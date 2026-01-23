const fs = require('fs');
const path = require('path');

// Database file path
const WARN_DB_PATH = path.join(__dirname, '../store.json');

// Load warns database
function loadWarns() {
    try {
        if (fs.existsSync(WARN_DB_PATH)) {
            const data = fs.readFileSync(WARN_DB_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading warns database:', error);
    }
    return {};
}

// Save warns database
function saveWarns(warns) {
    try {
        const dir = path.dirname(WARN_DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(WARN_DB_PATH, JSON.stringify(warns, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving warns database:', error);
        return false;
    }
}

// Get user warns
function getUserWarns(groupId, userId) {
    const warns = loadWarns();
    return warns[groupId]?.[userId] || {
        count: 0,
        warnings: [],
        lastWarn: null
    };
}

// Add warn to user
function addWarn(groupId, userId, reason, warnedBy) {
    const warns = loadWarns();
    
    if (!warns[groupId]) {
        warns[groupId] = {};
    }
    
    if (!warns[groupId][userId]) {
        warns[groupId][userId] = {
            count: 0,
            warnings: [],
            lastWarn: null
        };
    }
    
    const warnData = warns[groupId][userId];
    const warnId = Date.now();
    
    warnData.count++;
    warnData.warnings.push({
        id: warnId,
        reason: reason || 'No reason provided',
        warnedBy: warnedBy,
        timestamp: new Date().toISOString()
    });
    warnData.lastWarn = new Date().toISOString();
    
    saveWarns(warns);
    return {
        newCount: warnData.count,
        warnId: warnId
    };
}

// Remove warn from user
function removeWarn(groupId, userId, warnId = null) {
    const warns = loadWarns();
    
    if (!warns[groupId] || !warns[groupId][userId]) {
        return false;
    }
    
    const warnData = warns[groupId][userId];
    
    if (warnId) {
        const index = warnData.warnings.findIndex(w => w.id === warnId);
        if (index !== -1) {
            warnData.warnings.splice(index, 1);
            warnData.count = warnData.warnings.length;
        }
    } else {
        if (warnData.warnings.length > 0) {
            warnData.warnings.pop();
            warnData.count = warnData.warnings.length;
        }
    }
    
    if (warnData.count === 0) {
        delete warns[groupId][userId];
        if (Object.keys(warns[groupId]).length === 0) {
            delete warns[groupId];
        }
    }
    
    saveWarns(warns);
    return true;
}

// Reset user warns
function resetWarns(groupId, userId) {
    const warns = loadWarns();
    
    if (!warns[groupId] || !warns[groupId][userId]) {
        return false;
    }
    
    delete warns[groupId][userId];
    if (Object.keys(warns[groupId]).length === 0) {
        delete warns[groupId];
    }
    
    saveWarns(warns);
    return true;
}

// Get all warns in group
function getGroupWarns(groupId) {
    const warns = loadWarns();
    return warns[groupId] || {};
}

module.exports = {
    name: 'warn',
    aliases: ['warnuser', 'warning', 'w'],
    description: 'Warn system for group management',
    category: 'group',
    
    run: async (context) => {
        const { client, m, text, prefix } = context;
        
        if (!m.isGroup) {
            return client.sendMessage(m.chat, {
                text: "❌ This command can only be used in groups."
            }, { quoted: m });
        }
        
        const args = text ? text.trim().split(' ') : [];
        const subCommand = args[0]?.toLowerCase();
        
        try {
            if (!subCommand || subCommand === 'help') {
                // Show help
                return client.sendMessage(m.chat, {
                    text: `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *WARN SYSTEM COMMANDS*
┋✿
┋✿ 📋 *Usage:*
┋✿ ${prefix}warn @user [reason]
┋✿ ${prefix}warn check @user
┋✿ ${prefix}warn list
┋✿ ${prefix}warn remove @user
┋✿ ${prefix}warn reset @user
┋✿
┋✿ 🔄 *Reply Method:*
┋✿ Reply to user's message with:
┋✿ ${prefix}warn [reason]
┋✿
┋✿ ⚠️ *Warning Levels:*
┋✿ • 1st warn: Warning message
┋✿ • 2nd warn: Warning + mute
┋✿ • 3rd warn: Remove from group
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`
                }, { quoted: m });
            }
            
            if (subCommand === 'list') {
                // List all warned users in group
                const groupWarns = getGroupWarns(m.chat);
                const warnedUsers = Object.keys(groupWarns);
                
                if (warnedUsers.length === 0) {
                    return client.sendMessage(m.chat, {
                        text: "✅ No users have warnings in this group."
                    }, { quoted: m });
                }
                
                let listText = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n┋✿ *WARNED USERS LIST*\n┋✿\n┋✿ 📊 Total: ${warnedUsers.length}\n┋✿\n`;
                
                for (const userId of warnedUsers) {
                    const userWarns = groupWarns[userId];
                    const userName = await client.getName(userId) || userId.split('@')[0];
                    listText += `┋✿ 👤 @${userId.split('@')[0]}\n`;
                    listText += `┋✿    ⚠️ Warnings: ${userWarns.count}/3\n`;
                    if (userWarns.lastWarn) {
                        listText += `┋✿    🕒 Last: ${new Date(userWarns.lastWarn).toLocaleDateString()}\n`;
                    }
                    listText += `┋✿\n`;
                }
                
                listText += `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`;
                
                return client.sendMessage(m.chat, {
                    text: listText,
                    mentions: warnedUsers
                }, { quoted: m });
            }
            
            let targetUser = null;
            let reason = '';
            
            // Method 1: Check if user is mentioned
            if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetUser = m.mentionedJid[0];
                reason = args.slice(1).join(' ') || 'No reason provided';
            }
            // Method 2: Check if replying to a message
            else if (m.quoted) {
                targetUser = m.quoted.sender;
                reason = text || 'No reason provided';
            }
            
            if (!targetUser) {
                // No target user specified
                return client.sendMessage(m.chat, {
                    text: `❌ Please mention a user or reply to their message.\nExample: ${prefix}warn @user [reason]`
                }, { quoted: m });
            }
            
            // Don't allow warning yourself
            if (targetUser === m.sender) {
                return client.sendMessage(m.chat, {
                    text: "❌ You cannot warn yourself."
                }, { quoted: m });
            }
            
            // Don't allow warning the bot
            if (targetUser === client.user.id) {
                return client.sendMessage(m.chat, {
                    text: "❌ You cannot warn me."
                }, { quoted: m });
            }
            
            if (subCommand === 'check') {
                // Check user warns
                const userWarns = getUserWarns(m.chat, targetUser);
                
                let checkText = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n┋✿ *WARN CHECK*\n┋✿\n`;
                checkText += `┋✿ 👤 User: @${targetUser.split('@')[0]}\n`;
                checkText += `┋✿ ⚠️ Total Warnings: ${userWarns.count}/3\n`;
                
                if (userWarns.count > 0) {
                    checkText += `┋✿ 🕒 Last Warning: ${userWarns.lastWarn ? new Date(userWarns.lastWarn).toLocaleString() : 'N/A'}\n`;
                    checkText += `┋✿\n┋✿ *WARNING HISTORY:*\n`;
                    
                    userWarns.warnings.forEach((warn, index) => {
                        checkText += `┋✿ ${index + 1}. ID: ${warn.id}\n`;
                        checkText += `┋✿    Reason: ${warn.reason}\n`;
                        checkText += `┋✿    By: @${warn.warnedBy.split('@')[0]}\n`;
                        checkText += `┋✿    Time: ${new Date(warn.timestamp).toLocaleString()}\n┋✿\n`;
                    });
                } else {
                    checkText += `┋✿ ✅ No warnings\n`;
                }
                
                checkText += `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`;
                
                const mentions = [targetUser];
                if (userWarns.warnings.length > 0) {
                    mentions.push(...userWarns.warnings.map(w => w.warnedBy));
                }
                
                return client.sendMessage(m.chat, {
                    text: checkText,
                    mentions: mentions
                }, { quoted: m });
            }
            
            if (subCommand === 'remove') {
                // Remove warn from user
                const removed = removeWarn(m.chat, targetUser);
                
                if (removed) {
                    const updatedWarns = getUserWarns(m.chat, targetUser);
                    
                    await client.sendMessage(m.chat, {
                        text: `✅ Warning removed!\n\n👤 @${targetUser.split('@')[0]}\n⚠️ Remaining: ${updatedWarns.count}/3`,
                        mentions: [targetUser]
                    }, { quoted: m });
                } else {
                    await client.sendMessage(m.chat, {
                        text: `❌ No warnings found for this user.`,
                        mentions: [targetUser]
                    }, { quoted: m });
                }
                return;
            }
            
            if (subCommand === 'reset') {
                // Reset all warns for user
                const reset = resetWarns(m.chat, targetUser);
                
                if (reset) {
                    await client.sendMessage(m.chat, {
                        text: `✅ All warnings reset for @${targetUser.split('@')[0]}!`,
                        mentions: [targetUser]
                    }, { quoted: m });
                } else {
                    await client.sendMessage(m.chat, {
                        text: `❌ No warnings found for this user.`,
                        mentions: [targetUser]
                    }, { quoted: m });
                }
                return;
            }
            
            // Default: Add warn (if no subcommand or other subcommands)
            if (subCommand !== 'check' && subCommand !== 'remove' && subCommand !== 'reset' && subCommand !== 'list') {
                // If first arg is not a subcommand, treat it as part of reason
                if (!['check', 'remove', 'reset', 'list'].includes(args[0].toLowerCase())) {
                    targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
                    reason = text || 'No reason provided';
                }
            }
            
            // Add warn
            const warnResult = addWarn(m.chat, targetUser, reason, m.sender);
            const warnCount = warnResult.newCount;
            
            let actionText = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n┋✿ *WARNING #${warnCount}*\n┋✿\n`;
            actionText += `┋✿ 👤 User: @${targetUser.split('@')[0]}\n`;
            actionText += `┋✿ 📝 Reason: ${reason}\n`;
            actionText += `┋✿ 👮 Warned by: @${m.sender.split('@')[0]}\n`;
            actionText += `┋✿ ⏰ Time: ${new Date().toLocaleString()}\n`;
            actionText += `┋✿ ⚠️ Total Warnings: ${warnCount}/3\n`;
            actionText += `┋✿\n`;
            
            // Take action based on warn count
            if (warnCount === 1) {
                actionText += `┋✿ 📌 *First Warning*\n┋✿ Please follow group rules.\n┋✿ Next violation may result in mute.`;
            } else if (warnCount === 2) {
                actionText += `┋✿ 📌 *Second Warning*\n┋✿ User has been muted for 5 minutes.\n┋✿ Next violation will result in removal.`;
            } else if (warnCount >= 3) {
                actionText += `┋✿ 📌 *Third Warning*\n┋✿ User has been removed from group.\n┋✿ For repeated violations.`;
            }
            
            actionText += `\n❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤\n> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`;
            
            await client.sendMessage(m.chat, {
                text: actionText,
                mentions: [targetUser, m.sender]
            }, { quoted: m });
            
            // Take action based on warn count
            if (warnCount === 2) {
                // Mute user for 5 minutes
                try {
                    await client.groupParticipantsUpdate(m.chat, [targetUser], 'mute');
                    
                    // Auto unmute after 5 minutes
                    setTimeout(async () => {
                        try {
                            await client.groupParticipantsUpdate(m.chat, [targetUser], 'unmute');
                        } catch (e) {
                            console.error('Error unmuting user:', e);
                        }
                    }, 5 * 60 * 1000); // 5 minutes
                    
                } catch (muteError) {
                    console.error('Error muting user:', muteError);
                }
            } else if (warnCount >= 3) {
                // Remove user from group
                try {
                    await client.groupParticipantsUpdate(m.chat, [targetUser], 'remove');
                    
                    // Reset warns after removal
                    resetWarns(m.chat, targetUser);
                } catch (removeError) {
                    console.error('Error removing user:', removeError);
                    await client.sendMessage(m.chat, {
                        text: `❌ Failed to remove user. Make sure I'm admin.`,
                        mentions: [m.sender]
                    }, { quoted: m });
                }
            }
            
        } catch (error) {
            console.error('Warn command error:', error);
            
            await client.sendMessage(m.chat, {
                text: `❌ Error: ${error.message || 'Unknown error occurred'}`
            }, { quoted: m });
        }
    }
};

// Auto-cleanup for Database folder
const dbDir = path.dirname(WARN_DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Auto-remove old warns (older than 7 days)
function cleanupOldWarns() {
    try {
        const warns = loadWarns();
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        let cleaned = false;
        
        for (const groupId in warns) {
            for (const userId in warns[groupId]) {
                const userWarns = warns[groupId][userId];
                
                // Filter out old warns (older than 7 days)
                const originalCount = userWarns.warnings.length;
                userWarns.warnings = userWarns.warnings.filter(warn => {
                    return (now - new Date(warn.timestamp).getTime()) < sevenDays;
                });
                
                userWarns.count = userWarns.warnings.length;
                
                // Update lastWarn if there are still warns
                if (userWarns.warnings.length > 0) {
                    userWarns.lastWarn = userWarns.warnings[userWarns.warnings.length - 1].timestamp;
                }
                
                // Remove user if no warns left
                if (userWarns.count === 0) {
                    delete warns[groupId][userId];
                    cleaned = true;
                } else if (originalCount !== userWarns.count) {
                    cleaned = true;
                }
            }
            
            // Remove group if empty
            if (Object.keys(warns[groupId]).length === 0) {
                delete warns[groupId];
                cleaned = true;
            }
        }
        
        if (cleaned) {
            saveWarns(warns);
            console.log('✅ Cleaned up old warnings');
        }
    } catch (error) {
        console.error('Error cleaning up old warns:', error);
    }
}

// Run cleanup every hour
setInterval(cleanupOldWarns, 60 * 60 * 1000);
cleanupOldWarns(); // Run on startup