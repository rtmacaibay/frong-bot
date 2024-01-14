const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'serverinfo',
	description: 'Displays when you joined the server',
	aliases: ['si'],
	args: false,
	async execute(message) {
		const roles = await message.guild.roles.fetch();
		const members = await message.guild.members.fetch();
		const channels = await message.guild.channels.fetch();
		const emojis = await message.guild.emojis.fetch();
		const owner = await message.guild.fetchOwner();

		const embed = new EmbedBuilder()
			.setTitle(`**${message.guild.name}**`)
			.setDescription('**Server Info**')
			.setColor('BLACK')
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.addField('**General**',
				`*ID:* ${message.guild.id}\n
				*Owner:* ${owner} \n
				*Time Created:* ${message.guild.createdAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST`,
			)
			.addField('**Statistics**',
				`*Role Count:* ${roles.length} \n
				*Emoji Count:* ${emojis.size} \n
				*Regular Emoji Count:* ${emojis.filter(emoji => !emoji.animated).size} \n
				*Animated Emoji Count:* ${emojis.filter(emoji => emoji.animated).size} \n
				*Member Count:* ${message.guild.memberCount} \n
				*Humans:* ${members.filter(member => !member.user.bot).size} \n
				*Bots:* ${members.filter(member => member.user.bot).size} \n
				*Text Channels:* ${channels.filter(channel => channel.type === 'text').size} \n
				*Voice Channels:* ${channels.filter(channel => channel.type === 'voice').size}`,
			)
			.addField('**Presence**',
				`*Online:* ${members.filter(member => { return member.presence ? member.presence.status === 'online' : false; }).size} \n
				*Idle:* ${members.filter(member => { return member.presence ? member.presence.status === 'idle' : false; }).size} \n
				*Do Not Disturb:* ${members.filter(member => { return member.presence ? member.presence.status === 'dnd' : false; }).size} \n
				*Offline:* ${members.filter(member => { return member.presence ? member.presence.status === 'offline' : false; }).size}`,
			);

		message.delete().then(message.channel.send({ embeds: [embed] }));
	},
};