const { Client, Collection, Intents } = require('discord.js');

module.exports = class extends Client {
	constructor(config) {
		super({ ws: { intents: Intents.NON_PRIVILEGED } });

		this.commands = new Collection();

		this.commandsLoc = new Collection();

		this.queue = new Collection();

		this.ratings = new Collection();

		this.cancels = new Collection();

		this.reactions = new Collection();

		this.libraries = new Collection();

		this.voiceStates = new Collection();

		this.token = config.token;

		this.prefix = config.prefix;
	}
};