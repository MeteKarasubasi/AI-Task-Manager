import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const whisperService = {
  /**
   * Ses dosyasını metne çevirir
   * @param audioBlob - Ses kaydı blobu
   * @returns Metne çevrilmiş ses
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Ses dosyasını FormData olarak hazırla
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'tr');

      const response = await openai.audio.transcriptions.create({
        file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
        language: 'tr',
      });

      return response.text;
    } catch (error) {
      console.error('Ses dosyası metne çevrilirken hata:', error);
      throw error;
    }
  }
}; 