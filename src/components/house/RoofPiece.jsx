import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TILE_SIZE, TILE_LONG_LENGTH, WALL_HEIGHT } from '../../data/houseConfig';
import { ROOF_PIECE_THICKNESS, roofPiecePitch, getRoofModel } from '../../data/roofConfig';
import { usePieceHighlight } from '../../utils/usePieceHighlight';

// Geometry per model piece atap. Semua berpusat di X/Z dan berdiri pada
// y = 0 (dasar piece) sehingga posisi mesh cukup piece.baseY.
// Local X = sumbu panjang/buburang, local Z = arah lereng:
// "kiri" = lereng turun ke -Z, "kanan" = turun ke +Z (pasangan cermin
// untuk menyusun pelana). Rotasi 'v' memutar piece 90° sehingga lereng
// menghadap sumbu X dunia.
export function buildRoofPieceGeometry(model, size) {
  const width = size === 'long' ? TILE_LONG_LENGTH : TILE_SIZE; // X lokal
  const depth = TILE_SIZE; // Z lokal (arah lereng)
  const pitch = roofPiecePitch();

  // Atap Datar — lempeng rata
  if (model === 'datar') {
    const geometry = new THREE.BoxGeometry(width, ROOF_PIECE_THICKNESS, depth);
    geometry.translate(0, ROOF_PIECE_THICKNESS / 2, 0);
    return geometry;
  }

  // Atap Limas Sudut — setengah piramida: puncak di atas titik tengah
  // sisi +X, muka diagonal menjadi lereng hip menghadap -X
  if (model === 'limas') {
    const w2 = width / 2;
    const d2 = depth / 2;
    // A(-x,-z) B(+x,-z) C(+x,+z) D(-x,+z), T = puncak di atas sisi +X
    const A = [-w2, 0, -d2];
    const B = [w2, 0, -d2];
    const C = [w2, 0, d2];
    const D = [-w2, 0, d2];
    const T = [w2, pitch, 0];
    const verts = [
      ...A, ...B, ...C, // alas
      ...A, ...C, ...D, // alas
      ...A, ...T, ...B, // lereng utara (-Z)
      ...B, ...T, ...C, // muka tegak (+X)
      ...C, ...T, ...D, // lereng selatan (+Z)
      ...D, ...T, ...A, // lereng hip diagonal (-X)
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  // Atap Miring Kiri / Kanan — prisma segitiga hasil ekstrusi profil;
  // profil digambar di bidang shape-XY lalu dirotasi agar shape X → -Z
  // dunia dan arah ekstrusi → sumbu X dunia (panjang piece)
  const shape = new THREE.Shape();
  shape.moveTo(-depth / 2, 0);
  shape.lineTo(depth / 2, 0);
  if (model === 'kiri') {
    shape.lineTo(-depth / 2, pitch); // tinggi di +Z dunia, turun ke -Z
  } else {
    shape.lineTo(depth / 2, pitch); // cermin: tinggi di -Z, turun ke +Z
  }
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -width / 2);
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

function RoofPiece({
  piece,
  editable = false,
  selectable = false,
  allowPieceContextMenu = true,
  isSelected = false,
  onSelect,
  onRemove,
}) {
  const model = getRoofModel(piece.model);
  const materialRef = useRef();

  usePieceHighlight(materialRef, isSelected);

  const geometry = useMemo(
    () => buildRoofPieceGeometry(piece.model, piece.size),
    [piece.model, piece.size]
  );

  // Bebaskan geometry dari GPU saat piece terbongkar / ganti bentuk
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[piece.position[0], piece.baseY ?? WALL_HEIGHT, piece.position[2]]}
      rotation={[0, piece.rotation === 'v' ? Math.PI / 2 : 0, 0]}
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
      <meshStandardMaterial
        ref={materialRef}
        color={model.color}
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>
  );
}

export { RoofPiece };
