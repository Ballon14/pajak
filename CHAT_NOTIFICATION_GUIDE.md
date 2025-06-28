# 💬 Sistem Notifikasi Chat - Panduan Lengkap

## **✅ Fitur Notifikasi Chat yang Tersedia**

### **🎯 Jenis Notifikasi:**

1. **Toast Notification** - Muncul di pojok kanan atas
2. **Browser Notification** - Notifikasi sistem browser
3. **Badge Counter** - Angka di tombol chat
4. **Sound Alert** - Suara notifikasi (opsional)

### **📍 Lokasi Tampilan:**

-   **Toast**: Pojok kanan atas (top-right)
-   **Badge**: Di atas tombol chat (bottom-right)
-   **Browser**: Notifikasi sistem browser

## **🚀 Cara Kerja Sistem Notifikasi Chat**

### **1. Polling System**

-   ✅ **Auto-check**: Setiap 5 detik mengecek pesan baru
-   ✅ **Smart polling**: Hanya polling saat chat tidak terbuka
-   ✅ **Efficient**: Tidak membebani server

### **2. Message Detection**

-   ✅ **Filter user**: Hanya pesan untuk user yang login
-   ✅ **New message**: Deteksi pesan baru dari admin
-   ✅ **Unread count**: Hitung pesan yang belum dibaca

### **3. Notification Types**

-   ✅ **Toast**: Muncul otomatis saat ada pesan baru
-   ✅ **Badge**: Angka merah di tombol chat
-   ✅ **Browser**: Notifikasi sistem (jika diizinkan)

## **🔧 Komponen yang Digunakan**

### **1. useChatNotification Hook**

```javascript
const {
    unreadCount,
    resetUnreadCount,
    requestNotificationPermission,
    checkNewMessages,
} = useChatNotification()
```

### **2. ChatNotificationBadge Component**

```javascript
<ChatNotificationBadge unreadCount={unreadCount} onClick={handleOpenChat} />
```

### **3. SupportChat Component**

```javascript
import { useChatNotification, ChatNotificationBadge } from "./ChatNotification"
```

## **📱 Fitur yang Tersedia**

### **✅ Auto Notification**

-   Pesan baru otomatis muncul notifikasi
-   Badge counter bertambah
-   Toast notification muncul

### **✅ Permission Management**

-   Request permission browser notification
-   Fallback ke toast notification
-   User-friendly permission UI

### **✅ Smart Reset**

-   Badge reset saat chat dibuka
-   Unread count reset otomatis
-   Clean state management

### **✅ Responsive Design**

-   Bekerja di desktop, tablet, mobile
-   Adaptive layout
-   Touch-friendly interface

## **🎨 UI/UX Features**

### **Badge Counter**

-   🔴 **Red badge** dengan angka
-   ⚡ **Pulse animation** untuk menarik perhatian
-   📱 **Clickable** untuk buka chat

### **Toast Notification**

-   💬 **Chat icon** untuk identifikasi
-   📝 **Message preview** (truncated)
-   ⏰ **Auto-disappear** setelah 4 detik

### **Browser Notification**

-   🏷️ **Custom title**: "Pesan Baru dari Support"
-   📄 **Message body**: Isi pesan
-   🎯 **Tag system**: Mencegah duplikasi

## **🔍 Debugging & Testing**

### **Test Notifikasi Chat:**

1. **Login sebagai user**
2. **Buka halaman user** (dashboard, inputdata, dll)
3. **Admin kirim pesan** dari halaman admin/chat
4. **Cek notifikasi** muncul dalam 5 detik

### **Cek Permission:**

```javascript
// Di browser console
console.log(Notification.permission)
// "default" = belum diizinkan
// "granted" = sudah diizinkan
// "denied" = ditolak
```

### **Manual Test:**

```javascript
// Test notifikasi manual
const { addNotification } = useNotification()
addNotification("💬 Pesan baru: Test notifikasi chat", "info")
```

## **⚙️ Konfigurasi**

### **Polling Interval**

```javascript
// Di ChatNotification.js
pollingIntervalRef.current = setInterval(() => {
    checkNewMessages()
}, 5000) // 5 detik
```

### **Notification Duration**

```javascript
// Toast notification duration
setTimeout(() => {
    setIsVisible(false)
    setTimeout(onClose, 300)
}, 4000) // 4 detik
```

### **Badge Animation**

```css
@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}
```

## **🚨 Troubleshooting**

### **Notifikasi Tidak Muncul:**

1. ✅ **Cek permission**: Browser notification diizinkan
2. ✅ **Cek polling**: Console log untuk error
3. ✅ **Cek API**: `/api/chat` berfungsi
4. ✅ **Cek session**: User sudah login

### **Badge Tidak Update:**

1. ✅ **Cek unreadCount**: State terupdate
2. ✅ **Cek reset**: Saat chat dibuka
3. ✅ **Cek filter**: Pesan untuk user yang benar

### **Browser Notification Tidak Muncul:**

1. ✅ **Cek permission**: `Notification.permission === "granted"`
2. ✅ **Cek browser**: Support Notification API
3. ✅ **Cek focus**: Tab tidak dalam focus

## **📊 Performance**

### **Optimization:**

-   ✅ **Smart polling**: Hanya saat chat tertutup
-   ✅ **Efficient API calls**: Minimal requests
-   ✅ **Memory management**: Cleanup intervals
-   ✅ **State optimization**: Minimal re-renders

### **Monitoring:**

-   ✅ **Error handling**: Try-catch untuk API calls
-   ✅ **Console logging**: Debug information
-   ✅ **User feedback**: Toast notifications

## **🎯 Best Practices**

### **✅ Do's:**

-   Gunakan polling interval yang reasonable (5-10 detik)
-   Berikan feedback visual yang jelas
-   Handle permission gracefully
-   Cleanup resources saat unmount

### **❌ Don'ts:**

-   Jangan polling terlalu sering (spam server)
-   Jangan spam notifikasi
-   Jangan ignore permission states
-   Jangan lupa cleanup intervals

## **🚀 Ready to Use!**

Sistem notifikasi chat sudah siap digunakan dengan fitur:

-   ✅ **Real-time notifications** untuk pesan baru
-   ✅ **Smart badge counter** dengan animasi
-   ✅ **Browser notification** support
-   ✅ **Toast notifications** sebagai fallback
-   ✅ **Permission management** yang user-friendly
-   ✅ **Responsive design** untuk semua device

**User akan mendapat notifikasi otomatis saat admin mengirim pesan!** 🎉
