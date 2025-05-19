import os
import firebase_admin
from firebase_admin import credentials
from pathlib import Path

def initialize_firebase():
    """
    Firebase Admin SDK'yı başlatır.
    Service Account anahtarını kullanarak Firebase ile bağlantı kurar.
    """
    try:
        # Service Account dosyasının yolunu al
        base_dir = Path(__file__).resolve().parent.parent
        cred_path = os.path.join(
            base_dir,
            'firebase_credentials',
            'ai-task-manager-f42fe-firebase-adminsdk-fbsvc-19560585da.json'
        )
        
        if not os.path.exists(cred_path):
            raise FileNotFoundError(f"Service Account file not found at: {cred_path}")
            
        # Firebase Admin SDK'yı başlat
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        
        print("✅ Firebase Admin SDK başarıyla başlatıldı!")
        
    except Exception as e:
        print(f"❌ Firebase Admin SDK başlatılırken hata oluştu: {str(e)}")
        raise 