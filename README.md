# 🌊 Spinotek Labs — Keep the Innovation!

Wadah buat pamer karya, prototipe, atau hasil eksperimen kamu. Di sini tempatnya kita kumpulin energi kreatif dari tim Spinotek dan kamu semua! 🚀

🔗 **Live Gallery**: [lab.spinotek.com](https://lab.spinotek.com)

---

## 🚀 Teknologi Modern

Project ini dirancang sebagai **Monorepo / Workspace** yang efisien. Kamu tidak perlu instalasi berulang.

- **Frontend**: [React 18](https://react.dev/), [Vue 3](https://vuejs.org/), HTML5
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) (Global Configuration)
- **Build Tool**: [Vite 5](https://vitejs.dev/) (Super fast HMR)
- **Backend as a Service**: [Supabase](https://supabase.com/) (Database & Auth)

---

## 🛠️ Setup & Development

### 1. Instalasi Dependensi

Cukup jalankan satu perintah di _root folder_ untuk menginstall dependensi bagi SELURUH project.

```bash
npm install
```

### 2. Konfigurasi Backend (Supabase)

Setiap developer atau folder project bisa memiliki database sendiri.

1.  **Duplicate Env File**:
    Copy file `.env.example` dan ubah namanya menjadi `.env`.

    ```bash
    cp .env.example .env
    ```

2.  **Isi Kredensial**:
    Buka file `.env` dan isi dengan kredensial dari project Supabase kamu masing-masing.

    ```env
    VITE_SUPABASE_URL=https://xyzpy.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    ```

    > **💡 Tips Tim:** Kamu bebas menggunakan project Supabase pribadi (`my-dev-db`) di laptopmu untuk testing tanpa takut merusak database utama (`production-db`).

3.  **Setup Database Table**:
    Agar fitur seperti _Save to Cloud_ berjalan, kamu perlu membuat tabel di database Supabase kamu.
    - Buka Dashboard Supabase > SQL Editor.
    - Copy & Paste isi file `supabase_schema.sql` yang ada di root folder ini.
    - Run query tersebut.

### 3. Jalankan Server

Menyalakan server development untuk semua project sekaligus.

```bash
npm run dev
```

Akses di: [http://localhost:5173](http://localhost:5173)

---

## 📂 Struktur Workspace

Kita menggunakan konsep _Workspace_, jadi satu `package.json` mengedalikan semuanya.

```text
/ (root)
├── .env                <-- Kredensial LOKAL kamu (JANGAN DICOMMIT!)
├── .env.example        <-- Template kredensial buat tim
├── supabase_schema.sql <-- Skema database untuk setup Supabase
├── package.json        <-- Config utama
├── vite.config.js      <-- Config build server
├── lib/
│   └── supabase.js     <-- Client koneksi database terpusat
├── system-flow/        <-- [Contoh App] Diagram Builder (Vue + Supabase)
├── aksa-coffee/        <-- [Contoh App] Landing Page
└── [proyek-kamu]/      <-- Buat folder barumu di sini
```

---

## 🎨 Cara Membuat Project Baru

### Opsi A: Project React/Vue (Disarankan)

1. Copy folder `_template-react` atau `_template-vue`.
2. Rename folder tersebut (misal: `dashboard-v1`).
3. Mulai koding! Environment variables (`.env`) di root otomatis terbaca.

### Opsi B: Project HTML Statis

1. Buat folder baru.
2. Buat `index.html`.
3. Import Global CSS jika butuh Tailwind:
   ```html
   <script type="module" src="/main.js"></script>
   ```

---

106:
107: ## 📦 Manajemen Aset & Gambar (PENTING!)
108:
109: Project ini menggunakan struktur aset standar untuk memastikan gambar bekerja baik di Localhost maupun Production.
110:
111: ### 1. Folder `public` untuk Aset
112:
113: **JANGAN** simpan gambar langsung di folder project kamu (misal `jelajah-nusa/assets`).
114: Tapi, simpanlah di dalam folder `public/` dengan struktur nama project kamu.
115:
116: - **Struktur Folder**:
117: `text
118:   /public
119:   ├── /assets/images      <-- Logo & Favicon Global
120:   ├── /jelajah-nusa/assets <-- Aset khusus project 'jelajah-nusa'
121:   ├── /aksa-coffee/assets  <-- Aset khusus project 'aksa-coffee'
122:   └── ...
123:   `
124:
125: ### 2. Cara Panggil Gambar di HTML/Code
126:
127: Karena saat build folder `public` disalin ke root, panggil aset **tanpa** awalan `/public` atau `./public`. Gunakan path sesuai struktur di atas.
128:
129: `html
130: <!-- BENAR -->
131: <img src="assets/images/logo.png" />
132: <img src="jelajah-nusa/assets/bromo.jpg" />
133: 
134: <!-- SALAH (Akan 404 di Production) -->
135: <img src="./assets/bromo.jpg" />
136: <img src="/public/assets/logo.png" />
137: `
138:
139: ---

## 🤝 Kolaborasi Tim & Git

- **.env Aman**: File `.env` sudah masuk `.gitignore`. Kredensial server kamu aman di laptop masing-masing.
- **Database Terpisah**: Jangan takut bereksperimen. Selama kamu pakai URL Supabase kamu sendiri di `.env`, data teman setim tidak akan terganggu.
- **Pull Request**: Selalu push kode kamu tanpa menyertakan kredensial asli.

---

---

## 🚀 Deployment (Laravel Forge / VPS)

Karena ini adalah **Static Site** (HTML/CSS/JS) yang digenerate oleh Vite, kita tidak butuh proses Node.js yang berjalan terus-menerus (seperti PM2). Kita hanya butuh Nginx untuk menyajikan folder `dist`.

### 1. Set Build Script

Di dashboard Laravel Forge (atau CI/CD pipeline kamu), gunakan perintah ini untuk men-generate website:

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
# Ini akan membuat folder 'dist' yang berisi semua website kamu (optimized)
npm run build
```

### 2. Konfigurasi Web Server (Nginx)

Ubah **Web Directory** / **Site Root** di konfigurasi Nginx kamu agar mengarah ke folder `dist` yang baru saja dibuat.

- **Root Path**: `/home/forge/vibe.spinotek.com/dist`
- **Why?**: Karena Vite menyimpan hasil build di folder `dist`.

### 3. Environment Variables Strategy (PENTING!)

**Q: Di mana Tim harus membuat file `.env`?**

**A: Semuanya di ROOT Folder.**

Meskipun project kalian terpisah folder (`system-flow`, `aksa-coffee`), karena kita menjalankan satu server Vite dari pusat (`root`), maka **semua variabel .env harus dikumpulkan di satu file `.env` di folder paling luar (root).**

**Workflow Development:**

1. Si Ani mengerjakan `system-flow`, dia butuh `VITE_DB_URL`.
2. Si Budi mengerjakan `aksa`, dia butuh `VITE_API_KEY`.
3. Keduanya harus menulis variabel tersebut di **satu file `.env` yang sama** di root folder `vibe-spinotek`.

**Workflow Production (Server):**
Sama seperti development, kumpulkan semua variabel dari semua tim dan masukkan ke **Panel Environment variable** di Laravel Forge (atau file `.env` di server).

> **Alasannya**: Vite hanya membaca environment variables dari direktori tempat perintah `vite` dijalankan.

Contoh gabungan:

```env
# Global
VITE_APP_TITLE=Spinotek Labs

# Jelajah Nusa Project
VITE_JELAJAH_NUSA_DB_URL=...
VITE_JELAJAH_NUSA_API_KEY=...

# Aksa Project
VITE_AKSA_API_URL=...
```

Vite akan secara otomatis menyuntikkan (inject) nilai-nilai ini ke dalam kode Javascript saat proses `npm run build` berlangsung.

---

_Happy coding & deploying!_ ⚡️

## 📝 Troubleshooting Scripts

### 1. Script JS Error 404 di Production?

Jika file JavaScript kamu (seperti `script.js` atau `vote.js`) tidak ter-load (404) di production padahal di local jalan, pastikan:

1.  Gunakan `type="module"` pada tag script.
2.  Gunakan **Relative Path** (`./`) bukan absolute path.

**Contoh Salah (Akan 404):**
```html
<script src="/folder-project/script.js"></script>
```

**Contoh Benar ✅:**
```html
<script type="module" src="./script.js"></script>
```

**Penjelasan:** Vite hanya akan mem-bundle file yang diimport sebagai module atau asset yang terlink relatif. Path absolute dianggap static file yang mungkin tidak ada di struktur final `dist`.
