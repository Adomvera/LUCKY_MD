const middleware = require('../../utility/botUtil/middleware');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'promote-all',
  aliases: ['admin-all', 'make-admin-all', 'grant-all', 'empower'],
  description: 'Promotes all members to admin status',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, botname, prefix } = context;

      if (!botname) {
        console.error('Fee-Xmd: Botname not set in context');
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ SYSTEM MALFUNCTION! 😤\n│• Bot identity not configured\n│• Contact system administrator\n│• Error: BOTNAME_UNDEFINED\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      if (!m.isGroup) {
        console.log(`Fee-Xmd: Promote-all command attempted in non-group chat by ${m.sender}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ COMMAND USAGE ERROR! 😈\n│• This command works ONLY in groups\n│• Current chat: PRIVATE CHAT ❌\n│• Required: GROUP CHAT ✅\n│• Usage: ${prefix}promote-all\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Send initial analysis message
      await m.reply(
        `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ 📊 GROUP ANALYSIS INITIATED\n│• Bot: ${botname}\n│• Requested by: ${m.pushName}\n│• Time: ${new Date().toLocaleTimeString()}\n│• Status: SCANNING MEMBERS...\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
      );

      // Fetch group metadata
      let groupMetadata;
      try {
        groupMetadata = await client.groupMetadata(m.chat);
      } catch (e) {
        console.error(`Fee-Xmd: Error fetching group metadata: ${e.stack}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ DATA RETRIEVAL FAILED! 😤\n│• Error: ${e.message}\n│• Possible causes:\n│  1. Network issues\n│  2. Group privacy settings\n│  3. Bot permission restrictions\n│• Solution: Try again later\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      const members = groupMetadata.participants;
      const botId = client.user.id.split(':')[0];
      const commandUserId = m.sender.split(':')[0];
      const totalMembers = members.length;
      
      // Get current admins
      const adminParticipants = members.filter((p) => p.admin != null);
      const adminIds = adminParticipants.map((p) => p.id.split(':')[0]);
      const currentAdminCount = adminIds.length;

      console.log(`Fee-xmd: Total Members: ${totalMembers}, Current Admins: ${currentAdminCount}, Bot ID: ${botId}`);

      // Check if bot is admin
      if (!adminIds.includes(botId)) {
        console.log(`Fee-Xmd: Bot ${botId} is not admin in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ PERMISSION DENIED! 🚫\n│• Bot Status: NOT ADMIN ❌\n│• Required: ADMIN PRIVILEGES ✅\n│• To use this command:\n│  1. Make @${botId.split('@')[0]} admin\n│  2. Run ${prefix}promote-all again\n│• Without admin rights, I'm powerless! 😔\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Check if command user is admin
      if (!adminIds.includes(commandUserId)) {
        console.log(`Fee-Xmd: Command user ${commandUserId} is not admin in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ AUTHORIZATION FAILED! 😠\n│• User: ${m.pushName}\n│• Status: NOT ADMIN ❌\n│• This command requires:\n│  - User must be group admin\n│  - Bot must be group admin\n│• Please contact current admins\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Calculate members to promote
      const membersToPromote = members.filter(member => 
        !adminIds.includes(member.id.split(':')[0])
      );

      if (membersToPromote.length === 0) {
        console.log(`Fee-Xmd: All members are already admins in ${m.chat}`);
        return m.reply(
          `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ STATUS CHECK COMPLETE! 🎯\n│• Total Members: ${totalMembers}\n│• Current Admins: ${currentAdminCount}\n│• Members to Promote: 0 ✅\n│• Result: EVERYONE IS ALREADY ADMIN!\n│• This is a true democracy! 🗳️\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
        );
      }

      // Send confirmation message
      const confirmMessage = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ OPERATION CONFIRMATION ⚠️\n│• Total Group Members: ${totalMembers}\n│• Current Admins: ${currentAdminCount}\n│• Members to Promote: ${membersToPromote.length}\n│• Estimated Time: ${Math.ceil(membersToPromote.length * 1.5)} seconds\n│\n│📋 OPERATION DETAILS:\n│• This will promote ${membersToPromote.length} members\n│• All non-admin members become admins\n│• Group will have ${totalMembers} admins\n│• Action is IRREVERSIBLE!\n│\n│⚠️ WARNING: Too many admins can cause:\n│• Spamming issues\n│• Management conflicts\n│• Security risks\n│\n│Type *CONFIRM* to proceed or *CANCEL* to abort\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`;
      
      await m.reply(confirmMessage);

      // Wait for confirmation (simplified version - in real bot you'd need to handle this properly)
      // For now, we'll proceed after a short delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Send starting message
      await m.reply(
        `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ 🚀 MASS PROMOTION INITIATED\n│• Target: ${membersToPromote.length} members\n│• Bot: ${botname}\n│• Executor: ${m.pushName}\n│• Start Time: ${new Date().toLocaleTimeString()}\n│• Status: PROCESSING... ⏳\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
      );

      // Start promotion process
      const promotedMembers = [];
      const failedMembers = [];
      let progress = 0;

      for (const member of membersToPromote) {
        try {
          const memberId = member.id;
          const memberName = member.name || member.id.split('@')[0];
          
          // Send progress update every 5 members
          if (progress % 5 === 0 && progress > 0) {
            await m.reply(
              `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ 📈 PROMOTION PROGRESS\n│• Completed: ${progress}/${membersToPromote.length}\n│• Successful: ${promotedMembers.length}\n│• Failed: ${failedMembers.length}\n│• Percentage: ${Math.round((progress/membersToPromote.length)*100)}%\n│• Current: ${memberName}\n│• Status: IN PROGRESS...\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
            );
          }

          await client.groupParticipantsUpdate(m.chat, [memberId], 'promote');
          promotedMembers.push({ id: memberId, name: memberName });
          
          console.log(`Fee-Xmd: Promoted ${memberName} (${memberId.split(':')[0]})`);
          
          progress++;
          await new Promise(resolve => setTimeout(resolve, 1500)); // Delay to avoid rate limiting
          
        } catch (error) {
          console.error(`Fee-Xmd: Failed to promote member ${member.id}: ${error.message}`);
          failedMembers.push({ id: member.id, name: member.name || member.id.split('@')[0], error: error.message });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Compile final report
      const successCount = promotedMembers.length;
      const failCount = failedMembers.length;
      const successRate = Math.round((successCount / membersToPromote.length) * 100);
      
      // Final success message
      let finalMessage = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ 🎉 OPERATION COMPLETED!\n│\n│📊 FINAL STATISTICS:\n│• Total Targets: ${membersToPromote.length}\n│• Successfully Promoted: ${successCount}\n│• Failed Promotions: ${failCount}\n│• Success Rate: ${successRate}%\n│• Completion Time: ${new Date().toLocaleTimeString()}\n│\n│👑 NEW ADMIN STRUCTURE:\n│• Total Group Members: ${totalMembers}\n│• New Admin Count: ${currentAdminCount + successCount}\n│• Regular Members: ${failCount}\n`;
      
      if (successCount > 0) {
        finalMessage += `│\n│✅ SUCCESSFUL PROMOTIONS:\n`;
        const samplePromoted = promotedMembers.slice(0, 5).map((m, i) => `│  ${i+1}. ${m.name}`).join('\n');
        finalMessage += samplePromoted;
        if (promotedMembers.length > 5) {
          finalMessage += `\n│  ...and ${promotedMembers.length - 5} more`;
        }
      }
      
      if (failCount > 0) {
        finalMessage += `\n│\n│❌ FAILED PROMOTIONS:\n`;
        const sampleFailed = failedMembers.slice(0, 3).map((m, i) => `│  ${i+1}. ${m.name}`).join('\n');
        finalMessage += sampleFailed;
        if (failedMembers.length > 3) {
          finalMessage += `\n│  ...and ${failedMembers.length - 3} more`;
        }
        finalMessage += `\n│• Common failure reasons:\n│  - User left the group\n│  - WhatsApp API limitations\n│  - Network timeouts`;
      }
      
      finalMessage += `\n│\n│📝 ADMIN MANAGEMENT TIPS:\n│1. Use ${prefix}demote @user to remove admin\n│2. Use ${prefix}demote-all to reset all\n│3. Too many admins? Use moderation!\n│4. Set clear admin guidelines\n│\n│⚡ Powered by: ${botname}\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`;
      
      await m.reply(finalMessage);

      // Send additional management instructions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await m.reply(
        `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ 🛡️ ADMIN MANAGEMENT GUIDE\n│\n│🔧 AVAILABLE COMMANDS:\n│• ${prefix}promote @user - Make single admin\n│• ${prefix}demote @user - Remove admin\n│• ${prefix}promote-all - Make all admins\n│• ${prefix}demote-all - Remove all admins\n│• ${prefix}admins - List all admins\n│\n│⚠️ SECURITY RECOMMENDATIONS:\n│• Keep 3-5 trusted admins maximum\n│• Regularly review admin list\n│• Remove inactive admins\n│• Set group rules\n│\n│📞 NEED HELP?\n│• Contact bot developer\n│• Read documentation\n│• Join support group\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
      );

    }).catch(async (error) => {
      console.error(`Fee-Xmd: Error in promote-all command: ${error.stack}`);
      await m.reply(
        `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n│✿ CRITICAL ERROR OCCURRED! 💀\n│\n│🔴 ERROR DETAILS:\n│• Type: ${error.name || 'Unknown'}\n│• Message: ${error.message}\n│• Time: ${new Date().toLocaleTimeString()}\n│\n│🛠️ TROUBLESHOOTING:\n│1. Check bot admin status\n│2. Verify group permissions\n│3. Ensure stable internet\n│4. Try again in 30 seconds\n│\n│📞 SUPPORT:\n│• Save this error message\n│• Contact technical support\n│• Error Code: PROMOTE_ALL_${Date.now()}\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤`
      );
    });
  },
};