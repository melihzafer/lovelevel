# 🔥 Firebase Storage Rules Düzeltme Rehberi

## ❌ SORUN: CORS Hatası

**Hata mesajı:**
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

**Asıl sebep:** Firebase Storage Rules yanlış veya eksik!

---

## ✅ ÇÖZÜM: Storage Rules'u Düzelt

### Adım 1: Firebase Console'da Storage Rules'a Git

🔗 **Direkt link:**
```
https://console.firebase.google.com/project/lovelevel-7dadc/storage/lovelevel-7dadc.firebasestorage.app/rules
```

### Adım 2: Rules Sekmesini Bul

Sol menüde:
1. **Storage** tıkla (Build kategorisinde)
2. Yukarıda **Rules** tab'ına tıkla
3. **STORAGE RULES** editörünü göreceksin

⚠️ **UYARI**: Realtime Database Rules'tan farklı! Storage'in ayrı rules'u var!

### Adım 3: Aşağıdaki Rules'u Yapıştır

Tüm mevcut içeriği SİL ve şunu yapıştır:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos - Herkes okuyabilir, sadece sahibi yazabilir
    match /profile-photos/{userId}/{fileName} {
      allow read: if true; // Public read (avatarlar için)
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Memory photos (gelecek özellik) - Sadece partnerlar okuyabilir/yazabilir
    match /memories/{partnershipId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Fallback - Authenticated users only
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Adım 4: Publish Et

1. Sağ üstte **"Publish"** butonuna tıkla
2. Onay penceresinde **"Publish"** tıkla
3. "Rules published successfully" mesajı göreceksin

### Adım 5: Test Et

1. **10 saniye bekle** (rules yayılması için)
2. Browser'ı **tamamen yenile**: `Ctrl + Shift + R` (cache temizler)
3. Profile sayfasına git
4. Fotoğraf yükle
5. ✅ **Başarılı!** Console'da "photoUpdated" alert'i göreceksin

---

## 🧐 Neden Bu Rules?

### Rule 1: Profile Photos
```javascript
match /profile-photos/{userId}/{fileName} {
  allow read: if true; // Herkes görebilir (avatarlar public)
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

✅ **Güvenlik:**
- Sadece giriş yapmış kullanıcılar yükleyebilir
- Kullanıcı sadece kendi klasörüne (`profile-photos/{kendi-uid}/...`) yazabilir
- Herkes avatarları görebilir (public read)

### Rule 2: Memories (Gelecek)
```javascript
match /memories/{partnershipId}/{fileName} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

✅ **Privacy:**
- Sadece giriş yapmış kullanıcılar görebilir
- Gelecekte partner kontrolü eklenebilir

### Rule 3: Fallback
```javascript
match /{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

✅ **Güvenlik:**
- Diğer tüm dosyalar için: sadece authenticated kullanıcılar erişebilir

---

## 🔍 Mevcut Rules'unu Kontrol Et

Eğer şu an rules'un boşsa veya şu şekildeyse:

### ❌ KÖTÜ (Hiçbir erişim yok):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false; // SORUN BURADA!
    }
  }
}
```

### ❌ KÖTÜ (Test mode - güvensiz):
```javascript
allow read, write: if true; // Herkes her şeyi yapabilir - TEHLİKELİ!
```

### ✅ İYİ (Yukarıdaki rules):
```javascript
// Profile photos: public read, owner write
// Memories: authenticated only
// Fallback: authenticated only
```

---

## 📊 Sen Gösterdiğin Rules

**Senin gösterdiğin:**
```json
{
  "rules": {
    "users": { ... },
    "invites": { ... },
    "partnerships": { ... }
  }
}
```

Bu **Realtime Database Rules**! Storage'in ayrı rules'u var.

**Fark:**
- **Realtime Database**: JSON formatında veriler (`users`, `invites`, `partnerships`)
- **Storage**: Dosyalar (fotoğraflar, videolar, PDF'ler)

---

## 🚀 Alternatif: IndexedDB Base64 (CORS Sorunu Yok)

Eğer Storage Rules'u düzeltmek istemiyorsan:

### Profil Sayfasını Değiştir

`Profile.tsx` yerine `Profile.INDEXEDDB.tsx` kullan:

```typescript
// App.tsx'te
const ProfilePage = lazy(() => import('./pages/Profile.INDEXEDDB'));
```

**Avantajlar:**
- ✅ CORS sorunu YOK
- ✅ Ücretsiz (storage kullanmıyor)
- ✅ Offline çalışır
- ✅ Gizlilik (fotoğraflar cloud'a gitmiyor)

**Dezavantajlar:**
- ❌ Partner'la sync olmaz
- ❌ Cihaz değişiminde kaybolur
- ❌ Browser cache temizlenirse kaybolur

---

## 🎯 Hangi Yöntemi Seçeyim?

### Firebase Storage (ÖNERİLEN)
👉 **Seç eğer:**
- ✅ Partner'la fotoğraf paylaşmak istiyorsan
- ✅ Cihaz değişiminde fotoğraflar korunsun istiyorsan
- ✅ Production-ready çözüm istiyorsan

👉 **Yapman gereken:**
- Storage Rules'u yukarıdaki gibi düzelt (2 dakika)

### IndexedDB Base64 (Alternatif)
👉 **Seç eğer:**
- ✅ Sadece kendi fotoğrafını görmek yeterliyse
- ✅ CORS uğraşmak istemiyorsan
- ✅ 100% offline app istiyorsan

👉 **Yapman gereken:**
- `App.tsx`'te import değiştir: `Profile.INDEXEDDB.tsx`

---

## 📝 Özet

1. **Firebase Console'a git**: Storage → Rules
2. **Yukarıdaki rules'u yapıştır**
3. **Publish et**
4. **10 saniye bekle**
5. **Browser'ı yenile** (Ctrl+Shift+R)
6. **Test et** (fotoğraf yükle)
7. ✅ **ÇÖZÜLDÜ!**

---

## 💡 Hala Sorun Varsa

### Kontrol listesi:
- [ ] Storage Rules'u doğru yapıştırdın mı?
- [ ] Publish ettikten sonra 10 saniye bekledin mi?
- [ ] Browser cache temizledin mi? (Ctrl+Shift+R)
- [ ] Firebase Authentication çalışıyor mu? (user != null)
- [ ] Console'da başka hata var mı? (F12 → Console)

### Storage başlatılmamışsa:
1. Firebase Console → Storage
2. "Get Started" butonuna tıkla
3. Location seç (europe-west1)
4. "Done" tıkla
5. Sonra Rules'u düzenle

---

**Son Durum:**
- ✅ Kod doğru (Firebase SDK kullanıyor)
- ❌ Storage Rules yanlış veya eksik
- 🎯 Çözüm: Rules'u düzelt (yukarıda)
- ⏱️ Süre: 2 dakika

**Şimdi Firebase Console'a git ve Rules'u düzelt!** 🔥
