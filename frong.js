import fs, { link } from 'fs';
import Discord from 'discord.js';
import Client from './client/client.js';
import { config } from './config.js';
import fetch from 'node-fetch';
import { Commands } from './exports.js';

const client = new Client(config);
const token = client.token;
const quickvidsToken = client.quickvidsBearerToken;

for (const command of Commands) {
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity(`Glimpse of Us by Joji`, {
		type: 'LISTENING',
		url: 'https://github.com/rtmacaibay/frong-bot',
	});
	console.log('Activity set!');
});

client.on(Discord.Events.MessageCreate, async message => {
	// check if server is in database
	if (message.guild && !message.author.bot) {
		await client.pool.query(`
			SELECT prefix
			FROM servers
			WHERE server_id = $1
		;`,
		[message.guild.id],
		async (err, res) => {
			if (err || res.rowsCount == 0) {
				await client.pool.query(`
					INSERT INTO servers
						(server_name, server_id, prefix)
					VALUES ($1, $2, $3)
					ON CONFLICT (server_id)
					DO NOTHING
				;`,
				[message.guild.name, message.guild.id, client.prefix],
				(err, res) => {
					if (err) {
						console.log('Error - Failed to insert server into servers');
						console.log(err);
					} else {
						if (res.rowCount > 0) {
							console.log(`Server rows added: ${res.rowCount}`);
						}
						InterpretMessage(message, client.prefix);
					}
				});
			} else {
				InterpretMessage(message, res.rows[0].prefix);
			}
		});
	}
});

function InterpretMessage(message, prefix) {
	const msg = message.content;
	if (msg.length > 400) {return;}

	if (message.channel.id == 744461168395026493 && (!msg.startsWith(`${prefix}g`) && !msg.startsWith(`${prefix}grant`)) && !message.author.bot && !message.member.permissions.has('ADMINISTRATOR')) {
		console.log(`[${message.author.username}]: ${message.content}`);
		message.delete('This is the welcome channel idiot.');
	}

	let { tiktok_urls, instagram_urls, twitter_urls, reddit_urls } = ExtractURLs(msg.replace("https://www.", "https://"));

	ProcessURLs(message, tiktok_urls, instagram_urls, twitter_urls, reddit_urls);

	if (!msg.startsWith(prefix) || message.author.bot) {return;}

	console.log(`[${message.author.username}]: ${message.content}`);

	const args = msg.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) {return;}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.delete()
			.then((replyMsg) =>
				replyMsg.channel.send(reply)
					.then((m) =>
						setTimeout(function() {
							m.delete();
						}, 3000),
					));
	}

	if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Discord.Collection());

	const now = Date.now();
	const timestamps = cooldowns.get(commandName);
	const cooldownAmount = (command.cooldown || 0.5) * 1000;

	if (timestamps.has(message.author.id) && !message.member.permissions.has('ADMINISTRATOR')) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`pleast wait ${timeLeft.toFixed(1)} more second(s) before reusing the '${commandName}' command.`);
		}
	} else {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('We don\'t got the brain cells for that command.');
	}
}

function ExtractURLs(message) {
	let tiktok_urls = message.replace("photo", "video").replace("https://vxtiktok.com/", "https://tiktok.com/").match(/https:\/\/(www.)?((vm|vt).tiktok.com\/[A-Za-z0-9]+|tiktok.com\/@[\w.]+\/video\/[\d]+\/?|tiktok.com\/t\/[a-zA-Z0-9]+\/)/);
	if (tiktok_urls == null) {
		tiktok_urls = message.replace("photo", "video").match(/https:\/\/(vx)?tiktok\.com\/@[\w.]?\/video\/[\d]+\/?/);
		if (tiktok_urls != null) {
			let username = ProcessTiktokUsername(tiktok_urls[0]);
			if (username != "") {
				tiktok_urls = [tiktok_urls[0].replace("@", `@${username}`)];
			} else {
				tiktok_urls = null;
			}
		}
	}
	let instagram_urls = message.match(/(https:\/\/(www.)?instagram\.com\/(?:p|reels|reel)\/([^/?#&]+))/);
    let twitter_urls = message.replace("https://x.com/", "https://twitter.com/").match(/(https:\/\/(www.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/[0-9]+)/);
    let reddit_urls = message.match(/(https?:\/\/(?:www.)?(?:old\.)?reddit\.com\/r\/[A-Za-z0-9_]+\/(?:comments|s)\/[A-Za-z0-9_]+(?:\/[^\/ ]+)?(?:\/\w+)?)|(https?:\/\/(?:www.)?redd\.it\/[A-Za-z0-9]+)/);

    return { tiktok_urls, instagram_urls, twitter_urls, reddit_urls };
}

async function ProcessURLs(message, tiktok_urls, instagram_urls, twitter_urls, reddit_urls) {
	let seen = tiktok_urls != null || instagram_urls != null || twitter_urls != null || reddit_urls != null;

	if (tiktok_urls != null) {
		let original_url = tiktok_urls[0];
		Quickvids(original_url).then(async (quickvids) => {
			if (quickvids == undefined || quickvids.url == undefined) {
				let processed_url = original_url.replace("https://tiktok", "https://vxtiktok");
				let row = getActionRow(processed_url);

				message.channel.send({ content: `<@${message.author.id}> | [vxtiktok](${processed_url})`, allowedMentions: { parse: [] }, components: [row] })
					.then((msg) => processURLReaction(msg, original_url, message.author));
				return;
			}
			let usernameOutput = `@${quickvids.username} | QuickVids.app`;
			let descriptionOutput = ` | \"${quickvids.description}\"`;
			if (quickvids.username == undefined || quickvids.username == "") {
				usernameOutput = "QuickVids.app";
			}
			if (quickvids.description == undefined || quickvids.description == "") {
				descriptionOutput = "";
			}
			let processed_url = quickvids.url;
			let row = getActionRow(processed_url);
			let carouselArr = await ProcessTiktokCarousel(processed_url)
			if (carouselArr.length > 0) {
				let embeds = [new Discord.EmbedBuilder().setURL(processed_url).setImage(carouselArr[0]).setTitle(`Download All ${carouselArr.length} Images Here`)];
				let embedArr = carouselArr.slice(0, 4);
				for (let i = 1; i < embedArr.length; i++) {
					embeds.push(new Discord.EmbedBuilder().setURL(processed_url).setImage(embedArr[i]));
				}
				message.channel.send({ content: `<@${message.author.id}> | [${usernameOutput}](${processed_url})${descriptionOutput}`, embeds: embeds, allowedMentions: { parse: [] }, components: [row] })
					.then((msg) => processURLReaction(msg, original_url, message.author));
			} else {
				message.channel.send({ content: `<@${message.author.id}> | [${usernameOutput}](${processed_url})${descriptionOutput}`, allowedMentions: { parse: [] }, components: [row] })
					.then((msg) => processURLReaction(msg, original_url, message.author));
			}
		});
	} else if (instagram_urls != null) {
		let original_url = instagram_urls[0];
		
		let processed_url = original_url.replace("https://instagram.com/", "https://instagramez.com/");
		let row = getActionRow(processed_url);
		message.channel.send({ content: `<@${message.author.id}> | [instagramez](${processed_url}) *link doesn't work; please click See Original URL*`, allowedMentions: { parse: [] }, components: [row] })
			.then((msg) => processURLReaction(msg, original_url, message.author));
	} else if (twitter_urls != null) {
		let original_url = twitter_urls[0];
		let processed_url = original_url.replace("https://twitter.com/", "https://vxtwitter.com/");
		let row = getActionRow(processed_url);
		message.channel.send({ content: `<@${message.author.id}> | [vxtwitter](${processed_url})`, allowedMentions: { parse: [] }, components: [row] })
			.then((msg) => processURLReaction(msg, original_url, message.author));
	} else if (reddit_urls != null) {
		let original_url = reddit_urls[0];
		let { streamable_url, description } = await ProcessRedditURL(original_url);
		if (original_url.match(streamable_url)) {
			let processed_url = original_url.replace("reddit.com/", "rxddit.com/").replace("redd.it/", "rxddit.com/");
			let row = getActionRow(original_url);
			message.channel.send({ content: `<@${message.author.id}> | [rxddit](${processed_url}) | ${description}`, allowedMentions: { parse: [] }, components: [row] })
				.then((msg) => processURLReaction(msg, original_url, message.author));
		} else {
			let row = getActionRow(streamable_url);
			message.channel.send({ content: `<@${message.author.id}> | [streamable](${streamable_url})`, allowedMentions: { parse: [] }, components: [row] })
				.then((msg) => processURLReaction(msg, original_url, message.author));
		}
	}
	if (seen) { message.delete(); }
}

function getActionRow(processed_url) {
	const delete_button = new Discord.ButtonBuilder()
		.setCustomId('delete')
		.setLabel('🗑️')
		.setStyle(Discord.ButtonStyle.Danger);

	const link_button = new Discord.ButtonBuilder()
		.setLabel('🔗')
		.setURL(processed_url)
		.setStyle(Discord.ButtonStyle.Link);

	const original_button = new Discord.ButtonBuilder()
		.setCustomId('original')
		.setLabel('See Original URL')
		.setStyle(Discord.ButtonStyle.Primary);

	return new Discord.ActionRowBuilder().addComponents(link_button, delete_button, original_button);
}

function processURLReaction(message, original_url, author) {
	let posted = 0;

	const collector = message.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 3_600_000 });

	collector.on('collect', interaction => {
		const selection = interaction.customId;
		if (selection === 'delete' && interaction.user.id === author.id) {
			message.delete();
		} else if (selection === 'original' && posted < 1) {
			posted += 1;

			const delete_button = new Discord.ButtonBuilder()
				.setCustomId('delete')
				.setLabel('🗑️')
				.setStyle(Discord.ButtonStyle.Danger);

			const row = new Discord.ActionRowBuilder().addComponents(delete_button);

			message.channel.send({ content: `<@${author.id}> | Original Link: ${original_url}`, flags: [Discord.MessageFlags.SuppressEmbeds], allowedMentions: { parse: [] }, components: [row] })
				.then((msg) => {
					const collector = msg.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 10_000 });

					collector.on('collect', interaction => {
						const selection = interaction.customId;
						if (selection === 'delete' && interaction.user.id === author.id) {
							msg.delete();
						}
					});
				});
			interaction.deferUpdate()
				.catch(console.error);
		} else {
			interaction.deferUpdate()
				.catch(console.error);
		}
	});

	collector.on('end', () => {
		message.edit({ components: [] })
			.catch(error => console.error('Tried editing message:', error.message));
	});
}

async function Quickvids(tiktok_url) {
	return new Promise(function(resolve, reject) {
		try {
			fetch("https://api.quickvids.app/v2/quickvids/shorturl", {
				method: "POST",
				body: JSON.stringify({
					"input_text": tiktok_url,
					"detailed": true,
				}),
				headers: {
					"Authorization": `Bearer ${quickvidsToken}`,
					"Accept": "application/json",
					"Content-Type": "application/json",
					"User-Agent": "Frong Bot - macaibay.com",
				}
			}).then(async (response) => {
				if (response.status == 200) {
					let resp = await response.json();
					resolve({ url: resp['quickvids_url'],  username: resp['details']['author']['username'], description: resp['details']['post']['description'] });
				} else if (response.status == 500) {
					fetch("https://api.quickvids.app/v2/quickvids/shorturl", {
						method: "POST",
						body: JSON.stringify({
							"input_text": tiktok_url,
							"detailed": false,
						}),
						headers: {
							"Authorization": `Bearer ${quickvidsToken}`,
							"Accept": "application/json",
							"Content-Type": "application/json",
							"User-Agent": "Frong Bot - macaibay.com",
						}
					}).then(async (innerResponse) => {
						if (innerResponse.status == 200) {
							let resp = await innerResponse.json();
							resolve({ url: resp['quickvids_url'],  username: undefined, description: undefined });
						} else {
							resolve(undefined)
						}
					});
				} else {
					resolve(undefined);
				}
			});
		} catch (error) {
			console.error(error);
			error = reject;
		}
	});
}

async function ProcessTiktokCarousel(quickvids_url) {
	return new Promise(function(resolve, reject) {
		try {
			fetch(quickvids_url, {
				method: "GET",
				headers: {
					"content-type": "application/json",
					"user-agent": "Frong Bot - macaibay.com",
				}
			}).then(async (response) => {
				if (response.status == 200) {
					let resp = await response.text();
					if (resp.includes(">Download All Images</button>")) {
						let data = resp.substring(resp.indexOf("[", resp.indexOf("images:[", resp.indexOf("const data ="))), resp.indexOf("],", resp.indexOf("images:[", resp.indexOf("const data ="))) + 1);
						let carouselArr = await JSON.parse(data);
						resolve(carouselArr);
					} else {
						resolve([]);
					}
				} else {
					resolve([]);
				}
			});
		} catch (error) {
			console.error(error);
			error = reject;
		}
	});
}

async function ProcessTiktokUsername(tiktok_url) {
	return new Promise(function(resolve, reject) {
		try {
			fetch(tiktok_url, {
				method: "GET",
				headers: {
					"content-type": "application/json",
					"user-agent": "Frong Bot - macaibay.com",
				}
			}).then(async (response) => {
				if (response.status == 200) {
					let resp = await response.text();
					let username = resp.substring(resp.indexOf("\"", resp.indexOf(":", resp.indexOf("\"uniqueId\":\""))) + 1, resp.indexOf("\",", resp.indexOf("\"uniqueId\":\"")));
					resolve(username);
				} else {
					resolve("");
				}
			});
		} catch (error) {
			console.error(error);
			error = reject;
		}
	})
}

async function ProcessRedditURL(url) {
	return new Promise(function(resolve, reject) {
		try {
			fetch(url, {
				method: "GET",
				headers: {
					"content-type": "application/json",
					"user-agent": "Frong Bot - macaibay.com",
				}
			}).then(async (response) => {
				let description = "";
				console.log(response);
				if (response.status == 200) {
					let resp = await response.text();
					if (resp.includes("\"target_url_domain\": \"streamable.com\"")) {
						let streamable_url = resp.substring(resp.indexOf("https", resp.indexOf("target_url")), resp.indexOf("\",", resp.indexOf("target_url")));
						resolve({ streamable_url, description });
					} else {
						description = resp.substring(resp.indexOf(">", resp.indexOf("<title>")) + 1, resp.indexOf("</title>"));
						resolve({ url, description });
					}
				} else {
					resolve({ url, description });
				}
			});
		} catch (error) {
			console.error(error);
			error = reject;
		}
	});
}



client.on('voiceStateUpdate', (oldMember, newMember) => {
	try {
		const server = newMember.guild.id;
		const libraries = client.libraries;

		if (libraries.has(server)) {
			const targetLib = libraries.get(server);
			const joinedChannel = newMember.channelID;
			const leftChannel = oldMember.channelID;

			if (targetLib.includes(joinedChannel) && !newMember.mute) {
				newMember.setMute(true)
					.then(console.log(`Muted user ${newMember.member.user.username}`));
				return;
			} else if (targetLib.includes(leftChannel) && !targetLib.includes(joinedChannel) && joinedChannel !== null) {
				newMember.setMute(false)
					.then(console.log(`Unmuted user ${newMember.member.user.username}`));
				return;
			}
			// TODO: keep track of mute state. A flag = MUTED BEFORE LIBRARY? ; B flag = WAS IN LIBRARY
			/*
                else if (!targetLib.includes(joinedChannel) && joinedChannel !== null && newMember.mute) {
                newMember.setMute(false)
                    .then(console.log(`Unmuted user ${newMember.member.user.username}`));
                 }
            */
		}
	} catch (error) {
		console.error(error);
	}
});

client.login(token);