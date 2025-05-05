import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Belge oluşturma (ID belirterek)
export const createDocumentWithId = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docId;
  } catch (error) {
    throw error;
  }
};

// Belge oluşturma (otomatik ID)
export const createDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Belge getirme
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

// Koleksiyon getirme
export const getCollection = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    throw error;
  }
};

// Filtrelenmiş sorgu
export const queryDocuments = async (collectionName, conditions = [], sortOptions = [], limitCount = 0) => {
  try {
    let queryRef = collection(db, collectionName);
    
    if (conditions.length > 0 || sortOptions.length > 0) {
      const queryConstraints = [];
      
      // Filtreler ekle
      conditions.forEach((condition) => {
        queryConstraints.push(where(condition.field, condition.operator, condition.value));
      });
      
      // Sıralama ekle
      sortOptions.forEach((sort) => {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      });
      
      // Limit ekle
      if (limitCount > 0) {
        queryConstraints.push(limit(limitCount));
      }
      
      queryRef = query(queryRef, ...queryConstraints);
    }
    
    const querySnapshot = await getDocs(queryRef);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    throw error;
  }
};

// Belge güncelleme
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Belge silme
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw error;
  }
};

// Gerçek zamanlı veri dinleme - belge
export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Gerçek zamanlı veri dinleme - koleksiyon
export const subscribeToCollection = (collectionName, callback, conditions = []) => {
  let queryRef = collection(db, collectionName);
  
  if (conditions.length > 0) {
    const queryConstraints = conditions.map((condition) => 
      where(condition.field, condition.operator, condition.value)
    );
    queryRef = query(queryRef, ...queryConstraints);
  }
  
  return onSnapshot(queryRef, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
}; 