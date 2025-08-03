# Cloudinary Setup Guide

## 1. Buat Account Cloudinary

1. Kunjungi [cloudinary.com](https://cloudinary.com)
2. Sign up untuk account gratis
3. Setelah login, kamu akan mendapatkan dashboard dengan credentials

## 2. Dapatkan Credentials

Di dashboard Cloudinary, kamu akan melihat:
- **Cloud Name**: Nama unik untuk cloud storage kamu
- **API Key**: Key untuk mengakses API
- **API Secret**: Secret key untuk autentikasi

## 3. Setup Environment Variables

Tambahkan ke `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here  
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 4. Setup di Vercel

1. Buka Vercel dashboard
2. Pilih project neezarnext
3. Masuk ke Settings > Environment Variables
4. Tambahkan 3 environment variables di atas

## 5. Features

- ✅ Automatic image optimization (800x400px for banners)
- ✅ Cloud storage (tidak terbatas pada disk space)
- ✅ CDN untuk loading gambar yang cepat
- ✅ Auto-format (WebP, AVIF untuk browser yang support)
- ✅ Quality optimization

## 6. Folder Structure di Cloudinary

Images akan disimpan di:
```
neezar-blog/
├── banners/
│   ├── blog-slug-1-banner
│   ├── blog-slug-2-banner
│   └── ...
```

## 7. URL Format

Setelah upload, banner akan accessible via:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/neezar-blog/banners/blog-slug-banner.jpg
```
