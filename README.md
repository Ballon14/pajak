# PajakApp - Sistem Manajemen Pajak (Next.js + MongoDB)

PajakApp adalah aplikasi web modern untuk manajemen data pajak, user, dan administrasi, dibangun dengan Next.js, MongoDB, Prisma, dan NextAuth.

---

## Teknologi & Library

-   **Next.js** v15.3.4 (framework React SSR/SSG)
-   **React** v19.0.0
-   **MongoDB** (database utama)
-   **Prisma** v6.10.1 (ORM untuk MongoDB)
-   **NextAuth** v4.24.11 (autentikasi & session)
-   **bcryptjs** v3.0.2 (hash password)
-   **nodemailer** v6.10.1 (email reset password)
-   **formidable** v3.5.4 (upload file/avatar)
-   **chart.js** v4.5.0 & **react-chartjs-2** v5.3.0 (chart statistik)
-   **jspdf** v3.0.1 & **jspdf-autotable** v5.0.2 (export PDF)
-   **xlsx** v0.18.5 (export Excel)
-   **papaparse** v5.5.3 (import/export CSV)
-   **dayjs** v1.11.13 (format tanggal)
-   **dotenv** v16.6.0 (env config)
-   **TailwindCSS** v4 (opsional, styling)

---

## Fitur Utama

-   **Autentikasi & Otorisasi**: Login, register, reset password, session JWT, admin/user role, status aktif/nonaktif user.
-   **Manajemen User**: Listing, tambah, edit, hapus, ubah password, toggle status aktif/nonaktif (langsung di tabel).
-   **Manajemen Pajak**: Listing, tambah, edit, hapus data pajak per user, status pajak (lunas, belum lunas, proses).
-   **Dashboard Admin**: Statistik user & pajak, chart, pencarian, filter, pagination.
-   **Chat & Support**: Fitur chat admin-user.
-   **Export Data**: Ekspor data ke Excel, PDF, dsb.
-   **UI Modern**: Loading spinner, responsive, dark/light, UX friendly.
-   **Keamanan**: Hash password, validasi input, proteksi route, session management.

---

## Requirement

-   Node.js v18+ (rekomendasi LTS)
-   npm (atau yarn/pnpm/bun)
-   MongoDB (local, Docker, atau Atlas)
-   [Opsional] Git

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Ballon14/pajak.git
cd pajak
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Setup Database MongoDB

-   **Lokal**: Install MongoDB Community Server, jalankan di `mongodb://localhost:27017`
-   **Docker**:
    ```bash
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    ```
-   **Atlas**: Buat cluster gratis di [MongoDB Atlas](https://www.mongodb.com/atlas)

### 4. Konfigurasi Environment

Buat file `.env` di root project:

```env
DATABASE_URL="mongodb://localhost:27017/pajak_nextjs"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Push Schema ke Database

```bash
npx prisma db push
```

### 7. Jalankan Aplikasi

```bash
npm run dev
# atau
yarn dev
```

Akses di [http://localhost:3000](http://localhost:3000)

---

## Struktur Database (Prisma Schema)

```prisma
model User {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  name       String
  email      String   @unique
  password   String
  image      String?
  isActive   Boolean  @default(true)
  taxRecords TaxRecord[] @relation("UserTaxRecords")
}

model TaxRecord {
  id      String   @id @default(auto()) @map("_id") @db.ObjectId
  name    String
  address String
  total   Float
  year    Int
  userId  String   @db.ObjectId
  status  TaxRecord_status @default(belum_lunas)
  user    User     @relation("UserTaxRecords", fields: [userId], references: [id])
}

enum TaxRecord_status {
  lunas
  belum_lunas
  proses
}
```

---

## API Endpoint Utama

-   `/api/admin/users` (GET, POST, PUT, DELETE): Manajemen user
-   `/api/admin/tax` (GET, POST, PUT, DELETE): Manajemen data pajak
-   `/api/auth/*` (NextAuth): Login, register, session, signout, dsb.

---

## Fitur Admin

-   **Toggle status aktif/nonaktif** user langsung di tabel (switch hijau/merah)
-   **Ubah password** user dari modal edit
-   **Nonaktif user**: user tidak bisa login, akan muncul info & link kontak admin
-   **Jika email belum terdaftar**: info & redirect otomatis ke register

---

## Troubleshooting

-   **Tidak bisa login di device lain**:  
    Lihat `SESSION_TROUBLESHOOTING.md`
-   **Error koneksi MongoDB**:  
    Pastikan `DATABASE_URL` benar dan MongoDB berjalan
-   **Error Prisma**:  
    Jalankan `npx prisma generate` dan `npx prisma db push`
-   **Reset password**:  
    Gunakan fitur "Lupa Password" di halaman login

---

## FAQ

-   **Bagaimana cara ganti password user?**  
    Edit user di admin, isi password baru, klik Simpan.
-   **Bagaimana menonaktifkan user?**  
    Klik toggle status di tabel user.
-   **Bagaimana jika user nonaktif login?**  
    Akan muncul info "Akun Anda nonaktif. Silakan hubungi admin atau kirim pesan ke admin."
-   **Bagaimana jika email belum terdaftar?**  
    Akan muncul info dan redirect otomatis ke halaman register.

---

## Kontribusi

Pull request, issue, dan feedback sangat diterima!

---

## Lisensi

MIT
