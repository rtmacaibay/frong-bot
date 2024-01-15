export const Unwatch = {
	name: 'unwatch',
	description: 'Unwatches a channel',
	usage: '{user must be in voice channel to unwatch}',
	aliases: ['uw'],
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
							let channels = libraries.get(server);
							if (channels.includes(channelID)) {
								channels = channels.filter(item => item !== channelID);
								libraries.set(server, channels);
								message.reply(`Channel is now unwatched. If you wish to watch, please use ${message.client.prefix}watch.`)
									.then(msg => {
										msg.delete({ timeout: 10000 });
									});
								const memberMap = user.voice.channel.members;
								for (const member of memberMap) {
									member[1].voice.setMute(false)
										.then(console.log(`Unmuted ${member[1].user.username}`));
								}
							}
							else {
								message.reply(`Channel is not being watched. If you wish to watch, please use ${message.client.prefix}watch.`)
									.then(msg => {
										msg.delete({ timeout: 10000 });
									});
								return;
							}
						}
						else {
							message.reply('There are no watched channels handled by this bot in this server.')
								.then(msg => {
									msg.delete({ timeout: 10000 });
								});
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