const { InstanceStatus } = require('@companion-module/base')

// The v1 stream we need: full rundown bodies (for the rundown_* variables) plus
// cue change envelopes. `status` always rides along and can't be unsubscribed.
const EVENTS_SUBSCRIPTION = 'rundown:fat,cue:thin'

const RECONNECT_DELAY_MS = 5000

module.exports = {
	initConnection: function () {
		let self = this

		self.stopStream()

		if (!self.config.apiToken || !self.config.rundownId) {
			self.updateStatus(InstanceStatus.BadConfig, 'Set your API Token and Rundown ID in the module config.')
			return
		}

		self.updateStatus(InstanceStatus.Connecting)
		self.startStream()
		self.startInterval()
	},

	apiUrl: function (path) {
		let self = this
		return `${String(self.API_BASE_URL).replace(/\/+$/, '')}/rundowns/${self.config.rundownId}${path}`
	},

	startStream: async function () {
		let self = this

		const controller = new AbortController()
		self.streamController = controller

		const url = self.apiUrl(`/events?events=${encodeURIComponent(EVENTS_SUBSCRIPTION)}`)

		if (self.config.verbose) {
			self.log('debug', `Opening SSE stream: ${url}`)
		}

		try {
			const res = await fetch(url, {
				headers: {
					Authorization: `Bearer ${self.config.apiToken}`,
					Accept: 'text/event-stream',
				},
				signal: controller.signal,
			})

			if (!res.ok) {
				self.handleHttpError(res, await self.readProblem(res))
				self.scheduleReconnect()
				return
			}

			self.updateStatus(InstanceStatus.Ok, 'Connected to Rundown Studio.')

			// The stream only sends a `rundown` frame when the rundown *changes*, so
			// fetch it once up front to seed the rundown_* variables.
			self.fetchRundown()

			await self.consumeStream(res, controller)

			// The server closed the stream (lifetime cycle, auth change, or network
			// drop). Reconnect unless we're the ones who tore it down.
			if (!controller.signal.aborted) {
				self.scheduleReconnect()
			}
		} catch (error) {
			if (controller.signal.aborted) return

			self.updateStatus(InstanceStatus.ConnectionFailure, 'See log for more details.')
			self.log('error', `Connection error: ${String(error)}`)
			self.scheduleReconnect()
		}
	},

	// Parses the text/event-stream framing off the response body. We hand-roll it
	// rather than use EventSource: the module targets the node18 runtime (no global
	// EventSource), and EventSource can neither send an Authorization header nor
	// resume after a server-side close.
	consumeStream: async function (res, controller) {
		let self = this

		const decoder = new TextDecoder()
		let buffer = ''

		for await (const chunk of res.body) {
			if (controller.signal.aborted) return

			buffer += decoder.decode(chunk, { stream: true })

			// Frames are separated by a blank line; \r\n\r\n is legal too.
			let boundary
			while ((boundary = buffer.search(/\r?\n\r?\n/)) !== -1) {
				const frame = buffer.slice(0, boundary)
				buffer = buffer.slice(boundary + buffer.match(/\r?\n\r?\n/)[0].length)
				self.handleFrame(frame)
			}
		}
	},

	handleFrame: function (frame) {
		let self = this

		let event = 'message'
		const dataLines = []

		for (const line of frame.split(/\r?\n/)) {
			if (line.startsWith(':')) continue // comment, e.g. the ": connected" preamble
			if (line.startsWith('event:')) {
				event = line.slice(6).trim()
			} else if (line.startsWith('data:')) {
				dataLines.push(line.slice(5).trimStart())
			}
		}

		if (dataLines.length === 0) return

		let data
		try {
			data = JSON.parse(dataLines.join('\n'))
		} catch (error) {
			self.log('warn', `Ignoring unparsable ${event} frame: ${String(error)}`)
			return
		}

		if (self.config.verbose && event !== 'heartbeat') {
			self.log('debug', `SSE ${event}: ${JSON.stringify(data)}`)
		}

		switch (event) {
			case 'ready':
				self.updateStatus(InstanceStatus.Ok, 'Connected to Rundown Studio.')
				break

			case 'status':
				// The spine of the channel: state, active cue and next cue in one shot.
				self.DATA.status = data
				self.setServerTime(data.server_time)
				self.updateData()
				break

			case 'rundown':
				if (data.change === 'removed') {
					delete self.DATA.rundown
				} else if (data.rundown) {
					self.DATA.rundown = data.rundown
				}
				self.updateData()
				break

			case 'cue':
				// Subscribed thin: the active cue's title and duration already arrive on
				// every status frame, so a cue edit only needs a status refresh.
				self.refreshStatus()
				break

			case 'heartbeat':
				self.lastHeartbeat = Number(data.at) || null
				break

			case 'disconnect':
				// The server is closing the stream. `lifetime` is routine hygiene;
				// an auth reason needs the user to fix the token.
				if (data.reason === 'lifetime') {
					self.log('debug', 'Server cycled the stream (lifetime), reconnecting.')
				} else {
					self.updateStatus(InstanceStatus.ConnectionFailure, 'API token is no longer valid.')
					self.log('error', `Server closed the stream: ${data.reason}. Check your API token.`)
				}
				break
		}
	},

	scheduleReconnect: function () {
		let self = this

		clearTimeout(self.RECONNECT_TIMER)
		self.RECONNECT_TIMER = setTimeout(() => {
			if (self.config.apiToken && self.config.rundownId) {
				self.startStream()
			}
		}, RECONNECT_DELAY_MS)
	},

	stopStream: function () {
		let self = this

		clearTimeout(self.RECONNECT_TIMER)
		self.RECONNECT_TIMER = null

		if (self.streamController) {
			self.streamController.abort()
			self.streamController = null
		}
	},

	// Pulls a fresh status snapshot outside the stream (used after a thin cue
	// change).
	refreshStatus: async function () {
		let self = this

		try {
			const res = await fetch(self.apiUrl('/status'), {
				headers: { Authorization: `Bearer ${self.config.apiToken}` },
			})

			if (!res.ok) {
				self.handleHttpError(res, await self.readProblem(res))
				return
			}

			const body = await res.json()
			if (body?.data) {
				self.DATA.status = body.data
				self.setServerTime(body.data.server_time)
				self.updateData()
			}
		} catch (error) {
			self.log('warn', `Status refresh failed: ${String(error)}`)
		}
	},

	// Seeds self.DATA.rundown (name, status, planned times). The SSE `rundown`
	// frame is a change envelope, so without this the rundown_* variables stay
	// empty until someone happens to edit the rundown.
	fetchRundown: async function () {
		let self = this

		try {
			const res = await fetch(self.apiUrl(''), {
				headers: { Authorization: `Bearer ${self.config.apiToken}` },
			})

			if (!res.ok) {
				// Only the rundown_* variables go stale; the stream still drives show
				// control, so warn rather than fault the whole instance.
				const detail = await self.readProblem(res)
				self.log('warn', `Could not fetch rundown details (HTTP ${res.status}).${detail ? ' ' + detail : ''}`)
				return
			}

			const body = await res.json()
			if (body?.data) {
				self.DATA.rundown = body.data
				self.updateData()
			}
		} catch (error) {
			self.log('warn', `Rundown fetch failed: ${String(error)}`)
		}
	},

	startInterval: function () {
		let self = this

		clearInterval(self.INTERVAL)

		self.INTERVAL = setInterval(() => {
			self.updateData()
		}, self.config.updateInterval || 100)
	},

	setServerTime: function (serverTimeMs) {
		let self = this

		if (!Number.isFinite(serverTimeMs)) return

		self.serverTimeUnix = serverTimeMs
		self.timeOffset = Math.ceil(serverTimeMs - Date.now())
	},

	updateData: function () {
		//processes the latest data and updates the timers, etc. and then updates feedbacks and variables
		let self = this

		try {
			//calculate the current server time using our offset
			self.serverTimeUnix = Date.now() + self.timeOffset
			self.serverTime = new Date(self.serverTimeUnix)

			self.timeOfDay = self.serverTime.toLocaleTimeString()
			self.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

			const status = self.DATA.status
			const activeCue = status?.active_cue

			if (activeCue) {
				// Per the v1 docs: running counts against the wall clock, paused freezes
				// at paused_at.
				const anchor = status.state === 'paused' && activeCue.paused_at ? activeCue.paused_at : self.serverTimeUnix

				activeCue.timeLeft = activeCue.started_at + activeCue.duration_ms - anchor
				activeCue.timeElapsed = anchor - activeCue.started_at
			}

			self.checkFeedbacks()
			self.checkVariables()
		} catch (error) {
			self.log('error', `updateData error: ${String(error)}`)
			clearInterval(self.INTERVAL)
		}
	},

	readProblem: async function (res) {
		// Errors are RFC 9457 problem+json; `detail` states the corrective action.
		try {
			const body = await res.json()
			return body?.detail || body?.title || null
		} catch {
			return null
		}
	},

	handleHttpError: function (res, detail) {
		let self = this

		const suffix = detail ? ` ${detail}` : ''

		switch (res.status) {
			case 401:
				self.updateStatus(InstanceStatus.ConnectionFailure, 'Invalid API token.')
				self.log('error', `Authentication failed. Check your API token.${suffix}`)
				break
			case 403:
				self.updateStatus(InstanceStatus.ConnectionFailure, 'Token lacks permission.')
				self.log('error', `Your API token lacks permission for this action.${suffix}`)
				break
			case 404:
				self.updateStatus(InstanceStatus.ConnectionFailure, 'Invalid Rundown ID.')
				self.log('error', `Rundown not found. Double check your Rundown ID.${suffix}`)
				break
			case 409:
				// e.g. runner.not_running when acting on a stopped show — not a
				// connection problem, so leave the instance status alone.
				self.log('warn', `Action rejected: the show is not running.${suffix}`)
				break
			case 429:
				self.log('warn', `Rate limited by Rundown Studio.${suffix}`)
				break
			default:
				self.updateStatus(InstanceStatus.ConnectionFailure, 'See log for more details.')
				self.log('error', `Request failed (HTTP ${res.status}).${suffix}`)
		}
	},

	sendMessage: async function (cmd, method = 'POST', body = null) {
		let self = this

		if (!self.config.apiToken || !self.config.rundownId) {
			self.log('error', 'Rundown ID and API Token must be set in the module configuration.')
			return null
		}

		const url = self.apiUrl(`/${cmd}`)

		const options = {
			method,
			headers: {
				Authorization: `Bearer ${self.config.apiToken}`,
			},
		}

		if (body !== null) {
			options.headers['Content-Type'] = 'application/json'
			options.body = JSON.stringify(body)
		}

		if (self.config.verbose) {
			self.log('debug', `Sending ${method} ${url}${body ? ' with body ' + JSON.stringify(body) : ''}`)
		}

		try {
			const res = await fetch(url, options)

			if (!res.ok) {
				self.handleHttpError(res, await self.readProblem(res))
				return null
			}

			const json = await res.json()

			// Control verbs answer with the post-verb status snapshot, so the UI
			// reflects the action without waiting for the next stream frame.
			if (json?.data && typeof json.data.state === 'string') {
				self.DATA.status = json.data
				self.setServerTime(json.data.server_time)
				self.updateData()
			}

			return json
		} catch (error) {
			self.log('error', `Request failed: ${String(error)}`)
			return null
		}
	},

	convertTime: function (ms, format) {
		//converts milliseconds to a time format like seconds, minutes:seconds, or hours:minutes:seconds
		let self = this

		let seconds = Math.abs(Math.ceil(ms / 1000))
		let minutes = Math.abs(Math.floor(seconds / 60))
		let hours = Math.abs(Math.floor(minutes / 60))

		if (format === 'ss') {
			return seconds
		} else if (format === 'mm:ss') {
			return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
		} else if (format === 'hh:mm:ss') {
			return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(
				seconds % 60
			).padStart(2, '0')}`
		} else {
			return ms //some unsupported format
		}
	},
}
