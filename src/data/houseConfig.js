// ===== Konstanta piece bangunan =====

// Ubin persegi: 1/8 dari lantai default 10m
export const TILE_SIZE = 1.25;

// Ubin panjang: ubin persegi dijejer 3
export const TILE_LONG_LENGTH = TILE_SIZE * 3;

export const WALL_HEIGHT = 3;
export const WALL_THICKNESS = 0.2;

export const GRID_UNIT = TILE_SIZE;

// Lantai awal 8x8 ubin (10 x 10 m)
export const DEFAULT_TILES = 8;

// Area maksimal untuk membangun (meter, dari pusat)
export const PLOT_BOUNDS = {
  minX: -10,
  maxX: 10,
  minZ: -10,
  maxZ: 10,
};

export const PLOT_SIZE = 20;

// ===== Helper =====

// Footprint [lebar, kedalaman] piece di lantai (X, Z)
// kind: 'floor' | 'wall', size: 'square' | 'long', rotation: 'h' | 'v'
export function pieceFootprint(kind, size, rotation) {
  const horizontal = rotation !== 'v';
  const length = size === 'long' ? TILE_LONG_LENGTH : TILE_SIZE;

  if (kind === 'wall') {
    return horizontal
      ? [length, WALL_THICKNESS]
      : [WALL_THICKNESS, length];
  }
  return horizontal ? [length, TILE_SIZE] : [TILE_SIZE, length];
}

// Snap posisi tengah piece agar menempel pada GARIS GRID 1.25m (grid edge),
// bukan titik tengah ubin:
// - Sumbu selebar >= 1 sel (lantai & panjang tembok): tepi awal piece
//   dijajarkan ke garis grid terdekat.
// - Sumbu tipis (ketebalan tembok 0.2m): tembok ditempelkan ke tepi sel
//   yang di-hover yang PALING DEKAT dari posisi pointer, sehingga sisi
//   luar tembok rata persis dengan tepi ubin/lantai tanpa menjorok keluar.
export function snapPieceCenter(x, z, footprint) {
  const EPS = 1e-6;

  const snapAxis = (v, size) => {
    if (size >= TILE_SIZE - EPS) {
      // Selebar sel penuh atau lebih: jajarkan tepi awal ke garis grid
      return Math.round((v - size / 2) / GRID_UNIT) * GRID_UNIT + size / 2;
    }

    // Sumbu tipis: pilih tepi sel (grid edge) terdekat dari pointer
    const cellMin = Math.floor(v / GRID_UNIT) * GRID_UNIT;
    const distToMin = v - cellMin;
    const distToMax = cellMin + GRID_UNIT - v;
    return distToMin <= distToMax
      ? cellMin + size / 2
      : cellMin + GRID_UNIT - size / 2;
  };

  return [snapAxis(x, footprint[0]), snapAxis(z, footprint[1])];
}

// Cek piece muat penuh di dalam area bangun
export function isPieceWithinPlot(position, footprint) {
  const [x, , z] = position;
  const halfW = footprint[0] / 2;
  const halfD = footprint[1] / 2;
  return (
    x - halfW >= PLOT_BOUNDS.minX &&
    x + halfW <= PLOT_BOUNDS.maxX &&
    z - halfD >= PLOT_BOUNDS.minZ &&
    z + halfD <= PLOT_BOUNDS.maxZ
  );
}

// Lantai default 8x8 ubin persegi
export function generateDefaultFloor() {
  const pieces = [];
  const half = (DEFAULT_TILES * TILE_SIZE) / 2;
  let id = 1;

  for (let iz = 0; iz < DEFAULT_TILES; iz++) {
    for (let ix = 0; ix < DEFAULT_TILES; ix++) {
      pieces.push({
        id: id++,
        kind: 'floor',
        size: 'square',
        rotation: 'h',
        position: [
          -half + TILE_SIZE * (ix + 0.5),
          0,
          -half + TILE_SIZE * (iz + 0.5),
        ],
      });
    }
  }
  return pieces;
}

export const DEFAULT_FLOOR_COUNT = DEFAULT_TILES * DEFAULT_TILES;
