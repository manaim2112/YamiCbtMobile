# Requirements Document

## Introduction

Aplikasi CBT Mobile adalah aplikasi Android berbasis React Native (Expo) yang berfungsi sebagai klien khusus (dedicated client) untuk mengakses platform ujian online di https://cbt.mtssupel.sch.id. Aplikasi ini dirancang untuk memastikan integritas ujian dengan menampilkan halaman pengecekan kesiapan perangkat sebelum ujian dimulai, serta mengaktifkan mode lockdown saat peserta sedang mengerjakan ujian (setelah login). Mode lockdown memblokir semua navigasi sistem dan notifikasi agar peserta tidak dapat meninggalkan aplikasi selama ujian berlangsung.

## Glossary

- **App**: Aplikasi CBT Mobile yang dibangun dengan React Native Expo.
- **WebView**: Komponen yang menampilkan konten web dari URL target di dalam aplikasi.
- **Target_URL**: URL tujuan aplikasi, yaitu `https://cbt.mtssupel.sch.id`.
- **Readiness_Screen**: Halaman pengecekan kesiapan perangkat yang ditampilkan sebelum WebView.
- **Readiness_Checker**: Modul yang melakukan pemeriksaan kondisi perangkat (internet, kamera, versi Android).
- **WebView_Screen**: Halaman utama yang menampilkan Target_URL di dalam WebView.
- **Lockdown_Manager**: Modul yang mengelola status lockdown dan memblokir aksi navigasi sistem.
- **Login_Path**: Path URL yang mengindikasikan halaman login, yaitu `/login`.
- **Lockdown_Mode**: Status aktif di mana semua navigasi sistem dan notifikasi diblokir.
- **Normal_Mode**: Status di mana navigasi sistem berjalan seperti biasa (saat di halaman login atau halaman depan).
- **Android_Min_Version**: Versi Android minimum yang didukung, yaitu Android 8.0 (API Level 26).

---

## Requirements

### Requirement 1: Halaman Pengecekan Kesiapan Perangkat

**User Story:** Sebagai peserta ujian, saya ingin melihat status kesiapan perangkat saya sebelum memulai ujian, agar saya dapat memastikan semua prasyarat terpenuhi sebelum mengerjakan soal.

#### Acceptance Criteria

1. THE App SHALL menampilkan Readiness_Screen sebagai halaman pertama saat aplikasi dibuka.
2. WHEN Readiness_Screen ditampilkan, THE Readiness_Checker SHALL memeriksa ketersediaan koneksi internet pada perangkat.
3. WHEN Readiness_Screen ditampilkan, THE Readiness_Checker SHALL memeriksa ketersediaan kamera pada perangkat.
4. WHEN Readiness_Screen ditampilkan, THE Readiness_Checker SHALL memeriksa versi Android pada perangkat dan membandingkannya dengan Android_Min_Version.
5. WHEN semua pemeriksaan (koneksi internet, kamera, dan versi Android) menunjukkan hasil lulus, THE Readiness_Screen SHALL mengaktifkan tombol "Mulai" agar dapat diklik oleh pengguna.
6. WHEN salah satu atau lebih pemeriksaan menunjukkan hasil gagal, THE Readiness_Screen SHALL menonaktifkan tombol "Mulai" sehingga tidak dapat diklik.
7. THE Readiness_Screen SHALL menampilkan status hasil setiap pemeriksaan secara individual dengan indikator visual yang membedakan status lulus dan gagal.
8. IF koneksi internet tidak tersedia, THEN THE Readiness_Checker SHALL menampilkan pesan "Koneksi internet tidak tersedia" pada item pemeriksaan koneksi.
9. IF kamera tidak tersedia pada perangkat, THEN THE Readiness_Checker SHALL menampilkan pesan "Kamera tidak tersedia" pada item pemeriksaan kamera.
10. IF versi Android perangkat lebih rendah dari Android_Min_Version, THEN THE Readiness_Checker SHALL menampilkan pesan "Versi Android tidak didukung (minimum Android 8.0)" pada item pemeriksaan versi.
11. WHEN pengguna menekan tombol "Mulai" yang aktif, THE App SHALL berpindah ke WebView_Screen dan memuat Target_URL.

---

### Requirement 2: Tampilan WebView

**User Story:** Sebagai peserta ujian, saya ingin mengakses platform CBT langsung di dalam aplikasi, agar saya tidak perlu membuka browser terpisah.

#### Acceptance Criteria

1. THE WebView_Screen SHALL menampilkan konten dari Target_URL menggunakan komponen WebView.
2. THE WebView SHALL memuat Target_URL secara otomatis saat WebView_Screen pertama kali ditampilkan.
3. WHILE WebView sedang memuat halaman, THE WebView_Screen SHALL menampilkan indikator loading kepada pengguna.
4. IF Target_URL gagal dimuat karena koneksi terputus, THEN THE WebView_Screen SHALL menampilkan pesan error beserta tombol "Coba Lagi" untuk memuat ulang halaman.
5. THE WebView SHALL menonaktifkan fitur zoom pinch-to-zoom pada konten web.
6. THE WebView SHALL mengizinkan akses kamera dari halaman web untuk keperluan proctoring ujian.
7. THE WebView SHALL mempertahankan sesi login pengguna selama aplikasi berjalan di foreground.

---

### Requirement 3: Deteksi Halaman dan Pengelolaan Mode

**User Story:** Sebagai penyelenggara ujian, saya ingin aplikasi secara otomatis mendeteksi apakah peserta sedang di halaman login atau halaman ujian, agar mode lockdown dapat diaktifkan atau dinonaktifkan secara tepat.

#### Acceptance Criteria

1. WHEN URL yang sedang ditampilkan di WebView mengandung Login_Path (`/login`) atau merupakan halaman root (`/`), THE Lockdown_Manager SHALL mengaktifkan Normal_Mode.
2. WHEN URL yang sedang ditampilkan di WebView tidak mengandung Login_Path dan bukan halaman root, THE Lockdown_Manager SHALL mengaktifkan Lockdown_Mode.
3. WHEN terjadi perubahan URL di dalam WebView, THE Lockdown_Manager SHALL mengevaluasi ulang dan memperbarui mode yang aktif sesuai dengan URL baru.
4. THE Lockdown_Manager SHALL mempertahankan status mode yang aktif selama URL tidak berubah.

---

### Requirement 4: Lockdown Mode — Pemblokiran Navigasi Sistem

**User Story:** Sebagai penyelenggara ujian, saya ingin semua navigasi sistem diblokir saat peserta sedang mengerjakan ujian, agar peserta tidak dapat meninggalkan aplikasi atau mengakses aplikasi lain selama ujian berlangsung.

#### Acceptance Criteria

1. WHILE Lockdown_Mode aktif, THE Lockdown_Manager SHALL memblokir aksi tombol Back Android sehingga aplikasi tidak berpindah ke layar sebelumnya atau keluar dari aplikasi.
2. WHILE Lockdown_Mode aktif, THE Lockdown_Manager SHALL memblokir gesture navigasi sistem dari sisi kiri layar (swipe dari kiri).
3. WHILE Lockdown_Mode aktif, THE Lockdown_Manager SHALL memblokir gesture navigasi sistem dari sisi kanan layar (swipe dari kanan).
4. WHILE Lockdown_Mode aktif, THE Lockdown_Manager SHALL memblokir gesture navigasi sistem dari sisi atas layar (swipe dari atas).
5. WHILE Lockdown_Mode aktif, THE App SHALL menampilkan konten secara fullscreen dengan menyembunyikan navigation bar dan status bar sistem Android.
6. WHILE Normal_Mode aktif, THE Lockdown_Manager SHALL mengizinkan tombol Back Android berfungsi secara normal.
7. WHILE Normal_Mode aktif, THE App SHALL menampilkan status bar dan navigation bar sistem Android secara normal.

---

### Requirement 5: Lockdown Mode — Pemblokiran Notifikasi

**User Story:** Sebagai penyelenggara ujian, saya ingin notifikasi dari aplikasi lain tidak muncul saat peserta sedang mengerjakan ujian, agar peserta tidak terganggu dan tidak dapat menerima informasi dari luar selama ujian.

#### Acceptance Criteria

1. WHILE Lockdown_Mode aktif, THE App SHALL meminta izin Do Not Disturb (DND) kepada sistem Android untuk menekan notifikasi masuk.
2. WHILE Lockdown_Mode aktif dan izin DND telah diberikan, THE Lockdown_Manager SHALL mengaktifkan mode Do Not Disturb pada perangkat Android.
3. WHEN Lockdown_Mode dinonaktifkan (pengguna kembali ke halaman login), THE Lockdown_Manager SHALL menonaktifkan mode Do Not Disturb dan mengembalikan pengaturan notifikasi ke kondisi semula.
4. IF pengguna menolak izin Do Not Disturb, THEN THE App SHALL tetap berfungsi dengan pemblokiran navigasi sistem yang aktif, dan SHALL menampilkan peringatan bahwa notifikasi tidak dapat diblokir sepenuhnya.

---

### Requirement 6: Keamanan Navigasi Web dalam WebView

**User Story:** Sebagai penyelenggara ujian, saya ingin peserta hanya dapat mengakses domain Target_URL di dalam WebView, agar peserta tidak dapat membuka situs web lain selama ujian berlangsung.

#### Acceptance Criteria

1. WHEN WebView mencoba memuat URL yang domainnya berbeda dari domain Target_URL (`cbt.mtssupel.sch.id`), THE WebView SHALL memblokir navigasi tersebut dan tidak memuat URL eksternal.
2. WHEN WebView memblokir navigasi ke URL eksternal, THE WebView_Screen SHALL menampilkan pesan "Akses ke situs eksternal tidak diizinkan selama ujian".
3. THE WebView SHALL mengizinkan navigasi ke semua path di bawah domain `cbt.mtssupel.sch.id`.

---

### Requirement 7: Penanganan Siklus Hidup Aplikasi

**User Story:** Sebagai penyelenggara ujian, saya ingin aplikasi menangani kondisi saat peserta mencoba meminimalkan atau meninggalkan aplikasi selama ujian, agar integritas ujian tetap terjaga.

#### Acceptance Criteria

1. WHILE Lockdown_Mode aktif dan aplikasi berpindah ke background (diminimalkan), THE App SHALL menampilkan peringatan kepada pengguna bahwa meninggalkan aplikasi selama ujian tidak diizinkan.
2. WHEN aplikasi kembali ke foreground setelah berada di background selama Lockdown_Mode aktif, THE Lockdown_Manager SHALL memastikan semua pemblokiran navigasi kembali aktif.
3. WHILE Normal_Mode aktif, THE App SHALL mengizinkan aplikasi berpindah ke background tanpa peringatan.
