import { Client, Collection, IntentsBitField } from 'discord.js';
import pg from "pg";
const { Pool } = pg;

export default class extends Client {
	constructor(config) {
		const myIntents = new IntentsBitField();
		myIntents.add(IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.GuildEmojisAndStickers, IntentsBitField.Flags.GuildInvites, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.GuildMessageTyping, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.DirectMessageReactions, IntentsBitField.Flags.DirectMessageTyping)
		super({ intents: myIntents });

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