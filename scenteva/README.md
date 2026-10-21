# SCENTEVA — Website siap deploy

Website HTML, CSS, dan JavaScript tanpa library pihak ketiga atau instalasi dependency. Source lengkap, foto asli, konfigurasi Vercel, dan integrasi GA4 disertakan. Belum dipublikasikan ke GitHub, Vercel, atau akun GA4 mana pun.

## 1. Menjalankan di komputer

1. Ekstrak ZIP, buka folder `scenteva` di VS Code.
2. Pastikan Node.js versi 20 atau lebih baru tersedia.
3. Buka terminal di folder yang berisi `package.json`, jalankan:

```sh
npm run dev
```

4. Buka http://localhost:4173 di browser. Hentikan dengan Ctrl+C.

Tidak perlu `npm install` karena project tidak menggunakan dependency. Alternatif jika ada Python: `python -m http.server 4173` dari folder yang sama.

## 2. Struktur dan perubahan konten

| File | Isi |
| --- | --- |
| `index.html` | Home, promo 1–30 Mei 2027, katalog |
| `about.html` | Cerita, visi, misi |
| `timeless.html` | Detail Timeless 50 ml |
| `ethereal.html` | Detail Ethereal 50 ml |
| `flower-bath.html` | Detail Flower Bath 50 ml |
| `404.html` | Halaman tidak ditemukan |
| `assets/styles.css` | Desain desktop dan layar kecil |
| `assets/app.js` | Interaksi dan event GA4 |
| `assets/config.js` | Measurement ID dan mode debug |
| `assets/*.jpg` | Logo dan foto produk asli |
| `products.json` | Referensi data produk, bukan sumber render otomatis |
| `scripts/build.mjs` | Menyalin file website ke `dist/` |
| `scripts/serve.mjs` | Server preview lokal |
| `vercel.json` | Konfigurasi build, output, dan header |

Edit HTML terkait untuk mengubah konten. Jika harga/nama berubah, perbarui juga `index.html`, `assets/app.js` (metadata analitik), dan `products.json`. Header/footer ada pada setiap HTML; ubah semuanya jika kontak berubah. Jalankan build ulang setelah perubahan. File `dist/` dihasilkan otomatis, jangan diedit langsung.

Foto mengikuti lampiran: IMG_0535 = Timeless, IMG_0551 = Ethereal, IMG_0565 = Flower Bath. Logo memakai gambar 7; area putih berlebih dibatasi melalui CSS tanpa mengubah file asli. Gambar referensi Alchemist tidak digunakan sebagai aset website.

## 3. Upload ke GitHub

Cara tanpa terminal Git:

1. Login GitHub, buat repository baru, misalnya `scenteva-website`.
2. Pilih Add file → Upload files.
3. Upload ISI folder `scenteva`, bukan ZIP. Pastikan `package.json`, `index.html`, dan `vercel.json` langsung berada di root repository. Sertakan folder `assets` dan `scripts`.
4. Commit changes. Folder `dist` tidak perlu diunggah karena dibuat saat build.

Alternatif terminal (ganti URL di bawah dengan repository milikmu):

```sh
git init
git add .
git commit -m "Create SCENTEVA website"
git branch -M main
git remote add origin https://github.com/USERNAME/scenteva-website.git
git push -u origin main
```

GitHub menyimpan source project; langkah berikut menggunakan Vercel sebagai hosting. GitHub Pages tidak diperlukan.

## 4. Deployment ke Vercel

1. Login Vercel dengan GitHub, pilih Add New → Project.
2. Import repository `scenteva-website`. Beri Vercel akses ke repository yang diperlukan.
3. Pilih Framework Preset: Other.
4. Root Directory: folder berisi `package.json`; kosong/default jika file berada di root repository.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Install Command: biarkan default. Tidak ada dependency tambahan atau environment variable wajib.
8. Klik Deploy. Buka URL yang dikembalikan Vercel setelah deployment berhasil.
9. Uji Home → Shop, About → Shop, ketiga produk, panel detail, dan tautan kontak. Cek juga dari ponsel.
10. Commit/push berikutnya ke branch produksi akan memicu deployment baru lewat integrasi Git Vercel.

`vercel.json` sudah memuat build/output tersebut. Untuk domain sendiri, tambahkan domain melalui pengaturan Domains project lalu ikuti instruksi DNS Vercel.

Sebelum deploy, kamu dapat menguji build secara lokal:

```sh
npm run build
```

Hasilnya berada di `dist/` dan hanya berisi file yang perlu dipublikasikan. Preview server bawaan melayani source, sehingga cek output build dapat dilakukan dengan `python -m http.server 4174 --directory dist` jika Python tersedia.

## 5. Konfigurasi GA4

1. Di Google Analytics, buat/pilih properti GA4 untuk SCENTEVA. Gunakan zona waktu Indonesia yang sesuai dan mata uang IDR.
2. Admin → Data streams/Aliran data → Add stream → Web. Masukkan URL website hasil deployment.
3. Buka stream tersebut, salin Measurement ID berbentuk `G-...`.
4. Edit `assets/config.js`:

```js
window.SCENTEVA_CONFIG = {
  ga4MeasurementId: "G-XXXXXXXXXX", // Ganti dengan ID asli
  debugAnalytics: false
};
```

5. Commit dan push perubahan, tunggu deployment baru.
6. Buka website lalu pilih Izinkan pada banner analitik. Google tag hanya dimuat setelah persetujuan. Jika memilih Tolak, event tidak dikirim. Pengunjung dapat membuka kembali pilihan melalui Pengaturan analitik di footer.
7. Di GA4, periksa Realtime. Buka produk dan klik tombol untuk melihat interaksinya. Pengiriman data dapat diblokir oleh ad blocker atau pilihan cookie.

Measurement ID memang publik, bukan API secret. Jangan menaruh token, API secret, atau password dalam source. Jangan menambah snippet GA4/GTM kedua yang mengirim page_view lagi karena integrasi ini sudah mengirim satu page_view untuk setiap halaman HTML yang dimuat. Navigasi hash ke katalog bukan page view baru.

### Event yang tersedia

| Event | Pemicu | Kegunaan |
| --- | --- | --- |
| `page_view` | Halaman dimuat setelah analitik diizinkan | Kunjungan halaman |
| `view_item_list` | Katalog masuk viewport, sekali per halaman | Eksposur katalog |
| `select_item` | Kartu produk diklik | Ketertarikan pada varian |
| `view_item` | Halaman detail produk dibuka | Detail yang dilihat |
| `shop_now_click` | Belanja Sekarang diklik | Efektivitas hero |
| `product_detail_expand` | Panel Mood/Notes/Performance dibuka | Detail yang diminati |
| `whatsapp_order_click` | Pesan via WhatsApp diklik | Niat menghubungi untuk pemesanan |
| `contact_click` | Kontak footer diklik | Kanal kontak |

Event produk standar menyertakan item_id, item_name, item_brand, item_category, dan price. `view_item` menyertakan currency IDR dan value 169000. Event WhatsApp adalah klik keluar, bukan bukti chat terkirim atau pembelian selesai. Project tidak mengirim `purchase`, revenue penjualan, `add_to_cart`, atau `begin_checkout` karena tidak ada keranjang maupun checkout online.

Jika diperlukan, tandai `whatsapp_order_click` sebagai key event di GA4 untuk mengukur niat menghubungi. Jangan menafsirkannya sebagai jumlah transaksi. Buat custom dimensions berscope Event untuk `contact_channel`, `section_name`, dan `placement` jika ingin memakainya di laporan Explore. Parameter item_id pada event custom dapat didaftarkan tersendiri bila dibutuhkan; event ecommerce standar sudah menggunakan array items.

### Pengujian DebugView

1. Ubah `debugAnalytics` menjadi `true` sementara lalu deploy.
2. Buka situs dan Izinkan analitik. Masuk ke GA4 → Admin → DebugView.
3. Cek page_view, scroll ke katalog, buka produk, buka Notes, lalu klik WhatsApp (tidak perlu mengirim pesan).
4. Pastikan tidak ada event purchase. Kembalikan debugAnalytics ke false setelah selesai.
5. Untuk mengulang consent, gunakan Pengaturan analitik di footer. Setelah menolak, pengiriman baru dihentikan; cookie yang sudah terbentuk dapat dibersihkan lewat pengaturan browser jika diperlukan.

Untuk sumber traffic, contoh tautan kampanye:
`https://DOMAIN-KAMU/?utm_source=instagram&utm_medium=social&utm_campaign=scenteva_launch`
Ganti domain tersebut. Jangan menaruh nama, nomor telepon pelanggan, atau informasi pribadi dalam UTM.

## 6. Batas fungsi dan catatan konten

- Semua harga normal Rp169.000 untuk 50 ml.
- Promo 5% ditampilkan sesuai instruksi, berlaku 1–30 Mei 2027; tidak dihitung atau diterapkan otomatis. Harga diskon untuk satu produk adalah Rp160.550. Admin WhatsApp perlu memverifikasi pembelian pertama, periode promo, dan total pesanan. Banner tetap tampil sampai HTML diperbarui; sebelum/sesudah periode promo sesuaikan teks bila diperlukan.
- Pemesanan menggunakan WhatsApp. Tidak ada pembayaran QRIS, gateway pembayaran, manajemen stok, akun pelanggan, database, atau konfirmasi pesanan otomatis.
- Mood, notes, deskripsi, dan skor performance mengikuti data yang diberikan pemilik. Skor bukan hasil uji independen oleh pembuat website.
- Deskripsi Ethereal menyebut peony, sementara daftar notes yang diberikan tidak memuat peony; keduanya dipertahankan sesuai brief. Periksa konsistensi konten bila ingin mengubahnya sebelum publikasi.
- Foto dan logo disertakan. Layout menggunakan inspirasi hierarki dan ruang putih referensi, dengan identitas SCENTEVA.
- Build dan sintaks JavaScript berhasil diperiksa. Pemeriksaan file/tautan internal dilakukan. Preview browser otomatis diblokir kebijakan lingkungan, sehingga tampilan visual dan interaksi browser perlu dicek secara manual sebelum publikasi. Pengiriman GA4 ke properti nyata belum diuji karena Measurement ID belum diberikan.

## 7. Referensi resmi

- Vercel deployment: https://vercel.com/docs/deployments
- Integrasi Git: https://vercel.com/docs/git
- Measurement ID GA4: https://support.google.com/analytics/answer/9539598?hl=id
- Ecommerce GA4: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce

Project ini disiapkan sebagai source siap deploy; tidak ada klaim publikasi atau konfigurasi akun yang sudah dilakukan.
