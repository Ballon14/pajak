# Quick Start Deployment - Pajak Next.js dengan Apache2

Panduan cepat untuk deploy aplikasi Pajak Next.js menggunakan Docker dan Apache2.

**Domain**: `iqbaldev.site/pajakapp`

## 🚀 Langkah Cepat Deployment

### 1. Persiapan Server (Ubuntu/Debian)

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Apache2
sudo apt install -y apache2

# Logout dan login kembali untuk apply docker group
exit
```

### 2. Clone dan Setup Project

```bash
# Clone repository
git clone <your-repository-url>
cd pajak-nextjs

# Berikan permission execute
chmod +x deploy.sh setup-apache2.sh backup.sh monitor.sh

# Copy environment file
cp .env.example .env
nano .env  # Edit sesuai konfigurasi
```

### 3. Setup Apache2

```bash
# Install dan konfigurasi Apache2
sudo ./setup-apache2.sh install
sudo ./setup-apache2.sh configure
sudo ./setup-apache2.sh enable

# Cek status
sudo ./setup-apache2.sh status
```

### 4. Deploy Aplikasi

```bash
# Deploy production
./deploy.sh prod

# Cek status
docker-compose ps
```

### 5. Verifikasi

```bash
# Test aplikasi
curl https://iqbaldev.site/pajakapp/health

# Cek logs
./deploy.sh logs app
```

## 📋 Checklist Deployment

-   [ ] Docker dan Docker Compose terinstall
-   [ ] Apache2 terinstall dan dikonfigurasi
-   [ ] File `.env` dikonfigurasi dengan benar
-   [ ] Aplikasi berhasil di-deploy
-   [ ] Apache2 reverse proxy berfungsi
-   [ ] Health check endpoint merespons
-   [ ] Database terhubung dengan benar
-   [ ] Domain `iqbaldev.site/pajakapp` bisa diakses

## 🔧 Konfigurasi Environment

### File `.env` (Development)

```bash
NODE_ENV=development
DATABASE_URL=mongodb://root:password123@localhost:27017/pajak_db?authSource=admin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
MONGODB_URI=mongodb://root:password123@localhost:27017/pajak_db?authSource=admin
```

### File `.env.production` (Production)

```bash
NODE_ENV=production
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password-here
MONGO_DATABASE=pajak_db
NEXTAUTH_URL=https://iqbaldev.site/pajakapp
NEXTAUTH_SECRET=your-super-secret-key-here-change-this
DATABASE_URL=mongodb://admin:your-secure-password-here@mongodb:27017/pajak_db?authSource=admin
MONGODB_URI=mongodb://admin:your-secure-password-here@mongodb:27017/pajak_db?authSource=admin
PORT=3000
HOSTNAME=0.0.0.0
```

## 🌐 Setup Domain dan SSL

### 1. Domain sudah dikonfigurasi

Domain `iqbaldev.site` sudah dikonfigurasi di `apache2.conf` dengan sub-path `/pajakapp`.

### 2. Setup SSL dengan Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-apache

# Generate SSL certificate
sudo certbot --apache -d iqbaldev.site --non-interactive --agree-tos --email admin@iqbaldev.site

# Update environment
echo "NEXTAUTH_URL=https://iqbaldev.site/pajakapp" >> .env.production
```

## 📊 Monitoring dan Maintenance

### Cek Status Sistem

```bash
# Status aplikasi
./monitor.sh status

# Status Apache2
sudo ./setup-apache2.sh status

# Resource usage
./monitor.sh resources
```

### Backup Database

```bash
# Buat backup
./backup.sh backup

# List backups
./backup.sh list

# Restore backup
./backup.sh restore backups/backup_20231201_143022.tar.gz
```

### Update Aplikasi

```bash
# Pull perubahan
git pull origin main

# Rebuild dan restart
./deploy.sh prod

# Restart Apache2 jika diperlukan
sudo systemctl restart apache2
```

## 🚨 Troubleshooting

### Aplikasi Tidak Bisa Diakses

```bash
# Cek container status
docker-compose ps

# Cek logs aplikasi
./deploy.sh logs app

# Cek Apache2 status
sudo ./setup-apache2.sh status

# Cek port yang digunakan
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

# Test akses
curl -I https://iqbaldev.site/pajakapp
```

### Database Connection Error

```bash
# Cek MongoDB container
docker-compose logs mongodb

# Test connection
docker exec pajak-nextjs-prod node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DATABASE_URL);
client.connect().then(() => {
  console.log('Connected to MongoDB');
  client.close();
}).catch(console.error);
"
```

### Apache2 Issues

```bash
# Cek konfigurasi
sudo apache2ctl configtest

# Cek logs
sudo ./setup-apache2.sh logs error

# Restart Apache2
sudo systemctl restart apache2
```

## 📝 Command Reference

### Deployment

```bash
./deploy.sh dev          # Deploy development
./deploy.sh prod         # Deploy production
./deploy.sh logs         # Lihat logs
./deploy.sh stop         # Stop containers
./deploy.sh cleanup      # Cleanup semua
```

### Apache2

```bash
sudo ./setup-apache2.sh install    # Install Apache2
sudo ./setup-apache2.sh configure  # Konfigurasi
sudo ./setup-apache2.sh enable     # Enable site
sudo ./setup-apache2.sh status     # Cek status
sudo ./setup-apache2.sh ssl        # Setup SSL
```

### Backup & Monitoring

```bash
./backup.sh backup       # Buat backup
./backup.sh list         # List backups
./monitor.sh status      # Cek status
./monitor.sh resources   # Cek resources
./monitor.sh report      # Generate report
```

## 🔒 Security Checklist

-   [ ] Ganti password default MongoDB
-   [ ] Ganti NEXTAUTH_SECRET
-   [ ] Setup firewall (UFW)
-   [ ] Aktifkan SSL/HTTPS
-   [ ] Setup rate limiting
-   [ ] Regular backup
-   [ ] Update sistem secara berkala

## 📞 Support

Jika mengalami masalah:

1. Cek logs: `./deploy.sh logs app`
2. Cek status: `./monitor.sh status`
3. Cek Apache2: `sudo ./setup-apache2.sh status`
4. Generate report: `./monitor.sh report`
5. Cek dokumentasi lengkap: `README-DEPLOYMENT.md`

## 🎯 Next Steps

Setelah deployment berhasil:

1. **Setup Monitoring**: Aktifkan monitoring alerts
2. **Setup Backup**: Konfigurasi backup otomatis
3. **Setup SSL**: Aktifkan HTTPS
4. **Setup Domain**: Konfigurasi domain custom
5. **Setup Firewall**: Konfigurasi UFW
6. **Setup Logging**: Konfigurasi log rotation
7. **Setup Updates**: Konfigurasi auto-update

## 🌐 URL Akses

-   **Aplikasi**: https://iqbaldev.site/pajakapp
-   **Health Check**: https://iqbaldev.site/pajakapp/health
-   **API**: https://iqbaldev.site/pajakapp/api/
-   **Login**: https://iqbaldev.site/pajakapp/login
