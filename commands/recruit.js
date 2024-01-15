export const Recruit = {
	name: 'recruit',
	description: 'Another classic Pooncity copypasta',
	args: false,
	usage: '<optional: any number of people youre looking to recruit',
	async execute(message, args) {
		const num = args.length > 0 && parseInt(args[0]) > 0 ? args[0] : 5;
		if (message.guild.id === '161941174687498240') {
            let role = await message.guild.roles.fetch('715779742908809226');
            setTimeout(() => {  message.delete()
                .then(message.channel.send(`${role} Recruitment event tonight: ${num} mans, if you perform and impress you WILL be invited to our team`)); }, 500);
        } else {
            setTimeout(() => { message.delete()
                .then(message.channel.send(`Recruitment event tonight: ${num} mans, if you perform and impress you WILL be invited to our team`)); }, 500);
        }
	},
};