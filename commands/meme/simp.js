module.exports = {
	name: 'simp',
	description: 'For alerting others of the simp',
	args: false,
	usage: '<optional: specify something to simp for>',
	async execute(message, args) {
		let output = '';
		if (!args.length) {
			const lastTwo = await message.channel.messages.fetch({ limit: 2 });
			const user = lastTwo.last().author;
			output = `ATTN: ${message.author} is simping for ${user}!`;
		}
		else {
			const target = args.join(' ');
			output = `ATTN: ${message.author} is simping for ${target}!`;
		}

		message.delete().then(message.channel.send(output));
	},
};