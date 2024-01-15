export const RollMovie = {
	name: 'rollmovie',
	description: 'Rolls a movie',
	aliases: ['rollm'],
	args: false,
	async execute(message) {
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
            DELETE FROM 
                movies
            WHERE
                id IN (SELECT id FROM movies WHERE server_id = (SELECT id FROM servers WHERE server_id = $1) ORDER BY random() LIMIT 1)
            RETURNING
                *
		;`,
		[message.guild.id],
		(err, res) => {
			if (err) {
				console.log('Error - Failed to delete user movie from movies');
				console.log(err);
			} else {
				console.log(`Movies rows affected: ${res.rowCount}`);
				if (res.rowCount) {
					message.channel.send({ content: `Movie chosen is ${res.rows[0].movie}. *Recommended by <@${res.rows[0].user_id}>*`, allowedMentions: { parse: [] } });
				} else {
					message.channel.send(`No movies have been added to the list. Please use \`${message.client.prefix}addmovie or ${message.client.prefix}addm\` to add a movie.`);
				}
			}
		});

		return message.delete();
	},
};