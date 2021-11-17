module.exports = {
	name: 'roll',
	description: 'To roll a dice',
	args: false,
	usage: '<# of dice to roll>',
	execute(message, args) {
		let number = 0;
		const rolls = args[0] > 1 ? args[0] : 1;
		const emoji = message.client.guilds.resolve('709481570230337596').emojis.cache.find(e => e.name === 'dice');
		const out = `${emoji} `;

		for (let i = 0; i < rolls; i++) {
			number += Math.floor((Math.random() * 6) + 1);
		}

		message.delete().then(
			message.channel.send(`${out.repeat(rolls)}`).then(
				msg => {
					setTimeout(() => {
						msg.delete().then(message.channel.send(`It's a ${number}.`));
					}, 5000);
				},
			),
		);
	},
};