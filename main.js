// Panasonic Lumix
const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const upgrades = require('./src/upgrades')

const config = require('./src/config')

const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const api = require('./src/api')

const constants = require('./src/constants')
const icons = require('./src/icons')

class rundownInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,

			...actions,
			...feedbacks,
			...variables,
			...presets,

			...api,

			...constants,
			...icons,
		})

		this.socket = null //used for socketio connection

		this.serverTime = null //current server time
		this.timeOffset = 0 //offset between server time and local time

		this.DATA = {}

		this.INTERVAL = null //used to update timers based on latest data from the server
	}

	async init(config) {
		this.configUpdated(config)
	}
	// When module gets deleted
	async destroy() {
		try {
			if (this.socket) {
				//close the socket if open
				this.socket.disconnect()
				this.socket = null
			}

			this.serverTime = null
			this.timeOffset = 0

			this.DATA = {}

			//clear the interval
			clearInterval(this.INTERVAL)
			this.log('debug', 'destroy')
		} catch (error) {
			this.log('error', 'destroy error:', error)
		}
	}

	async configUpdated(config) {
		this.config = config

		if (this.config.advancedConfig == true) {
			this.API_BASE_URL = this.config.apiBaseUrl
			this.SOCKET_BASE_URL = this.config.socketBaseUrl
			this.SOCKET_PATH = this.config.socketPath
		}

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.initConnection()
	}
}

runEntrypoint(rundownInstance, upgrades)
