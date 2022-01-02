module.exports = {
	name: 'grant',
	description: 'Grants a user the server specified role',
	aliases: ['g'],
	args: true,
	usage: '<@ a user to grant their role',
	execute(message, args) {
		if (message.guildId == 744451939848159342) {
			if (!args.length) {
				return message.delete().then(message.channel.send(`Please specify the user you want to grant the regular member role to. (e.g. ${message.client.prefix}g <@910350990304231445>`));
			} else if (message.member.roles.find(role => role.id == 744476760485265479)) {
				const user = message.mentions.users.first();
				const member = message.mentions.members.first();
				if (member != null && user != null) {
					member.roles.add(744476760485265479);
					return message.delete().then(message.channel.send(`${user} now has the <@&744476760485265479>`));
				} else {
					return message.delete().then(message.channel.send('Invalid user'));
				}
			} else {
				return message.delete().then(message.channel.send('You do not have the <@&744476760485265479> role to use this command.'));
			}
		} else {
			return message.delete().then(message.channel.send('This command is not available for this server.'));
		}
	},
};