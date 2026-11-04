const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this

		let feedbacks = {}

		feedbacks.rundownState = {
			name: 'Rundown State',
			type: 'boolean',
			description: 'Rundown State is Running/Paused/Stopped',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'running',
					choices: [
						{ id: 'running', label: 'Running' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'stopped', label: 'Stopped' },
					],
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: async (feedback) => {
				return self.DATA.status?.state === feedback.options.state
			},
		}

		const cueChoices = self.getCueChoices()

		feedbacks.cueIsActive = {
			name: 'Cue is active',
			type: 'boolean',
			description: 'Illuminate if the chosen cue is the active cue',
			options: [
				{
					type: 'dropdown',
					label: 'Cue',
					id: 'cueId',
					default: cueChoices[0]?.id ?? '',
					choices: cueChoices,
					allowCustom: true,
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(239, 68, 68), // Rundown Studio red, #ef4444
				color: combineRgb(255, 255, 255),
			},
			callback: async (feedback) => {
				const activeCueId = self.DATA.status?.active_cue?.id
				return !!activeCueId && activeCueId === feedback.options.cueId
			},
		}

		feedbacks.currentCueRunningOver = {
			name: 'Current cue is running over',
			type: 'boolean',
			description: 'Illuminate if the current cue is running over',
			options: [],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: async () => {
				return self.DATA.status?.active_cue?.timeLeft < 0 && self.DATA.status?.state === 'running'
			},
		}

		feedbacks.visualProgress = {
			name: 'Visual progress: X or less seconds remaining',
			type: 'boolean',
			description: 'Illuminate if the current cue has X or less seconds left in the current cue',
			options: [
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 10,
					min: 1,
					max: 9999,
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: async (feedback) => {
				let seconds = feedback.options.seconds
				let ms = seconds * 1000
				let timeLeft = self.DATA.status?.active_cue?.timeLeft
				let secondsLeft = Math.floor(timeLeft / 1000)

				if (timeLeft < 0 && self.DATA.status?.state === 'running') {
					//if we have run out of time, let's flash the button on even seconds, but only if the cue is stil running
					if (Math.floor(Date.now() / 1000) % 2 === 0) {
						return false
					} else {
						return true
					}
				} else {
					if (timeLeft <= ms) {
						//if the secondsLeft equals the seconds, illuminate the button
						if (secondsLeft == seconds - 1) {
							return true
						} else {
							return false
						}
					} else {
						return false
					}
				}
			},
		}

		// Sub-timers (experimental API).
		const subTimerChoices = self.getSubTimerChoices()
		const subTimerOption = {
			type: 'dropdown',
			label: 'Sub-timer',
			id: 'subTimerId',
			default: subTimerChoices[0]?.id ?? '',
			choices: subTimerChoices,
			allowCustom: true,
		}

		feedbacks.subTimerState = {
			name: 'Sub-timer: State',
			type: 'boolean',
			description: 'Experimental. Illuminate if the chosen sub-timer is Running/Paused/Finished/Reset',
			options: [
				subTimerOption,
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'running',
					choices: [
						{ id: 'running', label: 'Running' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'finished', label: 'Finished (countdown held at 00:00)' },
						{ id: 'reset', label: 'Reset' },
					],
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(0, 153, 51),
				color: combineRgb(255, 255, 255),
			},
			callback: async (feedback) => {
				return self.getSubTimerRunState(feedback.options.subTimerId).state === feedback.options.state
			},
		}

		feedbacks.subTimerOvertime = {
			name: 'Sub-timer: In overtime',
			type: 'boolean',
			description: 'Experimental. Illuminate if the chosen countdown has run past 00:00 (end action "continue")',
			options: [subTimerOption],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			callback: async (feedback) => {
				const run = self.getSubTimerRunState(feedback.options.subTimerId)
				return run.direction === 'down' && run.state !== 'reset' && run.displayMs < 0
			},
		}

		feedbacks.subTimerTimeRemaining = {
			name: 'Sub-timer: X or less seconds remaining',
			type: 'boolean',
			description: 'Experimental. Illuminate if the chosen countdown has X or less seconds left (including overtime)',
			options: [
				subTimerOption,
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 10,
					min: 0,
					max: 86400,
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 191, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: async (feedback) => {
				const run = self.getSubTimerRunState(feedback.options.subTimerId)
				return run.direction === 'down' && run.state !== 'reset' && run.displayMs <= feedback.options.seconds * 1000
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
