const { InstanceStatus } = require('@companion-module/base')

const io = require('socket.io-client')

module.exports = {
	initConnection: function () {
		let self = this

		if (self.config.apiToken && self.config.rundownId) {
			if (self.config.apiToken !== '' && self.config.rundownId !== '') {
				try {
					self.updateStatus(InstanceStatus.Connecting)

					if (self.config.verbose) {
						self.log(
							'debug',
							`Connecting to Rundown Studio @ ${self.SOCKET_BASE_URL}${self.SOCKET_PATH} with Rundown ID: ${self.config.rundownId}`,
						)
					}

					self.socket = io(self.SOCKET_BASE_URL, {
						path: self.SOCKET_PATH,
						auth: { apiToken: self.config.apiToken, rundownId: self.config.rundownId },
					})

					self.socket.on('connect', () => {
						self.updateStatus(InstanceStatus.Ok, 'Connected to Rundown Server.')
					})

					self.socket.on('connect_error', (error) => {
						self.socket.disconnect()

						let errorString = String(error)

						if (errorString.includes("Rundown doesn't exist")) {
							self.updateStatus(InstanceStatus.ConnectionFailure, 'Invalid Rundown ID.')
							self.log('error', 'Invalid Rundown ID. Double check your module configuration.')
						} else {
							self.updateStatus(InstanceStatus.ConnectionFailure, 'See log for more details.')
							self.log('error', 'Connection Error:' + String(error))
						}
					})

					self.socket.on('disconnect', (reason) => {
						//self.updateStatus(InstanceStatus.ConnectionFailure, 'Disconnected from Rundown Server. See log for more details.')
						//self.log('error', `Disconnected from Rundown Server: ${reason}`);
					})

					self.socket.on('serverTime', (data) => {
						//The server time sent on a 30s interval, used to sync clocks
						self.serverTime = data

						self.updateServerTime()
					})

					self.socket.on('runndown', (data) => {
						//When the rundown itself changes
						/*
							{
								"id": "4LdiPByHcbVZHxjovBQB",
								"name": "Example Rundown",
								"startTime": "2023-11-23T09:45:00.000Z",
								"endTime": "2023-04-01T09:45:00.000Z",
								"status": "approved",
								"createdAt": "2023-10-23T18:51:22.653Z",
								"updatedAt": "2024-01-06T12:55:26.021Z"
							}
						*/

						self.DATA.rundown = data
						console.log('rundown', data)
						self.updateData()
					})

					self.socket.on('currentCue', (data) => {
						//When the current cue changes
						/*
							{
								"id": "ArWdCNok6nS9DjhrQaoD",
								"type": "cue",
								"title": "Welcome",
								"subtitle": "",
								"duration": 180000,
								"backgroundColor": "#450a0a",
								"locked": false,
								"createdAt": "2023-10-23T18:51:23.326Z",
								"updatedAt": "2023-10-23T18:51:23.326Z"
							}
						*/

						self.DATA.currentCue = data
						console.log('currentCue', data)
						self.updateData()
					})

					self.socket.on('nextCue', (data) => {
						//When the next cue changes
						/*
							{
								"id": "dkSnrutcDgp5Tq5WGz6P",
								"type": "cue",
								"title": "Keynote",
								"subtitle": "",
								"duration": 300000,
								"backgroundColor": "#450a0a",
								"locked": false,
								"createdAt": "2023-10-23T18:51:23.326Z",
								"updatedAt": "2023-10-23T18:51:23.326Z"
							}
						*/

						self.DATA.nextCue = data
						console.log('nextCue', data)
						self.updateData()
					})

					self.socket.on('timesnap', (data) => {
						//For all timing-related changes like start, stop, next, and previous
						/*
							{
								"lastStop": 1704546261727,
								"kickoff": 1704546261727,
								"running": true,
								"cueId": "EF3Rgj4A0IwXV42VP0Ed",
								"deadline": 1704547171727
							}
						*/

						/* Note: The timesnap event contains timestamps in milliseconds since UNIX epoch.
						The duration is derived from deadline - kickoff = duration.
						The remaining time can be calculated by deadline - now = remaining. */

						self.DATA.timesnap = data
						console.log('timesnap', data)
						self.updateData()
					})

					self.startInterval()
				} catch (error) {
					self.updateStatus(InstanceStatus.ConnectionFailure, 'Connection Failure. See Log.')
					self.log('error', 'Connection Failure:' + error)
				}
			} else {
				self.updateStatus(InstanceStatus.ConnectionFailure)
				self.log('error', 'Rundown ID and API Token must be set in the module configuration.')
			}
		} else {
			//self.updateStatus(InstanceStatus.UnknownWarning, 'Set your API Token and Rundown ID in the module config.');
		}
	},

	startInterval: function () {
		let self = this

		clearInterval(self.INTERVAL)

		self.INTERVAL = setInterval(() => {
			self.updateData()
		}, self.config.updateInterval)
	},

	updateServerTime: function () {
		//updates the offset time between the server and the local time based on the difference between the two
		let self = this

		let serverTimeUnix = new Date(self.serverTime).getTime()
		let localTimeUnix = new Date().getTime()

		self.timeOffset = Math.ceil(serverTimeUnix - localTimeUnix)
	},

	updateData: function () {
		//processes the latest data and updates the timers, etc. and then updates feedbacks and variables
		let self = this

		try {
			let currentTime = new Date().getTime() //epoch time in milliseconds

			//calculate the current server time using our offset
			self.serverTimeUnix = currentTime + self.timeOffset

			//make a new date variable with the servertime
			self.serverTime = new Date(self.serverTimeUnix)

			//update the time of day and timezone
			self.timeOfDay = self.serverTime.toLocaleTimeString()
			self.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

			let currentCue = self.DATA.currentCue
			let timeSnap = self.DATA.timesnap

			if (currentCue && timeSnap) {
				//compare that the timeSnap cueId matches the currentCue id
				if (timeSnap.cueId === currentCue.id) {
					//calculate time left
					if (timeSnap.running) {
						//time left is deadline minus current time
						currentCue.timeLeft = timeSnap.deadline - self.serverTimeUnix

						//calculate time elapsed - kickoff minus current time
						currentCue.timeElapsed = self.serverTimeUnix - timeSnap.kickoff
					} else {
						//time left is current time minus timesnap kickoff
						currentCue.timeLeft = timeSnap.deadline - timeSnap.lastStop

						//time elapsed is last stop minus kickoff
						currentCue.timeElapsed = timeSnap.lastStop - timeSnap.kickoff
					}
				} else {
					//some other condition, so just return, we will be right back to this function in 100ms anyway
					return
				}
			}

			//check if the nextCue id is the same as the currentCue id, which would mean we are on the last cue
			//delete nextCue if so
			if (self.DATA.nextCue?.id === self.DATA.currentCue?.id) {
				delete self.DATA.nextCue
			}

			self.checkFeedbacks()
			self.checkVariables()
		} catch (error) {
			console.log(error)
			self.log('error', 'updateData error:', String(error))
			clearInterval(self.INTERVAL)
		}
	},

	sendMessage: async function (cmd) {
		let self = this

		let API_BASE = `${self.API_BASE_URL}`
		let baseUri = `${API_BASE}/rundown/${self.config.rundownId}`

		const options = {
			headers: {
				Authorization: `Bearer ${self.config.apiToken}`,
			},
		}

		if (self.config.verbose) {
			self.log('debug', `Sending command: ${cmd} to ${baseUri}`)
		}

		const res = await fetch(`${baseUri}/${cmd}`, options)
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
			return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
		} else {
			return ms //some unsupported format
		}
	},
}
