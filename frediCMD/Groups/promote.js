const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
    await middleware(context, async () => {
        const { client, m } = context;

        if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
            return m.reply('❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n❒ You did not give me a user!?\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤');
        }

        let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
        if (!users) {
            return m.reply('❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n❒ Invalid user specified.\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤');
        }

        const parts = users.split('@')[0];

        await client.groupParticipantsUpdate(m.chat, [users], 'promote');
        m.reply(`❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n❒ ${parts} is now an admin. 🥇\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`);
    });
};