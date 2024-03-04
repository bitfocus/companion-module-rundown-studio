const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this

		let feedbacks = {}

		feedbacks.rundownState = {
			name: 'Rundown State',
			type: 'boolean',
			description: 'Rundown State is Running/Paused/Ended',
			options: [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'running',
					choices: [
						{ id: 'running', label: 'Running' },
						{ id: 'paused', label: 'Paused' },
						{ id: 'ended', label: 'Ended' },
					],
				},
			],
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			callback: async (feedback) => {
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

				if (state === feedback.options.state) {
					return true
				} else {
					return false
				}
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
				let secondsLeft = Math.floor(self.DATA.currentCue?.timeLeft / 1000)

				if (self.DATA.currentCue?.timeLeft < 0 && self.DATA.timesnap?.running == true) {
					//if we have run out of time, let's flash the button on even seconds, but only if the cue is stil running
					if (Math.floor(Date.now() / 1000) % 2 === 0) {
						return false
					} else {
						return true
					}
				} else {
					if (self.DATA.currentCue?.timeLeft <= ms) {
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
