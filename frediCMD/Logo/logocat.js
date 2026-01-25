const axios = require('axios');

module.exports = {
  name: 'logocat',
  aliases: ['logostyles', 'logotype'],
  description: 'Show logo styles in selected category',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *logocat [category] [text]*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *logocat [category] [text]*");

      const categoryNum = parseInt(args[0]);
      const logoText = args.slice(1).join(' ');

      // UPDATED: Logo styles by category with CORRECT IDs (1-50)
      const logoCategories = [
        {
          title: "🎭 POPULAR LOGOS",
          styles: [
            { id: 1, name: "Black Pink Signature", display: "Black Pink Signature" },
            { id: 2, name: "Black Pink Style", display: "Black Pink Style" },
            { id: 3, name: "Silver 3D", display: "Silver 3D" },
            { id: 4, name: "Naruto", display: "Naruto" },
            { id: 5, name: "Digital Glitch", display: "Digital Glitch" },
            { id: 33, name: "Galaxy", display: "Galaxy ❤️‍🔥" },
            { id: 34, name: "Anonymous Hacker", display: "Anonymous Hacker" },
            { id: 36, name: "Dragon Ball", display: "Dragon Ball 🐲" },
            { id: 37, name: "Elegant Rotation", display: "Elegant Rotation" },
            { id: 10, name: "Avatar Gold", display: "Avatar Gold 🥇" }
          ]
        },
        {
          title: "🎂 OCCASION LOGOS",
          styles: [
            { id: 6, name: "Birthday Cake", display: "Birthday Cake" },
            { id: 7, name: "Zodiac", display: "Zodiac" },
            { id: 21, name: "Halloween", display: "Halloween 🎃" },
            { id: 24, name: "Women's Day", display: "Women's Day" },
            { id: 25, name: "Valentine", display: "Valentine" },
            { id: 35, name: "Birthday Flower Cake", display: "Birthday Flower Cake" },
            { id: 48, name: "Birthday Cake 2", display: "Birthday Cake 2" },
            { id: 49, name: "Zodiac 2", display: "Zodiac 2" },
            { id: 50, name: "Birthday Cake 3", display: "Birthday Cake 3" }
          ]
        },
        {
          title: "✨ GLOW & NEON",
          styles: [
            { id: 8, name: "Underwater", display: "Underwater 🫧" },
            { id: 9, name: "Glow", display: "Glow 🌟" },
            { id: 11, name: "Bokeh", display: "Bokeh" },
            { id: 12, name: "Fireworks", display: "Fireworks 🎇" },
            { id: 26, name: "Neon Light", display: "Neon Light 🕯️" },
            { id: 30, name: "Light", display: "Light 🚨" },
            { id: 46, name: "Incandescent", display: "Incandescent" },
            { id: 19, name: "Tattoo", display: "Tattoo" },
            { id: 28, name: "Foggy Glass", display: "Foggy Glass" }
          ]
        },
        {
          title: "🎮 GAMING LOGOS",
          styles: [
            { id: 13, name: "Gaming Logo", display: "Gaming Logo" },
            { id: 14, name: "Signature", display: "Signature 💫" },
            { id: 20, name: "Pentakill", display: "Pentakill 🔥" },
            { id: 27, name: "Gaming Assassin", display: "Gaming Assassin" },
            { id: 41, name: "PUBG Mascot", display: "PUBG Mascot" },
            { id: 42, name: "Typography", display: "Typography" },
            { id: 45, name: "Typography Maker", display: "Typography Maker" },
            { id: 16, name: "Dragon Fire", display: "Dragon Fire 🐉" },
            { id: 43, name: "Naruto Shippuden", display: "Naruto Shippuden" }
          ]
        },
        {
          title: "🎨 ART & DESIGN",
          styles: [
            { id: 15, name: "Luxury", display: "Luxury" },
            { id: 17, name: "Queen Card", display: "Queen Card" },
            { id: 18, name: "Graffiti Color", display: "Graffiti Color" },
            { id: 31, name: "Modern Gold", display: "Modern Gold 🪙" },
            { id: 32, name: "Cartoon Graffiti", display: "Cartoon Graffiti" },
            { id: 44, name: "Colorful Paint", display: "Colorful Paint 🎨" },
            { id: 22, name: "Horror", display: "Horror" },
            { id: 23, name: "Blood", display: "Blood 🩸" },
            { id: 38, name: "Wet Glass", display: "Wet Glass" }
          ]
        }
      ];

      if (categoryNum < 1 || categoryNum > logoCategories.length) {
        return m.reply(`Invalid category number. Use 1-${logoCategories.length}`);
      }

      const category = logoCategories[categoryNum - 1];

      await client.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });

      // Create buttons for each style in the category
      const styleButtons = category.styles.map(style => ({
        buttonId: `${prefix}logogen ${style.id} ${logoText}`,
        buttonText: { displayText: style.display },
        type: 1
      }));

      // Add back button
      styleButtons.push({
        buttonId: `${prefix}logo ${logoText}`,
        buttonText: { displayText: "🔙 Back to Categories" },
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
      console.error('Logo category error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Category selection failed.\nError: ${error.message}`);
    }
  }
};