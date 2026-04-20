# Implementation Plan: CBT App Mobile

## Overview

Implementasi aplikasi CBT Mobile berbasis React Native (Expo) dengan dua fitur utama: (1) Readiness Screen untuk pengecekan kesiapan perangkat sebelum ujian, dan (2) Lockdown Browser yang memblokir navigasi sistem dan notifikasi saat peserta mengerjakan ujian. Aplikasi menggunakan expo-router untuk navigasi, react-native-webview untuk menampilkan platform CBT, dan native module Android untuk fitur Do Not Disturb.

Implementasi mengikuti arsitektur modular dengan pemisahan tanggung jawab yang jelas: ReadinessChecker untuk pemeriksaan perangkat, LockdownManager untuk pengelolaan mode lockdown, dan CBTWebView untuk tampilan web dengan navigation guard. Setiap modul diuji dengan unit tests dan property-based tests untuk memastikan correctness properties terpenuhi.

---

## Tasks

- [x] 1. Setup proyek dan dependensi
  - Install dependensi yang diperlukan: `react-native-webview`, `@react-native-community/netinfo`, `expo-camera`, `expo-navigation-bar`
  - Install dependensi development: `fast-check`, `@testing-library/react-native`
  - Konfigurasi `app.json` untuk menambahkan Android permissions: `CAMERA`, `INTERNET`, `ACCESS_NOTIFICATION_POLICY`
  - Setup development build configuration (karena menggunakan native modules)
  - _Requirements: 1.2, 1.3, 1.4, 5.1_

- [ ] 2. Implementasi konstanta konfigurasi aplikasi
  - [x] 2.1 Buat file `constants/config.ts` dengan konstanta `APP_CONFIG`
    - Definisikan `TARGET_URL`, `TARGET_DOMAIN`, `LOGIN_PATHS`, `ANDROID_MIN_API_LEVEL`, `ANDROID_MIN_VERSION_LABEL`
    - _Requirements: 1.1, 1.4, 2.1, 3.1, 6.1_

- [ ] 3. Implementasi ReadinessChecker module
  - [x] 3.1 Buat file `modules/readiness-checker.ts` dengan interface `CheckResult` dan `ReadinessCheckResults`
    - Implementasi fungsi `checkInternet()` menggunakan `@react-native-community/netinfo`
    - Implementasi fungsi `checkCamera()` menggunakan `expo-camera` permissions API
    - Implementasi fungsi `checkAndroidVersion()` menggunakan `Platform.Version`
    - Implementasi fungsi `runAllChecks()` yang menjalankan semua pemeriksaan secara paralel
    - Implementasi fungsi helper `allChecksPassed(results)` untuk validasi hasil
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 3.2 Write property test untuk checkAndroidVersion
    - **Property 1: Android version check adalah fungsi murni**
    - **Validates: Requirements 1.4**
    - Test dengan `fc.integer()` untuk berbagai API level, verifikasi passed=true hanya untuk API >= 26
  
  - [ ]* 3.3 Write property test untuk allChecksPassed
    - **Property 2: Tombol Mulai aktif hanya jika semua pemeriksaan lulus**
    - **Validates: Requirements 1.5, 1.6**
    - Test dengan `fc.record()` untuk berbagai kombinasi hasil pemeriksaan
  
  - [ ]* 3.4 Write unit tests untuk ReadinessChecker
    - Test `checkInternet()` dengan mock netinfo (connected/disconnected)
    - Test `checkCamera()` dengan mock expo-camera permissions (granted/denied)
    - Test `checkAndroidVersion()` dengan berbagai API level (25, 26, 30)
    - Test `runAllChecks()` menjalankan semua pemeriksaan dan mengembalikan hasil lengkap
    - _Requirements: 1.2, 1.3, 1.4_

- [ ] 4. Implementasi LockdownContext
  - [x] 4.1 Buat file `context/LockdownContext.tsx` dengan Context dan Provider
    - Definisikan interface `LockdownContextValue` dengan `isLockdownActive` dan `setLockdownActive`
    - Implementasi `LockdownProvider` component dengan state management
    - Export custom hook `useLockdown()` untuk mengakses context
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Implementasi ReadinessScreen
  - [x] 5.1 Buat file `app/index.tsx` untuk ReadinessScreen
    - Implementasi component `CheckItem` untuk menampilkan status setiap pemeriksaan
    - Implementasi UI dengan header, daftar pemeriksaan, tombol "Mulai" dan "Periksa Ulang"
    - Jalankan `runAllChecks()` saat component mount dan saat tombol "Periksa Ulang" ditekan
    - Aktifkan tombol "Mulai" hanya jika `allChecksPassed(results) === true`
    - Navigasi ke `/webview` saat tombol "Mulai" ditekan menggunakan `router.push()`
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_
  
  - [ ]* 5.2 Write unit tests untuk ReadinessScreen
    - Test rendering daftar pemeriksaan dengan berbagai status (loading, passed, failed)
    - Test tombol "Mulai" disabled saat ada pemeriksaan yang gagal
    - Test tombol "Mulai" enabled saat semua pemeriksaan lulus
    - Test navigasi ke `/webview` saat tombol "Mulai" ditekan
    - Test tombol "Periksa Ulang" menjalankan ulang pemeriksaan
    - _Requirements: 1.5, 1.6, 1.11_

- [x] 6. Checkpoint - Ensure readiness flow works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implementasi DNDModule (native module Android)
  - [x] 7.1 Buat native module menggunakan `expo-modules-core`
    - Buat direktori `modules/dnd/` dengan struktur expo module
    - Implementasi Android native code untuk `isPermissionGranted()`, `requestPermission()`, `enableDND()`, `disableDND()`
    - Gunakan `NotificationManager.isNotificationPolicyAccessGranted()` dan `setInterruptionFilter()`
    - Export TypeScript interface `DNDModule` di `modules/dnd/index.ts`
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 7.2 Write unit tests untuk DNDModule
    - Test `isPermissionGranted()` mengembalikan boolean
    - Test `requestPermission()` membuka Settings (mock Intent)
    - Test `enableDND()` dan `disableDND()` memanggil native API (mock NotificationManager)
    - Test graceful degradation saat native module tidak tersedia
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implementasi LockdownManager module
  - [x] 8.1 Buat file `modules/lockdown-manager.ts` dengan fungsi lockdown
    - Implementasi fungsi `isUrlLocked(url)` untuk mengevaluasi URL (return false jika `/login` atau `/`, true untuk lainnya)
    - Implementasi fungsi `activateLockdown(options)` yang:
      - Menambahkan BackHandler listener untuk memblokir tombol Back
      - Menyembunyikan system bars menggunakan `expo-navigation-bar` dan `expo-status-bar`
      - Memanggil `DNDModule.enableDND()` jika izin granted
      - Menambahkan AppState listener untuk deteksi background
    - Implementasi fungsi `deactivateLockdown()` yang:
      - Menghapus BackHandler listener
      - Menampilkan kembali system bars
      - Memanggil `DNDModule.disableDND()`
      - Menghapus AppState listener
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.2, 5.3, 7.1, 7.2, 7.3_
  
  - [ ]* 8.2 Write property test untuk isUrlLocked
    - **Property 3: Evaluasi URL lockdown adalah konsisten dan deterministik**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Test dengan `fc.webUrl()` untuk berbagai URL, verifikasi idempoten dan konsistensi
  
  - [ ]* 8.3 Write property test untuk Back button behavior
    - **Property 4: Back button behavior konsisten dengan mode aktif**
    - **Validates: Requirements 4.1, 4.6**
    - Test dengan mock BackHandler dan berbagai mode state
  
  - [ ]* 8.4 Write property test untuk background warning
    - **Property 8: Peringatan background konsisten dengan mode aktif**
    - **Validates: Requirements 7.1, 7.3**
    - Test dengan mock AppState dan berbagai mode state
  
  - [ ]* 8.5 Write property test untuk lockdown state persistence
    - **Property 9: Lockdown state dipertahankan setelah background-foreground transition**
    - **Validates: Requirements 7.2**
    - Test dengan mock AppState, simulasi background→foreground, verifikasi state
  
  - [ ]* 8.6 Write unit tests untuk LockdownManager
    - Test `activateLockdown()` memanggil BackHandler.addEventListener
    - Test `deactivateLockdown()` memanggil BackHandler.removeEventListener
    - Test system bars disembunyikan saat lockdown aktif
    - Test system bars ditampilkan saat mode normal
    - Test DND diaktifkan hanya saat izin granted
    - Test peringatan ditampilkan saat app masuk background dalam lockdown mode
    - _Requirements: 4.1, 4.5, 4.6, 4.7, 5.2, 5.4, 7.1, 7.3_

- [ ] 9. Implementasi CBTWebView component
  - [x] 9.1 Buat file `components/CBTWebView.tsx` dengan WebView configuration
    - Implementasi component dengan props `onUrlChange` dan `onLoadError`
    - Konfigurasi WebView: `source={{ uri: TARGET_URL }}`, `javaScriptEnabled`, `domStorageEnabled`, `scalesPageToFit={false}`, `textZoom={100}`
    - Implementasi `onShouldStartLoadWithRequest` untuk navigation guard (blokir domain eksternal)
    - Implementasi `onNavigationStateChange` untuk mendeteksi perubahan URL dan memanggil `onUrlChange`
    - Implementasi `onError` dan `onHttpError` untuk menangani error loading
    - Implementasi fungsi helper `evaluateNavigation(url, targetDomain)` untuk navigation guard
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 6.1, 6.2, 6.3_
  
  - [ ]* 9.2 Write property test untuk navigation guard
    - **Property 5: Navigation guard memblokir semua domain eksternal**
    - **Validates: Requirements 6.1, 6.3**
    - Test dengan `fc.webUrl()` untuk berbagai URL, verifikasi hanya domain target yang diizinkan
  
  - [ ]* 9.3 Write unit tests untuk CBTWebView
    - Test WebView dirender dengan `source.uri = TARGET_URL`
    - Test `domStorageEnabled=true` (sesi login dipertahankan)
    - Test `scalesPageToFit=false` (zoom dinonaktifkan)
    - Test `onShouldStartLoadWithRequest` memblokir URL eksternal
    - Test `onNavigationStateChange` memanggil `onUrlChange` dengan URL baru
    - Test tampilan pesan saat URL eksternal diblokir
    - _Requirements: 2.1, 2.5, 2.6, 6.1, 6.2_

- [x] 10. Checkpoint - Ensure WebView and navigation guard work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implementasi WebViewScreen
  - [x] 11.1 Buat file `app/webview.tsx` untuk WebViewScreen
    - Wrap screen dengan `LockdownProvider` (atau gunakan context dari root layout)
    - Render `CBTWebView` component
    - Implementasi handler `onUrlChange` yang:
      - Memanggil `isUrlLocked(url)` untuk mengevaluasi URL
      - Memanggil `activateLockdown()` jika URL locked
      - Memanggil `deactivateLockdown()` jika URL tidak locked
    - Implementasi loading indicator saat WebView memuat
    - Implementasi error state dengan tombol "Coba Lagi" yang memanggil `webViewRef.current?.reload()`
    - Implementasi peringatan modal saat app masuk background dalam lockdown mode
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 7.1_
  
  - [ ]* 11.2 Write property test untuk DND activation
    - **Property 6: DND diaktifkan hanya saat izin diberikan dan lockdown aktif**
    - **Validates: Requirements 5.2, 5.4**
    - Test dengan mock DNDModule dan berbagai kondisi izin
  
  - [ ]* 11.3 Write property test untuk DND round trip
    - **Property 7: Lockdown-unlock round trip menonaktifkan DND**
    - **Validates: Requirements 5.3**
    - Test dengan mock DNDModule, aktifkan lockdown, nonaktifkan, verifikasi disableDND dipanggil
  
  - [ ]* 11.4 Write unit tests untuk WebViewScreen
    - Test rendering CBTWebView component
    - Test loading indicator ditampilkan saat WebView memuat
    - Test error screen ditampilkan saat WebView gagal memuat
    - Test tombol "Coba Lagi" memanggil reload
    - Test peringatan modal ditampilkan saat app masuk background dalam lockdown mode
    - Test `activateLockdown()` dipanggil saat URL berubah ke non-login path
    - Test `deactivateLockdown()` dipanggil saat URL berubah ke login path
    - _Requirements: 2.3, 2.4, 3.1, 3.2, 7.1_

- [ ] 12. Setup routing dan integrasi dengan expo-router
  - [x] 12.1 Update `app/_layout.tsx` untuk wrap dengan LockdownProvider
    - Wrap root layout dengan `<LockdownProvider>` agar context tersedia di semua screen
    - Pastikan expo-router Stack configuration sudah benar
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 12.2 Konfigurasi route `/` untuk ReadinessScreen dan `/webview` untuk WebViewScreen
    - Pastikan `app/index.tsx` adalah ReadinessScreen (route default)
    - Pastikan `app/webview.tsx` adalah WebViewScreen
    - Test navigasi dari ReadinessScreen ke WebViewScreen
    - _Requirements: 1.1, 1.11, 2.1_

- [ ] 13. Konfigurasi app.json untuk Android permissions dan settings
  - [x] 13.1 Update `app.json` dengan Android permissions dan configuration
    - Tambahkan permissions: `android.permission.CAMERA`, `android.permission.INTERNET`, `android.permission.ACCESS_NOTIFICATION_POLICY`
    - Konfigurasi `android.minSdkVersion` ke 26 (Android 8.0)
    - Konfigurasi `android.permissions` untuk camera dan notification policy access
    - _Requirements: 1.2, 1.3, 1.4, 5.1_

- [ ] 14. Integration testing dan final verification
  - [ ]* 14.1 Write integration tests untuk lockdown lifecycle
    - Test full flow: ReadinessScreen → WebViewScreen → Lockdown activation → URL change → Lockdown deactivation
    - Test DND activation dan deactivation dalam full flow
    - Test background-foreground transition dalam lockdown mode
    - Test navigation guard memblokir URL eksternal dalam full flow
    - _Requirements: 1.11, 2.1, 3.1, 3.2, 4.1, 5.2, 5.3, 6.1, 7.2_

- [x] 15. Final checkpoint - Ensure all features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are covered by implementation
  - Verify all correctness properties are validated by property-based tests

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (9 properties total)
- Unit tests validate specific examples, edge cases, and error conditions
- Development build diperlukan karena menggunakan native modules (`react-native-webview`, `@react-native-community/netinfo`, DNDModule)
- DNDModule memerlukan implementasi native Android menggunakan `expo-modules-core`
- Semua property-based tests menggunakan `fast-check` dengan minimum 100 iterasi
