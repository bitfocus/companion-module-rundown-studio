module.exports = {
	initActions: function () {
		let self = this

		let actions = {}

		actions.startRundown = {
			name: 'Start rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`action:start`)
			},
		}

		actions.pauseRundown = {
			name: 'Pause rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`action:pause`)
			},
		}

		actions.goToNextCue = {
			name: 'Go to next cue',
			options: [],
			callback: async () => {
				self.sendMessage(`action:next`)
			},
		}

		actions.goToPreviousCue = {
			name: 'Go to previous cue',
			options: [],
			callback: async () => {
				self.sendMessage(`action:previous`)
			},
		}

		/*actions.endRundown = {
			name: 'End rundown',
			options: [],
			callback: async () => {
				self.sendMessage(`end`)
			},
		}*/

		actions.addTime_Seconds = {
			name: 'Add time to current cue',
			options: [
				{
					type: 'number',
					label: 'Seconds',
					id: 'seconds',
					default: 30,
					min: 1,
					max: 86400,
				},
			],
			callback: async (action) => {
				self.sendMessage('action:adjust-duration', 'POST', { delta_ms: action.options.seconds * 1000 })
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
					max: 86400,
				},
			],
			callback: async (action) => {
				self.sendMessage('action:adjust-duration', 'POST', { delta_ms: -action.options.seconds * 1000 })
			},
		}

		// v1 has no show/hide/toggle endpoints — visibility is the `visible` field
		// on the output-message PATCH.
		actions.showOutputMessage = {
			name: 'Output Message: Show',
			options: [],
			callback: async () => {
				self.sendMessage('output-message', 'PATCH', { visible: true })
			},
		}

		actions.hideOutputMessage = {
			name: 'Output Message: Hide',
			options: [],
			callback: async () => {
				self.sendMessage('output-message', 'PATCH', { visible: false })
			},
		}

		actions.toggleOutputMessage = {
			name: 'Output Message: Toggle visibility',
			options: [],
			callback: async () => {
				const current = await self.sendMessage('output-message', 'GET')
				if (!current?.data) return //the read failed and already logged

				self.sendMessage('output-message', 'PATCH', { visible: !current.data.visible })
			},
		}

		actions.setOutputMessage = {
			name: 'Output Message: Set',
			options: [
				{
					type: 'textinput',
					label: 'Text (leave blank to keep unchanged)',
					id: 'text',
					default: '',
					useVariables: true,
					tooltip: 'Maximum 1000 characters. Leave blank to leave existing text unchanged.',
				},
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					default: '#ef4444',
					enableAlpha: false,
					returnType: 'string',
				},
				{
					type: 'checkbox',
					label: 'Set color',
					id: 'setColor',
					default: true,
					tooltip: 'When unchecked, color will not be updated.',
				},
				{
					type: 'dropdown',
					label: 'Bold',
					id: 'bold',
					default: 'unchanged',
					choices: [
						{ id: 'unchanged', label: 'Leave unchanged' },
						{ id: 'true', label: 'Bold on' },
						{ id: 'false', label: 'Bold off' },
					],
				},
				{
					type: 'dropdown',
					label: 'Underline',
					id: 'underline',
					default: 'unchanged',
					choices: [
						{ id: 'unchanged', label: 'Leave unchanged' },
						{ id: 'true', label: 'Underline on' },
						{ id: 'false', label: 'Underline off' },
					],
				},
				{
					type: 'dropdown',
					label: 'Visibility',
					id: 'visible',
					default: 'unchanged',
					choices: [
						{ id: 'unchanged', label: 'Leave unchanged' },
						{ id: 'true', label: 'Show' },
						{ id: 'false', label: 'Hide' },
					],
				},
			],
			callback: async (action) => {
				const body = {}
				const text = await self.parseVariablesInString(action.options.text || '')
				if (text !== '') body.text = text.slice(0, 1000)
				if (action.options.setColor) body.color = action.options.color
				if (action.options.bold !== 'unchanged') body.bold = action.options.bold === 'true'
				if (action.options.underline !== 'unchanged') body.underline = action.options.underline === 'true'
				if (action.options.visible !== 'unchanged') body.visible = action.options.visible === 'true'

				if (Object.keys(body).length === 0) {
					self.log('warn', 'Set Output Message called with no fields to update')
					return
				}

				self.sendMessage('output-message', 'PATCH', body)
			},
		}

		self.setActionDefinitions(actions)
	},
}
