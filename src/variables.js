module.exports = {
	initVariables: function () {
		let self = this
		let variables = []

		variables.push({ variableId: 'timeofday', name: 'Time of Day' })
		variables.push({ variableId: 'timezone', name: 'Timezone' })

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
		variables.push({ variableId: 'currentcue_subtitle', name: 'Current Cue Subtitle' })

		variables.push({ variableId: 'nextcue_duration_ms', name: 'Next Cue Duration (ms)' })
		variables.push({ variableId: 'nextcue_duration_ss', name: 'Next Cue Duration (ss)' })
		variables.push({ variableId: 'nextcue_duration_mmss', name: 'Next Cue Duration (mm:ss)' })
		variables.push({ variableId: 'nextcue_duration_hhmmss', name: 'Next Cue Duration (hh:mm:ss)' })

		variables.push({ variableId: 'nextcue_title', name: 'Next Cue Title' })
		variables.push({ variableId: 'nextcue_subtitle', name: 'Next Cue Subtitle' })

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		let variablesObj = {}

		variablesObj.timeofday = self.timeOfDay
		variablesObj.timezone = self.timezone

		variablesObj.rundown_name = self.DATA.rundown?.name || ''
		variablesObj.rundown_date = self.DATA.rundown?.startTime || ''
		if (variablesObj.rundown_date !== '') {
			//make it more human readable
			variablesObj.rundown_date = new Date(variablesObj.rundown_date).toLocaleDateString()
		}

		variablesObj.rundown_planned_starttime = new Date(self.DATA.rundown?.startTime).toLocaleTimeString() || ''
		variablesObj.rundown_planned_endtime = new Date(self.DATA.rundown?.endTime).toLocaleTimeString() || ''
		variablesObj.rundown_planned_length =
			self.convertTime(
				new Date(self.DATA.rundown?.endTime).getTime() - new Date(self.DATA.rundown?.startTime).getTime(),
				'hh:mm:ss',
			) || ''

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

		let state = ''
		if (self.DATA.timesnap?.running == true) {
			state = 'running'
		} else {
			if (self.DATA.timesnap?.ended == true) {
				state = 'ended'
			} else {
				state = 'paused'
			}
		}

		variablesObj.rundown_state = state
		//make the state more human readable
		switch (variablesObj.rundown_state) {
			case 'running':
				variablesObj.rundown_state = 'Running'
				break
			case 'paused':
				variablesObj.rundown_state = 'Paused'
				break
			case 'ended':
				variablesObj.rundown_state = 'Ended'
				break
		}

		let currentCueTimeLeftMS = self.DATA.currentCue?.timeLeft || 0
		variablesObj.currentcue_timeleft_ms = Math.abs(currentCueTimeLeftMS)
		variablesObj.currentcue_timeleft_ss = self.convertTime(currentCueTimeLeftMS, 'ss')
		variablesObj.currentcue_timeleft_mmss = self.convertTime(currentCueTimeLeftMS, 'mm:ss')
		variablesObj.currentcue_timeleft_hhmmss = self.convertTime(currentCueTimeLeftMS, 'hh:mm:ss')

		let currentCueTimeElapsedMS = self.DATA.currentCue?.timeElapsed || 0
		variablesObj.currentcue_timeelapsed_ms = currentCueTimeElapsedMS
		variablesObj.currentcue_timeelapsed_ss = self.convertTime(currentCueTimeElapsedMS, 'ss')
		variablesObj.currentcue_timeelapsed_mmss = self.convertTime(currentCueTimeElapsedMS, 'mm:ss')
		variablesObj.currentcue_timeelapsed_hhmmss = self.convertTime(currentCueTimeElapsedMS, 'hh:mm:ss')

		let currentCueDurationMS = self.DATA.currentCue?.duration || 0
		variablesObj.currentcue_duration_ms = currentCueDurationMS
		variablesObj.currentcue_duration_ss = self.convertTime(currentCueDurationMS, 'ss')
		variablesObj.currentcue_duration_mmss = self.convertTime(currentCueDurationMS, 'mm:ss')
		variablesObj.currentcue_duration_hhmmss = self.convertTime(currentCueDurationMS, 'hh:mm:ss')

		variablesObj.currentcue_title = self.DATA.currentCue?.title || ''
		variablesObj.currentcue_subtitle = self.DATA.currentCue?.subtitle || ''

		let nextCueDurationMS = self.DATA.nextCue?.duration || 0
		variablesObj.nextcue_duration_ms = nextCueDurationMS
		variablesObj.nextcue_duration_ss = self.convertTime(nextCueDurationMS, 'ss')
		variablesObj.nextcue_duration_mmss = self.convertTime(nextCueDurationMS, 'mm:ss')
		variablesObj.nextcue_duration_hhmmss = self.convertTime(nextCueDurationMS, 'hh:mm:ss')

		variablesObj.nextcue_title = self.DATA.nextCue?.title || ''
		variablesObj.nextcue_subtitle = self.DATA.nextCue?.subtitle || ''

		self.setVariableValues(variablesObj)
	},
}
