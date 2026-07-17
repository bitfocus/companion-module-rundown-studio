module.exports = [
	function (context, props) {
		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},

	// v1 API migration. The old socket.io config is gone, and the runner's third
	// state is `stopped` (pre-show and post-show) rather than `ended`.
	function (context, props) {
		const result = {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}

		if (props.config) {
			const config = props.config
			let configChanged = false

			// Retire the hosts we shipped before: the v0 base (which 404s against v1
			// paths). Both move to
			// the dedicated API host. A base pointing anywhere else is deliberate
			// (e.g. a dev environment) and is left alone.
			const RETIRED_BASE = /^https:\/\/app\.rundownstudio\.app\/api-v[01]\/?$/
			if (typeof config.apiBaseUrl === 'string' && RETIRED_BASE.test(config.apiBaseUrl.trim())) {
				config.apiBaseUrl = 'https://api-v1.rundownstudio.app'
				configChanged = true
			}

			// The v0 socket fields, and the realtimeBaseUrl briefly used while the SSE
			// stream lived on its own host. Everything is one host again.
			if ('socketBaseUrl' in config || 'socketPath' in config || 'realtimeBaseUrl' in config) {
				delete config.socketBaseUrl
				delete config.socketPath
				delete config.realtimeBaseUrl
				configChanged = true
			}

			if (configChanged) result.updatedConfig = config
		}

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'rundownState' && feedback.options?.state === 'ended') {
				feedback.options.state = 'stopped'
				result.updatedFeedbacks.push(feedback)
			}
		}

		return result
	},
]
