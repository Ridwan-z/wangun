import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  generateDefaultFloor,
  pieceFootprint,
  isPieceWithinPlot,
} from '../data/houseConfig';
import {
  collidesWithPieces,
  findWallPlacementLevel,
  canRemovePiece,
  wallHitsFurniture,
} from '../utils/buildHelper';
import { clampToPlotBounds, getCatalogSizeByType } from '../utils/boundsHelper';

export const useHouseStore = create(
  persist(
    (set, get) => ({
      furnitureItems: [],

      // Piece bangunan: lantai & tembok hasil bongkar pasang
      buildPieces: generateDefaultFloor(),

      addPiece: (kind, size, rotation, position) => {
        const fp = pieceFootprint(kind, size, rotation);
        const snapped = [position[0], 0, position[2]];

        if (!isPieceWithinPlot(snapped, fp)) return false;

        const pieces = get().buildPieces;

        // Lantai tidak boleh tumpang tindih lantai lain
        if (
          kind === 'floor' &&
          collidesWithPieces(snapped, kind, size, rotation, pieces)
        )
          return false;

        // Tembok: cari level bebas — di atas lantai, atau menumpuk
        // tembok yang sudah ada di tempat yang sama (bangun bertingkat)
        let level = 0;
        if (kind === 'wall') {
          level = findWallPlacementLevel(snapped, size, rotation, pieces);
          if (level < 0) return false;
          // Tembok lantai dasar tidak boleh menembus furniture
          if (
            level === 0 &&
            wallHitsFurniture(snapped, size, rotation, get().furnitureItems)
          )
            return false;
        }

        const piece = {
          id: `piece-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind,
          size,
          rotation,
          position: snapped,
        };
        if (kind === 'wall') piece.level = level;
        set((state) => ({
          buildPieces: [...state.buildPieces, piece],
        }));
        return true;
      },

      removePiece: (id) => {
        // Tolak bongkar bila piece masih menopang furniture/tembok lain
        if (!canRemovePiece(id, get().buildPieces, get().furnitureItems))
          return false;
        set((state) => ({
          buildPieces: state.buildPieces.filter((p) => p.id !== id),
        }));
        return true;
      },

      addFurniture: (type, position) => {
        const newItem = {
          id: Date.now(),
          type,
          position,
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        };
        set((state) => ({
          furnitureItems: [...state.furnitureItems, newItem],
        }));
      },

      updateFurniture: (id, updates) => {
        set((state) => ({
          furnitureItems: state.furnitureItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeFurniture: (id) => {
        set((state) => ({
          furnitureItems: state.furnitureItems.filter((item) => item.id !== id),
        }));
      },

      // Clamp semua furniture tetap di dalam area bangun
      reclampFurniture: () => {
        const { furnitureItems } = get();
        set({
          furnitureItems: furnitureItems.map((item) => {
            const size = getCatalogSizeByType(item.type);
            const [x, , z] = item.position;
            const [cx, cz] = clampToPlotBounds(x, z, size[0] / 2, size[2] / 2);
            return { ...item, position: [cx, 0, cz] };
          }),
        });
      },
    }),
    {
      name: 'rumah3d-furniture',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
      // buildPieces ikut tersimpan; bila belum ada (data lama), isi default
      merge: (persisted, current) => {
        const merged = { ...current, ...persisted };
        if (!Array.isArray(merged.buildPieces)) {
          merged.buildPieces = generateDefaultFloor();
        }
        return merged;
      },
    }
  )
);
