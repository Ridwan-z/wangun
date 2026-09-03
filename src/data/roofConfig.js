// ===== Katalog & konstanta piece atap =====
// Piece atap modular: dipasang per piece mengikuti grid yang sama dengan
// lantai/tembok (persegi 1.25 × 1.25 m, panjang 3.75 × 1.25 m), dengan
// validasi penempatan sendiri — wajib ada tembok di cell yang sama.

export const ROOF_PIECE_THICKNESS = 0.14; // tebal lempeng atap datar (meter)

// Tinggi lereng piece miring = lebar ubin × rasio (proporsional grid)
export const ROOF_PIECE_PITCH_RATIO = 0.45;

export function roofPiecePitch() {
  return ROOF_PIECE_PITCH_RATIO * 1.25;
}

// ===== Daftar model bentuk piece atap =====
export const ROOF_MODELS = [
  {
    key: 'datar',
    label: 'Atap Datar',
    sub: 'Lempeng rata',
    color: '#A85538',
  },
  {
    key: 'kiri',
    label: 'Atap Miring Kiri',
    sub: 'Lereng turun ke kiri',
    color: '#B65C3E',
  },
  {
    key: 'kanan',
    label: 'Atap Miring Kanan',
    sub: 'Lereng turun ke kanan',
    color: '#B65C3E',
  },
  {
    key: 'limas',
    label: 'Atap Limas Sudut',
    sub: 'Sudut/pojok limas',
    color: '#9C4F30',
  },
];

export function getRoofModel(key) {
  return ROOF_MODELS.find((m) => m.key === key) || ROOF_MODELS[0];
}
