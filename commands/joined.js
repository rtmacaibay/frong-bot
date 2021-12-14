module.exports = {
	name: 'joined',
	description: 'Displays when you joined the server',
	aliases: ['j'],
	args: false,
	execute(message) {
		return message.delete().then(message.channel.send(`${message.author} joined: ${message.member.joinedAt.toLocaleString('en-US', { timeZone: 'PST' })} PST`));
	},
};