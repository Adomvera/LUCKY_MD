const yts = require("yt-search");
const axios = require("axios");

module.exports = {
  name: 'play',
  aliases: ['ply', 'playy', 'pl', 'song', 'music', 'youtube'],
  description: 'Download audio from YouTube',
  run: async (context) => {
    const { client, m, text, prefix } = context;

    try {
      const query = m.text.trim();
      if (!query) return m.reply("Give me a song name or YouTube URL, you tone-deaf cretin.");

      if (query.length > 100) return m.reply("Your 'song title' is longer than my patience. 100 characters MAX.");

      await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

      // (1) TUMIA YOUTUBE API
      const apiUrl = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const data = response.data;

      // (2) CHANGES: Kagua muundo wa data kutoka YouTube API
      if (!data || data.error) {
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return m.reply(`No audio found for "${query}". Your music taste is as bad as your search skills.`);
      }

      // (3) CHANGES: Toa maelezo kutoka kwa YouTube API
      const title = data.title || "Unknown Song";
      const channel = data.channel || "Unknown Artist";
      const duration = data.duration || "00:00";
      const thumbnail = data.thumbnail || "";
      const formats = data.formats || [];

      // (4) CHANGES: Tafuta aina mbalimbali za sauti (AUDIO ONLY)
      // - MP3 (kwa bitrate bora)
      // - M4A/AAC (kwa ubora wa juu)
      // - OGG/OPUS (kwa ukubwa mdogo)
      const audioFormats = {
        mp3: formats.filter(f => !f.hasVideo && f.hasAudio && (f.codec === 'mp3' || f.container === 'mp3')).sort((a,b) => b.bitrate - a.bitrate)[0],
        m4a: formats.filter(f => !f.hasVideo && f.hasAudio && (f.container === 'm4a' || f.codec.includes('aac'))).sort((a,b) => b.bitrate - a.bitrate)[0],
        opus: formats.filter(f => !f.hasVideo && f.hasAudio && (f.codec === 'opus' || f.container === 'webm')).sort((a,b) => b.bitrate - a.bitrate)[0]
      };

      // Angalia kama kuna angalau aina moja ya sauti inapatikana
      const hasAvailableAudio = Object.values(audioFormats).some(f => f !== undefined);
      if (!hasAvailableAudio) {
        throw new Error("No downloadable audio formats found for this video.");
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // (5) CHANGES: Unda buttons kwa kila aina ya sauti inayopatikana
      const buttons = [];
      const queryForButtons = query; // Tumia query asili kwa buttons

      // Ongeza button kwa kila aina ya sauti iliyopatikana
      if (audioFormats.mp3) {
        buttons.push({
          buttonId: `${prefix}audio mp3 ${queryForButtons}`,
          buttonText: { displayText: `🎵 MP3 (${audioFormats.mp3.bitrate || '?'}kbps)` },
          type: 1
        });
      }

      if (audioFormats.m4a) {
        buttons.push({
          buttonId: `${prefix}audio m4a ${queryForButtons}`,
          buttonText: { displayText: `📀 M4A/AAC (${audioFormats.m4a.bitrate || '?'}kbps)` },
          type: 1
        });
      }

      if (audioFormats.opus) {
        buttons.push({
          buttonId: `${prefix}audio opus ${queryForButtons}`,
          buttonText: { displayText: `🌀 Opus (${audioFormats.opus.bitrate || '?'}kbps)` },
          type: 1
        });
      }

      // Ongeza button ya kupeleka kwenye video kwenye YouTube
      buttons.push({
        buttonId: `${prefix}audio doc ${queryForButtons}`,
        buttonText: { displayText: '📄 Send as Document' },
        type: 1
      });

      // (6) CHANGES: Ujumbe wa kuonyesha aina za sauti zilizopatikana
      const availableFormatsText = [];
      if (audioFormats.mp3) availableFormatsText.push(`• MP3: ${audioFormats.mp3.bitrate || 'High'}kbps`);
      if (audioFormats.m4a) availableFormatsText.push(`• M4A/AAC: ${audioFormats.m4a.bitrate || 'High'}kbps`);
      if (audioFormats.opus) availableFormatsText.push(`• Opus: ${audioFormats.opus.bitrate || 'High'}kbps`);

      const message = `🎵 *${title}*\n👤 *Channel:* ${channel}\n⏱️ *Duration:* ${duration}\n🔗 *Source:* YouTube\n\n*Available Audio Formats:*\n${availableFormatsText.join('\n')}\n\n*Select download type:*`;

      await client.sendMessage(
        m.chat,
        {
          text: message,
          footer: '𝒑𝒐𝒘𝒆𝒓𝒆𝒅 𝒃𝒚 𝒇𝒆𝒆-𝒙𝒎𝒅',
          buttons: buttons,
          headerType: 4,
          image: { url: thumbnail },
        },
        { quoted: m, ad: true }
      );

    } catch (error) {
      console.error('Play command error:', error);
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`YouTube audio search failed. The universe rejects your music taste.\nError: ${error.message}`);
    }
  }
};