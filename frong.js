const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/client.js');
const { config } = require('./config.js');

const client = new Client(config);

const prefix = client.prefix;
const token = client.token;

const mainCommands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of mainCommands) {
	const loc = `${file}`;
	const command = require(`./commands/${loc}`);
	client.commands.set(command.name, command);
	client.commandsLoc.set(command.name, loc);
}

const memeCommands = fs.readdirSync('./commands/meme').filter(file => file.endsWith('.js'));

for (const file of memeCommands) {
	const loc = `meme/${file}`;
	const command = require(`./commands/${loc}`);
	client.commands.set(command.name, command);
	client.commandsLoc.set(command.name, loc);
}

// const libCommands = fs.readdirSync('./commands/library').filter(file => file.endsWith('.js'));

// for (const file of libCommands) {
// 	const loc = `library/${file}`;
// 	const command = require(`./commands/${loc}`);
// 	client.commands.set(command.name, command);
// 	client.commandsLoc.set(command.name, loc);
// }

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity(`${prefix}help & appreciating Jonathan`, {
		type: 'LISTENING',
		url: 'https://github.com/rtmacaibay/frong-bot',
	});
	console.log('Activity set!');
});

client.on('messageCreate', message => {
	const msg = message.content;

	if (((msg.toLowerCase().includes('bobert') || msg.toLowerCase().includes('robert')) && msg.toLowerCase().includes('simp')) && !message.author.bot) {
		const name = msg.toLowerCase().includes('bobert') ? 'Bobert' : 'Robert';
		message.channel.send(`Thing about ${name} is he doesn't simp. In fact, he never simps.`);
	}
	if (!msg.startsWith(prefix) || message.author.bot) {return;}

	console.log(`[${message.author.username}]: ${message.content}`);

	const args = msg.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {return;}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Discord.Collection());

	const now = Date.now();
	const timestamps = cooldowns.get(commandName);
	const cooldownAmount = (command.cooldown || 0.5) * 1000;

	if (timestamps.has(message.author.id) && !message.member.hasPermission('ADMINISTRATOR')) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`pleast wait ${timeLeft.toFixed(1)} more second(s) before reusing the '${commandName}' command.`);
		}
	} else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('We don\'t got the brain cells for that command.');
	}
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
	try {
		const server = newMember.guild.id;
		const libraries = client.libraries;

		if (libraries.has(server)) {
			const targetLib = libraries.get(server);
			const joinedChannel = newMember.channelID;
			const leftChannel = oldMember.channelID;

			if (targetLib.includes(joinedChannel) && !newMember.mute) {
				newMember.setMute(true)
					.then(console.log(`Muted user ${newMember.member.user.username}`));
				return;
			} else if (targetLib.includes(leftChannel) && !targetLib.includes(joinedChannel) && joinedChannel !== null) {
				newMember.setMute(false)
					.then(console.log(`Unmuted user ${newMember.member.user.username}`));
				return;
			}
			// TODO: keep track of mute state. A flag = MUTED BEFORE LIBRARY? ; B flag = WAS IN LIBRARY
			/*
                else if (!targetLib.includes(joinedChannel) && joinedChannel !== null && newMember.mute) {
                newMember.setMute(false)
                    .then(console.log(`Unmuted user ${newMember.member.user.username}`));
                 }
            */
		}
	} catch (error) {
		console.error(error);
	}
});

client.login(token);