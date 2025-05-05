import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Task koleksiyonu referansı
const tasksCollection = collection(db, 'tasks');

/**
 * Yeni görev oluşturma
 * @param {Object} taskData - Görev verileri
 * @param {string} userId - Kullanıcı ID
 * @returns {Promise} - Oluşturulan görev
 */
export const createTask = async (taskData, userId) => {
  if (!userId) {
    console.error('TaskService: Görev oluşturulamıyor - userId geçersiz');
    throw new Error('Geçersiz kullanıcı kimliği');
  }

  if (!taskData || !taskData.title) {
    console.error('TaskService: Görev oluşturulamıyor - başlık gerekli');
    throw new Error('Görev başlığı zorunludur');
  }

  try {
    // Status değerini düzgün formata çevir
    const normalizeStatus = (status) => {
      const statusMap = {
        'todo': 'todo',
        'in-progress': 'in-progress', 
        'completed': 'completed',
        'TODO': 'todo',
        'IN_PROGRESS': 'in-progress',
        'DONE': 'completed',
        'inProgress': 'in-progress',
        'done': 'completed'
      };
      return statusMap[status] || 'todo';
    };

    const task = {
      ...taskData,
      userId,
      createdAt: serverTimestamp(), // Firebase server timestamp kullan
      updatedAt: serverTimestamp(),
      status: normalizeStatus(taskData.status || 'todo'),
      priority: taskData.priority || 'medium'
    };

    console.log('TaskService: Görev oluşturuluyor:', task);
    const docRef = await addDoc(tasksCollection, task);
    
    // Görev başarıyla oluşturuldu, client tarafı için bir tarih değeri döndür
    const createdTask = { 
      id: docRef.id, 
      ...task,
      createdAt: new Date(), // Client'a döndürmek için geçici tarih
      updatedAt: new Date()
    };
    
    return createdTask;
  } catch (error) {
    console.error('TaskService: Görev oluşturulurken hata:', error);
    throw error;
  }
};

/**
 * Görev güncelleme
 * @param {string} taskId - Görev ID
 * @param {Object} updateData - Güncellenecek veriler
 * @returns {Promise} - Güncellenen görev
 */
export const updateTask = async (taskId, updateData) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return { id: taskId, ...updateData };
  } catch (error) {
    console.error('Görev güncellenirken hata:', error);
    throw error;
  }
};

/**
 * Görev silme
 * @param {string} taskId - Görev ID
 * @returns {Promise}
 */
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    return taskId;
  } catch (error) {
    console.error('Görev silinirken hata:', error);
    throw error;
  }
};

/**
 * Kullanıcının görevlerini gerçek zamanlı dinleme
 * @param {string} userId - Kullanıcı ID
 * @param {Function} onUpdate - Güncelleme callback fonksiyonu
 * @returns {Function} - Dinlemeyi durduran fonksiyon
 */
export const subscribeToTasks = (userId, onUpdate) => {
  if (!userId) {
    console.error('TaskService: userId geçersiz!');
    onUpdate([]);
    return () => {};
  }

  console.log(`TaskService: ${userId} için görevler dinleniyor...`);
  
  try {
    // Basit sorgu - sadece userId filtresi kullan
    const q = query(tasksCollection, where('userId', '==', userId));
    
    // onSnapshot listener oluştur
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        try {
          const tasks = [];
          snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
          });
          
          // Görevleri tarih sırasına göre düzenle
          const sortedTasks = tasks.sort((a, b) => {
            // Tarihler için null kontrolleri
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            
            // Tarih nesneleri oluştur
            const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : 
                          typeof a.createdAt === 'string' ? new Date(a.createdAt) : new Date(0);
                          
            const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : 
                          typeof b.createdAt === 'string' ? new Date(b.createdAt) : new Date(0);
            
            // Tarihleri karşılaştır
            return bDate.getTime() - aDate.getTime(); // Yeniden eskiye
          });
          
          console.log(`TaskService: ${tasks.length} görev bulundu`);
          onUpdate(sortedTasks);
        } catch (error) {
          console.error('TaskService: Görev verileri işlenirken hata:', error);
          onUpdate([]);
        }
      }, 
      (error) => {
        console.error('TaskService: Görevler dinlenirken hata:', error);
        onUpdate([]);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('TaskService: Firestore sorgusu oluşturulurken hata:', error);
    onUpdate([]);
    return () => {};
  }
};

/**
 * Görev durumunu güncelleme
 * @param {string} taskId - Görev ID
 * @param {string} status - Yeni durum
 * @returns {Promise}
 */
export const updateTaskStatus = async (taskId, status) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { id: taskId, status };
  } catch (error) {
    console.error('Görev durumu güncellenirken hata:', error);
    throw error;
  }
}; 