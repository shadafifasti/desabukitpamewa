# PANDUAN DEPLOYMENT WEBSITE DESA BUKIT PAMEWA

## 🚀 PILIHAN HOSTING GRATIS/MURAH

### 1. NETLIFY (Recommended - Gratis)
**Kelebihan:**
- Gratis selamanya untuk static sites
- Auto-deploy dari GitHub
- SSL certificate gratis
- Custom domain support

**Cara Deploy:**
1. Push kode ke GitHub repository
2. Daftar di netlify.com
3. Connect repository GitHub
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Deploy otomatis setiap push ke GitHub

### 2. VERCEL (Gratis)
**Kelebihan:**
- Gratis untuk personal projects
- Performance tinggi
- Auto-deploy dari GitHub

**Cara Deploy:**
1. Push kode ke GitHub
2. Daftar di vercel.com
3. Import GitHub repository
4. Deploy otomatis

### 3. GITHUB PAGES (Gratis)
**Kelebihan:**
- Gratis selamanya
- Terintegrasi dengan GitHub

**Cara Deploy:**
1. Push kode ke GitHub repository
2. Enable GitHub Pages di Settings
3. Set source ke GitHub Actions
4. Buat workflow file untuk build

## 🌐 DOMAIN SETUP

### Domain Gratis
- **Subdomain Netlify**: yoursite.netlify.app
- **Subdomain Vercel**: yoursite.vercel.app
- **GitHub Pages**: username.github.io/repository

### Domain Berbayar (Recommended)
- **Niagahoster**: ~Rp 15.000/tahun (.my.id)
- **Domainesia**: ~Rp 20.000/tahun (.id)
- **Cloudflare**: ~$10/tahun (.com)

## 📋 ENVIRONMENT VARIABLES

Untuk deployment, set environment variables berikut:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://inlowqpzwdepdjqsebfg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google Maps (jika digunakan)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Email Configuration (jika ada)
VITE_EMAIL_SERVICE_ID=your_email_service_id
```

## 🔧 BUILD CONFIGURATION

### package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && netlify deploy --prod --dir=dist"
  }
}
```

### Netlify Configuration (_netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 🔄 AUTO-DEPLOYMENT SETUP

### GitHub Actions Workflow
Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📊 MONITORING & ANALYTICS

### Google Analytics Setup
1. Buat akun Google Analytics
2. Tambahkan tracking code ke index.html
3. Monitor traffic dan user behavior

### Uptime Monitoring
- **UptimeRobot**: Monitor website 24/7 gratis
- **Pingdom**: Monitoring performance
- **StatusCake**: Free uptime monitoring

## 🔐 SECURITY CHECKLIST

### Supabase Security
- [ ] Enable RLS (Row Level Security)
- [ ] Set proper policies untuk setiap tabel
- [ ] Restrict API keys ke domain tertentu
- [ ] Enable 2FA untuk akun Supabase

### Domain Security
- [ ] Enable SSL certificate
- [ ] Set up HTTPS redirect
- [ ] Configure security headers
- [ ] Enable DNSSEC (jika supported)

## 📞 HANDOVER CHECKLIST

### Akses yang Harus Ditransfer
- [ ] GitHub repository access
- [ ] Supabase project ownership
- [ ] Netlify/Vercel account access
- [ ] Domain registrar access
- [ ] Google Analytics access
- [ ] Email accounts terkait

### Dokumentasi yang Harus Diserahkan
- [ ] Panduan admin (PANDUAN-ADMIN.md)
- [ ] Panduan maintenance (PANDUAN-MAINTENANCE.md)
- [ ] Backup script (backup-script.sql)
- [ ] Deployment guide (file ini)
- [ ] Contact list developer & support

### Training yang Harus Diberikan
- [ ] Cara login dan menggunakan admin panel
- [ ] Cara upload berita, galeri, data
- [ ] Cara backup data
- [ ] Troubleshooting masalah umum
- [ ] Kontak darurat jika ada masalah

## 🆘 EMERGENCY CONTACTS

### Developer
- **Nama**: [Nama Mahasiswa KKN]
- **HP**: [Nomor HP]
- **Email**: [Email]
- **Periode Support**: [Tanggal - Tanggal]

### Technical Support
- **Supabase**: support@supabase.com
- **Netlify**: support@netlify.com
- **Domain Provider**: [Sesuai provider]

---
**Catatan**: Pastikan semua akses dan password sudah ditransfer ke aparatur desa sebelum masa KKN berakhir.
