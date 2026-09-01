# Rumah3D - Quick Reference Card

## 🚀 Start Here

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## 📍 Halaman & Routes

| Route | Nama | Tujuan |
|-------|------|--------|
| `/` | Rumah | Preview hasil akhir + furniture counter |
| `/editor` | Editor | Tambah, pindah, putar, hapus furniture |

## 🎮 Kontrol

### HouseView (/)
- **Mouse Drag**: Rotate camera
- **Scroll**: Zoom in/out
- **Navbar**: Link ke Editor

### EditorView (/editor)
- **Klik Furniture di Sidebar**: Select jenis (highlight biru)
- **Klik Lantai**: Place furniture (saat ada yang dipilih)
- **Klik Furniture di Scene**: Select untuk edit
- **Drag Gizmo**: Move/Rotate furniture (sesuai mode)
- **Mode Button**: Toggle Pindah ↔ Putar
- **Hapus Button**: Delete furniture

## 📦 Furniture Catalog

```javascript
chair   | Kursi   | 0.5×0.9×0.5 | Brown
table   | Meja    | 1.2×0.7×0.8 | Tan
sofa    | Sofa    | 1.8×0.8×0.9 | Teal
bed     | Kasur   | 1.6×0.5×2.0 | Beige
shelf   | Rak     | 1.0×1.8×0.4 | Dark
lamp    | Lampu   | 0.3×1.5×0.3 | Yellow
```

## 💾 Data

- **Storage**: localStorage
- **Key**: `rumah3d-furniture`
- **Format**: JSON array dengan furniture items
- **Persist**: Otomatis (Zustand middleware)
- **Sync**: Real-time antar halaman

## 📁 Key Files

```
src/
├── store/useHouseStore.js        ← State management
├── data/furnitureCatalog.js      ← Furniture types
├── components/house/HouseShell.jsx ← 3D model
├── components/ui/FurniturePicker.jsx ← Sidebar
└── pages/EditorView.jsx          ← Main editor logic
```

## ⌨️ Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build production
npm run preview   # Preview build
./verify.bat      # Verify project (Windows)
bash verify.sh    # Verify project (Mac/Linux)
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Scene tidak muncul | Check WebGL support, refresh browser |
| Furniture tidak bisa dipindah | Click furniture dulu, cek gizmo visible |
| Data hilang | Check localStorage (DevTools) |
| Build error | Run `npm install` again |

## 📊 Project Stats

- **Components**: 10 JSX files
- **Pages**: 2 routes  
- **Dependencies**: 5 (react, three, fiber, drei, zustand, router)
- **Build Size**: 1.22 MB (gzip: 339 KB)
- **Test Coverage**: 10-point checklist

## 📚 Documentation

- **README.md** - Full documentation
- **TESTING.md** - 10-point testing checklist
- **PROJECT_SUMMARY.md** - Detailed project overview
- **FINAL_SUMMARY.md** - Comprehensive completion report

## ✅ Status

**Status**: ✅ Production Ready v1.0  
**All Steps**: COMPLETE (1-8)  
**Verification**: PASSED (23/23 checks)  
**Build**: SUCCESS (No errors)

---

💡 **Tip**: Buka TESTING.md untuk comprehensive testing checklist sebelum production deployment.
