module.exports = {
	name: 'rate',
	description: 'Rates anything you ask it to rate',
	aliases: ['r'],
	args: true,
	usage: '<anything>',
	execute(message, args) {
		const ratings = message.client.ratings;
		let rating;
		const query = args.join(' ').toLowerCase().replace(/\s/g, '');
		const final = args.join(' ');
		if (ratings.has(query)) {
			rating = ratings.get(query);
		}
		else {
			let score = Math.floor(Math.random() * 11);

			if (score == 10 && Math.floor(Math.random() * 11) == 10) {
				score = 11;
			}

			rating = `${score}/10`;
			ratings.set(query, rating);
		}

		return message.channel.send(`I rate ${final} a ${rating}`)
			.then(setTimeout(function() {
				message.delete();
			}, 3000));
	},
};