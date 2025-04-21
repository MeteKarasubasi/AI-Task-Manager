import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll 
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Dosya yükleme
export const uploadFile = (folder, file, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      // Benzersiz bir dosya adı oluştur
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      // Yükleme işlemi için uploadTask oluştur
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Yükleme olaylarını izle
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // İlerleme durumunu hesapla
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Hata durumunda
          reject(error);
        },
        async () => {
          // Yükleme tamamlandığında
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            name: fileName,
            url: downloadURL,
            path: `${folder}/${fileName}`,
            contentType: file.type,
            size: file.size
          });
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Bir klasördeki tüm dosyaları listeleme
export const listFiles = async (folder) => {
  try {
    const listRef = ref(storage, folder);
    const res = await listAll(listRef);
    
    const items = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url
        };
      })
    );
    
    return items;
  } catch (error) {
    throw error;
  }
};

// Dosya URL'ini alma
export const getFileUrl = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    throw error;
  }
};

// Dosya silme
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    throw error;
  }
}; 