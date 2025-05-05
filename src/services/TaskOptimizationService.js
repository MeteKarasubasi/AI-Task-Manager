import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Görev optimizasyonu için AI destekli servis sınıfı
 */
export class TaskOptimizationService {
  constructor() {
    // Gemini API yapılandırması
    const API_KEY = 'AIzaSyCGa7UgPOe2eJAJKy3TCfE-qpFnhx4sjhc'; // Gerçek uygulamada bu değeri .env dosyasından alın
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Tüm görevleri Firestore'dan çeker
   */
  async getAllTasks() {
    try {
      const tasksRef = collection(db, 'tasks');
      const snapshot = await getDocs(tasksRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Görevler çekilirken hata:', error);
      throw error;
    }
  }

  /**
   * AI'dan görev optimizasyon önerileri alır
   */
  async getOptimizationSuggestions() {
    try {
      // Mevcut görevleri al
      const tasks = await this.getAllTasks();

      // AI prompt'unu hazırla
      const prompt = this.buildOptimizationPrompt(tasks);

      // Gemini API'den yanıt al
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const suggestions = this.parseSuggestions(response.text());

      return suggestions;
    } catch (error) {
      console.error('Öneriler alınırken hata:', error);
      throw error;
    }
  }

  /**
   * AI için optimizasyon prompt'u oluşturur
   */
  buildOptimizationPrompt(tasks) {
    return `
      Aşağıdaki görev listesini analiz et ve öncelik optimizasyonları öner:
      
      Görevler:
      ${tasks.map(task => `
        - ${task.title}
        - Mevcut Öncelik: ${task.priority}
        - Teslim Tarihi: ${task.dueDate}
        - Açıklama: ${task.description}
      `).join('\\n')}
      
      Lütfen şu formatta öneriler sun:
      1. Her öneri için:
         - Görev ID'si
         - Mevcut öncelik
         - Önerilen yeni öncelik
         - Değişiklik gerekçesi
      2. Öneriler aciliyet durumuna göre sıralanmalı
      3. Her öneri için kısa ve net bir açıklama
    `;
  }

  /**
   * AI yanıtını öneriler dizisine dönüştürür
   */
  parseSuggestions(aiResponse) {
    try {
      // AI yanıtını satırlara böl
      const lines = aiResponse.split('\\n').filter(line => line.trim());
      
      const suggestions = [];
      let currentSuggestion = null;

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          // Yeni öneri başlangıcı
          if (currentSuggestion) {
            suggestions.push(currentSuggestion);
          }
          currentSuggestion = {
            id: suggestions.length + 1,
            taskId: '',
            currentPriority: '',
            newPriority: '',
            reason: '',
            details: []
          };
        } else if (currentSuggestion) {
          // Öneri detaylarını parse et
          if (line.includes('Görev ID')) {
            currentSuggestion.taskId = line.split(':')[1].trim();
          } else if (line.includes('Mevcut öncelik')) {
            currentSuggestion.currentPriority = line.split(':')[1].trim();
          } else if (line.includes('Önerilen yeni öncelik')) {
            currentSuggestion.newPriority = line.split(':')[1].trim();
          } else if (line.includes('Gerekçe')) {
            currentSuggestion.reason = line.split(':')[1].trim();
          } else if (line.trim()) {
            currentSuggestion.details.push(line.trim());
          }
        }
      }

      // Son öneriyi ekle
      if (currentSuggestion) {
        suggestions.push(currentSuggestion);
      }

      return suggestions;
    } catch (error) {
      console.error('AI yanıtı parse edilirken hata:', error);
      throw error;
    }
  }

  /**
   * Öneriyi uygular ve görevi günceller
   */
  async applyOptimization(suggestion) {
    try {
      const taskRef = doc(db, 'tasks', suggestion.taskId);
      await updateDoc(taskRef, {
        priority: suggestion.newPriority,
        lastOptimized: new Date().toISOString(),
        optimizationReason: suggestion.reason
      });

      // Öneriyi arşivle
      await this.archiveSuggestion(suggestion, 'accepted');
    } catch (error) {
      console.error('Öneri uygulanırken hata:', error);
      throw error;
    }
  }

  /**
   * Öneriyi reddeder ve arşivler
   */
  async rejectOptimization(suggestion) {
    try {
      await this.archiveSuggestion(suggestion, 'rejected');
    } catch (error) {
      console.error('Öneri reddedilirken hata:', error);
      throw error;
    }
  }

  /**
   * Öneriyi arşivler
   */
  async archiveSuggestion(suggestion, status) {
    try {
      const archiveRef = collection(db, 'optimizationArchive');
      await addDoc(archiveRef, {
        ...suggestion,
        status,
        archivedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Öneri arşivlenirken hata:', error);
      throw error;
    }
  }
} 