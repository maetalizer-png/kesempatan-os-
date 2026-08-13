# KESEMPATAN OS Live Simulator

Development-only live preview for this repo's working tree. Zero npm
dependencies (this project has no `package.json` on purpose) — built
entirely on Node's built-in `http`/`fs`/`path`/`os` modules.

It does **not** touch git, GitHub, Vercel, Netlify, Cloudflare, or any
production config. It only reads files from disk on your machine and
serves them over plain HTTP, for as long as you leave it running.

## Menjalankan

```bash
node dev-simulator/server.js
```

Lalu buka:

```
http://localhost:5500/dev-simulator/simulator.html
```

Port default `5500`. Untuk pakai port lain:

```bash
node dev-simulator/server.js --port=4000
```

## Menghentikan

`Ctrl+C` di terminal tempat server jalan. Tidak ada proses lain yang perlu
dibersihkan — server tidak menulis file, tidak membuat cache, tidak
mengubah apa pun di luar prosesnya sendiri.

## Membuka dari HP (LAN)

Saat server start, ia mencetak semua alamat LAN yang terdeteksi di mesin
tempat ia berjalan, misalnya:

```
LAN:     http://192.168.1.23:5500/dev-simulator/simulator.html
```

Buka alamat itu dari browser HP, **selama HP dan komputer ada di jaringan
Wi-Fi yang sama**. Server bind ke `0.0.0.0` (semua network interface) tapi
tidak melakukan port-forwarding atau expose ke internet — hanya
perangkat di LAN yang sama yang bisa mengaksesnya.

> **Catatan kalau kamu menjalankan Claude Code lewat sesi cloud/remote**
> (bukan di laptop/HP kamu sendiri): server ini jalan di dalam container
> sesi itu, yang jaringannya terisolasi dari LAN rumahmu — alamat LAN yang
> tercetak (kalau ada) tidak akan bisa dibuka dari HP kamu. Untuk akses
> HP yang sungguhan, jalankan `node dev-simulator/server.js` di
> laptop/komputer yang satu jaringan Wi-Fi dengan HP-mu (working tree yang
> sama, cukup `git pull` dulu kalau perlu).

## Membuka halaman tertentu

Dua cara:
1. Dropdown "Halaman…" di toolbar — otomatis berisi semua file `.html`
   yang ditemukan di repo (`index.html`, `chat-kesempatan.html`, dst).
2. Ketik path-nya langsung di kotak URL (mis. `chat-kesempatan.html`),
   lalu tekan Enter atau klik "Buka".

Halaman-halaman yang dirender lewat `js/router.js` di dalam
`index.html` (Observation, Noise, Memory, dst) tetap diakses dengan cara
yang sama seperti biasa — klik menu sidebar di dalam preview. Router-nya
tidak diubah sama sekali oleh simulator ini.

## Cara kerja live reload

1. `dev-simulator/server.js` mem-watch seluruh folder repo (`fs.watch`
   dengan `recursive: true`), kecuali `.git`.
2. Begitu ada file berubah (HTML/CSS/JS/asset apa pun), server
   mem-broadcast satu event lewat Server-Sent Events
   (`/__dev-simulator/events`) ke halaman simulator yang sedang terbuka.
3. Simulator menerima event itu lalu memanggil
   `iframe.contentWindow.location.reload()` — jadi apa pun yang sedang
   ditampilkan di preview (index.html ATAU halaman lain yang kamu buka)
   dimuat ulang dari disk.
4. Semua response dari server ini dikirim dengan `Cache-Control: no-store`,
   jadi tidak ada cache browser yang bisa menyembunyikan perubahan
   terbaru. `sw.js` proyek ini sendiri sudah "install-only" (tidak
   meng-cache apa pun), jadi tidak perlu penanganan khusus untuk itu.

Beberapa perubahan file dalam satu aksi (mis. Claude Code menulis 2-3
file sekaligus) di-debounce 150ms supaya preview tidak reload berkali-kali
untuk satu simpanan.

## Kompatibilitas fitur existing

Server ini hanya menyajikan file apa adanya dari working tree — tidak
ada build step, tidak ada rewrite path, tidak ada transformasi kode.
Semua modul ES6 (`js/*`, `ai-agent/*`, `workers/*`, `memory/*`, dst),
routing SPA di `js/router.js`, dan `chat-kesempatan.html` berjalan
persis seperti saat dibuka lewat `python3 -m http.server` atau deployment
statis biasa.

## File yang dibuat

- `dev-simulator/server.js` — server preview + live-reload (SSE)
- `dev-simulator/simulator.html` — UI simulator (viewport Android/
  tablet/desktop, page picker, error overlay, indikator LIVE)
- `dev-simulator/README.md` — dokumen ini

Tidak ada file existing proyek yang diubah untuk membangun tool ini.
