const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this

		let presets = {}

		presets['Start'] = {
			type: 'button',
			category: 'Control',
			name: 'Start Rundown',
			style: {
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: self.ICONS['play'],
			},
			steps: [
				{
					down: [
						{
							actionId: 'startRundown',
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets['Pause'] = {
			type: 'button',
			category: 'Control',
			name: 'Pause Rundown',
			style: {
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: self.ICONS['pause'],
			},
			steps: [
				{
					down: [
						{
							actionId: 'pauseRundown',
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets['Next'] = {
			type: 'button',
			category: 'Control',
			name: 'Go to next',
			style: {
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: self.ICONS['next'],
			},
			steps: [
				{
					down: [
						{
							actionId: 'goToNextCue',
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets['Previous'] = {
			type: 'button',
			category: 'Control',
			name: 'Go to previous',
			style: {
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: self.ICONS['previous'],
			},
			steps: [
				{
					down: [
						{
							actionId: 'goToPreviousCue',
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets['End'] = {
			type: 'button',
			category: 'Control',
			name: 'End Rundown',
			style: {
				size: '18',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: self.ICONS['end'],
			},
			steps: [
				{
					down: [
						{
							actionId: 'endRundown',
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}

		for (let i = 5; i >= 1; i--) {
			presets[`visualProgress${i}`] = {
				type: 'button',
				category: 'Visual Progress',
				name: `Visual Progress ${i} Seconds Remaining`,
				style: {
					png64: self.ICONS['visual_off'],
				},
				steps: [],
				feedbacks: [
					{
						feedbackId: 'visualProgress',
						options: {
							seconds: i,
						},
						style: {
							png64: self.ICONS['visual_on'],
						},
					},
				],
			}
		}

		self.setPresetDefinitions(presets)
	},
}
