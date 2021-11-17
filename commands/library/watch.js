module.exports = {
	name: 'watch',
	description: 'Watches a channel and mutes any user that enters / unmutes any user that leaves',
	cooldown: 10,
	args: false,
	usage: '{user must be in voice channel to watch}',
	aliases: ['w'],
	execute(message) {
		setTimeout(() => {
			message.delete()
				.then(() => {
					const libraries = message.client.libraries;
					const user = message.member;

					if (user.hasPermission('MANAGE_CHANNELS', true, true)) {
						if (!user.voice.channel) {
							message.reply('User must be in a voice channel to use this command.')
								.then(msg => {
									msg.delete({ timeout: 10000 });
								});
							return;
						}

						const server = message.guild.id;
						const channelID = user.voice.channelID;

						if (libraries.has(server)) {
							const channels = libraries.get(server);
							if (channels.includes(channelID)) {
								message.reply(`Channel is already being watched. If you wish to unwatch, please use ${message.client.prefix}unwatch.`)
									.then(msg => {
										msg.delete({ timeout: 10000 });
									});
								return;
							}
							else {
								channels.push(channelID);
								libraries.set(server, channels);
								message.reply(`Channel is now being watched. If you wish to unwatch, please use ${message.client.prefix}unwatch.`)
									.then(msg => {
										msg.delete({ timeout: 10000 });
									});
								const memberMap = user.voice.channel.members;
								for (const member of memberMap) {
									member[1].voice.setMute(true)
										.then(console.log(`Muted ${member[1].user.username}`));
								}
							}
						}
						else {
							const channels = [];
							channels.push(channelID);
							libraries.set(server, channels);
							message.reply(`Channel is now being watched. If you wish to unwatch, please use ${message.client.prefix}unwatch.`)
								.then(msg => {
									msg.delete({ timeout: 10000 });
								});
							const memberMap = user.voice.channel.members;
							for (const member of memberMap) {
								member[1].voice.setMute(true)
									.then(console.log(`Muted ${member[1].user.username}`));
							}
						}
					}
					else {
						message.reply('You do not have the permission to use this command.')
							.then(msg => {
								msg.delete({ timeout: 10000 });
							});
					}
				});
		}, 500);
	},
};