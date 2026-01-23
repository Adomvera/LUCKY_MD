module.exports = {
  name: 'apk',
  aliases: ['android', 'modapk', 'apkdown'],
  description: 'Download Android APK files',
  category: 'download',
  
  run: async (context) => {
    const { client, m, text, fetchJson, prefix } = context;

    if (!text) {
      return client.sendMessage(m.chat, {
        text: `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *APK DOWNLOADER*
┋✿
┋✿ 📋 *Usage:*
┋✿ ${prefix}apk <app name>
┋✿
┋✿ 📝 *Examples:*
┋✿ ${prefix}apk facebook
┋✿ ${prefix}apk whatsapp
┋✿ ${prefix}apk instagram
┋✿ ${prefix}apk tiktok
┋✿
┋✿ 📱 *Features:*
┋✿ • APK file download
┋✿ • App information
┋✿ • Safe download link
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`
      }, { quoted: m });
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '📱', key: m.key } });

      // 🔍 Search app on Aptoide
      const searchUrl = `https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}`;
      const data = await fetchJson(searchUrl);

      if (
        !data ||
        !data.datalist ||
        !data.datalist.list ||
        data.datalist.list.length === 0
      ) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return client.sendMessage(m.chat, {
          text: `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *APK NOT FOUND*
┋✿
┋✿ ❌ App "${text}" not found on Aptoide
┋✿
┋✿ 💡 *Try These Examples:*
┋✿ ${prefix}apk whatsapp
┋✿ ${prefix}apk facebook lite
┋✿ ${prefix}apk youtube
┋✿ ${prefix}apk spotify
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`
        }, { quoted: m });
      }

      // 📦 Take first result
      const app = data.datalist.list[0];
      const appName = app.name || "Unknown App";
      const apkUrl = app.file?.path;
      const appVersion = app.file?.vername || "Unknown";
      const appSize = app.file?.filesize ? `${Math.round(app.file.filesize / 1048576)} MB` : "Unknown";

      if (!apkUrl) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return client.sendMessage(m.chat, {
          text: `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *DOWNLOAD ERROR*
┋✿
┋✿ ❌ APK download link not available
┋✿
┋✿ 📱 *App:* ${appName}
┋✿ 📍 *Try a different app name*
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`
        }, { quoted: m });
      }

      // Create app details message
      const appInfo = `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *APK DOWNLOAD INFO*
┋✿
┋✿ 📱 *App:* ${appName}
┋✿ 📦 *Version:* ${appVersion}
┋✿ 📊 *Size:* ${appSize}
┋✿
┋✿ 📋 *Status:* Ready to download
┋✿ ⚠️ *Note:* Install at your own risk
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`;

      // Send APK file with details and newsletter context
      await client.sendMessage(m.chat, {
        document: { url: apkUrl },
        fileName: `${appName.replace(/[^\w\s]/gi, '')}_v${appVersion}.apk`,
        mimetype: "application/vnd.android.package-archive",
        caption: appInfo,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363423084862852@newsletter',
            newsletterName: "@FrediEzra",
            serverMessageId: 143,
          },
          externalAdReply: {
            showAdAttribution: false,
            title: `📱 ${appName}`,
            body: `Version ${appVersion} • ${appSize}`,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error('APK download error:', error);
      
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });

      let errorMessage = "❌ APK download failed";
      
      if (error.message.includes('fetch')) {
        errorMessage = "🌐 Network error. Check your connection.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "⏳ Request timeout. Try again later.";
      } else if (error.message.includes('JSON')) {
        errorMessage = "🔧 API error. Service might be down.";
      } else {
        errorMessage = `⚠️ Error: ${error.message.substring(0, 100)}`;
      }

      await client.sendMessage(m.chat, {
        text: `❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
┋✿ *DOWNLOAD FAILED*
┋✿
┋✿ ${errorMessage}
┋✿
┋✿ 💡 *Troubleshooting:*
┋✿ 1. Check internet connection
┋✿ 2. Try a different app name
┋✿ 3. Service might be temporary down
┋✿ 4. Try popular apps (whatsapp, facebook)
❥┈┈┈┈┈┈┈┈┈┈┈┈┈┈➤
> 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`
      }, { quoted: m });
    }
  }
};