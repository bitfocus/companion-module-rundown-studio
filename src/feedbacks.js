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

		self.setFeedbackDefinitions(feedbacks)
	},
}
