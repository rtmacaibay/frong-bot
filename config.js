require('dotenv').config();

module.exports = {
	config: {
		prefix: process.env.PREFIX,
		token: process.env.TOKEN,
	},
};