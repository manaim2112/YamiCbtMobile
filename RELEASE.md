# Release Guide

## Setup Awal (sekali saja)

### 1. Install EAS CLI dan login

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`eas build:configure` akan menambahkan `extra.eas.projectId` ke `app.json` secara otomatis.

### 2. Tambahkan EXPO_TOKEN ke GitHub Secrets

1. Buka [expo.dev → Account Settings → Access Tokens](https://expo.dev/accounts)
2. Klik **Create Token**, beri nama misal `GITHUB_ACTIONS`
3. Copy token-nya
4. Buka GitHub repo → **Settings → Secrets and variables → Actions**
5. Klik **New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: paste token tadi
6. Klik **Add secret**

---

## Cara Release

```bash
# Patch release: 1.0.0 → 1.0.1
npm run release

# Minor release: 1.0.0 → 1.1.0
npm run release:minor

# Major release: 1.0.0 → 2.0.0
npm run release:major

# Versi spesifik
node scripts/release.js 1.2.3
```

Script akan:
1. Bump versi di `package.json` dan `app.json`
2. Commit perubahan
3. Buat git tag `v{versi}`
4. Push ke GitHub

GitHub Actions otomatis:
1. Build **APK** dan **AAB** via EAS
2. Buat **GitHub Release** dengan kedua file terlampir

---

## Catatan

- Tag dengan `-` (misal `v1.0.0-beta`) otomatis jadi **pre-release**
- Build berjalan di Expo cloud — tidak perlu Android SDK lokal
- Progress build bisa dipantau di tab **Actions** di GitHub repo
