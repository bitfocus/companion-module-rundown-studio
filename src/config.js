module.exports = {
	getConfigFields() {
		let self = this

		return [
			{
				type: 'static-text',
				id: 'info',
				label: 'Information',
				width: 12,
				value: `This module allows you to control Rundown Studio - The rundown tool for collaborative show planning, cueing, and directing. To use this module, you will need to create an API token in your Rundown Studio Dashboard. More instructions are available here: <a target='_blank' href='https://rundownstudio.app/docs/rundown/api/'>https://rundownstudio.app/docs/rundown/api/</a>`,
			},
			{
				type: 'static-text',
				id: 'hr1',
				label: '',
				width: 12,
				value: '<hr />',
			},
			{
				type: 'textinput',
				id: 'apiToken',
				label: 'API Token',
				width: 8,
				tooltip: 'The API token can be taken from your Rundown Studio Dashboard',
			},
			{
				type: 'textinput',
				id: 'rundownId',
				label: 'Rundown ID',
				width: 4,
				tooltip: 'The ID can be found in the URL bar of your Rundown',
			},
			{
				type: 'static-text',
				id: 'hr2',
				label: '',
				width: 12,
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'advancedConfig',
				label: 'Advanced Configuration',
				width: 4,
				default: false,
			},
			{
				type: 'static-text',
				id: 'advancedConfig-info',
				label: '',
				width: 8,
				value:
					'Enable this to show advanced configuration options. These are for advanced users only and not needed for normal operation.',
			},
			{
				type: 'textinput',
				id: 'apiBaseUrl',
				label: 'API Base URL',
				width: 4,
				default: 'https://live.rundownstudio.app/api-v0',
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'textinput',
				id: 'socketBaseUrl',
				label: 'Websocket Base URL',
				width: 4,
				default: 'https://socket.rundownstudio.app',
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'textinput',
				id: 'socketPath',
				label: 'Websocket Path',
				width: 4,
				default: '/api-v0/socket.io',
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'number',
				id: 'updateInterval',
				label: 'Update Interval (ms)',
				width: 4,
				default: 100,
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'static-text',
				id: 'updateInterval-info',
				label: '',
				width: 8,
				value:
					'The interval at which the module will update the timers based on the last sent data from Rundown Studio.',
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Verbose Mode',
				width: 4,
				default: false,
				isVisible: (config) => config.advancedConfig === true,
			},
			{
				type: 'static-text',
				id: 'verbose-info',
				label: '',
				width: 8,
				value: 'Enable this to log more information to the debug log. This can be useful for troubleshooting.',
				isVisible: (config) => config.advancedConfig === true,
			},
		]
	},
}
