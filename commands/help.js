import { config } from '../config.js';

export const Help = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '<command name>',
	execute(message, args) {
		let data = '';
		const { commands } = message.client;
		const prefix = config.prefix;

		if (!args.length) {
			data = data.concat('Here\'s a list of all my commands:\n');
			data = data.concat(commands.map(command => command.name).join(', '));
			data = data.concat(`\n\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			return message.author.send(data)
				.then(() => {
					if (message.channel.type === 'dm') return;
					message.reply('I\'ve sent you a DM with all my commands!')
						.then(msg => setTimeout(function() {
							msg.delete();
							message.delete();
						}, 3000));
				})
				.catch(error => {
					console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
					message.reply('it seems like I can\'t DM you! Do you have DMs disabled?')
						.then(msg => setTimeout(function() {
							msg.delete();
							message.delete();
						}, 3000));
				});
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply('that\'s not a valid command!');
		}

		data = data.concat(`**Name:** ${command.name}\n`);

		if (command.aliases) data = data.concat(`**Aliases:** ${command.aliases.join(', ')}\n`);
		if (command.description) data = data.concat(`**Description:** ${command.description}\n`);
		if (command.usage) data = data.concat(`**Usage:** ${prefix}${command.name} ${command.usage}\n`);
		if (command.cooldown) data = data.concat(`**Cooldown:** ${command.cooldown} second(s)\n`);

		message.delete().then(message.channel.send(data));
	},
};