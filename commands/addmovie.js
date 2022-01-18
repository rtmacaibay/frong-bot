module.exports = {
	name: 'addmovie',
	description: 'Adds a movie',
	aliases: ['addm'],
	args: true,
	usage: '<any movie title>',
	async execute(message, args) {
		const movie = args.join(' ');

		if (!message.guild) {
			return message.delete().then((msg) => {
				msg.send('Please use this command inside a server/guild.').then((m) => {
					setTimeout(function() {
						m.delete();
					}, 3000);
				});
			});
		}

		await message.client.pool.query(`
			INSERT INTO movies
				(user_id, movie, server_id)
			VALUES ($1, $2, (SELECT id AS server_id FROM servers WHERE server_id = $3))
		;`,
		[message.author.id, movie, message.guild.id],
		(err, res) => {
			if (err) {
				console.log('Error - Failed to insert user movie into movies');
				console.log(err);
			} else {
				console.log(`Movies rows added: ${res.rowCount}`);
				message.channel.send({ content: `Added ${movie} to the list. *Recommended by <@${message.author.id}>*`, allowedMentions: { parse: [] } });
			}
		});

		return message.delete();
	},
};