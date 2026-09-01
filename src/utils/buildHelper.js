import { TILE_SIZE, WALL_HEIGHT, pieceFootprint } from '../data/houseConfig';
import { getCatalogSizeByType } from './boundsHelper';

// Kunci sel grid dari sebuah titik (sel i mencakup [i*1.25, (i+1)*1.25))
function cellKeyAt(x, z) {
  return `${Math.floor(x / TILE_SIZE)},${Math.floor(z / TILE_SIZE)}`;
}

// Sel-sel grid yang tertutup piece (posisi piece selalu snapped ke grid,
// sehingga perhitungan indeks eksak)
function coveredCells(position, footprint) {
  const [x, , z] = position;
  const ix0 = Math.round((x - footprint[0] / 2) / TILE_SIZE);
  const iz0 = Math.round((z - footprint[1] / 2) / TILE_SIZE);
  const nx = Math.round(footprint[0] / TILE_SIZE);
  const nz = Math.round(footprint[1] / TILE_SIZE);

  const cells = [];
  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      cells.push(`${ix0 + ix},${iz0 + iz}`);
    }
  }
  return cells;
}

// Apakah seluruh alas furniture berada di atas ubin yang terpasang.
// Dicek via 4 sudut (di-inset sedikit) + titik tengah agar furniture
// yang kecil pun selalu menghasilkan sampel yang valid.
export function isOnFloor(position, size, floorPieces) {
  const eps = 0.02;
  const [cx, , cz] = position;
  const halfW = Math.max(size[0] / 2 - eps, eps);
  const halfD = Math.max(size[2] / 2 - eps, eps);

  const samples = [
    [cx - halfW, cz - halfD],
    [cx + halfW, cz - halfD],
    [cx - halfW, cz + halfD],
    [cx + halfW, cz + halfD],
    [cx, cz],
  ];

  const covered = new Set();
  floorPieces.forEach((piece) => {
    const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
    coveredCells(piece.position, fp).forEach((c) => covered.add(c));
  });

  return samples.every(([x, z]) => covered.has(cellKeyAt(x, z)));
}

// Apakah piece (tembok/lantai) berdiri di atas ubin lantai terpasang.
// Cek 4 sudut + tengah footprint piece (dengan inset kecil).
// Lantai sendiri selalu lolos karena diletakkan langsung di tanah.
// Konsisten dengan anchor grid-edge di snapPieceCenter: seluruh muka
// tembok terletak tepat pada garis grid, sehingga sampel (di-inset ke
// dalam footprint) selalu jatuh pada sel lantai yang sama — tembok yang
// menempel rata di tepi lantai lolos, yang menjorok keluar ditolak.
export function isPieceOnFloor(position, kind, size, rotation, pieces) {
  if (kind !== 'wall') return true;

  const eps = 0.02;
  const fp = pieceFootprint(kind, size, rotation);
  const [cx, , cz] = position;
  const halfW = Math.max(fp[0] / 2 - eps, eps);
  const halfD = Math.max(fp[1] / 2 - eps, eps);

  const samples = [
    [cx - halfW, cz - halfD],
    [cx + halfW, cz - halfD],
    [cx - halfW, cz + halfD],
    [cx + halfW, cz + halfD],
    [cx, cz],
  ];

  const covered = new Set();
  pieces.forEach((piece) => {
    if (piece.kind !== 'floor') return;
    const otherFp = pieceFootprint(piece.kind, piece.size, piece.rotation);
    coveredCells(piece.position, otherFp).forEach((c) => covered.add(c));
  });

  return samples.every(([x, z]) => covered.has(cellKeyAt(x, z)));
}

// Overlap AABB antara dua piece (dengan toleransi epsilon)
function aabbOverlap(posA, fpA, posB, fpB) {
  const eps = 0.01;
  const overlapX =
    Math.abs(posA[0] - posB[0]) < (fpA[0] + fpB[0]) / 2 - eps;
  const overlapZ =
    Math.abs(posA[2] - posB[2]) < (fpA[1] + fpB[1]) / 2 - eps;
  return overlapX && overlapZ;
}

// Cek piece baru/pindahan menabrak piece lain sejenis
export function collidesWithPieces(position, kind, size, rotation, pieces, excludeId = null) {
  const fp = pieceFootprint(kind, size, rotation);
  return pieces.some((piece) => {
    if (piece.id === excludeId || piece.kind !== kind) return false;
    const otherFp = pieceFootprint(piece.kind, piece.size, piece.rotation);
    return aabbOverlap(position, fp, piece.position, otherFp);
  });
}

// Cek furniture (footprint alas) menabrak tembok terpasang.
// Hanya tembok level dasar (level 0) yang menghalangi furniture;
// tembok bertingkat berada di atas dan tidak boleh memblokir alas.
export function collidesWithWalls(position, size, wallPieces, excludeId = null) {
  const fp = [size[0], size[2]];
  return wallPieces.some((piece) => {
    if (wallLevel(piece) !== 0) return false;
    const wallFp = pieceFootprint(
      piece.kind,
      piece.size,
      piece.rotation
    );
    const wallFootprint = [wallFp[0], wallFp[1]];
    return aabbOverlap(position, fp, piece.position, wallFootprint);
  });
}

// Apakah tembok pada posisi/footprint tertentu menembus furniture yang
// sudah ada. Hanya relevan untuk tembok level dasar (level 0) — tembok
// bertingkat berada di atas jangkauan furniture.
export function wallHitsFurniture(position, size, rotation, furnitureItems) {
  const fp = pieceFootprint('wall', size, rotation);
  return furnitureItems.some((item) => {
    const otherSize = getCatalogSizeByType(item.type);
    return aabbOverlap(position, fp, item.position, [otherSize[0], otherSize[2]]);
  });
}

// Tabrakan furniture dengan furniture (untuk drag)
export function willCollideWithOthers(newPos, size, furnitureItems, excludeId) {
  const fp = [size[0], size[2]];
  return furnitureItems.some((item) => {
    if (item.id === excludeId) return false;
    const otherSize = getCatalogSizeByType(item.type);
    return aabbOverlap(newPos, fp, item.position, [otherSize[0], otherSize[2]]);
  });
}

// ===== Sistem bertingkat untuk tembok =====
// Tembok level 0 berdiri di tanah/lantai; tembok level N (N >= 1) harus
// ditopang penuh oleh tembok level N-1 (footprint baru berada di dalam
// gabungan footprint penopang). Menaruh tembok di tempat yang sudah ada
// tembok se-level & se-orientasi otomatis menumpuknya di level berikutnya.
// Level disimpan di piece.level (data lama tanpa level = 0).

export const MAX_WALL_LEVELS = 5;

// Level tembok dari piece (data lama tanpa level = 0)
export function wallLevel(piece) {
  if (!piece || piece.kind !== 'wall') return 0;
  return piece.level || 0;
}

// Tinggi dasar tembok level tertentu (untuk posisi Y render)
export function wallBaseY(level) {
  return level * WALL_HEIGHT;
}

// Rectangle footprint sebuah piece di bidang X/Z
function rectOf(piece) {
  const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
  return {
    minX: piece.position[0] - fp[0] / 2,
    maxX: piece.position[0] + fp[0] / 2,
    minZ: piece.position[2] - fp[1] / 2,
    maxZ: piece.position[2] + fp[1] / 2,
  };
}

// Sampel titik di sepanjang satu sumbu footprint
function sampleAxis(min, max, inset) {
  const lo = min + inset;
  const hi = max - inset;
  if (hi <= lo) return [(min + max) / 2];
  const span = hi - lo;
  const n = Math.max(1, Math.ceil(span / 0.1));
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(lo + (span * i) / n);
  return pts;
}

// Apakah seluruh footprint (X/Z) berada di dalam gabungan supportRects.
// Semua piece grid-aligned & axis-aligned sehingga cukup dicek per titik.
function isFootprintSupported(position, fp, supportRects) {
  const tol = 1e-6;
  const [cx, , cz] = position;
  const xs = sampleAxis(cx - fp[0] / 2, cx + fp[0] / 2, 0.02);
  const zs = sampleAxis(cz - fp[1] / 2, cz + fp[1] / 2, 0.02);

  return xs.every((px) =>
    zs.every((pz) =>
      supportRects.some(
        (r) =>
          px >= r.minX - tol && px <= r.maxX + tol &&
          pz >= r.minZ - tol && pz <= r.maxZ + tol
      )
    )
  );
}

// Penopang tembok: level 0 = lantai terpasang, level N = tembok level N-1
function supportRectsFor(level, pieces) {
  if (level === 0) {
    return pieces.filter((p) => p.kind === 'floor').map(rectOf);
  }
  return pieces
    .filter((p) => p.kind === 'wall' && wallLevel(p) === level - 1)
    .map(rectOf);
}

// Apakah tembok punya penopang pada level-nya
export function hasWallSupport(piece, pieces) {
  if (piece.kind !== 'wall') return true;
  const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
  const support = supportRectsFor(wallLevel(piece), pieces);
  return isFootprintSupported(piece.position, fp, support);
}

// Level pemasangan tembok di posisi tertentu: level bebas pertama.
// - Level 0 butuh lantai di bawah footprint penuh.
// - Level N butuh tembok level N-1 yang menopang footprint penuh.
// - Se-level, tembok se-orientasi tidak boleh beririsan (koplanar) —
//   kalau beririsan, pemasangan otomatis naik ke level berikutnya
//   (menumpuk). Tembok tegak lurus boleh bersilangan (pojok).
// return -1 jika tidak ada level valid.
export function findWallPlacementLevel(position, size, rotation, pieces) {
  const fp = pieceFootprint('wall', size, rotation);
  const horizontal = rotation !== 'v';

  for (let level = 0; level <= MAX_WALL_LEVELS; level++) {
    const support = supportRectsFor(level, pieces);
    if (!isFootprintSupported(position, fp, support)) return -1;

    const coplanar = pieces.some((p) => {
      if (p.kind !== 'wall' || wallLevel(p) !== level) return false;
      if ((p.rotation !== 'v') !== horizontal) return false;
      const otherFp = pieceFootprint(p.kind, p.size, p.rotation);
      return aabbOverlap(position, fp, p.position, otherFp);
    });
    if (!coplanar) return level;
  }
  return -1;
}

// Bolehkah piece dibongkar? Diblokir bila penghapusan membuat furniture
// atau tembok lain kehilangan penopangnya.
export function canRemovePiece(pieceId, pieces, furnitureItems = []) {
  const target = pieces.find((p) => p.id === pieceId);
  if (!target) return true;
  const remaining = pieces.filter((p) => p.id !== pieceId);

  // Furniture yang berdiri di atas lantai ini jadi melayang?
  if (target.kind === 'floor') {
    const floorsBefore = pieces.filter((p) => p.kind === 'floor');
    const floorsAfter = remaining.filter((p) => p.kind === 'floor');
    const blocked = furnitureItems.some((item) => {
      const size = getCatalogSizeByType(item.type);
      return (
        isOnFloor(item.position, size, floorsBefore) &&
        !isOnFloor(item.position, size, floorsAfter)
      );
    });
    if (blocked) return false;
  }

  // Tembok lain kehilangan penopang akibat penghapusan ini?
  const wallFalls = pieces.some((p) => {
    if (p.kind !== 'wall' || p.id === pieceId) return false;
    return hasWallSupport(p, pieces) && !hasWallSupport(p, remaining);
  });

  return !wallFalls;
}
