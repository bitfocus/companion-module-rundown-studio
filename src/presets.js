const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this

		let presets = {}

		presets['Start'] = {
			type: 'button',
			category: 'Transport Controls',
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
			category: 'Transport Controls',
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
			category: 'Transport Controls',
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
			category: 'Transport Controls',
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

		/*presets['End'] = {
			type: 'button',
			category: 'Transport Controls',
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
		}*/

		presets.rundownTitle = {
			type: 'button',
			category: 'Rundown Info',
			name: 'Rundown Title',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:rundown_name)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.rundownStatus = {
			type: 'button',
			category: 'Rundown Info',
			name: 'Rundown Status',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:rundown_status)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.rundownState = {
			type: 'button',
			category: 'Rundown Info',
			name: 'Rundown State',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:rundown_state)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.rundownDate = {
			type: 'button',
			category: 'Rundown Info',
			name: 'Rundown Date',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:rundown_date)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.currentCueTitle = {
			type: 'button',
			category: 'Current Cue',
			name: 'Current Cue Title',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:currentcue_title)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.currentCueSubtitle = {
			type: 'button',
			category: 'Current Cue',
			name: 'Current Cue Subtitle',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:currentcue_subtitle)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.currentCueTimeLeft = {
			type: 'button',
			category: 'Current Cue',
			name: 'Current Cue Time Left',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:currentcue_timeleft_mmss)',
			},
			steps: [],
			feedbacks: [
				{
					feedbackId: 'currentCueRunningOver',
					options: {},
					style: {
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets.currentCueTimeElapsed = {
			type: 'button',
			category: 'Current Cue',
			name: 'Current Cue Time Elapsed',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:currentcue_timeelapsed_mmss)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.currentCueDuration = {
			type: 'button',
			category: 'Current Cue',
			name: 'Current Cue Duration',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:currentcue_duration_mmss)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.nextCueTitle = {
			type: 'button',
			category: 'Next Cue',
			name: 'Next Cue Title',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:nextcue_title)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.nextCueSubtitle = {
			type: 'button',
			category: 'Next Cue',
			name: 'Next Cue Subtitle',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:nextcue_subtitle)',
			},
			steps: [],
			feedbacks: [],
		}

		presets.nextCueDuration = {
			type: 'button',
			category: 'Next Cue',
			name: 'Next Cue Duration',
			style: {
				size: '14',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				text: '$(rundown-studio:nextcue_duration_mmss)',
			},
			steps: [],
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
