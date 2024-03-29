export const ReactMessage = {
	name: 'reactmessage',
	description: 'Reacts to a message with a message',
	cooldown: 3,
	aliases: ['reactm', 'rm'],
	args: true,
	usage: '<words>',
	async execute(message, args) {
		const lastTwo = await message.channel.messages.fetch({ limit: 2 });
		lastTwo.first().delete();
		const allReactionsMap = message.client.reactions;
		const mapExists = allReactionsMap.has(lastTwo.last());
		let map = null;
		if (mapExists) {
			map = allReactionsMap.get(lastTwo.last());
		} else {
			map = new Map();
		}
		let counter = 0;
		try {
			for (let i = 0; i < args.length; i++) {
				for (let j = 0; j < args[i].length && counter < 20; j++) {
					const c = args[i].toLowerCase().charAt(j);
					if (map.get(c)) {
						map.set(c, map.get(c) + 1);
					} else {
						map.set(c, 1);
					}
					let letter;
					if (c == '!') {
						letter = 'exclamationmark_' + (map.get(c) - 1);
					} else if (c == '?') {
						letter = 'questionmark_' + (map.get(c) - 1);
					} else {
						letter = c + '_' + (map.get(c) - 1);
					}
					let server;
					switch (map.get(c)) {
					case 1:
						server = '709481570230337596';
						break;
					case 2:
						server = '709511617598980227';
						break;
					case 3:
						server = '709511828530790592';
						break;
					default:
						server = '709511962995851305';
					}
					const emoji = message.client.guilds.resolve(server).emojis.cache.find(e => e.name === letter);
					if (emoji) {
						counter += 1;
						if (lastTwo.last().deleted) {
							return;
						}
						lastTwo.last().react(emoji);
					}
				}
			}
			allReactionsMap.set(lastTwo.last(), map);
		} catch (e) {
			console.log(e);
		}
	},
};