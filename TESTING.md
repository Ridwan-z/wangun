# Testing Guide - Rumah3D

## Checklist Testing Alur Penuh

### Setup
- [ ] npm install selesai tanpa error
- [ ] npm run dev berjalan di localhost:5173
- [ ] Halaman "/" (rumah) dan "/editor" bisa diakses

### Test 1: Navigation & UI
- [ ] Navbar muncul di atas halaman dengan link "Rumah" dan "Editor"
- [ ] Klik navbar link berpindah halaman tanpa reload
- [ ] Styling responsive dan tidak ada console error

### Test 2: HouseView (Preview Halaman)
- [ ] Halaman "/" menampilkan 3D scene dengan rumah
- [ ] Dinding, lantai, lighting terlihat realistis
- [ ] Tidak ada furniture awal (pertama kali)
- [ ] Bisa rotate/zoom camera dengan mouse
- [ ] Title "Preview Rumah" dan counter furniture muncul

### Test 3: EditorView - Placement System
**Setup**: Buka halaman /editor

- [ ] Sidebar kiri dengan daftar 6 furniture muncul
- [ ] Klik tombol furniture → highlight biru berarti terpilih
- [ ] Mode pemilihan tertulis di stats bar bawah ("Klik lantai untuk menempatkan")
- [ ] Klik di lantai rumah → furniture muncul di posisi klik
- [ ] Furniture bisa ditaruh multiple kali dengan jenis sama tanpa perlu reselect

### Test 4: EditorView - Transform Controls
**Setup**: Sudah ada 1+ furniture di editor

- [ ] Klik furniture → highlight/terpilih dengan gizmo visible
- [ ] Drag gizmo (arrow) untuk pindah posisi
- [ ] Posisi update real-time saat drag
- [ ] Tombol "Mode: Pindah" muncul di bawah kanan
- [ ] Klik Mode → berubah ke "Mode: Putar"
- [ ] Dengan Mode Putar, drag gizmo untuk rotate furniture
- [ ] Rotation terupdate

### Test 5: EditorView - Delete & Counter
**Setup**: Ada furniture terpilih di editor

- [ ] Tombol "Hapus Furniture" muncul saat ada furniture terpilih
- [ ] Klik Hapus → furniture hilang dari scene
- [ ] Counter total furniture di stats bar berkurang
- [ ] Klik di area kosong (bukan furniture) → deselect, tombol Hapus hilang

### Test 6: LocalStorage Persistence
**Setup**: Editor dengan 2-3 furniture sudah ditaruh

1. Buka DevTools (F12) → Application tab → Local Storage
2. Cari key "rumah3d-furniture"
   - [ ] Key ada dan berisi array furniture items
   - [ ] Setiap item punya: id, type, position, rotation, scale
   
3. Refresh halaman
   - [ ] Furniture tetap ada (same quantity & positions)
   - [ ] Data tidak hilang
   
4. Clear localStorage, refresh
   - [ ] Furniture hilang (reset ke state awal kosong)

### Test 7: Cross-Page Data Sync
**Setup**: EditorView dengan 2 furniture sudah ditaruh

1. Buka halaman "/" (HouseView)
   - [ ] Furniture yang sama muncul di preview
   - [ ] Posisi & rotasi sama persis
   - [ ] Counter furniture match

2. Buka /editor, tambah 1 furniture baru
   - [ ] Pindah ke "/" → furniture baru ikut muncul
   - [ ] Counter update

### Test 8: Camera & Controls
- [ ] Mouse drag di canvas → rotate view
- [ ] Scroll mouse → zoom in/out smooth
- [ ] Camera tidak bisa masuk di bawah lantai (minimum distance)
- [ ] Camera ada batasan sudut (tidak bisa tengok dari bawah)

### Test 9: Edge Cases
- [ ] Taruh furniture di corner rumah → tidak nembus dinding (visual check, collision bukan priority)
- [ ] Taruh furniture overlap dengan furniture lain → allow (sesuai spec)
- [ ] Klik lantai saat tidak ada furniture dipilih → nothing happens
- [ ] Buka editor di browser baru → localStorage dari tab lain tidak tersinkronisasi real-time (expected behavior)

### Test 10: Performance & Console
- [ ] Tidak ada error di console
- [ ] No warnings tentang missing keys di React lists
- [ ] Taruh 10+ furniture → scene tetap smooth
- [ ] Build (npm run build) selesai tanpa error critical

---

## Debug Checklist

Jika ada issue:

1. **Scene tidak muncul**
   - Check: Canvas rendering di browser
   - Check: WebGL support di browser
   - Console: Apakah ada error three.js?

2. **Furniture tidak bisa dipindah**
   - Check: Click furniture → selection highlight?
   - Check: Transform controls gizmo visible?
   - Console: Error di onObjectChange?

3. **Data tidak tersimpan**
   - Check: DevTools → Application → Local Storage
   - Check: Zustand middleware persist sudah load?
   - Console: Error di useHouseStore?

4. **Build gagal**
   - Check: `npm install` selesai
   - Check: Tidak ada syntax error di .jsx files
   - Run: `npm run build` untuk rebuild

---

## Test Results Template

Setelah test manual, isi template ini:

```
Date: [YYYY-MM-DD HH:MM]
Tester: [Nama]
Browser: [Chrome/Firefox/Safari] v[version]
OS: [Windows/Mac/Linux]

✓ PASS / ✗ FAIL - Test 1: Navigation
✓ PASS / ✗ FAIL - Test 2: HouseView
✓ PASS / ✗ FAIL - Test 3: EditorView Placement
✓ PASS / ✗ FAIL - Test 4: Transform Controls
✓ PASS / ✗ FAIL - Test 5: Delete & Counter
✓ PASS / ✗ FAIL - Test 6: LocalStorage
✓ PASS / ✗ FAIL - Test 7: Cross-Page Sync
✓ PASS / ✗ FAIL - Test 8: Camera Controls
✓ PASS / ✗ FAIL - Test 9: Edge Cases
✓ PASS / ✗ FAIL - Test 10: Performance

Issues Found:
- [Issue 1]
- [Issue 2]

Notes:
[Catatan tambahan]
```
