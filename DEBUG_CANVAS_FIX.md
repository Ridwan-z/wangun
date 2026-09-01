# Debug: Canvas 3D Blank Fix

## Masalah

Halaman "Rumah" menampilkan teks header tetapi kanvas 3D putih kosong.

## Root Causes Ditemukan

1. **CSS Height Issue**: `html, body, #root` punya `height: 100%` tapi tidak ada `min-height`, bisa collapse pada browser tertentu
2. **Environment Loading**: `<Environment preset="apartment" />` dari drei membutuhkan fetch HDRI eksternal yang bisa timeout
3. **Import Unnecessary**: HouseShell mengimport BoxGeometry, PlaneGeometry, MeshStandardMaterial dari 'three' yang tidak diperlukan
4. **CSS Navbar Offset**: `.house-view` pakai `margin-top: 60px` tapi height tetap `100vh`, menyebabkan overflow
5. **Camera Position**: Kamera di posisi `[8, 8, 8]` bisa tidak optimal untuk scene ini

## Solusi yang Diterapkan

### STEP 1 - Cek Console Error
- Tidak error critical di console
- Environment HDRI load tanpa error tapi perlu Suspense wrapper

### STEP 2 - Cek Canvas Size
**App.css**: Tambah `min-height: 100%` dan `overflow: hidden`
```css
html, body, #root {
  width: 100%;
  height: 100%;
  min-height: 100%;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
```

**HouseView.jsx**: Canvas punya inline style eksplisit
```jsx
<Canvas
  camera={{ position: [8, 6, 10], fov: 45 }}
  shadows
  style={{ width: '100%', height: '100%' }}
></Canvas>
```

**HouseView.css**: Container pakai calc height
```css
.house-view {
  width: 100%;
  height: calc(100vh - 60px);
  margin-top: 60px;
}
```

### STEP 3 - Cek Camera & Scene Rendering
- Camera position: `[8, 6, 10]` — cukup jauh dari scene
- HouseShell verified: 4 walls + 1 floor, semua mesh valid
- Tambah `<axesHelper>` untuk debug (opsional, sudah dihapus)

### STEP 4 - Cek Lighting
**SceneLighting.jsx**:
```jsx
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.8} /> {/* Naik dari 0.5 */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5} {/* Naik dari 1.0 */}
        castShadow
        ...
      />
      <Suspense fallback={null}>
        <Environment preset="sunset" /> {/* Ganti dari "apartment" */}
      </Suspense>
    </>
  );
}
```

### STEP 5 - HouseShell Cleanup
Hapus import 'three' yang tidak dipakai:
```jsx
// SEBELUM (buggy):
import { BoxGeometry, PlaneGeometry, MeshStandardMaterial } from 'three';

// SESUDAH (fixed):
// Hapus import, gunakan JSX geometry langsung
```

## File Changed

1. `src/App.css` — CSS global height/min-height fix
2. `src/components/house/SceneLighting.jsx` — Suspense wrapper, intensity boost
3. `src/components/house/HouseShell.jsx` — Hapus import 'three' yang tidak dipakai
4. `src/pages/HouseView.jsx` — Inline canvas style, camera position
5. `src/pages/HouseView.css` — Calc height fix
6. `src/pages/EditorView.jsx` — Inline canvas style
7. `src/pages/EditorView.css` — Calc height fix

## Verifikasi

```bash
# Build test
npm run build
# ✓ Built successfully, no errors

# Dev server
npm run dev
# ✓ http://localhost:5173 — Canvas 3D muncul
```

## Hasil

- HouseView: Canvas 3D muncul, rumah + lighting terlihat
- EditorView: Canvas 3D muncul, furniture bisa ditempatkan
- Cross-page sync: localStorage persist works
- No console errors

---

## Known Issues (v1.0)

1. **Environment fallback**: Jika network lambat, Environment HDRI mungkin butuh waktu tambahan. Suspense fallback={null} handles ini dengan aman.
2. **Mobile performance**: Scene bisa lagging di perangkat mobile lemah.
3. **Shadow quality**: Di perangkat low-end, turunkan shadow-mapSize.
