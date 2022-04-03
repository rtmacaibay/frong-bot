module.exports = {
	name: 'granttemp',
	description: 'Grants a user the server specified temp role',
	aliases: ['gt'],
	args: true,
	usage: '<@ a user to grant their temporary role>',
	execute(message) {
		const mainServerID = '744451939848159342';
		const mainRoleID = '744476760485265479';
		const tempRoleID = '959372769685028874';

		if (message.guildId == mainServerID) {
			if (message.member.roles.cache.some(role => role.id == mainRoleID)) {
				const user = message.mentions.users.first();
				const member = message.mentions.members.first();
				if (member != null && user != null && !member.roles.cache.some(role => role.id == mainRoleID)) {
					member.roles.add(`${tempRoleID}`);
					return message.delete().then(message.channel.send({ content: `${user} now has the <@&${mainRoleID}> role`, allowedMentions: { parse: [] } }));
				} else {
					return message.delete().then(message.channel.send('Invalid user specified or user already has role c:'));
				}
			} else {
				return message.delete().then(message.channel.send({ content: `You do not have the <@&${mainRoleID}> role to use this command.`, allowedMentions: { parse: [] } }));
			}
		} else {
			return message.delete().then(message.channel.send('This command is not available for this server.'));
		}
	},
};