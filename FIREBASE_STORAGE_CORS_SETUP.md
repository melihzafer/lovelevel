# Firebase Storage CORS Sorunu Çözümü

## Sorun
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

Bu hata, Firebase Storage'ın localhost'tan gelen isteklere izin vermediğini gösterir.

---

## ✅ Çözüm 1: Google Cloud SDK ile CORS Ayarla (Kalıcı Çözüm)

### 1. Google Cloud SDK Kurulumu

1. **İndir**: https://cloud.google.com/sdk/docs/install
2. **Kur**: İndirilen `GoogleCloudSDKInstaller.exe` dosyasını çalıştır
3. **Terminal'i yeniden aç**: Kurulum sonrası PowerShell'i kapat/aç

### 2. Google Cloud'a Login

```powershell
# Firebase hesabınla giriş yap
gcloud auth login
```

Tarayıcıda açılan pencereden Google hesabınızı seçin.

### 3. Firebase Projesini Ayarla

```powershell
# Projenizi ayarlayın (lovelevel-7dadc)
gcloud config set project lovelevel-7dadc
```

### 4. CORS Kurallarını Uygula

```powershell
# CORS yapılandırmasını Firebase Storage'a yükle
gsutil cors set cors.json gs://lovelevel-7dadc.firebasestorage.app
```

### 5. CORS Kurallarını Doğrula

```powershell
# Ayarların doğru yapıldığını kontrol et
gsutil cors get gs://lovelevel-7dadc.firebasestorage.app
```

**Çıktı şöyle olmalı:**
```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://melihzafer.github.io"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "X-Requested-With"]
  }
]
```

### 6. Tarayıcıyı Yenile

- Browser'ı tamamen kapat/aç (cache temizle)
- http://localhost:5175/lovelevel/ sayfasına git
- Profil fotoğrafı yüklemeyi tekrar dene ✅

---

## ✅ Çözüm 2: Firebase Console'dan Security Rules (Alternatif)

Eğer gsutil kurulumu yapmak istemiyorsan:

1. **Firebase Console'a git**: https://console.firebase.google.com/
2. **Projeyi aç**: `lovelevel-7dadc`
3. **Storage** sekmesine git (sol menüden)
4. **Rules** tabına tıkla
5. **Şu kuralları ekle**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos
    match /profile-photos/{userId}/{allPaths=**} {
      // Anyone can read if authenticated
      allow read: if request.auth != null;
      
      // Only owner can upload/update/delete
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

6. **Publish** butonuna tıkla

**NOT**: Bu yöntem CORS sorununu tamamen çözmeyebilir. Kalıcı çözüm için gsutil kullanmalısın.

---

## ✅ Çözüm 3: Geçici Test için Firebase Emulator (Development)

Sadece local test için:

```powershell
# Firebase CLI kur (eğer yoksa)
npm install -g firebase-tools

# Firebase emulator başlat
firebase emulators:start --only storage
```

Sonra `src/lib/firebase.ts` dosyasında:

```typescript
import { connectStorageEmulator } from 'firebase/storage';

if (import.meta.env.DEV) {
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

**Dezavantaj**: Sadece local test için, production'da çalışmaz.

---

## 🎯 Önerilen Yaklaşım

1. **İlk önce**: Çözüm 1 (Google Cloud SDK + gsutil) — Kalıcı, profesyonel çözüm ✅
2. **Alternatif**: Çözüm 2 (Firebase Console Rules) — Kısmi çözüm, CORS sorunu devam edebilir ⚠️
3. **Geçici**: Çözüm 3 (Emulator) — Sadece development için 🔧

---

## 🔍 Sorun Giderme

### CORS ayarladıktan sonra hala hata alıyorsam?

1. **Browser cache temizle**:
   - Chrome: F12 → Network tabı → "Disable cache" işaretle → Sayfayı yenile
   - Veya: Ctrl+Shift+Delete → Tüm cache'i temizle

2. **Tarayıcıyı tamamen kapat/aç**: Yeni session başlat

3. **CORS kurallarını kontrol et**:
   ```powershell
   gsutil cors get gs://lovelevel-7dadc.firebasestorage.app
   ```

4. **Firebase Storage Rules kontrol et**:
   - Console'da Rules sekmesine bak
   - `profile-photos/{userId}/{allPaths=**}` kuralı olmalı

### gsutil komutu çalışmıyorsa?

```powershell
# PATH'e eklenmiş mi kontrol et
where gsutil

# Eğer bulunamazsa, Google Cloud SDK'yı yeniden kur
# Ve "Add to PATH" seçeneğini işaretle
```

### Hala çözüm bulamadıysan?

Firebase Support'a ticket aç veya StackOverflow'da sor:
- https://firebase.google.com/support
- https://stackoverflow.com/questions/tagged/firebase-storage

---

## 📝 Ek Notlar

- **Production domain**: `https://melihzafer.github.io` zaten CORS listesinde
- **Localhost ports**: 5173, 5174, 5175 (Vite dev server için)
- **maxAgeSeconds**: 3600 (1 saat) — Browser CORS preflight cache süresi
- **responseHeader**: Firebase Storage'ın döndürebileceği headerlar

---

## ✅ Başarılı Kurulum Sonrası

Profil fotoğrafı yükleme akışı:

1. Profile sayfasına git
2. Avatar'a hover yap → Kamera overlay görünür
3. Avatar'a tıkla → Dosya seçici açılır
4. Resim seç (max 5MB, image/*)
5. **Yükleme başlar** → Spinner görünür
6. **Firebase Storage'a upload** → CORS hatası YOK ✅
7. **photoURL güncellenir** → `updateProfile(user, { photoURL })`
8. **Başarı mesajı** → Sayfa yenilenir
9. **Yeni avatar görünür** ✅

Herhangi bir sorun olursa bu dökümanı takip et!
