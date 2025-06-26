# Migrasi dari MySQL ke MongoDB

## Langkah-langkah Setup MongoDB

### 1. Install MongoDB

-   **Windows**: Download dan install dari [MongoDB Community Server](https://www.mongodb.com/try/download/community)
-   **Docker**: `docker run -d -p 27017:27017 --name mongodb mongo:latest`
-   **MongoDB Atlas**: Buat cluster gratis di [MongoDB Atlas](https://www.mongodb.com/atlas)

### 2. Buat File .env

Buat file `.env` di root project dengan konfigurasi berikut:

```env
# MongoDB Connection String
# Untuk MongoDB lokal:
DATABASE_URL="mongodb://localhost:27017/pajak_nextjs"

# Untuk MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/pajak_nextjs"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Push Schema ke Database

```bash
npx prisma db push
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

## Perubahan yang Telah Dilakukan

### 1. Package.json

-   Menghapus `mysql2`
-   Menambahkan `mongodb`

### 2. Prisma Schema

-   Mengubah provider dari `mysql` ke `mongodb`
-   Mengubah tipe ID dari `Int` ke `String` dengan `@db.ObjectId`
-   Menambahkan `@map("_id")` untuk mapping ke MongoDB ObjectId

### 3. API Routes

-   Mengupdate `app/api/tax/route.js` untuk handle ObjectId string

## Perbedaan MySQL vs MongoDB

| Aspek     | MySQL                    | MongoDB                |
| --------- | ------------------------ | ---------------------- |
| Tipe ID   | Integer (auto increment) | ObjectId (String)      |
| Schema    | Rigid                    | Flexible               |
| Query     | SQL                      | MongoDB Query Language |
| Relations | Foreign Keys             | References/Embedding   |
| Scaling   | Vertical                 | Horizontal             |

## Troubleshooting

### Error: "the URL must start with the protocol `mongo`"

Pastikan DATABASE_URL di file `.env` menggunakan format yang benar:

-   ✅ `mongodb://localhost:27017/database_name`
-   ✅ `mongodb+srv://username:password@cluster.mongodb.net/database_name`
-   ❌ `mysql://localhost:3306/database_name`

### Error: "Invalid ObjectId"

Pastikan ID yang dikirim adalah string ObjectId yang valid (24 karakter hex).

### Data Migration

Jika Anda memiliki data MySQL yang ingin dimigrasikan:

1. Export data dari MySQL
2. Transform data sesuai schema MongoDB
3. Import ke MongoDB menggunakan MongoDB Compass atau mongoimport

## Keuntungan MongoDB

1. **Flexibility**: Schema yang fleksibel
2. **Scalability**: Horizontal scaling yang mudah
3. **Performance**: Query yang cepat untuk data besar
4. **JSON-like**: Data dalam format yang familiar untuk JavaScript
5. **No Schema Migration**: Tidak perlu migration untuk perubahan schema
