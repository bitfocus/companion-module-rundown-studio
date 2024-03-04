module.exports = {
	initActions: function () {
		let self = this

		let actions = {}

		actions.startRundown = {
			name: 'Start rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`start`)
			},
		}

		actions.pauseRundown = {
			name: 'Pause rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`pause`)
			},
		}

		actions.goToNextCue = {
			name: 'Go to next cue',
			options: [],
			callback: async () => {
				self.sendMessage(`next`)
			},
		}

		actions.goToPreviousCue = {
			name: 'Go to previous cue',
			options: [],
			callback: async () => {
				self.sendMessage(`previous`)
			},
		}

		actions.endRundown = {
			name: 'End rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`end`)
			},
		}

		actions.addTime_Seconds = {
			name: 'Add time to current cue',
			options: [
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 30,
					min: 1,
					max: 9999,
				},
			],
			callback: async (action) => {
				self.sendMessage(`addTime/${action.options.seconds}`)
			},
		}

		actions.removeTime_Seconds = {
			name: 'Remove time from current cue',
			options: [
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 30,
					min: 1,
					max: 9999,
				},
			],
			callback: async (action) => {
				self.sendMessage(`removeTime/${action.options.seconds}`)
			},
		}

		self.setActionDefinitions(actions)
	},
}
