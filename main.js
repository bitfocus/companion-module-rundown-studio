import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { upgrades } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { UpdateVariableDefinitions } from './variables.js'
import { initPresets } from './presets.js'

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok)

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.updatePresets()
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'apiToken',
				label: 'API Token',
				width: 8,
				tooltip: 'The API token can be taken from your Rundown Studio Dashboard'
			},
			{
				type: 'textinput',
				id: 'rundownId',
				label: 'Rundown ID',
				width: 4,
				tooltip: 'The ID can be found in the URL bar of your rundown'
			},
			
		]
	}

	updatePresets() {
		initPresets(this)
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	
}

runEntrypoint(ModuleInstance, upgrades)
