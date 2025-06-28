# 📢 Sistem Notifikasi - Panduan Lengkap

## **✅ Fitur yang Tersedia**

### **🎯 Jenis Notifikasi:**

1. **Success** - Hijau dengan ikon ✅
2. **Error** - Merah dengan ikon ❌
3. **Warning** - Orange dengan ikon ⚠️
4. **Info** - Biru dengan ikon ℹ️

### **📍 Lokasi Tampilan:**

-   **Toast Notifications**: Pojok kanan atas (top-right)
-   **Chat Notifications**: Pojok kanan bawah (bottom-right)

## **🚀 Cara Menggunakan di Halaman Admin**

### **1. Import Hook**

```javascript
import { useNotification } from "@/app/components/NotificationToast"
```

### **2. Gunakan di Komponen**

```javascript
export default function AdminPage() {
    const { addNotification } = useNotification()

    // Contoh penggunaan
    const handleSuccess = () => {
        addNotification("Operasi berhasil!", "success")
    }

    const handleError = () => {
        addNotification("Terjadi kesalahan!", "error")
    }

    return (
        <div>
            <button onClick={handleSuccess}>Success</button>
            <button onClick={handleError}>Error</button>
        </div>
    )
}
```

### **3. Parameter addNotification**

```javascript
addNotification(message, type, duration)
```

-   **message** (string): Pesan yang akan ditampilkan
-   **type** (string): "success" | "error" | "warning" | "info" (default: "info")
-   **duration** (number): Durasi dalam milidetik (default: 5000ms)

## **💡 Contoh Implementasi di Admin**

### **✅ Notifikasi Sukses**

```javascript
// Saat data berhasil disimpan
addNotification("Data berhasil disimpan!", "success")

// Saat user berhasil dihapus
addNotification("User berhasil dihapus dari sistem", "success")
```

### **❌ Notifikasi Error**

```javascript
// Saat gagal memuat data
addNotification("Gagal memuat data dari server", "error")

// Saat validasi gagal
addNotification("Mohon lengkapi semua field yang diperlukan", "error")
```

### **⚠️ Notifikasi Warning**

```javascript
// Saat akan menghapus data
addNotification("Data yang dihapus tidak dapat dikembalikan", "warning")

// Saat sistem maintenance
addNotification("Sistem akan maintenance dalam 5 menit", "warning")
```

### **ℹ️ Notifikasi Info**

```javascript
// Informasi umum
addNotification("Data sedang diproses, mohon tunggu", "info")

// Update status
addNotification("Versi terbaru tersedia", "info")
```

## **🎨 Customisasi**

### **Durasi Kustom**

```javascript
// Notifikasi yang muncul selama 10 detik
addNotification("Pesan penting", "info", 10000)

// Notifikasi yang cepat hilang (2 detik)
addNotification("Pesan singkat", "success", 2000)
```

### **Multiple Notifications**

```javascript
const showMultipleNotifications = () => {
    addNotification("Notifikasi 1", "success")
    setTimeout(() => addNotification("Notifikasi 2", "warning"), 1000)
    setTimeout(() => addNotification("Notifikasi 3", "error"), 2000)
}
```

## **🔧 Integrasi dengan API**

### **Contoh dengan Fetch API**

```javascript
const handleSubmit = async (data) => {
    try {
        const response = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            addNotification("User berhasil ditambahkan!", "success")
        } else {
            addNotification("Gagal menambahkan user", "error")
        }
    } catch (error) {
        addNotification("Terjadi kesalahan jaringan", "error")
    }
}
```

### **Contoh dengan Form Validation**

```javascript
const validateAndSubmit = (formData) => {
    if (!formData.name) {
        addNotification("Nama harus diisi", "error")
        return false
    }

    if (!formData.email) {
        addNotification("Email harus diisi", "error")
        return false
    }

    addNotification("Form valid, mengirim data...", "info")
    return true
}
```

## **📱 Responsive Design**

Notifikasi sudah dioptimalkan untuk:

-   ✅ Desktop (1024px+)
-   ✅ Tablet (768px - 1023px)
-   ✅ Mobile (< 768px)

## **♿ Accessibility**

-   ✅ Screen reader support
-   ✅ Keyboard navigation
-   ✅ High contrast colors
-   ✅ Clear visual indicators

## **🔄 Auto Cleanup**

-   Notifikasi otomatis hilang setelah durasi yang ditentukan
-   Tidak ada memory leak
-   Cleanup otomatis saat komponen unmount

## **🎯 Best Practices**

### **✅ Do's:**

-   Gunakan pesan yang jelas dan singkat
-   Pilih tipe notifikasi yang sesuai
-   Berikan feedback yang berguna
-   Gunakan durasi yang wajar

### **❌ Don'ts:**

-   Jangan spam notifikasi
-   Jangan gunakan pesan yang terlalu panjang
-   Jangan gunakan notifikasi untuk informasi yang tidak penting
-   Jangan gunakan durasi yang terlalu pendek

## **🔍 Debugging**

### **Cek Notifikasi Berfungsi:**

```javascript
// Test di console browser
const { addNotification } = useNotification()
addNotification("Test notification", "success")
```

### **Cek Provider Terpasang:**

Pastikan `NotificationProvider` sudah di `layout.js`:

```javascript
import { NotificationProvider } from "./components/NotificationToast"

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                <NotificationProvider>{children}</NotificationProvider>
            </body>
        </html>
    )
}
```

## **🚀 Ready to Use!**

Sistem notifikasi sudah siap digunakan di semua halaman admin. Cukup import `useNotification` dan gunakan `addNotification()` untuk menampilkan notifikasi yang sesuai dengan kebutuhan Anda!
