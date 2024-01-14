const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Pool } = require('pg');

module.exports = class extends Client {
	constructor(config) {
		super({ intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping] });

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

		this.pool = new Pool({
			connectionString: config.db,
			ssl: {
				rejectUnauthorized: false,
			},
		});
	}
};