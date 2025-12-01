import https from 'https';

class TTSService {
  constructor() {
    console.log('TTS Service initialized - Using Google TTS');
  }
  // Synthesize speech using Google TTS
  synthesizeSpeech(text, language = 'uk', timeoutMs = 30000) {
    return Promise.race([
      new Promise((resolve, reject) => {
        try {
          const encodedText = encodeURIComponent(text);
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodedText}`;

          const chunks = [];
          const request = https.get(ttsUrl, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`TTS request failed: ${response.statusCode}`));
              return;
            }

            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
              const audioBuffer = Buffer.concat(chunks);
              if (audioBuffer.length === 0) reject(new Error('Downloaded audio is empty'));
              else resolve(audioBuffer);
            });
          });

          request.on('error', err => reject(new Error(`TTS network error: ${err.message}`)));
          request.setTimeout(10000, () => {  // це внутрішній timeout для запиту
            request.destroy();
            reject(new Error('TTS request timeout'));
          });
        } catch (error) {
          reject(error);
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TTS overall timeout exceeded 30s')), timeoutMs)
      )
    ]);
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
        console.error(`❌ Failed to synthesize: ${question.text}`, error.message);
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
