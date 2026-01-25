module.exports = {
  name: 'logomore',
  aliases: ['morelogos', 'extralogos'],
  description: 'Show more logo styles',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *logomore [text]*");

      await client.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

      // UPDATED: Additional logo styles with CORRECT IDs
      const moreStyles = [
        {
          title: "🌊 WATER & BEACH",
          styles: [
            { id: 8, name: "Underwater", display: "Underwater 🫧" },
            { id: 29, name: "Sand Beach", display: "Sand Beach 🏖️" },
            { id: 39, name: "Water 3D", display: "Water 3D" },
            { id: 40, name: "Realistic Sand", display: "Realistic Sand ⌛" },
            { id: 38, name: "Wet Glass", display: "Wet Glass" }
          ]
        },
        {
          title: "🎃 HORROR & SCARY",
          styles: [
            { id: 21, name: "Halloween", display: "Halloween 🎃" },
            { id: 22, name: "Horror", display: "Horror" },
            { id: 23, name: "Blood", display: "Blood 🩸" },
            { id: 16, name: "Dragon Fire", display: "Dragon Fire 🐉" },
            { id: 20, name: "Pentakill", display: "Pentakill 🔥" }
          ]
        },
        {
          title: "💎 LUXURY & GOLD",
          styles: [
            { id: 15, name: "Luxury", display: "Luxury" },
            { id: 10, name: "Avatar Gold", display: "Avatar Gold 🥇" },
            { id: 31, name: "Modern Gold", display: "Modern Gold 🪙" },
            { id: 17, name: "Queen Card", display: "Queen Card" },
            { id: 37, name: "Elegant Rotation", display: "Elegant Rotation" }
          ]
        },
        {
          title: "📝 TEXT EFFECTS",
          styles: [
            { id: 14, name: "Signature", display: "Signature 💫" },
            { id: 19, name: "Tattoo", display: "Tattoo" },
            { id: 28, name: "Foggy Glass", display: "Foggy Glass" },
            { id: 38, name: "Wet Glass", display: "Wet Glass" },
            { id: 42, name: "Typography", display: "Typography" }
          ]
        },
        {
          title: "🎨 COLORFUL DESIGNS",
          styles: [
            { id: 18, name: "Graffiti Color", display: "Graffiti Color" },
            { id: 32, name: "Cartoon Graffiti", display: "Cartoon Graffiti" },
            { id: 44, name: "Colorful Paint", display: "Colorful Paint 🎨" },
            { id: 33, name: "Galaxy", display: "Galaxy ❤️‍🔥" },
            { id: 34, name: "Anonymous Hacker", display: "Anonymous Hacker" }
          ]
        }
      ];

      // Create buttons for additional categories
      const moreButtons = moreStyles.map((category, index) => ({
        buttonId: `${prefix}logomorecat ${index} ${text}`,
        buttonText: { displayText: category.title },
        type: 1
      }));

      // Add back button
      moreButtons.push({
        buttonId: `${prefix}logo ${text}`,
        buttonText: { displayText: "🔙 Main Menu" },
        type: 1
      });

      const message = `🎨 *MORE LOGO STYLES*\n📝 *Text:* ${text}\n\nSelect a category:`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
          buttons: moreButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Logo more error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Failed to show more styles.\nError: ${error.message}`);
    }
  }
};