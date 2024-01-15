export const Say = {
	name: 'say',
	description: 'Says what the user wants',
	args: true,
	usage: '<phrase to say>',
	execute(message, args) {
		const msg = args.join(' ');
		message.delete().then(message.channel.send(msg));
	},
};