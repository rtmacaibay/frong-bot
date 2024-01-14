require('dotenv').config();

module.exports = {
	config: {
		db: process.env.DATABASE_URL,
		prefix: process.env.PREFIX,
		token: process.env.TOKEN,
		jsonLinkApiKey: process.env.JSON_LINK_API_KEY,
	},
};