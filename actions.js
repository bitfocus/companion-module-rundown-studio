import got from 'got'

const API_BASE = `https://live.rundownstudio.app/api-v0`

export function UpdateActions(self) {
	const gotOptions = {
		headers: {
			Authorization: `Bearer ${self.config.apiToken}`,
		},
	}

	const sendHttpMessage = async (cmd = '') => {
		var baseUri = `${API_BASE}/rundown/${self.config.rundownId}`
		const res = await got.get(`${baseUri}/${cmd}`, gotOptions)
	}

	self.setActionDefinitions({
		startRundown: {
			name: 'Start rundown',
			callback: async () => {
				sendHttpMessage(`start`)
			},
		},
		pauseRundown: {
			name: 'Pause rundown',
			callback: async () => {
				sendHttpMessage(`pause`)
			},
		},
		goToNext: {
			name: 'Go to next cue',
			callback: async () => {
				sendHttpMessage(`next`)
			},
		},
	})
}
