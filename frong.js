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

client.on('messageCreate', async message => {
	const msg = message.content;

	// check if server is in database
	if (message.guild && !message.author.bot && msg.startsWith(prefix)) {
		await client.pool.query(`
			INSERT INTO servers
				(server_name, server_id)
			VALUES ($1, $2)
			ON CONFLICT (server_id)
			DO NOTHING
		;`,
		[message.guild.name, message.guild.id],
		(err, res) => {
			if (err) {
				console.log('Error - Failed to insert server into servers');
				console.log(err);
			} else {
				console.log(`Server rows added: ${res.rowCount}`);
			}
		});
	}

	if (message.channel.id == 744461168395026493 && (!msg.startsWith(`${prefix}g`) && !msg.startsWith(`${prefix}grant`)) && !message.author.bot) {
		message.delete('This is the welcome channel idiot.');
	}

	const keywords = ['is', 'does', 'will', 'why', 'what', 'when', 'where', 'how', 'could', 'would'];

	if (((msg.toLowerCase().includes('bobert') || msg.toLowerCase().includes('robert')) && msg.toLowerCase().includes('simp')) && keywords.some(v => msg.toLowerCase.includes(v)) && !message.author.bot) {
		const name = msg.toLowerCase().includes('bobert') ? 'Bobert' : 'Robert';
		message.channel.send(`Thing about ${name} is he does simp. In fact, he is a Jing simp. Despite all this information, he is only 2% simp, 98% not a simp.`);
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

		return message.delete()
			.then((replyMsg) =>
				replyMsg.channel.send(reply)
					.then((m) =>
						setTimeout(function() {
							m.delete();
						}, 3000),
					));
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