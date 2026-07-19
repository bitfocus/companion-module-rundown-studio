// Built-in currentcue_* ids that must not be overwritten by a column named e.g. "Title".
const RESERVED_CURRENTCUE_IDS = new Set([
	'currentcue_timeleft_ms',
	'currentcue_timeleft_ss',
	'currentcue_timeleft_mmss',
	'currentcue_timeleft_hhmmss',
	'currentcue_timeelapsed_ms',
	'currentcue_timeelapsed_ss',
	'currentcue_timeelapsed_mmss',
	'currentcue_timeelapsed_hhmmss',
	'currentcue_duration_ms',
	'currentcue_duration_ss',
	'currentcue_duration_mmss',
	'currentcue_duration_hhmmss',
	'currentcue_title',
])

module.exports = {
	sanitizeVariableId: function (name) {
		const sanitized = String(name || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '')
			.replace(/_+/g, '_')

		return sanitized || 'column'
	},

	// Maps each column id → a unique currentcue_<sanitized name> variable id.
	buildColumnVariableIds: function (columns) {
		let self = this

		const used = new Set(RESERVED_CURRENTCUE_IDS)
		const map = {}

		for (const column of columns || []) {
			const base = `currentcue_${self.sanitizeVariableId(column.name)}`
			let variableId = base
			let n = 2
			while (used.has(variableId)) {
				variableId = `${base}_${n++}`
			}
			used.add(variableId)
			map[column.id] = variableId
		}

		return map
	},

	initVariables: function () {
		let self = this
		let variables = []

		variables.push({ variableId: 'timeofday', name: 'Time of Day' })
		//variables.push({ variableId: 'timezone', name: 'Timezone' })

		variables.push({ variableId: 'rundown_name', name: 'Rundown Name' })
		variables.push({ variableId: 'rundown_date', name: 'Rundown Date' })

		variables.push({ variableId: 'rundown_planned_starttime', name: 'Rundown Planned Start Time' })
		variables.push({ variableId: 'rundown_planned_endtime', name: 'Rundown Planned End Time' })
		variables.push({ variableId: 'rundown_planned_length', name: 'Rundown Planned Length' })

		variables.push({ variableId: 'rundown_status', name: 'Rundown Status' })
		variables.push({ variableId: 'rundown_state', name: 'Rundown State' })

		variables.push({ variableId: 'currentcue_timeleft_ms', name: 'Current Cue Time Left (ms)' })
		variables.push({ variableId: 'currentcue_timeleft_ss', name: 'Current Cue Time Left (ss)' })
		variables.push({ variableId: 'currentcue_timeleft_mmss', name: 'Current Cue Time Left (mm:ss)' })
		variables.push({ variableId: 'currentcue_timeleft_hhmmss', name: 'Current Cue Time Left (hh:mm:ss)' })

		variables.push({ variableId: 'currentcue_timeelapsed_ms', name: 'Current Cue Time Elapsed (ms)' })
		variables.push({ variableId: 'currentcue_timeelapsed_ss', name: 'Current Cue Time Elapsed (ss)' })
		variables.push({ variableId: 'currentcue_timeelapsed_mmss', name: 'Current Cue Time Elapsed (mm:ss)' })
		variables.push({ variableId: 'currentcue_timeelapsed_hhmmss', name: 'Current Cue Time Elapsed (hh:mm:ss)' })

		variables.push({ variableId: 'currentcue_duration_ms', name: 'Current Cue Duration (ms)' })
		variables.push({ variableId: 'currentcue_duration_ss', name: 'Current Cue Duration (ss)' })
		variables.push({ variableId: 'currentcue_duration_mmss', name: 'Current Cue Duration (mm:ss)' })
		variables.push({ variableId: 'currentcue_duration_hhmmss', name: 'Current Cue Duration (hh:mm:ss)' })

		variables.push({ variableId: 'currentcue_title', name: 'Current Cue Title' })

		// The v1 status snapshot carries only id and title for the next cue, and no
		// subtitle for either — nextcue_duration_*, currentcue_subtitle and
		// nextcue_subtitle have no source and are gone.
		variables.push({ variableId: 'nextcue_title', name: 'Next Cue Title' })

		const columns = self.DATA.columns || []
		self.DATA.columnVariableIds = self.buildColumnVariableIds(columns)

		for (const column of columns) {
			const variableId = self.DATA.columnVariableIds[column.id]
			variables.push({
				variableId,
				name: `Current Cue: ${column.name}`,
			})
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		let variablesObj = {}

		variablesObj.timeofday = self.timeOfDay
		//variablesObj.timezone = self.timezone

		// v1 renames `name` to `title`, and start_time/end_time are epoch ms
		// (either may be null for open-ended rundowns).
		variablesObj.rundown_name = self.DATA.rundown?.title || ''

		const startTime = self.DATA.rundown?.start_time ?? null
		const endTime = self.DATA.rundown?.end_time ?? null

		variablesObj.rundown_date = startTime !== null ? new Date(startTime).toLocaleDateString() : ''
		variablesObj.rundown_planned_starttime = startTime !== null ? new Date(startTime).toLocaleTimeString() : ''
		variablesObj.rundown_planned_endtime = endTime !== null ? new Date(endTime).toLocaleTimeString() : ''
		variablesObj.rundown_planned_length =
			startTime !== null && endTime !== null ? self.convertTime(endTime - startTime, 'hh:mm:ss') : ''

		variablesObj.rundown_status = self.DATA.rundown?.status || ''
		//make the status more human readable
		switch (variablesObj.rundown_status) {
			case 'imported':
				variablesObj.rundown_status = 'Imported'
				break
			case 'draft':
				variablesObj.rundown_status = 'Draft'
				break
			case 'awaiting-data':
				variablesObj.rundown_status = 'Awaiting data'
				break
			case 'approved':
				variablesObj.rundown_status = 'Approved'
				break
			case 'finalized':
				variablesObj.rundown_status = 'Finalized'
				break
			case 'rejected':
				variablesObj.rundown_status = 'Rejected'
				break
		}

		//v1 states are running/paused/stopped; `stopped` covers pre-show and post-show
		switch (self.DATA.status?.state) {
			case 'running':
				variablesObj.rundown_state = 'Running'
				break
			case 'paused':
				variablesObj.rundown_state = 'Paused'
				break
			case 'stopped':
				variablesObj.rundown_state = 'Stopped'
				break
			default:
				variablesObj.rundown_state = ''
		}

		const currentCue = self.DATA.status?.active_cue
		const nextCue = self.DATA.status?.next_cue

		let currentCueTimeLeftMS = currentCue?.timeLeft || 0
		let currentCueTimeLeftPrefix = ''
		//if the time is counting up, add a plus sign
		if (parseInt(currentCueTimeLeftMS) < 0) {
			currentCueTimeLeftPrefix = '+' // Add a plus sign to indicate that the time is counting up
		}

		variablesObj.currentcue_timeleft_ms = currentCueTimeLeftPrefix + Math.abs(currentCueTimeLeftMS)
		variablesObj.currentcue_timeleft_ss = currentCueTimeLeftPrefix + self.convertTime(currentCueTimeLeftMS, 'ss')
		variablesObj.currentcue_timeleft_mmss = currentCueTimeLeftPrefix + self.convertTime(currentCueTimeLeftMS, 'mm:ss')
		variablesObj.currentcue_timeleft_hhmmss =
			currentCueTimeLeftPrefix + self.convertTime(currentCueTimeLeftMS, 'hh:mm:ss')

		let currentCueTimeElapsedMS = currentCue?.timeElapsed || 0
		variablesObj.currentcue_timeelapsed_ms = currentCueTimeElapsedMS
		variablesObj.currentcue_timeelapsed_ss = self.convertTime(currentCueTimeElapsedMS, 'ss')
		variablesObj.currentcue_timeelapsed_mmss = self.convertTime(currentCueTimeElapsedMS, 'mm:ss')
		variablesObj.currentcue_timeelapsed_hhmmss = self.convertTime(currentCueTimeElapsedMS, 'hh:mm:ss')

		let currentCueDurationMS = currentCue?.duration_ms || 0
		variablesObj.currentcue_duration_ms = currentCueDurationMS
		variablesObj.currentcue_duration_ss = self.convertTime(currentCueDurationMS, 'ss')
		variablesObj.currentcue_duration_mmss = self.convertTime(currentCueDurationMS, 'mm:ss')
		variablesObj.currentcue_duration_hhmmss = self.convertTime(currentCueDurationMS, 'hh:mm:ss')

		variablesObj.currentcue_title = currentCue?.title || '-'

		variablesObj.nextcue_title = nextCue?.title || '-'

		const cells = self.DATA.currentCueCells || {}
		const columnVariableIds = self.DATA.columnVariableIds || {}
		for (const column of self.DATA.columns || []) {
			const variableId = columnVariableIds[column.id]
			if (!variableId) continue
			variablesObj[variableId] = cells[column.id] ?? ''
		}

		self.setVariableValues(variablesObj)
	},
}
