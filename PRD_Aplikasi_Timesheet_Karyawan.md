# Product Requirements Document (PRD)
## Aplikasi Timesheet Karyawan

| | |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 7 September 2026 |
| **Status** | Draft untuk review |
| **Jumlah Target Pengguna** | ≤ 160 karyawan |

---

## 1. Ringkasan Produk

Aplikasi web untuk mencatat jam kerja harian karyawan secara digital, menggantikan proses rekap manual. Karyawan mengisi timesheet lewat form sederhana, sistem otomatis menghitung jam kerja, keterlambatan, dan lembur, lalu admin dapat memantau semuanya lewat satu dashboard — lengkap dengan filter, rekap bulanan/tahunan yang selalu ter-update, dan fitur ekspor ke PDF/Excel per karyawan maupun total keseluruhan.

## 2. Latar Belakang & Tujuan

**Masalah saat ini:** Admin merekap jam kerja karyawan secara manual, memakan waktu dan rawan salah hitung.

**Tujuan produk:**
- Menghilangkan proses rekap manual oleh admin.
- Menyediakan data jam kerja yang akurat, real-time, dan mudah diaudit.
- Mempermudah pembuatan laporan bulanan/tahunan untuk keperluan payroll/evaluasi.
- Memberi karyawan cara input yang cepat dan minim kesalahan (lewat konfirmasi sebelum submit).

## 3. Target Pengguna & Role

Sistem menggunakan **2 role**:

| Role | Deskripsi |
|---|---|
| **Admin** | Mengelola data karyawan (CRUD), melihat seluruh timesheet, memfilter & mengurutkan data, melihat rekap, mengekspor laporan, mengatur parameter jam kerja/lembur/keterlambatan. |
| **Karyawan** | Registrasi akun sendiri, login, mengisi timesheet harian, melihat riwayat timesheet & rekap miliknya sendiri. |

## 4. Ruang Lingkup

**Termasuk (in-scope):**
- Registrasi & autentikasi karyawan
- Form input timesheet harian
- Perhitungan otomatis jam kerja, keterlambatan, dan lembur
- Dashboard admin dengan filter, sort, dan pencarian
- Rekap otomatis bulanan & tahunan (per karyawan dan total)
- Ekspor data ke PDF dan Excel
- CRUD data karyawan oleh admin
- Notifikasi konfirmasi saat karyawan submit timesheet
- Pengiriman rekap lewat email

**Tidak termasuk (out-of-scope) untuk versi ini:**
- Alur approval/persetujuan atasan
- Role tambahan seperti supervisor/kepala divisi
- Integrasi absensi biometrik/GPS/face recognition
- Perhitungan payroll/gaji otomatis (sistem hanya menghitung jam, bukan nominal gaji)
- Aplikasi mobile native (fokus web responsif dulu)

## 5. User Stories

**Karyawan**
- Sebagai karyawan, saya ingin mendaftar dengan nama lengkap, email, password, dan no. telepon agar akun saya terdaftar di sistem.
- Sebagai karyawan, saya ingin login untuk mengisi timesheet harian saya.
- Sebagai karyawan, saya ingin mengisi jam masuk, jam keluar, dan deskripsi pekerjaan hari itu dengan cepat.
- Sebagai karyawan, saya ingin melihat pop-up konfirmasi sebelum data timesheet saya benar-benar tersimpan, supaya saya bisa mengecek ulang isiannya.
- Sebagai karyawan, saya ingin melihat riwayat timesheet dan rekap bulanan saya sendiri.
- Sebagai karyawan, saya ingin menerima rekap bulanan saya lewat email.

**Admin**
- Sebagai admin, saya ingin melihat semua data timesheet karyawan dalam satu dashboard.
- Sebagai admin, saya ingin memfilter data berdasarkan nama, bulan, tahun, atau status (telat/lembur/normal).
- Sebagai admin, saya ingin mengurutkan (sort) data berdasarkan tanggal, nama, atau jumlah jam kerja.
- Sebagai admin, saya ingin melihat rekap total jam kerja per karyawan per bulan dan per tahun secara otomatis.
- Sebagai admin, saya ingin mengekspor data timesheet — baik satu karyawan maupun seluruh karyawan — ke PDF atau Excel.
- Sebagai admin, saya ingin melakukan CRUD terhadap data karyawan (tambah, lihat, edit, nonaktifkan/hapus).
- Sebagai admin, saya ingin mengatur parameter standar jam kerja, batas lembur, dan batas keterlambatan.

## 6. Fitur Utama Detail

### 6.1 Autentikasi & Registrasi
- Registrasi mandiri oleh karyawan dengan field: **nama lengkap, email, password, no. telepon**.
- Verifikasi email saat registrasi (rekomendasi, agar email valid untuk pengiriman rekap — dapat didiskusikan lebih lanjut apakah wajib atau opsional).
- Login menggunakan email & password.
- Fitur lupa password (reset via email).
- Admin dapat menonaktifkan akun karyawan yang resign tanpa menghapus histori datanya.

### 6.2 Input Timesheet Harian (Karyawan)
Form input harian berisi:
- Tanggal (default: hari ini, bisa diedit untuk susulan H-1/H-2 sesuai kebijakan — perlu dikonfirmasi batas toleransinya)
- Jam masuk
- Jam keluar
- Deskripsi pekerjaan/aktivitas hari itu (free text)

Setelah klik submit, muncul **pop-up konfirmasi** yang menampilkan ringkasan isian (jam masuk, jam keluar, deskripsi) untuk dicek ulang sebelum benar-benar disimpan.

Data yang sudah disubmit **langsung masuk ke rekap** tanpa approval, namun karyawan dapat mengedit entry pada hari yang sama (rekomendasi, untuk mengantisipasi salah input — durasi edit dapat dibatasi, misalnya sampai tengah malam hari yang sama atau sampai H+1).

### 6.3 Dashboard Admin
- Tabel data timesheet seluruh karyawan dengan kolom: nama, tanggal, jam masuk, jam keluar, total jam kerja, status (normal/telat/lembur), deskripsi pekerjaan.
- **Filter**: berdasarkan nama karyawan, rentang tanggal, bulan, tahun, status kehadiran.
- **Sort**: berdasarkan tanggal, nama, total jam kerja (ascending/descending).
- **Search bar** untuk pencarian cepat nama karyawan.
- Ringkasan/summary card di atas tabel (misal: total karyawan aktif, total jam kerja bulan ini, jumlah keterlambatan bulan ini).

### 6.4 Perhitungan Otomatis
Sistem menghitung otomatis berdasarkan parameter yang bisa diatur admin di halaman **Pengaturan**:
- **Total jam kerja harian** = jam keluar − jam masuk.
- **Keterlambatan**: jika jam masuk > jam masuk standar (misal 08:00), selisihnya dicatat sebagai menit/jam keterlambatan.
- **Lembur**: jika total jam kerja > jam kerja standar harian (misal 8 jam), selisihnya dicatat sebagai jam lembur.
- Semua angka standar ini (jam masuk standar, jam kerja standar, dsb.) **dapat dikonfigurasi oleh admin**, bukan hardcode, karena berbeda tiap perusahaan.

> ⚠️ Catatan: Detail aturan lembur/keterlambatan perlu difinalisasi bersama admin/HR (misalnya apakah ada toleransi keterlambatan 5–10 menit, apakah lembur dihitung per menit atau dibulatkan per 30 menit, dsb).

### 6.5 Rekap Bulanan & Tahunan
- Rekap **per karyawan**: total hari kerja, total jam kerja, total keterlambatan, total lembur — untuk bulan berjalan dan akumulasi tahunan.
- Rekap **total/keseluruhan**: agregat semua karyawan per bulan/tahun, untuk kebutuhan laporan ke manajemen.
- Rekap ter-update otomatis (real-time) setiap kali ada input/edit timesheet baru — tidak perlu proses generate manual.

### 6.6 Ekspor Data
- Ekspor ke **PDF** dan **Excel**.
- Opsi ekspor:
  - Per satu karyawan (rekap individu, bulanan/tahunan)
  - Total seluruh karyawan (rekap gabungan, bulanan/tahunan)
- File ekspor mengikuti filter yang sedang aktif di dashboard (misal admin filter bulan Agustus → ekspor otomatis berisi data Agustus).

### 6.7 CRUD Data Karyawan (Admin)
- **Create**: admin bisa menambahkan karyawan manual (selain lewat registrasi mandiri).
- **Read**: melihat detail profil dan seluruh histori timesheet karyawan tertentu.
- **Update**: mengubah data profil karyawan (nama, email, no. telepon, status aktif/nonaktif).
- **Delete**: menghapus atau menonaktifkan (soft delete direkomendasikan agar histori timesheet tidak hilang).

### 6.8 Notifikasi & Email
- Pop-up konfirmasi setelah submit timesheet harian (di sisi karyawan).
- Pengiriman rekap ke email masing-masing karyawan — perlu dikonfirmasi apakah otomatis terjadwal (misal tiap akhir bulan) atau dikirim manual oleh admin per klik tombol "Kirim Rekap".

## 7. Alur Proses Utama

**Alur Karyawan (harian):**
1. Karyawan login.
2. Karyawan membuka form timesheet hari ini.
3. Isi jam masuk, jam keluar, dan deskripsi pekerjaan.
4. Klik submit → muncul pop-up konfirmasi ringkasan data.
5. Karyawan konfirmasi → data tersimpan dan langsung masuk ke rekap.

**Alur Admin (rutin):**
1. Admin login ke dashboard.
2. Melihat tabel timesheet seluruh karyawan, filter/sort sesuai kebutuhan (misal per bulan atau per nama).
3. Meninjau rekap otomatis (bulanan/tahunan).
4. Ekspor laporan (PDF/Excel) — per karyawan atau total — untuk kebutuhan pelaporan.
5. (Opsional) Mengirim rekap ke email karyawan.

## 8. Struktur Data (High-Level)

**Employees (Karyawan)**
- id, nama_lengkap, email, password (hashed), no_telepon, status (aktif/nonaktif), tanggal_bergabung, role

**Timesheets (Entry Harian)**
- id, employee_id, tanggal, jam_masuk, jam_keluar, total_jam_kerja (calculated), status_keterlambatan, durasi_lembur, deskripsi_pekerjaan, created_at, updated_at

**Settings (Pengaturan Perusahaan)**
- jam_masuk_standar, jam_kerja_standar_harian, aturan_pembulatan_lembur, toleransi_keterlambatan

**Recap (Rekap Bulanan/Tahunan)** — dapat berupa view/hasil agregasi, bukan tabel tersendiri
- employee_id, bulan, tahun, total_hari_kerja, total_jam_kerja, total_keterlambatan, total_lembur

## 9. Aturan Bisnis (Business Rules)

- Semua parameter jam kerja standar, batas lembur, dan toleransi keterlambatan diatur oleh admin, bukan nilai tetap di sistem.
- Data timesheet yang sudah disubmit langsung masuk rekap (tanpa approval), namun tetap bisa diedit karyawan dalam jangka waktu tertentu (perlu difinalisasi — rekomendasi: sampai akhir hari yang sama).
- Data karyawan yang dinonaktifkan tidak dihapus permanen, agar histori timesheet & rekap tetap utuh untuk kebutuhan arsip/audit.
- Ekspor laporan selalu mengikuti filter aktif di dashboard admin.

## 10. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Skalabilitas** | Cukup untuk ±160 pengguna aktif bersamaan mengisi timesheet di jam-jam sibuk (pagi & sore hari kerja) |
| **Keamanan** | Password di-hash, koneksi HTTPS, validasi input untuk mencegah SQL injection/XSS |
| **Ketersediaan** | Target uptime tinggi pada jam kerja (weekday) |
| **Kompatibilitas** | Responsif di desktop & mobile browser, karena karyawan mungkin mengisi lewat HP |
| **Backup Data** | Backup database berkala (harian/mingguan) mengingat data ini jadi acuan payroll/evaluasi |
| **Audit Trail** | Riwayat perubahan data timesheet (siapa mengedit, kapan) sebaiknya tercatat |

## 11. Rekomendasi Teknologi

Karena tidak ada preferensi khusus, berikut rekomendasi stack yang umum, stabil, dan hemat biaya untuk skala 160 pengguna:

| Layer | Rekomendasi | Alasan |
|---|---|---|
| **Frontend** | React (atau Next.js) / atau lebih sederhana: Laravel Blade | Cepat dibangun, ekosistem luas |
| **Backend** | Laravel (PHP) **atau** Node.js (Express/NestJS) | Laravel punya ekosistem export PDF/Excel yang matang (DomPDF, Maatwebsite Excel) dan mudah di-hosting di shared/VPS hosting Indonesia |
| **Database** | MySQL / PostgreSQL | Cukup untuk skala 160 karyawan, gratis, banyak didukung hosting lokal |
| **Export PDF** | DomPDF / Snappy (Laravel) atau Puppeteer (Node.js) | |
| **Export Excel** | Maatwebsite/Laravel-Excel atau ExcelJS (Node.js) | |
| **Email** | SMTP (Gmail Workspace/Mailtrap untuk testing) atau layanan seperti SendGrid | |
| **Hosting** | VPS (DigitalOcean, Niagahoster, dsb) atau shared hosting yang support PHP jika pakai Laravel | Biaya rendah, cukup untuk skala kecil-menengah |

*Catatan: Laravel direkomendasikan sebagai pilihan utama karena kemudahan development CRUD, autentikasi bawaan, dan library export PDF/Excel yang sudah matang — cocok untuk kebutuhan aplikasi internal seperti ini.*

## 12. Asumsi & Hal yang Perlu Difinalisasi

Beberapa poin di bawah ini diasumsikan secara wajar dan **perlu dikonfirmasi lebih lanjut** sebelum development dimulai:

1. Apakah karyawan boleh mengisi timesheet susulan (untuk tanggal yang terlewat) atau hanya untuk hari itu juga?
2. Batas waktu edit timesheet setelah disubmit — sampai kapan boleh diedit?
3. Angka pasti untuk jam masuk standar, jam kerja standar harian, dan toleransi keterlambatan (untuk parameter di Pengaturan).
4. Aturan pembulatan lembur (per menit, per 15/30 menit, dsb).
5. Apakah pengiriman rekap ke email otomatis terjadwal (misal tiap tanggal 1) atau manual dipicu admin.
6. Apakah perlu verifikasi email saat registrasi karyawan baru.

## 13. Kriteria Sukses (Success Metrics)

- Admin tidak lagi melakukan rekap manual (0% proses manual untuk kalkulasi jam kerja/lembur/keterlambatan).
- Waktu pembuatan laporan bulanan berkurang signifikan (dari proses manual berjam-jam menjadi hitungan menit lewat fitur ekspor).
- Seluruh 160 karyawan berhasil onboarding (registrasi & mulai isi timesheet) dalam periode rollout awal.
- Data rekap akurat dan konsisten antara dashboard, hasil ekspor PDF, dan Excel.

## 14. Rencana Fase Pengembangan (Rekomendasi)

| Fase | Cakupan |
|---|---|
| **Fase 1 (MVP)** | Registrasi & login karyawan, form input timesheet harian + pop-up konfirmasi, dashboard admin dasar (lihat & filter data), CRUD karyawan |
| **Fase 2** | Perhitungan otomatis (jam kerja, telat, lembur) + halaman Pengaturan parameter, rekap bulanan/tahunan real-time |
| **Fase 3** | Ekspor PDF & Excel (per karyawan & total), pengiriman rekap via email |
| **Fase 4 (opsional)** | Audit trail, notifikasi tambahan, penyempurnaan UI/UX |

---

*Dokumen ini adalah draft awal berdasarkan hasil diskusi kebutuhan. Poin-poin di bagian 12 (Asumsi & Hal yang Perlu Difinalisasi) sebaiknya didiskusikan lebih lanjut sebelum masuk tahap development agar aturan bisnis (terutama soal lembur/keterlambatan) sesuai kebijakan perusahaan yang sebenarnya.*
