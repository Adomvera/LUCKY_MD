const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  name: 'audio',
  aliases: ['ytdl', 'sdl', 'youtube'],
  description: 'Download YouTube audio in selected format',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      if (!text) return m.reply("Usage: *audio [format] [url/query]*\nExample: *audio mp3 https://youtube.com/...*");

      const args = text.split(' ');
      if (args.length < 2) return m.reply("Invalid format. Use: *audio [format] [url/query]*");

      const format = args[0].toLowerCase(); // mp3, m4a, opus, doc
      const query = args.slice(1).join(' ');

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      // (1) TUMIA YOUTUBE API
      const apiUrl = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || data.error) {
        throw new Error("YouTube API returned no valid data.");
      }

      const title = data.title || "Unknown Song";
      const channel = data.channel || "Unknown Artist";
      const thumbnail = data.thumbnail || "";
      const formats = data.formats || [];

      // (2) CHANGES: Chagua muundo sahihi kulingana na aina
      let selectedFormat;
      let fileExt;
      let mimeType;

      switch(format) {
        case 'mp3':
          selectedFormat = formats.filter(f => !f.hasVideo && f.hasAudio && (f.codec === 'mp3' || f.container === 'mp3')).sort((a,b) => b.bitrate - a.bitrate)[0];
          fileExt = 'mp3';
          mimeType = 'audio/mpeg';
          break;
        case 'm4a':
          selectedFormat = formats.filter(f => !f.hasVideo && f.hasAudio && (f.container === 'm4a' || f.codec.includes('aac'))).sort((a,b) => b.bitrate - a.bitrate)[0];
          fileExt = 'm4a';
          mimeType = 'audio/mp4';
          break;
        case 'opus':
          selectedFormat = formats.filter(f => !f.hasVideo && f.hasAudio && (f.codec === 'opus' || f.container === 'webm')).sort((a,b) => b.bitrate - a.bitrate)[0];
          fileExt = 'opus';
          mimeType = 'audio/ogg; codecs=opus';
          break;
        case 'doc': // "Send as Document" itatumia mp3 kama fallback
          selectedFormat = formats.filter(f => !f.hasVideo && f.hasAudio).sort((a,b) => b.bitrate - a.bitrate)[0];
          fileExt = 'mp3';
          mimeType = 'audio/mpeg';
          break;
        default:
          // Fallback kwa MP3
          selectedFormat = formats.filter(f => !f.hasVideo && f.hasAudio).sort((a,b) => b.bitrate - a.bitrate)[0];
          fileExt = 'mp3';
          mimeType = 'audio/mpeg';
      }

      if (!selectedFormat || !selectedFormat.url) {
        throw new Error(`The requested audio format (${format}) is not available for this video.`);
      }

      const audioUrl = selectedFormat.url;

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // Tayarisha jina la faili
      const sanitizeFilename = (name) => {
        return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
      };

      const safeTitle = sanitizeFilename(title);
      const finalFilename = `${safeTitle}.${fileExt}`;

      const caption = `🎵 *${safeTitle}*\n👤 *Channel:* ${channel}\n🎚️ *Format:* ${format.toUpperCase()} (${selectedFormat.bitrate || '?'}kbps)\n🔗 *Downloaded via:* 𝙁𝙀𝙀-𝙓𝙈𝘿`;

      const safeSubstring = (str, length) => {
        if (!str || typeof str !== 'string') return "";
        return str.substring(0, Math.min(str.length, length));
      };

      // (3) CHANGES: Tumtumie mtumiaji kulingana na aina
      if (format === 'doc') {
        // Tuma kama hati (document)
        await client.sendMessage(m.chat, {
          document: { url: audioUrl },
          mimetype: mimeType,
          fileName: finalFilename,
          caption: caption
        }, { quoted: m });
      } else {
        // Tuma kama ujumbe wa sauti
        await client.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: mimeType,
          fileName: finalFilename,
          contextInfo: {
            externalAdReply: {
              title: safeSubstring(safeTitle, 30),
              body: safeSubstring(channel, 30),
              thumbnailUrl: thumbnail,
              sourceUrl: query.includes('youtube.com') ? query : "",
              mediaType: 1,
              renderLargerThumbnail: true,
            },
          },
        }, { quoted: m });
      }

    } catch (error) {
      console.error('Audio download error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`YouTube audio download failed. Please try again.\nError: ${error.message}`);
    }
  }
};