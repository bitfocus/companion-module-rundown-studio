import { combineRgb } from '@companion-module/base'
import { ICONS } from './icons.js'

export const initPresets = (self) => {
	const presets = {}

	presets['Start'] = {
		type: 'button',
		category: 'Control',
		name: 'Start rundown',
		style: {
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
            png64: ICONS['play'],
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
		name: 'Pause rundown',
		style: {
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
            png64: ICONS['pause'],
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
            png64: ICONS['next'],
		},
		steps: [
			{
				down: [
					{
						actionId: 'goToNext',
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	self.setPresetDefinitions(presets)
}