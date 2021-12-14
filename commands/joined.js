module.exports = {
	name: 'joined',
	description: 'Displays when you joined the server',
	aliases: ['j'],
	args: true,
	usage: '<optional: @ a user to check their joined date',
	execute(message, args) {
		if (!args.length) {
			const author = message.author;
			const joinedDate = message.member.joinedAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
			return message.delete().then(message.channel.send(`${author} joined: ${joinedDate} PST`));
		}
		else {
			const member = message.mentions.users.first();
			const joinedDate = message.mentions.users.first().joinedAt.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
			return message.delete().then(message.channel.send(`${member} joined: ${joinedDate} PST`));
		}
	},
};