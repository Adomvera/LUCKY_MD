module.exports = async (context) => {
    const { client, m, participants, text } = context;

    if (!m.isGroup) {
        return client.sendMessage(
            m.chat,
            { text: '❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n✿ Command meant for groups.\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤' },
            { quoted: m }
        );
    }

    try {
        const mentions = participants.map(a => a.id);
        const txt = [
            `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`,
            `✿ Hi You have been tagged here.`,
            `  Message: ${text ? text : 'No Message!'}`,
            '',
            ...mentions.map(id => `💌 @${id.split('@')[0]}`),
            `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        ].join('\n');

        await client.sendMessage(
            m.chat,
            { text: txt, mentions },
            { quoted: m }
        );
    } catch (error) {
        console.error(`Tagall error: ${error.message}`);
        await client.sendMessage(
            m.chat,
            { text: '❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n✿ Failed to tag participants. Try again later.\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤' },
            { quoted: m }
        );
    }
};