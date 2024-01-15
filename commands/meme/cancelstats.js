import plural from 'pluralize';

export const CancelStats = {
	name: 'cancelstats',
	description: 'Tells you the \'cancel\' stats of a particular query',
	aliases: ['cs'],
	args: true,
	usage: '<anything>',
	execute(message, args) {
		const cancel = args.join(' ');
		const cancels = message.client.cancels;
		const count = cancels.has(cancel) ? cancels.get(cancel) : 0;
		const grammar = plural.isPlural(args[0]) || plural.isPlural(args[args.length - 1]) ? 'have' : 'has';

		message.delete().then(message.channel.send(`${cancel} ${grammar} been cancelled ${count} times.`));
	},
};