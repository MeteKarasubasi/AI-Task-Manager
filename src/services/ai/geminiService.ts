import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API anahtarını çevresel değişkenlerden al
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  tags: string[];
}

interface PriorityAnalysis {
  suggestedPriority: 'low' | 'medium' | 'high';
  reasoning: string;
}

interface MeetingSummary {
  summary: string[];
  actionItems: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }[];
}

export const geminiService = {
  /**
   * Kullanıcının geçmiş görevlerine bakarak yeni görev önerileri oluşturur
   */
  async generateTaskSuggestions(userTasks: any[]): Promise<TaskSuggestion[]> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Aşağıdaki görev geçmişine bakarak, kullanıcı için 3 yeni görev önerisi oluştur:
        ${JSON.stringify(userTasks, null, 2)}

        Lütfen şu formatta yanıt ver:
        [
          {
            "title": "Görev başlığı",
            "description": "Görev açıklaması",
            "priority": "low|medium|high",
            "estimatedDuration": "2h",
            "tags": ["tag1", "tag2"]
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Görev önerisi oluşturulurken hata:', error);
      throw error;
    }
  },

  /**
   * Görev içeriğini analiz ederek öncelik önerisinde bulunur
   */
  async analyzePriority(taskTitle: string, taskDescription: string): Promise<PriorityAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Lütfen aşağıdaki görevi analiz et ve uygun öncelik seviyesi öner:
        
        Başlık: ${taskTitle}
        Açıklama: ${taskDescription}

        Yanıtını şu formatta ver:
        {
          "suggestedPriority": "low|medium|high",
          "reasoning": "Öneri gerekçesi"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Öncelik analizi yapılırken hata:', error);
      throw error;
    }
  },

  /**
   * Ses kaydından metne çevrilen içeriği analiz ederek görev oluşturur
   */
  async analyzeVoiceInput(transcribedText: string): Promise<TaskSuggestion> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Lütfen aşağıdaki ses kaydından oluşturulan metni analiz ederek bir görev oluştur:
        
        "${transcribedText}"

        Yanıtını şu formatta ver:
        {
          "title": "Görev başlığı",
          "description": "Görev açıklaması",
          "priority": "low|medium|high",
          "estimatedDuration": "Tahmini süre",
          "tags": ["İlgili etiketler"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Ses girişi analiz edilirken hata:', error);
      throw error;
    }
  },

  /**
   * Toplantı notlarını analiz ederek özet ve aksiyon maddeleri çıkarır
   */
  async summarizeMeetingNotes(notes: string): Promise<MeetingSummary> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Lütfen aşağıdaki toplantı notlarını analiz et:
        
        ${notes}

        Yanıtını şu formatta ver:
        {
          "summary": ["Maksimum 5 cümleyle özetlenmiş toplantı notları"],
          "actionItems": [
            {
              "title": "Aksiyon başlığı",
              "description": "Aksiyon açıklaması",
              "priority": "high|medium|low"
            }
          ]
        }
        
        Sadece önemli ve somut aksiyon maddeleri çıkar. Maksimum 5 aksiyon maddesi olmalı.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Toplantı notları özetlenirken hata:', error);
      throw error;
    }
  }
}; 