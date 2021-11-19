const plural = require('pluralize');

module.exports = {
	name: 'cancel',
	description: 'Cancels anything you ask it to cancel',
	aliases: ['c'],
	args: true,
	usage: '<anything>',
	execute(message, args) {
		const cancel = args.join(' ');
		const cancels = message.client.cancels;
		const over = args.join('').toLowerCase();
		const grammar = plural.isPlural(args[0]) || plural.isPlural(args[args.length - 1]) ? 'are' : 'is';

		if (cancels.has(cancel)) {
			cancels.set(cancel, cancels.get(cancel) + 1);
		}
		else {
			cancels.set(cancel, 1);
		}

		message.delete().then(message.channel.send(`${cancel} ${grammar} officially cancelled. #${over}${grammar}overparty`));
	},
};