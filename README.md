# AI Task Manager

🇹🇷 Yapay Zeka Destekli Görev Yönetim Sistemi

## Proje Hakkında
Bu proje, yapay zeka destekli bir görev ve toplantı yönetim sistemidir. Django backend, React Native mobil uygulama ve web arayüzü içerir.

### Özellikler
- ✅ Kullanıcı kimlik doğrulama ve yetkilendirme
- 📋 Görev yönetimi (CRUD işlemleri)
- 🎯 Kanban board görünümü
- 🔔 Gerçek zamanlı bildirimler
- 🤖 AI destekli görev önerileri
- 🎤 Sesli görev ekleme
- 📅 Takvim entegrasyonu

## Kurulum

### Backend (Django)
```bash
# Virtual environment oluştur
python -m venv venv

# Virtual environment'ı aktifleştir
# Windows için:
venv\Scripts\activate
# Unix/MacOS için:
source venv/bin/activate

# Gerekli paketleri yükle
pip install -r requirements.txt

# Veritabanı migrasyonlarını uygula
cd backend
python manage.py migrate

# Sunucuyu başlat
python manage.py runserver
```

### Mobil Uygulama (React Native + Expo)
```bash
# Gerekli paketleri yükle
cd mobile
npm install

# Uygulamayı başlat
npx expo start
```

## Teknoloji Yığını
- Backend: Django + Django REST Framework
- Veritabanı: Firebase Firestore
- Kimlik Doğrulama: Firebase Authentication
- Mobil: React Native + Expo
- Web: React.js
- AI Servisleri: Gemini API, Whisper API

## Katkıda Bulunma
1. Bu repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans
MIT License altında lisanslanmıştır.

---

🇬🇧 AI-Powered Task Management System

[English documentation will be added soon...] 