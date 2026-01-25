const axios = require('axios');
const { getSettings } = require('../../Database/config');

// Function to fetch logo from API
const fetchLogoUrl = async (url, name) => {
  try {
    const response = await axios.get(`https://api-pink-venom.vercel.app/api/logo`, {
      params: { url, name },
      timeout: 30000
    });
    return response.data.result.download_url;
  } catch (error) {
    console.error("Error fetching logo:", error);
    return null;
  }
};

module.exports = {
  name: 'logo',
  aliases: ['logogen', 'logomaker', 'textlogo'],
  description: 'Generate logos with ephoto360 using buttons',
  run: async (context) => {
    const { client, m, text, prefix } = context;
    const settings = await getSettings();
    const botPrefix = settings.prefix || prefix;

    try {
      if (!text) {
        return m.reply("Please provide text for the logo.\nExample: *.logo FEE-XMD*");
      }

      if (text.length > 20) {
        return m.reply("Text too long. Maximum 20 characters for logo.");
      }

      await client.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

      // Logo categories (grouped by type)
      const logoButtons = [
        {
          buttonId: `${botPrefix}logocat 1 ${text}`,
          buttonText: { displayText: "🎭 POPULAR LOGOS" },
          type: 1
        },
        {
          buttonId: `${botPrefix}logocat 2 ${text}`,
          buttonText: { displayText: "🎂 OCCASION LOGOS" },
          type: 1
        },
        {
          buttonId: `${botPrefix}logocat 3 ${text}`,
          buttonText: { displayText: "✨ GLOW & NEON" },
          type: 1
        },
        {
          buttonId: `${botPrefix}logocat 4 ${text}`,
          buttonText: { displayText: "🎮 GAMING LOGOS" },
          type: 1
        },
        {
          buttonId: `${botPrefix}logocat 5 ${text}`,
          buttonText: { displayText: "🎨 ART & DESIGN" },
          type: 1
        },
        {
          buttonId: `${botPrefix}logomore ${text}`,
          buttonText: { displayText: "📋 MORE STYLES" },
          type: 1
        }
      ];

      const message = `🎨 *LOGO GENERATOR* 🎨\n\n📝 *Text:* ${text}\n🎯 *Styles Available:* 50+\n\n*Select a logo category:*`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
          buttons: logoButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Logo command error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Logo command failed.\nError: ${error.message}`);
    }
  }
};