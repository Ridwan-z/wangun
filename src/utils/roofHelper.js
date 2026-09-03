import { TILE_SIZE, pieceFootprint } from '../data/houseConfig';
import { wallLevel, wallBaseY } from './buildHelper';

// ===== Validasi penempatan piece atap =====
// Rule atap berbeda dari piece lain: lantai butuh tanah bebas, tembok
// butuh lantai di bawah, furniture butuh lantai — atap butuh TEMBOK di
// cell yang sama (tidak harus membentuk ruangan tertutup).

// Apakah ada minimal satu segmen tembok pada cell grid (cellX, cellZ).
// Tembok tipis (0.2 m) selalu menempel rata pada garis grid sehingga
// menembus 0.1 m ke cell di kedua sisinya — keduanya dihitung punya tembok.
export function isRoofPlaceable(cellX, cellZ, walls) {
  const cellMinX = cellX * TILE_SIZE;
  const cellMaxX = (cellX + 1) * TILE_SIZE;
  const cellMinZ = cellZ * TILE_SIZE;
  const cellMaxZ = (cellZ + 1) * TILE_SIZE;

  return walls.some((piece) => {
    if (!piece || piece.kind !== 'wall') return false;
    const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
    const [x, , z] = piece.position;
    // Overlap AABB tembok dengan kotak cell (strict: menyentuh tepi saja
    // dari luar tidak dihitung)
    return (
      x - fp[0] / 2 < cellMaxX &&
      x + fp[0] / 2 > cellMinX &&
      z - fp[1] / 2 < cellMaxZ &&
      z + fp[1] / 2 > cellMinZ
    );
  });
}

// Sel-sel grid yang tertutup piece (posisi selalu snapped ke grid,
// sehingga indeks eksak — pola sama dengan buildHelper)
function coveredGridCells(position, footprint) {
  const [x, , z] = position;
  const ix0 = Math.round((x - footprint[0] / 2) / TILE_SIZE);
  const iz0 = Math.round((z - footprint[1] / 2) / TILE_SIZE);
  const nx = Math.max(1, Math.round(footprint[0] / TILE_SIZE));
  const nz = Math.max(1, Math.round(footprint[1] / TILE_SIZE));

  const cells = [];
  for (let ix = ix0; ix < ix0 + nx; ix++) {
    for (let iz = iz0; iz < iz0 + nz; iz++) {
      cells.push([ix, iz]);
    }
  }
  return cells;
}

// Validasi placement piece atap: SETIAP cell yang tertutup piece wajib
// punya minimal satu segmen tembok (bukan area tertutup — tembok acak
// pun valid selama posisinya cocok)
export function isRoofPlacementValid(position, footprint, pieces) {
  const walls = pieces.filter((p) => p.kind === 'wall');
  return coveredGridCells(position, footprint).every(([ix, iz]) =>
    isRoofPlaceable(ix, iz, walls)
  );
}

// Tinggi dasar (Y) piece atap = ujung atas tembok TERTINGGI yang menaungi
// cell piece — atap "menempel" sebagai lapisan baru di atas tembok,
// termasuk di rumah bertingkat (tembok level N → atap di (N+1) × tinggi).
// Tanpa tembok = kembali ke tinggi tembok dasar (dipakai ghost merah).
export function roofPieceBaseY(position, footprint, pieces) {
  const [x, , z] = position;
  const minX = x - footprint[0] / 2;
  const maxX = x + footprint[0] / 2;
  const minZ = z - footprint[1] / 2;
  const maxZ = z + footprint[1] / 2;

  let maxLevel = 0;
  pieces.forEach((piece) => {
    if (piece.kind !== 'wall') return;
    const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
    const [wx, , wz] = piece.position;
    const overlaps =
      wx - fp[0] / 2 < maxX &&
      wx + fp[0] / 2 > minX &&
      wz - fp[1] / 2 < maxZ &&
      wz + fp[1] / 2 > minZ;
    if (overlaps) maxLevel = Math.max(maxLevel, wallLevel(piece));
  });

  return wallBaseY(maxLevel + 1);
}
