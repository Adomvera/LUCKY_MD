module.exports = {
  name: 'logomorecat',
  aliases: ['morelogostyles'],
  description: 'Show styles from more categories',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *logomorecat [category] [text]*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *logomorecat [category] [text]*");

      const categoryIndex = parseInt(args[0]);
      const logoText = args.slice(1).join(' ');

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

      if (categoryIndex < 0 || categoryIndex >= moreStyles.length) {
        return m.reply(`Invalid category number. Use 0-${moreStyles.length - 1}`);
      }

      const category = moreStyles[categoryIndex];

      await client.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

      // Create buttons for each style in the category
      const styleButtons = category.styles.map(style => ({
        buttonId: `${prefix}logogen ${style.id} ${logoText}`,
        buttonText: { displayText: style.display },
        type: 1
      }));

      // Add navigation buttons
      styleButtons.push({
        buttonId: `${prefix}logomore ${logoText}`,
        buttonText: { displayText: "🔙 Back to More" },
        type: 1
      });

      styleButtons.push({
        buttonId: `${prefix}logo ${logoText}`,
        buttonText: { displayText: "🏠 Main Menu" },
        type: 1
      });

      const message = `🎨 *${category.title}*\n📝 *Text:* ${logoText}\n\nSelect a logo style:`;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
          buttons: styleButtons,
          headerType: 1,
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('More categories error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Failed to show category styles.\nError: ${error.message}`);
    }
  }
};