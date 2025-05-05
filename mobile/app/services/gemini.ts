import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

const projectTemplates = {
  development: {
    prompt: `Bir yazılım geliştirme projesi için görev şablonları oluştur. 
    Şablonlar şu kategorilerde olmalı:
    1. Planlama ve Analiz
    2. Tasarım
    3. Geliştirme
    4. Test
    5. Dağıtım
    
    Her kategori için 3-4 spesifik görev oluştur. Görevler Türkçe olmalı ve gerçekçi olmalı.
    JSON formatında döndür.`,
  },
  design: {
    prompt: `Bir tasarım projesi için görev şablonları oluştur.
    Şablonlar şu kategorilerde olmalı:
    1. Araştırma ve Analiz
    2. Konsept Geliştirme
    3. Tasarım
    4. Prototip
    5. Final
    
    Her kategori için 3-4 spesifik görev oluştur. Görevler Türkçe olmalı ve gerçekçi olmalı.
    JSON formatında döndür.`,
  },
  marketing: {
    prompt: `Bir pazarlama projesi için görev şablonları oluştur.
    Şablonlar şu kategorilerde olmalı:
    1. Pazar Araştırması
    2. Strateji Geliştirme
    3. İçerik Üretimi
    4. Kampanya Yönetimi
    5. Analiz ve Raporlama
    
    Her kategori için 3-4 spesifik görev oluştur. Görevler Türkçe olmalı ve gerçekçi olmalı.
    JSON formatında döndür.`,
  },
  management: {
    prompt: `Bir proje yönetimi projesi için görev şablonları oluştur.
    Şablonlar şu kategorilerde olmalı:
    1. Proje Planlaması
    2. Kaynak Yönetimi
    3. Risk Yönetimi
    4. İlerleme Takibi
    5. Raporlama
    
    Her kategori için 3-4 spesifik görev oluştur. Görevler Türkçe olmalı ve gerçekçi olmalı.
    JSON formatında döndür.`,
  },
};

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

export interface ProjectTemplate {
  category: string;
  tasks: TaskTemplate[];
}

export const generateProjectTemplate = async (category: keyof typeof projectTemplates): Promise<ProjectTemplate> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(projectTemplates[category].prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON string'i parse et
    const template = JSON.parse(text);
    
    // Her göreve unique ID ekle
    template.tasks = template.tasks.map((task: TaskTemplate, index: number) => ({
      ...task,
      id: `${category}-${index + 1}`,
    }));
    
    return template;
  } catch (error) {
    console.error('Template generation error:', error);
    throw error;
  }
}; 