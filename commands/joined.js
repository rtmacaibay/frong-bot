module.exports = {
	name: 'joined',
	description: 'Displays when you joined the server',
	aliases: ['j'],
	args: false,
	usage: '<optional: @ a user to check their joined date',
	execute(message, args) {
		if (!args.length) {
			const author = message.author;
			const joinedDate = message.member.joinedAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
			return message.delete().then(message.channel.send(`${author} joined: ${joinedDate} PST`));
		} else {
			const user = message.mentions.users.first();
			const member = message.mentions.members.first();
			if (member != null && user != null) {
				const joinedDate = member.joinedAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
				return message.delete().then(message.channel.send(`${user} joined: ${joinedDate} PST`));
			} else {
				return message.delete().then(message.channel.send('Invalid user'));
			}
		}
	},
};