import { useMemo, useRef, useEffect } from 'react';
import {
  TILE_SIZE,
  TILE_LONG_LENGTH,
  WALL_HEIGHT,
  PLOT_SIZE,
  pieceFootprint,
} from '../../data/houseConfig';
import { useHouseStore } from '../../store/useHouseStore';
import { wallLevel, wallBaseY } from '../../utils/buildHelper';

// Penanda piece (tembok/lantai) terpilih: warna sama dengan highlight
// seleksi furniture (#FFD700) agar perbedaannya jelas terlihat
const PIECE_SELECTED_COLOR = '#FFD700';
const PIECE_SELECTED_INTENSITY = 0.35;

function usePieceHighlight(materialRef, isSelected) {
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

function FloorPiece({
  piece,
  editable,
  selectable,
  allowPieceContextMenu,
  isSelected,
  onSelect,
  onRemove,
}) {
  const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
  const materialRef = useRef();

  usePieceHighlight(materialRef, isSelected);

  return (
    <mesh
      position={[piece.position[0], -0.025, piece.position[2]]}
      receiveShadow
      onClick={
        selectable
          ? (e) => {
              e.stopPropagation();
              onSelect?.(piece.id);
            }
          : undefined
      }
      onContextMenu={
        editable && allowPieceContextMenu
          ? (e) => {
              e.stopPropagation();
              onRemove?.(piece.id);
            }
          : undefined
      }
    >
      <boxGeometry args={[fp[0] - 0.03, 0.05, fp[1] - 0.03]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#C9AE8A"
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
}

function WallPiece({
  piece,
  editable,
  selectable,
  allowPieceContextMenu,
  isSelected,
  onSelect,
  onRemove,
}) {
  const fp = pieceFootprint(piece.kind, piece.size, piece.rotation);
  const materialRef = useRef();

  usePieceHighlight(materialRef, isSelected);

  // Tembok bertingkat: dasar tembok = level * tinggi tembok
  const baseY = wallBaseY(wallLevel(piece));

  return (
    <mesh
      position={[piece.position[0], baseY + WALL_HEIGHT / 2, piece.position[2]]}
      castShadow
      receiveShadow
      onClick={
        selectable
          ? (e) => {
              e.stopPropagation();
              onSelect?.(piece.id);
            }
          : undefined
      }
      onContextMenu={
        editable && allowPieceContextMenu
          ? (e) => {
              e.stopPropagation();
              onRemove?.(piece.id);
            }
          : undefined
      }
    >
      <boxGeometry args={[fp[0], WALL_HEIGHT, fp[1]]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#F5F5DC"
        roughness={0.7}
        metalness={0}
      />
    </mesh>
  );
}

export function HouseShell({
  editable = false,
  selectable = false,
  allowPieceContextMenu = true,
  selectedPieceId = null,
  onSelectPiece,
  onRemovePiece,
}) {
  const buildPieces = useHouseStore((state) => state.buildPieces);
  const removePiece = useHouseStore((state) => state.removePiece);

  const floorPieces = useMemo(
    () => buildPieces.filter((p) => p.kind === 'floor'),
    [buildPieces]
  );
  const wallPieces = useMemo(
    () => buildPieces.filter((p) => p.kind === 'wall'),
    [buildPieces]
  );

  return (
    <group>
      {/* Tanah + garis grid bantu area bangun */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[PLOT_SIZE + 20, PLOT_SIZE + 20]} />
        <meshStandardMaterial color="#8A9A7B" roughness={0.9} />
      </mesh>
      <gridHelper args={[PLOT_SIZE, PLOT_SIZE / TILE_SIZE, '#9E9E9E', '#C7C7C7']} position={[0, -0.06, 0]} />

      {/* Lantai terpasang */}
      {floorPieces.map((piece) => (
        <FloorPiece
          key={piece.id}
          piece={piece}
          editable={editable}
          selectable={selectable}
          allowPieceContextMenu={allowPieceContextMenu}
          isSelected={selectedPieceId === piece.id}
          onSelect={onSelectPiece}
          onRemove={onRemovePiece || removePiece}
        />
      ))}

      {/* Tembok terpasang */}
      {wallPieces.map((piece) => (
        <WallPiece
          key={piece.id}
          piece={piece}
          editable={editable}
          selectable={selectable}
          allowPieceContextMenu={allowPieceContextMenu}
          isSelected={selectedPieceId === piece.id}
          onSelect={onSelectPiece}
          onRemove={onRemovePiece || removePiece}
        />
      ))}
    </group>
  );
}

export { TILE_LONG_LENGTH };
