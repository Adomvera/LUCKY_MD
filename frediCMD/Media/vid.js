const axios = require("axios");

module.exports = {
  name: 'vid',
  aliases: ['ytdl', 'youtubedl', 'youtube'],
  description: 'Download YouTube videos in selected quality',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *yt [quality] [url]*\nExample: *yt video_720 https://youtube.com/...*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *yt [quality] [url]*");

      const quality = args[0].toLowerCase();
      const url = args.slice(1).join(' ');

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      let formatParam = '720'; // Default to 720p
      let qualityLabel = '720p (High)';
      let isDocument = false;

      // Set format based on quality
      switch(quality) {
        case 'video_360':
          formatParam = '360';
          qualityLabel = '360p (Low)';
          break;
        
        case 'video_480':
          formatParam = '480';
          qualityLabel = '480p (Medium)';
          break;
        
        case 'video_720':
          formatParam = '720';
          qualityLabel = '720p (High)';
          break;
        
        case 'video_doc_360':
          formatParam = '360';
          qualityLabel = '360p Document';
          isDocument = true;
          break;
        
        case 'video_doc_720':
          formatParam = '720';
          qualityLabel = '720p Document';
          isDocument = true;
          break;
        
        default:
          formatParam = '720';
          qualityLabel = '720p (High)';
      }

      // Use the single YouTube API endpoint
      const apiEndpoint = `https://api.ootaizumi.web.id/downloader/youtube?url=${encodeURIComponent(url)}&format=${formatParam}`;
      
      // Set headers to mimic browser
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.youtube.com/"
      };

      const response = await axios.get(apiEndpoint, { headers });
      const data = response.data;

      if (!data.status || !data.result) {
        throw new Error('API returned no valid video data.');
      }

      const videoData = data.result;
      const videoUrl = videoData.download;
      const videoTitle = videoData.title || "Unknown Video";
      const videoAuthor = videoData.author || videoData.channel || "Unknown Channel";
      const thumbnailUrl = videoData.thumbnail || "";

      if (!videoUrl) {
        throw new Error('No video download URL found.');
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Prepare filename
      const sanitizeFilename = (name) => {
        return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
      };

      const safeTitle = sanitizeFilename(videoTitle);
      const filename = `${safeTitle} [${qualityLabel}].mp4`;
      
      const caption = `🎬 *${safeTitle}*\n👤 *Channel:* ${videoAuthor}\n📊 *Quality:* ${qualityLabel}\n🔗 *Downloaded via:* 𝙁𝙀𝙀-𝙓𝙈𝘿`;

      // Helper function to safely substring
      const safeSubstring = (str, length) => {
        if (!str || typeof str !== 'string') return "";
        return str.substring(0, Math.min(str.length, length));
      };

      // Send video based on type
      if (isDocument) {
        // Send as document
        await client.sendMessage(m.chat, {
          document: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: filename,
          caption: caption
        }, { quoted: m });
      } else {
        // Send as regular video
        await client.sendMessage(m.chat, {
          video: { url: videoUrl },
          mimetype: "video/mp4",
          fileName: filename,
          caption: caption,
          contextInfo: {
            externalAdReply: {
              title: safeSubstring(videoTitle, 30),
              body: `Quality: ${qualityLabel} | 🄵🄴🄴-🅇🄼🄳`,
              thumbnailUrl: thumbnailUrl,
              sourceUrl: url,
              mediaType: 2,
              renderLargerThumbnail: true,
            },
          },
        }, { quoted: m });
      }

    } catch (error) {
      console.error('YouTube download error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      let userMessage = 'Download failed. The universe despises your video choice.';
      if (error.message.includes('API returned')) userMessage = 'The video service rejected the request.';
      if (error.message.includes('No video download URL')) userMessage = 'Could not find download link for this quality.';
      await m.reply(`${userMessage}\nError: ${error.message}`);
    }
  }
};