const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  name: 'video',
  aliases: ['vid', 'v', 'ytvideo', 'youtube'],
  description: 'Search and download videos from YouTube',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Are you mute? Give me a video name. It's not rocket science.");
      if (text.length > 100) return m.reply("Your 'video title' is longer than your attention span. Keep it under 100 characters.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      // Function to detect if query is a YouTube link
      const isYoutubeLink = (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube.com/shorts');
      };

      let videoInfo = null;
      let videoUrl = '';

      // Check if query is a link or search term
      if (isYoutubeLink(text)) {
        videoUrl = text;
        // Get basic video info from yt-search for links
        const searchResult = await yts({ videoId: getVideoId(text) });
        const video = searchResult.videos[0];

        if (video) {
          videoInfo = {
            title: video.title,
            author: video.author?.name || "Unknown Channel",
            duration: video.duration?.timestamp || "00:00",
            thumbnail: video.thumbnail,
            views: video.views || "N/A",
            url: video.url
          };
        }
      } else {
        // Search for video
        const searchQuery = `${text} official`;
        const searchResult = await yts(searchQuery);
        const video = searchResult.videos[0];

        if (!video) return m.reply(`Nothing found for "${text}". Your taste is as nonexistent as the results.`);

        videoUrl = video.url;
        videoInfo = {
          title: video.title,
          author: video.author?.name || "Unknown",
          duration: video.duration?.timestamp || "00:00",
          thumbnail: video.thumbnail,
          views: video.views || "N/A",
          url: video.url
        };
      }

      if (!videoInfo) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No video found for "${text}". Maybe try searching for something that actually exists.`);
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Helper function to extract video ID
      function getVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      }

      // Create video download buttons
      const buttons = [
        {
          buttonId: `${prefix}vid video_360 ${videoUrl}`,
          buttonText: { displayText: '📹 360p (Low)' },
          type: 1
        },
        {
          buttonId: `${prefix}vid video_480 ${videoUrl}`,
          buttonText: { displayText: '🎬 480p (Medium)' },
          type: 1
        },
        {
          buttonId: `${prefix}vid video_720 ${videoUrl}`,
          buttonText: { displayText: '🎥 720p (High)' },
          type: 1
        },
        {
          buttonId: `${prefix}vid video_doc_360 ${videoUrl}`,
          buttonText: { displayText: '📄 360p Document' },
          type: 1
        },
        {
          buttonId: `${prefix}vid video_doc_720 ${videoUrl}`,
          buttonText: { displayText: '📄 720p Document' },
          type: 1
        }
      ];

      // Format duration
      const formatDuration = (dur) => {
        if (!dur) return "00:00";
        if (typeof dur === 'string' && dur.includes(':')) return dur;
        if (typeof dur === 'number') {
          const minutes = Math.floor(dur / 60);
          const seconds = dur % 60;
          return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        return String(dur);
      };

      const message = `🎬 *${videoInfo.title}*\n👤 *Channel:* ${videoInfo.author}\n⏱️ *Duration:* ${formatDuration(videoInfo.duration)}\n👁️ *Views:* ${videoInfo.views}\n🔗 *URL:* ${videoInfo.url}\n\n*Select video quality to download:*`;

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
          buttons: buttons,
          headerType: 4,
          image: { url: videoInfo.thumbnail },
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Video command error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      let userMessage = 'Search failed. The universe despises your video choice.';
      if (error.message.includes('API returned')) userMessage = 'The video service rejected the request.';
      await m.reply(`${userMessage}\nError: ${error.message}`);
    }
  }
};