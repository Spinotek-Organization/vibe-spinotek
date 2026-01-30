# 🌊 Spinotek Labs — Keep the Vibe Coding!

Wadah buat pamer karya, prototipe, atau hasil eksperimen UI/UX kamu. Di sini tempatnya kita kumpulin energi kreatif dari tim Spinotek dan kamu semua! 🚀

Cek galerinya di: [vibe.spinotek.com](https://vibe.spinotek.com)

---

## 🚀 Teknologi Terbaru

Sekarang Spinotek Labs sudah mendukung workflow pengembangan modern! Kamu bisa pakai:

- **React 18** & **Vue 3** (Tanpa perlu install di tiap folder)
- **Tailwind CSS 3** (Auto-scan di seluruh project)
- **Vite 5** (Server development super kencang & build kilat)

---

## 🛠️ Cara Mulai (Development)

1. **Install Dependensi** (Cukup sekali di root):
   ```bash
   npm install
   ```
2. **Jalankan local server**:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:5173](http://localhost:5173) di browser kamu.

---

## 🎨 Cara Drop Karya Baru

### 1. Project HTML/CSS Biasa

- Buat folder baru (misal: `karya-kece`).
- Masukkan `index.html` dan aset lainnya.
- Gunakan Tailwind kalau perlu dengan memanggil: `<script type="module" src="/main.js"></script>`.

### 2. Project React/Vue (Recommended)

- Copy folder `_template-react` atau `_template-vue` menjadi nama folder kamu.
- Mulai koding di file `.jsx` atau `.js` di dalam folder tersebut.
- **Penting:** Pastikan file utama kamu tetap bernama `index.html`.

---

## 📂 Struktur Proyek

Sistem kita menggunakan **NPM Workspaces**, artinya kamu cuma butuh satu folder `node_modules` di luar untuk semua project di dalam.

```text
/ (root)
├── package.json        <-- Daftar mesin & library utama
├── vite.config.js      <-- Otak yang bikin server jadi kencang
├── main.js             <-- Pintu masuk CSS & Tailwind
├── assets/
│   └── style.css       <-- File Tailwind (import dari sini)
├── _template-react/    <-- Contoh starter React
├── _template-vue/      <-- Contoh starter Vue
└── [folder-karya]/     <-- Folder karya kamu di sini
```

---

## 📝 Aturan Main

1. **Nama Folder:** Singkat & padat, gunakan tanda hubung (contoh: `web-proto-v1`). Jangan pakai spasi!
2. **Relative Path:** Pastikan panggil file CSS/JS pakai path relatif (contoh: `./style.css`) biar nggak error pas di-load.
3. **Optimasi:** Gunakan `npm run build` sebelum deploy untuk memastikan semua aset terkompres dengan baik.
4. **Pull Request:** Kirim PR ke branch `master` jika karya kamu sudah siap dipamerkan!

---

_Happy coding, let's keep the vibe alive!_ ⚡️
