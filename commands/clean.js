module.exports = {
	name: 'clean',
	description: 'Deletes a number of messages that are no more than two weeks old',
	args: true,
	aliases: ['clear'],
	usage: '<positive integer>',
	execute(message, args) {
		if (!message.member.permissions.has('MANAGE_MESSAGES')) {
			return message.reply('Hey, you don\'t have the permissions to clean/clear messages!')
				.then(msg => setTimeout(function() {
					msg.delete();
					message.delete();
				}, 5000));
		}

		if (parseInt(args[0])) {
			if (args[0] < 1) {
				message.channel.send(`You didn't specific a positive numeric argument, ${message.author}!`);
				return;
			}
			message.channel.bulkDelete(parseInt(args[0]) + 1)
				.then(messages =>
					message.channel.send(`The Yummy has taken ${messages.size - 1} messages to the beyond.`)
						.then(msg => setTimeout(function() {
							msg.delete();
						}, 3000)),
				)
				.catch(console.error);

		}
		else {
			message.channel.send(`You didn't specific a positive numeric argument, ${message.author}!`)
				.then(msg => setTimeout(function() {
					msg.delete();
					message.delete();
				}, 5000));
		}
	},
};