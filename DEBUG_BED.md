# 🛏️ BedModelGLB — Debugging Instructions

## Issue: Kasur Masih Melayang

### Langkah-Langkah Debug

1. **Buka browser** → http://localhost:5173
2. **Buka DevTools** (F12) → pilih tab **Console**
3. **Clear console** (tombol 🗑️ di console panel)
4. Buka `/editor`, pilih furniture **Kasur**, **klik lantai** untuk menambahkan
5. **Cek console** — cari log berikut:

```
--- BedModelGLB Debug ---
Bounding box size: { x: ?, y: ?, z: ? }
Bounding box center: { x: ?, y: ?, z: ? }
Bounding box min: { x: ?, y: ?, z: ? }
Bounding box max: { x: ?, y: ?, z: ? }
```

6. **Salin-paste hasil log** ini, lalu adjust scale berdasarkan nilai Y di atas

---

## 📊 Scale Adjustment Guide

| Model Units | Contoh Size Y | Scale yang Dicoba | Keterangan |
|-------------|-----------------|--------------------|------------|
| Meter | ~1.5 (terlalu besar) | `1.0` | Default, mungkin butuh turun |
| Meter | ~0.5 (sepadan dengan rumah) | `1.0` | ✅ Pas |
| CM | ~150 (terlalu besar) | `0.01` | Untuk unit cm |
| CM | ~50 (terlalu kecil) | `0.05` | Untuk unit cm kecil |

### Test Scale Bertahap

| Scale | Hasil |
|-------|-------|
| `1.0` | Jika model dalam meter |
| `0.5` | Setengah ukuran |
| `0.1` | Ukuran kecil |
| `0.01` | Jika model dalam cm |
| `2.0` | Jika ada (untuk model kecil) |

---

## 🔧 Offset Otomatis (Sudah Fix)

Kode sudah otomatis menghitung Y offset berdasarkan bounding box:

```javascript
const calculatedYOffset = -boundingInfo.min.y * DEFAULT_SCALE;
// Position so bottom of model sits at Y=0
```

Ini memastikan dasar kasur selalu menyentuh lantai, tidak melayang.

---

## 🐛 Jika Kasur Masih Melayang

Kemungkinan penyebab & solusi:

1. **Bounding box tidak akurat**
   - Model punya geometry di luar bounding box asli
   - Solusi: scale dulu, cek log, lalu adjust

2. **Scale terlalu kecil/kosong**
   - Model kehilangan detail atau tidak terlihat
   - Solusi: naikkan scale sampai kelihatan

3. **Pivot point tidak di dasar model**
   - Model asli pivotnya di tengah, bukan di bawah
   - Solusi: offset otomatis sudah handle ini (-min.y * scale)

---

## 📝 Report Bug Template

Setelah test, beri tahu:

```bash
Scale: [nilai yang dicoba]
Log output:
  Bounding box size: { x: X, y: Y, z: Z }
  Bounding box min: { x: X, y: Y, z: Z }
Result: [kasur terlalu besar/kecil/melayang/tenggelam]
Recommended scale: [Y / desiredHeight]
```

Contoh:
```
Scale: 1.0
Log output:
  Bounding box size: { x: 2.0, y: 2.5, z: 2.1 }
  Bounding box min: { x: -1.0, y: -1.2, z: -1.05 }
Result: kasur terlalu besar, tapi Y sudah benar (offset = 1.2)
Recommended scale: [3.0 (tinggi rumah)] / [2.5 (model height)] ≈ 1.2
```

---

**Setelah kamu beri hasil log, saya akan langsung update DEFAULT_SCALE dan MODEL_Y_OFFSET ke nilai yang tepat.** 🚀
