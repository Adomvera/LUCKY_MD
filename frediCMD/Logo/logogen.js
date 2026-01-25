const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'logogen',
  aliases: ['generatelogo', 'makelogo'],
  description: 'Generate logo with selected style',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *logogen [style_id] [text]*\nExample: *logogen 1 FEE-XMD*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *logogen [style] [text]*");

      const styleId = parseInt(args[0]);
      const logoText = args.slice(1).join(' ').substring(0, 15); // Limit text length

      if (isNaN(styleId) || styleId < 1 || styleId > 50) {
        return m.reply("Invalid style ID. Must be between 1 and 50.");
      }

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      // Map style IDs to ephoto360 endpoints (CORRECTED)
      const styleUrls = {
        1: "create-a-blackpink-style-logo-with-members-signatures-810.html",
        2: "online-blackpink-style-logo-maker-effect-711.html", 
        3: "create-glossy-silver-3d-text-effect-online-802.html",
        4: "naruto-shippuden-logo-style-text-effect-online-808.html",
        5: "create-digital-glitch-text-effects-online-767.html",
        6: "birthday-cake-96.html",
        7: "free-zodiac-online-logo-maker-491.html",
        8: "3d-underwater-text-effect-online-682.html",
        9: "advanced-glow-effects-74.html",
        10: "create-avatar-gold-online-303.html",
        11: "bokeh-text-effect-86.html",
        12: "text-firework-effect-356.html",
        13: "free-gaming-logo-maker-for-fps-game-team-546.html",
        14: "arrow-tattoo-effect-with-signature-712.html",
        15: "free-luxury-logo-maker-create-logo-online-458.html",
        16: "dragon-fire-text-effect-111.html",
        17: "create-a-personalized-queen-card-avatar-730.html",
        18: "graffiti-color-199.html",
        19: "make-tattoos-online-by-your-name-309.html",
        20: "create-a-lol-pentakill-231.html",
        21: "cards-halloween-online-81.html",
        22: "writing-horror-letters-on-metal-plates-265.html",
        23: "write-blood-text-on-the-wall-264.html",
        24: "create-beautiful-international-women-s-day-cards-399.html",
        25: "beautiful-flower-valentine-s-day-greeting-cards-online-512.html",
        26: "create-colorful-neon-light-text-effects-online-797.html",
        27: "create-logo-team-logo-gaming-assassin-style-574.html",
        28: "handwritten-text-on-foggy-glass-online-680.html",
        29: "write-in-sand-summer-beach-online-576.html",
        30: "text-light-effets-234.html",
        31: "modern-gold-3-212.html",
        32: "create-a-cartoon-style-graffiti-text-effect-online-668.html",
        33: "galaxy-text-effect-new-258.html",
        34: "create-anonymous-hacker-avatars-cyan-neon-677.html",
        35: "write-name-on-flower-birthday-cake-pics-472.html",
        36: "create-dragon-ball-style-text-effects-online-809.html",
        37: "create-elegant-rotation-logo-online-586.html",
        38: "write-text-on-wet-glass-online-589.html",
        39: "water-3d-text-effect-online-126.html",
        40: "realistic-3d-sand-text-effect-online-580.html",
        41: "pubg-mascot-logo-maker-for-an-esports-team-612.html",
        42: "create-online-typography-art-effects-with-multiple-layers-811.html",
        43: "naruto-shippuden-logo-style-text-effect-online-808.html",
        44: "create-3d-colorful-paint-text-effect-online-801.html",
        45: "make-typography-text-online-338.html",
        46: "text-effects-incandescent-bulbs-219.html",
        47: "create-digital-glitch-text-effects-online-767.html",
        48: "birthday-cake-96.html",
        49: "free-zodiac-online-logo-maker-491.html",
        50: "free-zodiac-online-logo-maker-491.html"
      };

      const endpoint = styleUrls[styleId];
      if (!endpoint) {
        throw new Error(`Style ID ${styleId} not found.`);
      }

      // Style names for display
      const styleNames = {
        1: "Black Pink Signature", 2: "Black Pink Style", 3: "Silver 3D", 4: "Naruto", 5: "Digital Glitch",
        6: "Birthday Cake", 7: "Zodiac", 8: "Underwater", 9: "Glow", 10: "Avatar Gold",
        11: "Bokeh", 12: "Fireworks", 13: "Gaming Logo", 14: "Signature", 15: "Luxury",
        16: "Dragon Fire", 17: "Queen Card", 18: "Graffiti Color", 19: "Tattoo", 20: "Pentakill",
        21: "Halloween", 22: "Horror", 23: "Blood", 24: "Women's Day", 25: "Valentine",
        26: "Neon Light", 27: "Gaming Assassin", 28: "Foggy Glass", 29: "Sand Beach", 30: "Light",
        31: "Modern Gold", 32: "Cartoon Graffiti", 33: "Galaxy", 34: "Anonymous Hacker", 35: "Birthday Flower Cake",
        36: "Dragon Ball", 37: "Elegant Rotation", 38: "Wet Glass", 39: "Water 3D", 40: "Realistic Sand",
        41: "PUBG Mascot", 42: "Typography", 43: "Naruto Shippuden", 44: "Colorful Paint", 45: "Typography Maker",
        46: "Incandescent", 47: "Digital Glitch", 48: "Birthday Cake", 49: "Zodiac", 50: "Birthday Cake"
      };

      const styleName = styleNames[styleId] || `Style ${styleId}`;

      let logoUrl = null;
      
      // Try multiple methods to get the logo
      
      // Method 1: Direct ephoto360 scraping
      try {
        console.log(`Trying to generate logo: ${styleName} with text: ${logoText}`);
        
        // Create form data
        const formData = new FormData();
        formData.append('text[]', logoText);
        
        // Make POST request to ephoto360
        const response = await axios.post(
          `https://en.ephoto360.com/${endpoint.replace('.html', '')}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'application/json, text/javascript, */*; q=0.01',
              'Accept-Language': 'en-US,en;q=0.9',
              'Content-Type': 'multipart/form-data',
              'Origin': 'https://en.ephoto360.com',
              'Referer': `https://en.ephoto360.com/${endpoint}`,
              'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 30000
          }
        );

        console.log('API Response:', response.data);

        // Try to extract image URL from response
        if (response.data && response.data.image) {
          logoUrl = response.data.image;
        } else if (response.data && response.data.url) {
          logoUrl = response.data.url;
        } else if (response.data && response.data.result && response.data.result.image) {
          logoUrl = response.data.result.image;
        }
      } catch (apiError) {
        console.log('Direct API failed:', apiError.message);
      }

      // Method 2: Use alternative logo generation API
      if (!logoUrl) {
        try {
          console.log('Trying alternative API...');
          
          // Use textpro.me alternative (example)
          const altResponse = await axios.post(
            'https://textpro.me/effect/create',
            {
              text: [logoText],
              effect_id: getAlternativeEffectId(styleId)
            },
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
              },
              timeout: 20000
            }
          );

          if (altResponse.data && altResponse.data.image) {
            logoUrl = altResponse.data.image;
          }
        } catch (altError) {
          console.log('Alternative API failed:', altError.message);
        }
      }

      // Method 3: Use placeholder image as fallback
      if (!logoUrl) {
        console.log('Using fallback image...');
        const encodedText = encodeURIComponent(logoText);
        
        // Different background colors based on style
        const bgColors = [
          'ff6b8b', 'c0c0c0', 'f39c12', '000000', '2c3e50',
          'e74c3c', '3498db', '1abc9c', '8e44ad', 'e84393',
          '2c3e50', '000000', '34495e', 'd35400', 'f1c40f',
          'e74c3c', '9b59b6', '3498db', '7f8c8d', '2c3e50',
          '000000', '1a5276', 'ffd700', '8e44ad', '000000',
          'c0392b', 'f39c12', '7f8c8d', 'f1c40f', '2c3e50',
          '9b59b6', '2c3e50', '00cec9', '3498db', 'f39c12',
          'd35400', '7f8c8d', 'bdc3c7', '2c3e50', 'c0392b',
          'ff6b8b', 'c0c0c0', 'f39c12', '000000', '2c3e50',
          'e74c3c', '3498db', '1abc9c', '8e44ad', 'e84393'
        ];

        const bgColor = bgColors[styleId - 1] || '7289da';
        logoUrl = `https://placehold.co/600x400/${bgColor}/ffffff.png?text=${encodedText}&font=arial`;
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Send the logo
      await client.sendMessage(
        m.chat,
        {
          image: { url: logoUrl },
          caption: `🎨 *Logo Generated!*\n📝 *Text:* ${logoText}\n🎭 *Style:* ${styleName}\n🔗 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅\n\n${logoUrl.includes('placehold.co') ? '⚠️ *Note:* Using fallback generator' : '✅ *Generated via ephoto360*'}`,
        },
        { quoted: m }
      );

    } catch (error) {
      console.error('Logo generation error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      
      // Ultimate fallback
      const fallbackText = text.split(' ').slice(1).join(' ') || 'FEE-XMD';
      const encodedText = encodeURIComponent(fallbackText);
      const fallbackUrl = `https://dummyimage.com/600x400/7289da/ffffff.png&text=${encodedText}`;
      
      await client.sendMessage(
        m.chat,
        {
          image: { url: fallbackUrl },
          caption: `🎨 *Logo Generated*\n📝 *Text:* ${fallbackText}\n🔗 𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅`,
        },
        { quoted: m }
      );
    }
  }
};

// Helper function for alternative API
function getAlternativeEffectId(styleId) {
  const effectMap = {
    1: 107,  // Black Pink
    3: 111,  // Silver 3D
    4: 103,  // Naruto
    8: 118,  // Underwater
    9: 115,  // Glow
    16: 125, // Dragon Fire
    33: 131, // Galaxy
    36: 133  // Dragon Ball
  };
  
  return effectMap[styleId] || 107; // Default to Black Pink
}