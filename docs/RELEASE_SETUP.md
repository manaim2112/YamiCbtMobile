# Release Setup Guide

Panduan untuk mengkonfigurasi signed release builds menggunakan GitHub Actions + Gradle.

## Prerequisites

- GitHub repository dengan Actions enabled
- Akses untuk menambahkan repository secrets

## 1. Generate Keystore

### Windows (PowerShell):
```powershell
.\scripts\generate-keystore.ps1
```

### Linux/macOS:
```bash
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

Script akan:
1. Meminta password keystore
2. Generate keystore file
3. **Output semua nilai secrets yang siap di-copy ke GitHub**

**PENTING:** Simpan file `yamicbtmobile.keystore` di tempat yang aman. Jangan commit ke repository!

## 2. Add GitHub Secrets

Buka **Settings > Secrets and variables > Actions** di repository GitHub, lalu tambahkan secrets berikut:

| Secret Name | Description |
|-------------|-------------|
| `KEYSTORE_BASE64` | Keystore file yang di-encode ke base64 (dari output script) |
| `KEYSTORE_PASSWORD` | Password untuk keystore (dari output script) |
| `KEY_ALIAS` | Alias key dalam keystore (dari output script) |
| `KEY_PASSWORD` | Password untuk key (dari output script) |

**Tinggal copy-paste dari output script ke GitHub Secrets!**

## 3. Trigger Release

Buat dan push tag untuk memulai build:

```bash
# Pastikan working directory bersih
git status

# Buat tag
npm run release        # patch version (1.0.4 -> 1.0.5)
# atau
npm run release:minor  # minor version (1.0.4 -> 1.1.0)
# atau
npm run release:major  # major version (1.0.4 -> 2.0.0)

# Push tag ke GitHub
git push --follow-tags
```

## 4. Monitor Build

- Buka tab **Actions** di GitHub repository
- Pilih workflow run untuk tag yang baru dibuat
- Tunggu hingga build selesai (biasanya 5-10 menit)
- Setelah selesai, release akan muncul di **Releases** page

## Build Artifacts

Setiap release akan menghasilkan:

1. **APK** (`yamicbtmobile-vX.X.X.apk`) - Untuk distribusi langsung
2. **AAB** (`yamicbtmobile-vX.X.X.aab`) - Untuk upload ke Google Play Store

## Troubleshooting

### Build gagal dengan error signing

- Pastikan semua secrets sudah dikonfigurasi dengan benar
- Verifikasi `KEYSTORE_BASE64` tidak terpotong atau memiliki newline
- Cek `KEYSTORE_PASSWORD` dan `KEY_PASSWORD` sesuai dengan yang digunakan saat membuat keystore

### Prebuild gagal

- Jalankan `npx expo prebuild --platform android --clean` secara lokal untuk debugging
- Cek apakah ada conflict dengan plugin atau native modules

### Keystore hilang

Jika keystore hilang, Anda harus membuat keystore baru. **PERHATIAN:** Aplikasi yang sudah di-sign dengan keystore lama tidak bisa di-update dengan keystore baru. Anda harus:
1. Publish sebagai aplikasi baru dengan package name berbeda, atau
2. Unpublish aplikasi lama dan publish yang baru

## Local Build (Tanpa GitHub Actions)

Untuk build secara lokal:

```bash
# 1. Prebuild
npx expo prebuild --platform android --clean

# 2. Buat keystore.properties di folder android/
echo "storePassword=YOUR_PASSWORD" > android/keystore.properties
echo "keyPassword=YOUR_PASSWORD" >> android/keystore.properties
echo "keyAlias=yamicbtmobile" >> android/keystore.properties
echo "storeFile=app/keystore.jks" >> android/keystore.properties

# 3. Copy keystore ke android/app/keystore.jks

# 4. Build
cd android
./gradlew assembleRelease  # APK
./gradlew bundleRelease    # AAB
```

Output akan berada di `android/app/build/outputs/`.
