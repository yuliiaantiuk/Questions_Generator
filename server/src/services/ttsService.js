import https from 'https';

class TTSService {
  constructor() {
    console.log('TTS Service initialized - Using Google TTS');
  }
  // Split text into parts for Google TTS
splitTextForGoogleTTS(text) {
  // split text into parts of max 150 characters
  const maxLength = 150;
  const parts = [];
  let currentPart = '';
  
  // Clean text from special characters
  const cleanText = text.replace(/[<>"']/g, '').replace(/\s+/g, ' ');
  const words = cleanText.split(' ');
  
  for (const word of words) {
    if ((currentPart + ' ' + word).length <= maxLength) {
      currentPart += (currentPart ? ' ' : '') + word;
    } else {
      if (currentPart) parts.push(currentPart);
      currentPart = word;
      
      // If a single word is longer than the limit - split it
      if (word.length > maxLength) {
        parts.push(word.substring(0, maxLength));
        currentPart = word.substring(maxLength);
      }
    }
  }
  
  if (currentPart) parts.push(currentPart);
  
  console.log(`📝 Split ${text.length} chars into ${parts.length} parts`);
  console.log('Parts:', parts.map(p => p.substring(0, 30) + '...'));
  return parts;
}

// Synthesize a single part of text
synthesizeSinglePart(text, language) {
  return new Promise((resolve, reject) => {
    try {
      // Additional cleaning for Google TTS
      const cleanText = text
        .replace(/[^\w\sа-яА-ЯіІїЇєЄґҐ.,!?\-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!cleanText || cleanText.length < 3) {
        resolve(Buffer.alloc(0)); // Empty buffer for empty parts
        return;
      }
      
      console.log(`Sending to Google: "${cleanText.substring(0, 50)}..." (${cleanText.length} chars)`);
      
      const encodedText = encodeURIComponent(cleanText);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;

      const chunks = [];
      const request = https.get(ttsUrl, (response) => {
        if (response.statusCode !== 200) {
          console.error(`Google TTS responded with ${response.statusCode} for: ${cleanText.substring(0, 30)}`);
          reject(new Error(`TTS request failed: ${response.statusCode}`));
          return;
        }

        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const audioBuffer = Buffer.concat(chunks);
          if (audioBuffer.length === 0) {
            console.error(`Empty audio for: ${cleanText.substring(0, 30)}`);
            resolve(Buffer.alloc(0)); // Return empty buffer instead of error
          } else {
            console.log(`Got ${audioBuffer.length} bytes for part`);
            resolve(audioBuffer);
          }
        });
      });

      request.on('error', err => {
        console.error(`Network error: ${err.message}`);
        reject(new Error(`TTS network error: ${err.message}`));
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        console.error(`Timeout for: ${cleanText.substring(0, 30)}`);
        reject(new Error('TTS request timeout'));
      });
    } catch (error) {
      console.error(`Exception in synthesizeSinglePart:`, error.message);
      reject(error);
    }
  });
}

//Synthesize full speech from text
async synthesizeSpeech(text, language = 'uk', timeoutMs = 30000) {
  try {
    const textParts = this.splitTextForGoogleTTS(text);
    const audioBuffers = [];
    
    for (let i = 0; i < textParts.length; i++) {
      const part = textParts[i];
      
      try {
        const buffer = await this.synthesizeSinglePart(part, language);
        if (buffer.length > 0) {
          audioBuffers.push(buffer);
        }
      } catch (error) {
        console.error(`Failed part ${i+1}, skipping:`, error.message);
        // Skipping the failed part and continuing
        continue;
      }
      
      if (i < textParts.length - 1) {
        await this.delay(500); // Increasing delay
      }
    }
    
    if (audioBuffers.length === 0) {
      throw new Error('All parts failed to synthesize');
    }
    
    const combinedBuffer = Buffer.concat(audioBuffers);
    console.log(`Success: ${audioBuffers.length}/${textParts.length} parts, total ${combinedBuffer.length} bytes`);
    return combinedBuffer;
    
  } catch (error) {
    console.error('Error in synthesizeSpeech:', error.message);
    throw error;
  }
}
  // Batch synthesis
  async synthesizeAllQuestions(questions) {
    const audioFiles = [];

    for (const question of questions) {
      try {
        const audioBuffer = await this.synthesizeSpeech(question.text);
        audioFiles.push({
          questionId: question.id || question.text,
          audioData: audioBuffer.toString('base64'), // base64 instead of filename
          text: question.text
        });

        await this.delay(500); // delay between requests
      } catch (error) {
        console.error(`Failed to synthesize: ${question.text}`, error.message);
        audioFiles.push({
          questionId: question.id || question.text,
          audioData: null,
          text: question.text,
          error: error.message
        });
      }
    }

    return audioFiles;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new TTSService();
