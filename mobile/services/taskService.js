import { 
  createDocument, 
  getDocument, 
  updateDocument, 
  deleteDocument,
  queryDocuments, 
  subscribeToCollection
} from './firestoreService';
import { auth } from '../config/firebase';

// Koleksiyon adı
const COLLECTION_NAME = 'tasks';

// Yeni görev oluşturma
export const createTask = async (taskData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    const task = {
      ...taskData,
      userId: currentUser.uid,
      completed: false,
      createdAt: new Date(),
    };

    const taskId = await createDocument(COLLECTION_NAME, task);
    return { id: taskId, ...task };
  } catch (error) {
    throw error;
  }
};

// Görev detayını getirme
export const getTask = async (taskId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    const task = await getDocument(COLLECTION_NAME, taskId);
    
    // Kullanıcı kendi görevini mi görüntülüyor kontrol et
    if (task && task.userId !== currentUser.uid) {
      throw new Error('Bu göreve erişim izniniz yok');
    }
    
    return task;
  } catch (error) {
    throw error;
  }
};

// Görev güncelleme
export const updateTask = async (taskId, taskData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    // Önce görevi getir, kullanıcıya ait mi kontrol et
    const task = await getDocument(COLLECTION_NAME, taskId);
    if (!task) throw new Error('Görev bulunamadı');
    if (task.userId !== currentUser.uid) throw new Error('Bu görevi düzenleme izniniz yok');

    // Görevi güncelle
    await updateDocument(COLLECTION_NAME, taskId, {
      ...taskData,
      updatedAt: new Date()
    });
    
    return { id: taskId, ...task, ...taskData, updatedAt: new Date() };
  } catch (error) {
    throw error;
  }
};

// Görev tamamlama durumunu değiştirme
export const toggleTaskStatus = async (taskId, isCompleted) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    // Görevi güncelle
    await updateDocument(COLLECTION_NAME, taskId, {
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Görevi silme
export const deleteTask = async (taskId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    // Önce görevi getir, kullanıcıya ait mi kontrol et
    const task = await getDocument(COLLECTION_NAME, taskId);
    if (!task) throw new Error('Görev bulunamadı');
    if (task.userId !== currentUser.uid) throw new Error('Bu görevi silme izniniz yok');

    // Görevi sil
    await deleteDocument(COLLECTION_NAME, taskId);
    return true;
  } catch (error) {
    throw error;
  }
};

// Kullanıcının görevlerini getirme
export const getUserTasks = async (filterOptions = {}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    // Filtre koşulları oluştur
    const conditions = [
      { field: 'userId', operator: '==', value: currentUser.uid },
    ];
    
    // Tamamlanma durumuna göre filtrele
    if (filterOptions.completed !== undefined) {
      conditions.push({ field: 'completed', operator: '==', value: filterOptions.completed });
    }
    
    // Sıralama seçenekleri
    const sortOptions = [
      { 
        field: filterOptions.sortBy || 'createdAt', 
        direction: filterOptions.sortDirection || 'desc' 
      }
    ];
    
    // Sorgu yap
    const tasks = await queryDocuments(
      COLLECTION_NAME, 
      conditions, 
      sortOptions,
      filterOptions.limit || 0
    );
    
    return tasks;
  } catch (error) {
    throw error;
  }
};

// Kullanıcının görevlerini gerçek zamanlı dinleme
export const subscribeToUserTasks = (callback, filterOptions = {}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

    // Filtre koşulları
    const conditions = [
      { field: 'userId', operator: '==', value: currentUser.uid },
    ];
    
    // Tamamlanma durumuna göre filtrele
    if (filterOptions.completed !== undefined) {
      conditions.push({ field: 'completed', operator: '==', value: filterOptions.completed });
    }
    
    // Dinlemeyi başlat
    return subscribeToCollection(COLLECTION_NAME, callback, conditions);
  } catch (error) {
    throw error;
  }
}; 