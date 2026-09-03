import { useEffect } from 'react';

// Penanda piece (tembok/lantai/atap) terpilih: warna kuning #FFD700,
// sama dengan highlight seleksi furniture — diambil dari HouseShell
// agar bisa dipakai lintas komponen piece.
export const PIECE_SELECTED_COLOR = '#FFD700';
export const PIECE_SELECTED_INTENSITY = 0.35;

// Hook highlight material piece terpilih (dipakai FloorPiece,
// WallPiece, dan RoofPiece)
export function usePieceHighlight(materialRef, isSelected) {
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    if (isSelected) {
      mat.emissive.set(PIECE_SELECTED_COLOR);
      mat.emissiveIntensity = PIECE_SELECTED_INTENSITY;
    } else {
      mat.emissive.set('#000000');
      mat.emissiveIntensity = 1;
    }
  }, [materialRef, isSelected]);
}
