# BedModel Upgrade (Opsi A + Opsi B Ready)

## STATUS: ✅ OPSI A COMPLETE | ⏳ OPSI B READY

---

## 🛏️ OPSI A — BedModel v2 (Primitive + Wrinkle)

### Layer Structure (Bottom to Top)

```
Group (Y=0 = lantai)
├── Bed Frame (rangka kayu) — Y: 0.09 (height/2)
├── Mattress (kasur) — Y: 0.30 (frame + mattress/2)
├── WrinkledBlanket (selimut bergelombang) — Y: 0.43 (+offset)
└── 3x Pillow (bantal) — Y: 0.61 (frame + mattress + pillow/2)
```

### 1. Bed Frame (Rangka Kayu)
```jsx
<RoundedBox
  position={[0, frameHeight / 2, 0]}    // Y: 0.09
  args={[1.7, 0.18, 2.1]}               // Lebar x Tebal x Panjang
  radius={0.02}                         // Radius kecil (kayu keras)
  smoothness={8}
  color="#4a2f22"                       // Coklat kayu
  roughness={0.4}
  metalness={0.3}
/>
```

### 2. Mattress (Kasur)
```jsx
<RoundedBox
  position={[0, frameHeight + mattressThickness / 2, 0]}
  args={[frameWidth - 0.06, 0.22, frameLength - 0.06]}
  radius={0.06}                         // Radius lebih besar (empuk)
  smoothness={12}
  color={color}                         // Warna dari furnitureCatalog.js (#D9CBB8)
  roughness={0.8}
  metalness={0.05}
/>
```

### 3. WrinkledBlanket (Selimut Bergelombang)
```jsx
<WrinkledBlanket
  width={1.65}     // Lebih sempit dari mattress
  length={1.365}   // 65% panjang kasur (sampai tengah kepala)
  color="#78909c"  // Abu-abu
/>
```

**Vertex Displacement:**
- PlaneGeometry: 24×24 segments (576 vertices untuk di-displace)
- Wave formula:
  ```
  wave = sin(x * 6) * 0.015 + cos(y * 5) * 0.012 + sin((x+y) * 8) * 0.008
  ```
- Extra wrinkle di area head (y > 35% panjang)
- Grid snap tetap berlaku untuk posisi furniture

### 4. Pillows (Bantal — 3 buah)
```jsx
<RoundedBox
  position={[randomX, 0.61, randomZ]}
  rotation={[0.1, 0, randomRotZ]}
  args={[0.55, 0.18, 0.8]}
  radius={0.12}           // Besar (empuk)
  smoothness={16}
  color "#f8f5ec"         // Putih kekreman
/>
```

**Random offset:**
- `x`: ±0.04 unit (acak kecil)
- `z`: bertumpuk dengan offset 0.04 unit
- `rotZ`: ±0.03 radian (0.08-0.09 derajat)

---

## 📦 Files

### Created
```
src/components/furniture/models/
├── BedModel.jsx          (UPGRADED v2)
├── WrinkledBlanket.jsx   (NEW)
└── BedModelGLB.jsx       (NEW - Opsi B placeholder)
```

### Modified
```
src/components/furniture/
├── FurnitureItem.jsx     (Added USE_GLB_MODELS switch)
└── index.jsx             (Added BedModelGLB export)
```

### Created
```
public/
└── models/               (Empty - for bed.glb)
```

---

## 🔧 OPSI B — GLB Loader (Ready to Activate)

### Switch di FurnitureItem.jsx
```javascript
const USE_GLB_MODELS = {
  bed: false,  // ← Ubah ke `true` setelah bed.glb tersedia
};
```

### BedModelGLB.jsx
File sudah tersedia di `src/components/furniture/models/BedModelGLB.jsx` dengan:
- Auto-load dari `/models/bed.glb`
- Material conversion ke MeshStandardMaterial
- Shadow casting
- Scale & offset siap di-tune
- Preload otomatis

### Untuk Aktivasi Opsi B
1. Download `.glb` file ke `public/models/bed.glb`
2. Ubah `USE_GLB_MODELS.bed` ke `true`
3. Tune `MODEL_SCALE` & `MODEL_Y_OFFSET` di BedModelGLB.jsx
4. Deploy & test

---

## ⚙️ TECHNICAL DETAILS

### Vertex Displacement Algorithm
```javascript
const geometry = new THREE.PlaneGeometry(width, length, 24, 24);
const pos = geometry.attributes.position;

for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);

  // Wave noise
  const wave = sin(x * 6) * 0.015 + cos(y * 5) * 0.012 + sin((x+y) * 8) * 0.008;

  // Extra folds at head area
  if (y > length * 0.35) {
    const extra = sin(x * 10) * 0.025 + cos(x * 7 + y * 3) * 0.015;
    pos.setZ(i, wave + extra);
  } else {
    pos.setZ(i, wave);
  }
}

geometry.computeVertexNormals();
```

### Boundary Constraint Applied
- Furniture tidak keluar rumah (HOUSE_BOUNDS)
- Y position tetap 0 (nempel lantai)
- Grid snap 0.25 unit

---

## 📊 Build Metrics

```
Modules: 601 (naik dari 599)
JS: 1,269.96 kB (gzip: 356.51 kB)
Build Time: 413ms
Status: ✅ SUCCESS
```

---

## 🎮 Testing Instructions

1. Buka http://localhost:5173
2. Clear localStorage
3. Buka /editor
4. Pilih "Kasur" di sidebar
5. Klik lantai → kasur muncul dengan:
   - Rangka kayu gelap
   - Kasur putih/krem dengan rounded corners
   - Selimut abu-abu bergelombang (terlihat wrinkled)
   - 3 bantal di atasnya
6. Drag kasur → boundary clamp aktif
7. Drag ke furniture lain → collision detection merah
8. Buka / → kasur muncul di preview read-only

---

## 📝 Known Limitations (Opsi A)

1. **Wrinkle detail**: Mesh displacement sederhana, tidak se-realistic fold kain sebenarnya
2. **Material**: Kain tidak memiliki fabric shader khusus
3. **Animation**: Tidak ada cloth simulation (vertex displacement statis)
4. **Lighting dependency**: Wrinkle hanya terlihat jelas dengan directional light yang tepat

---

## 🔄 Migration Path to Opsi B

Jika inginkan hasil lebih realistis:
1. Download `bed.glb` dari Poly Haven / Sketchfab
2. Taruh ke `public/models/bed.glb`
3. Ubah `USE_GLB_MODELS.bed = true`
4. Tune scale/offset
5. Test drag & collision tetap berfungsi

Semua furniture lain (chair, table, sofa) bisa di-upgrade ke GLB dengan pola yang sama.

---

**Created**: 2026-08-28  
**Version**: 1.0.0  
**Author**: Rumah3D Project
