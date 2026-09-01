# Wangun — Arsitek Studio

**Wangun** adalah web builder rumah 3D: rancang denah, bangun tembok bertingkat, tata furniture, dan lihat hasilnya langsung dalam visual 3D — semuanya dari browser, tanpa install apa pun. Tema visualnya mengusung nuansa *Arsitek Studio*: blueprint navy dengan aksen amber/terracotta, ikon garis teknik, dan anotasi monospace.

Developed by **RDW**.

---

## Halaman

### 1. Halaman Rumah (`/`) — Landing + Preview

- **Hero** — ajakan "Wujudkan Rumah Impianmu" dengan CTA langsung ke Editor.
- **Kenapa Wangun** — ringkasan fitur utama dalam kartu bergaya blueprint.
- **Preview Live** — viewport 3D interaktif (drag untuk memutar, scroll untuk zoom) yang menampilkan rumah & furniture tersimpan. Data dibaca dari penyimpanan yang sama dengan Editor, jadi selalu sinkron.
- **CTA penutup + footer** — kredit developer.

### 2. Halaman Editor (`/editor`)

Semua perancangan dilakukan di sini:

**a. Menata Furniture**
- Pilih salah satu dari 6 furniture di sidebar — siluet model mengikuti kursor (biru = bisa ditaruh, merah = bertabrakan).
- Klik lantai untuk menempatkan; posisi otomatis snap ke grid 0.25 m.
- Aturan penempatan: wajib di atas lantai, tidak boleh menembus tembok, tidak boleh menabrak furniture lain.
- Klik furniture untuk memilih → **drag** untuk memindah (indikator merah jika tidak valid), tombol **Putar Kiri/Kanan**, atau **Hapus**.
- Klik area kosong untuk membatalkan seleksi.

**b. Membangun Rumah (Lantai & Tembok)**
- 4 tool: Lantai Persegi/Panjang dan Tembok Persegi/Panjang — ghost preview menunjukkan hasil akhir sebelum dipasang.
- Semua piece snap ke **garis tepi grid 1.25 m**; tembok wajib berdiri di atas lantai.
- Tembok yang dipasang di tempat yang sama **menumpuk otomatis** di atas tembok lama (hingga 5 tingkat) — untuk rumah bertingkat.
- Tembok level dasar tidak boleh menembus furniture; tembok tegak lurus boleh bersilangan untuk membentuk pojok.
- Klik kanan saat tool aktif = **batalkan tool**.

**c. Menghapus (Bongkar)**
- Klik piece (tembok/lantai) untuk menandainya (highlight kuning), lalu klik kanan piece yang sama atau tekan tombol **"Bongkar Piece"**.
- Lantai yang masih ditumpu furniture/tembok tidak bisa dibongkar; tembok yang ditumpuk tembok lain harus dibongkar dari puncak — pesan peringatan menjelaskan alasannya.

**d. Penyimpanan**
- Semua perubahan tersimpan otomatis ke `localStorage` — refresh, tutup browser, atau pindah halaman, desain tetap ada.

### 3. Responsif

Di layar sempit (<768 px) sidebar menjadi *bottom sheet* yang bisa dibuka-tutup dari tombol hamburger; header dan panel info menyusut menjadi bar tipis agar viewport 3D tetap luas. Desktop memakai layout sidebar penuh.

## Katalog Furniture

| Tipe  | Label | Ukuran (W×H×D) | Warna   |
|-------|-------|-----------------|---------|
| chair | Kursi | 0.5×0.9×0.5     | #8B5E3C |
| table | Meja  | 1.2×0.7×0.8     | #A9744F |
| sofa  | Sofa  | 1.8×0.8×0.9     | #4A6D7C |
| bed   | Kasur | 1.6×0.5×2.0     | #D9CBB8 |
| shelf | Rak   | 1.0×1.8×0.4     | #5C4033 |
| lamp  | Lampu | 0.3×1.5×0.3     | #F2C14E |

Setiap furniture memakai model GLB (`public/models/*.glb`) dengan fallback model primitif bila file gagal dimuat.

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — build tool & dev server
- **Three.js** — 3D graphics engine
- **React Three Fiber + Drei** — React renderer & utilitas Three.js
- **Zustand 5** (persist middleware) — state management + autosave
- **React Router 7** — routing antar halaman

## Menjalankan Project

```bash
npm install     # install dependencies
npm run dev     # dev server → http://localhost:5173
npm run build   # build production ke folder dist/
npm run preview # preview hasil build
```

## Struktur Project (ringkas)

```
wangun/
├── src/
│   ├── pages/            # HouseView (landing+preview), EditorView
│   ├── components/
│   │   ├── house/        # HouseShell (lantai/tembok), SceneLighting, CameraRig
│   │   ├── furniture/    # FurnitureItemInteractive, model GLB & primitif
│   │   └── ui/           # FurniturePicker, BuildPanel, BlueprintIcons
│   ├── store/            # useHouseStore (Zustand + persist)
│   ├── utils/            # buildHelper (grid, tabrakan, bertingkat), boundsHelper
│   └── data/             # houseConfig (grid 1.25m), furnitureCatalog
├── public/
│   └── models/           # aset .glb furniture
└── index.html
```

## Penyimpanan Data

Semua state tersimpan otomatis di `localStorage` dengan key `rumah3d-furniture` (key dipertahankan sejak versi awal agar desain user tidak hilang setelah rebranding):

```javascript
{
  furnitureItems: [{ id, type, position: [x,y,z], rotation: [x,y,z], scale }],
  buildPieces:    [{ id, kind: "floor"|"wall", size: "square"|"long",
                     rotation: "h"|"v", position: [x,0,z], level }]  // level: tingkat tembok
}
```

## Batasan yang Diketahui

- Tidak ada undo/redo.
- Single user — tidak ada kolaborasi real-time.
- Tidak ada fitur export/import desain.
- Tembok bertingkat maksimal 5 level.

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+. Membutuhkan WebGL.

## License

MIT
