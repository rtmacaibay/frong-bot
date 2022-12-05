module.exports = {
	name: 'prefix',
	description: 'Sets a prefix for the current server - case sensitive',
	aliases: ['p'],
	args: true,
	usage: '<anything>',
	async execute(message, args) {
        if (args.length > 1) {
            return message.delete().then((msg) => {
				msg.send('Please specify a prefix without spaces.').then((m) => {
					setTimeout(function() {
						m.delete();
					}, 3000);
				});
			});
        }

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
            UPDATE servers
            SET prefix = $1
            WHERE server_id = $2
        ;`,
        [args[0], message.guild.id],
        (err, res) => {
            if (err) {
                console.log('Error - failed to set prefix');
                console.log(err);
            } else {
                console.log(`Server rows affected with prefix change: ${res.rowCount}`);
            }
        });

        return message.delete().then((msg) => {
            msg.channel.send(`Prefix changed to \`${args[0]}\` in this server`);
        });
	},
};