# 🗺️ Panduan Fitur Peta Desa

## Deskripsi Fitur
Fitur Peta Desa memungkinkan admin untuk mengunggah dan mengelola peta wilayah Desa Bukit Pamewa. Fitur ini menyediakan:
- Upload gambar peta dengan metadata lengkap
- Koordinat geografis (latitude/longitude) 
- Zoom level untuk tampilan optimal
- Galeri peta yang responsif dan interaktif
- Modal view untuk melihat peta dalam ukuran penuh

## 🎯 Tujuan
1. **Informasi Geografis**: Memberikan informasi visual tentang wilayah desa
2. **Navigasi**: Membantu warga dan pengunjung memahami tata letak desa
3. **Transparansi**: Menampilkan batas wilayah dan lokasi penting
4. **Dokumentasi**: Menyimpan peta historis dan perkembangan wilayah

## 🔧 Setup Database & Storage

### 1. Jalankan SQL Script
Eksekusi file `peta-desa-setup.sql` di Supabase SQL Editor:

```sql
-- Tabel peta_desa sudah dibuat dengan kolom:
-- id, judul, deskripsi, gambar_url, gambar_filename
-- koordinat_lat, koordinat_lng, zoom_level
-- created_at, updated_at

-- Storage bucket 'peta-desa' sudah dibuat
-- RLS policies sudah dikonfigurasi
```

### 2. Verifikasi Setup
- ✅ Tabel `peta_desa` ada di database
- ✅ Storage bucket `peta-desa` tersedia
- ✅ RLS policies aktif (read: public, write: admin only)
- ✅ TypeScript types sudah diupdate

## 👤 Akses & Permissions

### Public (Pengunjung)
- ✅ Melihat semua peta yang telah diupload
- ✅ Membuka peta dalam modal view
- ✅ Melihat informasi koordinat dan deskripsi

### Admin Only
- ✅ Upload peta baru
- ✅ Edit peta yang sudah ada
- ✅ Hapus peta
- ✅ Mengelola metadata (judul, deskripsi, koordinat)

## 📝 Cara Penggunaan

### Untuk Admin - Upload Peta Baru

1. **Login sebagai Admin**
   - Masuk ke halaman `/auth`
   - Login dengan akun admin

2. **Akses Halaman Peta Desa**
   - Klik menu "Peta Desa" di header
   - Atau akses langsung: `/peta-desa`

3. **Isi Form Upload**
   ```
   Judul Peta*: Contoh "Peta Wilayah Desa Bukit Pamewa 2024"
   Deskripsi: Informasi tambahan tentang peta
   Upload Gambar: Pilih file gambar (JPG/PNG/GIF, max 10MB)
   Latitude: Contoh -6.2088 (koordinat pusat desa)
   Longitude: Contoh 106.8456 (koordinat pusat desa)  
   Zoom Level: 14 (tingkat zoom optimal, 1-20)
   ```

4. **Klik "Simpan Peta"**
   - File akan diupload ke Supabase Storage
   - Data tersimpan di database
   - Peta langsung tampil di halaman

### Cara Mendapatkan Koordinat

1. **Buka Google Maps**
2. **Cari lokasi desa** atau zoom ke area yang diinginkan
3. **Klik kanan** pada titik pusat yang diinginkan
4. **Copy koordinat** yang muncul (format: lat, lng)
5. **Paste ke form** - pisahkan lat dan lng ke field masing-masing

### Untuk Admin - Edit Peta

1. **Klik tombol Edit** (ikon pensil) pada peta yang ingin diedit
2. **Form akan terisi** dengan data existing
3. **Ubah data** yang diperlukan
4. **Klik "Update Peta"**

### Untuk Admin - Hapus Peta

1. **Klik tombol Hapus** (ikon trash) pada peta
2. **Konfirmasi penghapusan** di dialog
3. **Peta dan file gambar** akan dihapus permanen

## 🎨 Fitur UI/UX

### Responsive Design
- ✅ Desktop: Form samping, galeri grid
- ✅ Tablet: Layout adaptif
- ✅ Mobile: Form stack, galeri single column

### Interactive Features
- ✅ **Image Modal**: Klik gambar untuk view fullscreen
- ✅ **Zoom & Pan**: Scroll untuk zoom, drag untuk pan
- ✅ **Keyboard Navigation**: ESC untuk tutup modal
- ✅ **Loading States**: Indicator saat upload/loading
- ✅ **Toast Notifications**: Feedback untuk setiap aksi

### Visual Elements
- ✅ **Gradient Headers**: Warna tema desa
- ✅ **Icon Integration**: Lucide icons untuk konsistensi
- ✅ **Card Layout**: Material design inspired
- ✅ **Hover Effects**: Smooth transitions

## 🔒 Keamanan

### File Upload Security
- ✅ **File Type Validation**: Hanya gambar (image/*)
- ✅ **File Size Limit**: Maksimal 10MB
- ✅ **Unique Filename**: Timestamp-based naming
- ✅ **Storage Isolation**: Folder terpisah `/peta/`

### Database Security
- ✅ **RLS Policies**: Row Level Security aktif
- ✅ **Admin Only Write**: Hanya admin bisa upload/edit/delete
- ✅ **Public Read**: Semua orang bisa melihat
- ✅ **Input Validation**: Sanitasi data input

## 📊 SEO Optimization

### Meta Tags
- ✅ Halaman `/peta-desa` sudah ditambahkan ke sitemap.xml
- ✅ Priority 0.7 (tinggi untuk konten penting)
- ✅ Change frequency: monthly

### Content Structure
- ✅ **Semantic HTML**: Proper heading hierarchy
- ✅ **Alt Text**: Deskriptif untuk gambar
- ✅ **Schema Markup**: Dapat ditambahkan untuk geo data
- ✅ **URL Structure**: Clean `/peta-desa` path

## 🚀 Deployment

### Vercel Auto-Deploy
- ✅ Push ke GitHub akan trigger auto-deploy
- ✅ Environment variables sudah dikonfigurasi
- ✅ Build process includes new page

### Post-Deployment Checklist
1. ✅ Akses `/peta-desa` di production
2. ✅ Test upload functionality (admin only)
3. ✅ Verify image display dan modal
4. ✅ Check responsive layout
5. ✅ Submit updated sitemap ke Google Search Console

## 🔧 Troubleshooting

### Upload Gagal
```
Problem: File tidak terupload
Solution: 
- Check file size (max 10MB)
- Verify file type (harus gambar)
- Check koneksi internet
- Verify admin permissions
```

### Gambar Tidak Tampil
```
Problem: Gambar broken/tidak load
Solution:
- Check Supabase storage bucket permissions
- Verify file path di database
- Check network connectivity
- Verify public URL generation
```

### Koordinat Tidak Akurat
```
Problem: Lokasi tidak sesuai
Solution:
- Double-check lat/lng dari Google Maps
- Pastikan format decimal (bukan degrees/minutes)
- Verify zoom level (14 recommended untuk desa)
```

### Permission Denied
```
Problem: Admin tidak bisa upload
Solution:
- Verify user role di database (table: profiles)
- Check RLS policies di Supabase
- Ensure proper authentication
```

## 📈 Future Enhancements

### Planned Features
- 🔄 **Interactive Map**: Integrasi dengan Leaflet/Google Maps
- 🔄 **GPS Integration**: Auto-detect koordinat
- 🔄 **Layer Support**: Multiple map layers
- 🔄 **Download Feature**: Export peta dalam berbagai format
- 🔄 **Version Control**: Track perubahan peta
- 🔄 **Comments System**: Feedback dari warga

### Technical Improvements
- 🔄 **Image Optimization**: Auto-resize dan compress
- 🔄 **CDN Integration**: Faster image loading
- 🔄 **Offline Support**: PWA capabilities
- 🔄 **Analytics**: Track peta usage

## 📞 Support

Jika mengalami masalah dengan fitur Peta Desa:

1. **Check dokumentasi** ini terlebih dahulu
2. **Verify permissions** dan setup database
3. **Test di browser** yang berbeda
4. **Contact developer** jika masih bermasalah

---

**Dibuat untuk Desa Bukit Pamewa** 🏝️  
*Membangun transparansi dan aksesibilitas informasi desa*
