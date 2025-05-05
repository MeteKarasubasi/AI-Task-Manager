import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API anahtarını çevresel değişkenlerden al
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

/**
 * Kullanıcının mevcut görevlerine ve geçmiş davranışlarına bakarak
 * yeni görev önerileri oluşturur
 * @param {Array} existingTasks - Mevcut görevler listesi
 * @returns {Promise<Array>} Önerilen görevler listesi
 */
export const getTaskSuggestions = async (existingTasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Mevcut görevlerden bağlam oluştur
    const context = existingTasks.map(task => ({
      title: task.title,
      status: task.status,
      priority: task.priority
    }));

    const prompt = `Mevcut görev listesi: ${JSON.stringify(context, null, 2)}

    Lütfen bu görev listesine bakarak:
    1. Kullanıcının çalışma alanını ve önceliklerini analiz et
    2. Tamamlayıcı veya ilişkili 3 yeni görev öner
    3. Her görev için başlık, açıklama ve öncelik seviyesi belirle
    
    Yanıtı aşağıdaki JSON formatında ver:
    {
      "suggestions": [
        {
          "title": "Görev başlığı",
          "description": "Görev açıklaması",
          "priority": "low|medium|high"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON yanıtını parse et
    const suggestions = JSON.parse(text).suggestions;
    
    return suggestions;
  } catch (error) {
    console.error('AI görev önerileri alınırken hata:', error);
    throw new Error('Görev önerileri oluşturulamadı');
  }
};

/**
 * Mevcut görevlerin önceliklerini optimize eder
 * @param {Array} tasks - Optimize edilecek görevler listesi
 * @returns {Promise<Array>} Optimize edilmiş görev öncelikleri
 */
export const optimizeTaskPriorities = async (tasks) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Görev listesi: ${JSON.stringify(tasks, null, 2)}

    Lütfen bu görevlerin önceliklerini optimize et:
    1. Her görevin önem ve aciliyetini değerlendir
    2. Görevler arasındaki bağımlılıkları analiz et
    3. Her görev için en uygun öncelik seviyesini belirle (low, medium, high)
    
    Yanıtı aşağıdaki JSON formatında ver:
    {
      "optimizedPriorities": [
        {
          "taskId": "görev_id",
          "priority": "low|medium|high",
          "reason": "Öncelik değişikliğinin kısa açıklaması"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON yanıtını parse et
    const { optimizedPriorities } = JSON.parse(text);
    
    return optimizedPriorities;
  } catch (error) {
    console.error('Görev öncelikleri optimize edilirken hata:', error);
    throw new Error('Görev öncelikleri optimize edilemedi');
  }
}; 