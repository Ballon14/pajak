# Panduan Deployment Aplikasi Pajak Next.js dengan Docker dan Apache2

Dokumen ini menjelaskan cara deploy aplikasi Pajak Next.js ke server menggunakan Docker dengan Apache2 sebagai reverse proxy.

## Prerequisites

Sebelum melakukan deployment, pastikan server memiliki:

1. **Docker** (versi 20.10+)
2. **Docker Compose** (versi 2.0+)
3. **Apache2** (untuk reverse proxy)
4. **Git** (untuk clone repository)
5. **Domain/Subdomain** (opsional, untuk HTTPS)

## Struktur File Docker

```
pajak-nextjs/
├── Dockerfile                 # Konfigurasi Docker image
├── .dockerignore             # File yang diabaikan saat build
├── docker-compose.yml        # Konfigurasi development
├── docker-compose.prod.yml   # Konfigurasi production
├── apache2.conf             # Konfigurasi Apache2 reverse proxy
├── setup-apache2.sh         # Script setup Apache2
├── deploy.sh                # Script deployment otomatis
├── backup.sh                # Script backup database
├── monitor.sh               # Script monitoring
└── README-DEPLOYMENT.md     # Dokumentasi ini
```

## Langkah-langkah Deployment

### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Tambahkan user ke docker group
sudo usermod -aG docker $USER

# Install Apache2 (jika belum terinstall)
sudo apt install -y apache2
```

### 2. Clone Repository

```bash
# Clone repository ke server
git clone <your-repository-url>
cd pajak-nextjs

# Berikan permission execute pada script deployment
chmod +x deploy.sh setup-apache2.sh backup.sh monitor.sh
```

### 3. Konfigurasi Environment

#### Development Environment

```bash
# Copy file environment example
cp .env.example .env

# Edit file .env sesuai konfigurasi
nano .env
```

#### Production Environment

```bash
# Buat file environment production
cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password-here
MONGO_DATABASE=pajak_db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=your-super-secret-key-here-change-this

# Database URLs
DATABASE_URL=mongodb://admin:your-secure-password-here@mongodb:27017/pajak_db?authSource=admin
MONGODB_URI=mongodb://admin:your-secure-password-here@mongodb:27017/pajak_db?authSource=admin

# Application Configuration
PORT=3000
HOSTNAME=0.0.0.0
EOF
```

### 4. Setup Apache2

```bash
# Install dan konfigurasi Apache2
sudo ./setup-apache2.sh install
sudo ./setup-apache2.sh configure
sudo ./setup-apache2.sh enable

# Cek status Apache2
sudo ./setup-apache2.sh status
```

### 5. Deployment

#### Development Environment

```bash
# Deploy development environment
./deploy.sh dev
```

#### Production Environment

```bash
# Deploy production environment
./deploy.sh prod
```

### 6. Verifikasi Deployment

```bash
# Cek status container
docker-compose ps

# Cek logs aplikasi
./deploy.sh logs app

# Cek status Apache2
sudo ./setup-apache2.sh status

# Test aplikasi
curl http://localhost/health
```

## Konfigurasi Domain dan SSL

### 1. Setup Domain

Edit file `apache2.conf` dan ganti `ServerName localhost;` dengan domain Anda:

```apache
ServerName your-domain.com
```

### 2. Setup SSL dengan Let's Encrypt

```bash
# Setup SSL certificate
sudo ./setup-apache2.sh ssl

# Atau manual dengan certbot
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com --non-interactive --agree-tos --email admin@your-domain.com
```

### 3. Update Environment Variables

Setelah setup domain, update file `.env.production`:

```bash
NEXTAUTH_URL=https://your-domain.com
```

## Monitoring dan Maintenance

### 1. Logs

```bash
# Lihat logs real-time
./deploy.sh logs

# Lihat logs specific service
./deploy.sh logs app
./deploy.sh logs mongodb

# Lihat Apache2 logs
sudo ./setup-apache2.sh logs error
sudo ./setup-apache2.sh logs access
```

### 2. Backup Database

```bash
# Backup MongoDB
./backup.sh backup

# List backups
./backup.sh list

# Restore backup
./backup.sh restore backups/backup_20231201_143022.tar.gz
```

### 3. Monitoring

```bash
# Cek status sistem
./monitor.sh status

# Cek resources
./monitor.sh resources

# Generate report
./monitor.sh report

# Setup alerts
./monitor.sh alerts
```

### 4. Update Aplikasi

```bash
# Pull perubahan terbaru
git pull origin main

# Rebuild dan restart
./deploy.sh prod

# Restart Apache2 jika diperlukan
sudo systemctl restart apache2
```

## Troubleshooting

### 1. Container Tidak Start

```bash
# Cek logs container
docker-compose logs app

# Cek resource usage
docker stats

# Restart container
docker-compose restart app
```

### 2. Apache2 Issues

```bash
# Cek status Apache2
sudo systemctl status apache2

# Cek konfigurasi
sudo apache2ctl configtest

# Cek logs Apache2
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/pajak_error.log

# Restart Apache2
sudo systemctl restart apache2
```

### 3. Database Connection Error

```bash
# Cek status MongoDB
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

### 4. Port Already in Use

```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3000

# Stop service yang menggunakan port
sudo systemctl stop apache2  # jika konflik dengan Apache2
```

### 5. Permission Issues

```bash
# Fix permission untuk Docker volumes
sudo chown -R $USER:$USER ./data
sudo chmod -R 755 ./data

# Fix permission untuk Apache2 logs
sudo chown -R www-data:www-data /var/log/apache2/
```

## Security Best Practices

1. **Ganti Password Default**: Selalu ganti password MongoDB dan NextAuth secret
2. **Firewall**: Konfigurasi firewall untuk membatasi akses
3. **Regular Updates**: Update Docker images dan sistem secara berkala
4. **Backup**: Lakukan backup database secara rutin
5. **Monitoring**: Setup monitoring untuk aplikasi dan server
6. **SSL**: Selalu gunakan HTTPS untuk production
7. **Rate Limiting**: Aktifkan rate limiting di Apache2

## Command Reference

```bash
# Development
./deploy.sh dev          # Deploy development
./deploy.sh logs         # Lihat logs
./deploy.sh stop         # Stop semua container

# Production
./deploy.sh prod         # Deploy production
./deploy.sh cleanup      # Hapus semua container dan image

# Apache2
sudo ./setup-apache2.sh install    # Install Apache2
sudo ./setup-apache2.sh configure  # Konfigurasi Apache2
sudo ./setup-apache2.sh enable     # Enable site
sudo ./setup-apache2.sh status     # Cek status
sudo ./setup-apache2.sh ssl        # Setup SSL

# Backup
./backup.sh backup       # Buat backup
./backup.sh list         # List backups
./backup.sh restore      # Restore backup

# Monitoring
./monitor.sh status      # Cek status
./monitor.sh resources   # Cek resources
./monitor.sh report      # Generate report

# Manual Docker commands
docker-compose up -d     # Start containers
docker-compose down      # Stop containers
docker-compose logs -f   # Follow logs
docker system prune      # Clean up unused resources
```

## Support

Jika mengalami masalah, cek:

1. Logs aplikasi: `./deploy.sh logs app`
2. Logs Apache2: `sudo ./setup-apache2.sh logs error`
3. Logs database: `./deploy.sh logs mongodb`
4. Status container: `docker-compose ps`
5. Status Apache2: `sudo ./setup-apache2.sh status`
6. Resource usage: `docker stats`
7. Monitoring: `./monitor.sh all`
