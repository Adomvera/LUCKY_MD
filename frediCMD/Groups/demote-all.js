const middleware = require('../../utility/botUtil/middleware');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'demote-all',
  aliases: ['unadmin-all', 'removeadmin-all'],
  description: 'Demotes all admins except bot and command user',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, botname, prefix } = context;

      if (!botname) {
        console.error('Fee-Xmd: Botname not set in context');
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ Bot's fucked, ${m.pushName}! 😤 No botname set. Yell at the dev, dipshit! 💀\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      if (!m.isGroup) {
        console.log(`Fee-Xmd: Demote-all command attempted in non-group chat by ${m.sender}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ Yo, ${m.pushName}, you dumb fuck! 😈 This ain't a group! Use ${prefix}demote-all in a group, moron! 🖕\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Fetch group metadata
      let groupMetadata;
      try {
        groupMetadata = await client.groupMetadata(m.chat);
      } catch (e) {
        console.error(`Fee-Xmd: Error fetching group metadata: ${e.stack}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ Shit broke, ${m.pushName}! 😤 Couldn't get group data: ${e.message}. Fix this crap! 💀\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      const members = groupMetadata.participants;
      const botId = client.user.id.split(':')[0]; // Normalize bot ID
      const commandUserId = m.sender.split(':')[0]; // Normalize command user ID
      
      // Get all admins
      const admins = members
        .filter((p) => p.admin != null)
        .map((p) => p.id.split(':')[0]);

      console.log(`Fee-xmd: Bot ID: ${botId}, Command User: ${commandUserId}, Admins: ${JSON.stringify(admins)}`);

      // Check if bot is admin
      if (!admins.includes(botId)) {
        console.log(`Fee-Xmd: Bot ${botId} is not admin in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ OI, ${m.pushName}! 😤 I ain't admin, so I can't demote anyone! Make me admin or fuck off! 🚫\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Check if command user is admin
      if (!admins.includes(commandUserId)) {
        console.log(`Fee-Xmd: Command user ${commandUserId} is not admin in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ Hey dumbass, ${m.pushName}! 😠 You need to be an admin to use this command! Get some power first! 🖕\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Filter admins to demote (exclude bot and command user)
      const adminsToDemote = admins.filter(adminId => 
        adminId !== botId && adminId !== commandUserId
      );

      if (adminsToDemote.length === 0) {
        console.log(`Fee-Xmd: No admins to demote in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ LOL, ${m.pushName}! 🤣 No other admins to demote! Only me and you have the power! 💪\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      try {
        // Send initial message
        await m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ POWER PURGE INITIATED! ⚡\n│• Executor: @${commandUserId}\n│• Target: ${adminsToDemote.length} admins\n│• Bot: ${botname}\n│• Status: Demoting...\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );

        // Demote all admins except bot and command user
        const demotedAdmins = [];
        const failedAdmins = [];
        
        for (const adminId of adminsToDemote) {
          try {
            const adminJid = adminId.includes('@') ? adminId : `${adminId}@s.whatsapp.net`;
            await client.groupParticipantsUpdate(m.chat, [adminJid], 'demote');
            demotedAdmins.push(adminId);
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (error) {
            console.error(`Fee-Xmd: Failed to demote ${adminId}: ${error.message}`);
            failedAdmins.push(adminId);
          }
        }

        // Make command user admin (in case they weren't already)
        if (!admins.includes(commandUserId)) {
          try {
            const userJid = commandUserId.includes('@') ? commandUserId : `${commandUserId}@s.whatsapp.net`;
            await client.groupParticipantsUpdate(m.chat, [userJid], 'promote');
          } catch (error) {
            console.error(`Fee-Xmd: Failed to promote command user: ${error.message}`);
          }
        }

        // Prepare result message
        let resultMessage = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ POWER PURGE COMPLETE! 🔥\n│• Executor: @${commandUserId}\n│• Bot: ${botname}\n│• Successfully demoted: ${demotedAdmins.length} admin(s)\n`;
        
        if (failedAdmins.length > 0) {
          resultMessage += `│• Failed to demote: ${failedAdmins.length} admin(s)\n`;
        }
        
        resultMessage += `│• Status: REBELLION SUCCESSFUL! 🎭\n│• Note: ${m.pushName} now has supreme control! 👑\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`;
        
        console.log(`Fee-Xmd: Demote-all completed in ${m.chat}. Success: ${demotedAdmins.length}, Failed: ${failedAdmins.length}`);
        await m.reply(resultMessage);

      } catch (error) {
        console.error(`Fee-Xmd: Demote-all command error: ${error.stack}`);
        await m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ REBELLION FAILED, ${m.pushName}! 😫 Error: ${error.message}. The resistance was too strong! 💀\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }
    });
  },
};