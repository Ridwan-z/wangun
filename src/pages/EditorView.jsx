import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import { HouseShell } from '../components/house/HouseShell';
import { SceneLighting } from '../components/house/SceneLighting';
import { buildRoofPieceGeometry } from '../components/house/RoofPiece';
import { FurniturePicker } from '../components/ui/FurniturePicker';
import { BuildPanel, getBuildTool, getRoofTool } from '../components/ui/BuildPanel';
import { PencilMark } from '../components/ui/BlueprintIcons';
import { FurnitureItemInteractive } from '../components/furniture/FurnitureItemInteractive';
import { FurnitureModel } from '../components/furniture/FurnitureModel';
import { getFurnitureConfig, furnitureCatalog } from '../data/furnitureCatalog';
import {
  WALL_HEIGHT,
  PLOT_SIZE,
  pieceFootprint,
  snapPieceCenter,
  isPieceWithinPlot,
} from '../data/houseConfig';
import { useHouseStore } from '../store/useHouseStore';
import { clampToPlotBounds, getCatalogSizeByType } from '../utils/boundsHelper';
import {
  isRoofPlacementValid,
  roofPieceBaseY,
} from '../utils/roofHelper';
import {
  willCollideWithOthers,
  collidesWithWalls,
  collidesWithPieces,
  isOnFloor,
  findWallPlacementLevel,
  wallBaseY,
  wallHitsFurniture,
} from '../utils/buildHelper';
import './EditorView.css';

// Ghost piece atap: bentuk asli model mengikuti kursor — arah lereng
// langsung terlihat; biru saat valid, merah saat cell tanpa tembok
function RoofGhost({ ghost }) {
  const geometry = useMemo(
    () => buildRoofPieceGeometry(ghost.model, ghost.size),
    [ghost.model, ghost.size]
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      position={[ghost.x, ghost.baseY, ghost.z]}
      rotation={[0, ghost.rotation === 'v' ? Math.PI / 2 : 0, 0]}
    >
      <meshBasicMaterial
        color={ghost.valid ? '#4FC3F7' : '#E74C3C'}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  );
}

function GhostPreview({ ghost }) {
  if (!ghost) return null;
  const tool = getBuildTool(ghost.tool);
  const roofTool = getRoofTool(ghost.tool);
  const color = ghost.valid ? '#4FC3F7' : '#E74C3C';

  // Mode atap: siluet bentuk piece di atas tembok
  if (roofTool) {
    return <RoofGhost ghost={ghost} />;
  }

  const fp = pieceFootprint(tool.kind, tool.size, ghost.rotation);

  if (tool.kind === 'floor') {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ghost.x, 0.02, ghost.z]}>
        <planeGeometry args={[fp[0], fp[1]]} />
        <meshBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} />
      </mesh>
    );
  }

  return (
    <mesh position={[ghost.x, wallBaseY(ghost.level || 0) + WALL_HEIGHT / 2, ghost.z]}>
      <boxGeometry args={[fp[0], WALL_HEIGHT, fp[1]]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

// Siluet furniture yang mengikuti kursor sebelum ditempatkan:
// model asli dirender transparan; merah saat posisi tidak valid
function FurnitureGhost({ type, x, z, valid }) {
  const groupRef = useRef();
  const config = getFurnitureConfig(type);
  const size = config.size;

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    group.traverse((child) => {
      if (!child.isMesh) return;

      // Model tampil sebagai siluet: tanpa bayangan
      child.castShadow = false;
      child.receiveShadow = false;

      if (!child.material) return;
      if (!child.userData._ghostPatched) {
        // Clone material agar siluet tidak mengubah tampilan furniture asli
        // (scene GLB berbagi material antar instance)
        child.userData._ghostPatched = true;
        const makeGhost = (mat) => {
          const clone = mat.clone();
          clone.transparent = true;
          clone.opacity = 0.45;
          clone.depthWrite = false;
          return clone;
        };
        child.material = Array.isArray(child.material)
          ? child.material.map(makeGhost)
          : makeGhost(child.material);
      }

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => {
        if (!mat.emissive) return;
        const targetColor = valid ? 0x000000 : 0xe74c3c;
        if (mat.emissive.getHex() !== targetColor) mat.emissive.set(targetColor);
        const targetIntensity = valid ? 1 : 0.5;
        if (mat.emissiveIntensity !== targetIntensity) mat.emissiveIntensity = targetIntensity;
      });
    });
  });

  return (
    <group position={[x, 0, z]}>
      <FurnitureModel type={type} color={config.color} />
    </group>
  );
}

function PlacementPlane({
  buildTool,
  buildRotation,
  selectedType,
  onPlaceFurniture,
  onCancelSelection,
  onCancelBuildTool,
}) {
  const [ghost, setGhost] = useState(null);
  const [furnGhost, setFurnGhost] = useState(null);

  // Klik kanan di area kerja: batalkan build tool yang aktif
  const handleContextMenu = (e) => {
    if (!buildTool) return;
    e.stopPropagation();
    onCancelBuildTool?.();
  };

  const updateGhost = (e) => {
    if (!buildTool && !selectedType) {
      if (ghost) setGhost(null);
      if (furnGhost) setFurnGhost(null);
      return;
    }

    const state = useHouseStore.getState();

    // Mode atap: piece mengikuti grid; wajib cell ber-tembok
    if (buildTool) {
      const roofTool = getRoofTool(buildTool);
      if (roofTool) {
        const fp = pieceFootprint(roofTool.kind, roofTool.size, buildRotation);
        const [x, z] = snapPieceCenter(e.point.x, e.point.z, fp);
        const pos = [x, 0, z];
        const valid =
          isPieceWithinPlot(pos, fp) &&
          !collidesWithPieces(pos, roofTool.kind, roofTool.size, buildRotation, state.buildPieces) &&
          isRoofPlacementValid(pos, fp, state.buildPieces);
        setGhost({
          tool: buildTool,
          x,
          z,
          size: roofTool.size,
          model: roofTool.model,
          rotation: buildRotation,
          baseY: roofPieceBaseY(pos, fp, state.buildPieces),
          valid,
        });
        return;
      }

      // Mode bangun: ghost piece lantai/tembok
      const tool = getBuildTool(buildTool);
      const fp = pieceFootprint(tool.kind, tool.size, buildRotation);
      const [x, z] = snapPieceCenter(e.point.x, e.point.z, fp);

      let valid = isPieceWithinPlot([x, 0, z], fp);
      let level = 0;
      if (valid) {
        if (tool.kind === 'floor') {
          // Lantai tidak boleh tumpang tindih lantai lain
          valid = !collidesWithPieces(
            [x, 0, z],
            tool.kind,
            tool.size,
            buildRotation,
            state.buildPieces
          );
        } else {
          // Tembok: cari level bebas (di atas lantai / menumpuk tembok lain)
          level = findWallPlacementLevel(
            [x, 0, z],
            tool.size,
            buildRotation,
            state.buildPieces
          );
          valid = level >= 0;
          // Tembok lantai dasar tidak boleh menembus furniture
          if (valid && level === 0) {
            valid = !wallHitsFurniture(
              [x, 0, z],
              tool.size,
              buildRotation,
              state.furnitureItems
            );
          }
        }
      }
      setGhost({ tool: buildTool, x, z, level, rotation: buildRotation, valid });
      return;
    }

    // Mode furniture: siluet model mengikuti kursor
    const config = getFurnitureConfig(selectedType);
    const size = config.size;
    const [clampedX, clampedZ] = clampToPlotBounds(
      e.point.x,
      e.point.z,
      size[0] / 2,
      size[2] / 2
    );
    const pos = [
      Math.round(clampedX * 4) / 4,
      0,
      Math.round(clampedZ * 4) / 4,
    ];
    const valid =
      isOnFloor(pos, size, state.buildPieces.filter((p) => p.kind === 'floor')) &&
      !collidesWithWalls(pos, size, state.buildPieces.filter((p) => p.kind === 'wall')) &&
      !willCollideWithOthers(pos, size, state.furnitureItems, null);
    setFurnGhost({ x: pos[0], z: pos[2], valid });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const point = e.point;

    // Mode bangun: pasang piece (lantai / tembok / atap)
    if (buildTool) {
      const tool = getBuildTool(buildTool) || getRoofTool(buildTool);
      const fp = pieceFootprint(tool.kind, tool.size, buildRotation);
      const [x, z] = snapPieceCenter(point.x, point.z, fp);
      useHouseStore
        .getState()
        .addPiece(
          tool.kind,
          tool.size,
          buildRotation,
          [x, 0, z],
          tool.kind === 'roof' ? tool.model : null
        );
      return;
    }

    // Mode furniture: tempatkan furniture
    if (selectedType) {
      onPlaceFurniture(e);
      return;
    }

    // Klik di area kosong (bukan di furniture) = batalkan mode pilih
    onCancelSelection?.();
  };

  // Tool/mode dimatikan: hilangkan semua preview
  useEffect(() => {
    if (!buildTool && ghost) setGhost(null);
  }, [buildTool, ghost]);

  useEffect(() => {
    if ((!selectedType || buildTool) && furnGhost) setFurnGhost(null);
  }, [selectedType, buildTool, furnGhost]);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerMove={updateGhost}
        onPointerOut={() => {
          setGhost(null);
          setFurnGhost(null);
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <planeGeometry args={[PLOT_SIZE + 20, PLOT_SIZE + 20]} />
        <meshStandardMaterial transparent opacity={0.001} side={2} />
      </mesh>
      <GhostPreview ghost={ghost} />
      {selectedType && furnGhost && !buildTool && (
        <>
          {/* Penanda alas siluet: biru saat valid, merah saat bertabrakan */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[furnGhost.x, 0.02, furnGhost.z]}>
            <planeGeometry args={[getFurnitureConfig(selectedType).size[0], getFurnitureConfig(selectedType).size[2]]} />
            <meshBasicMaterial
              color={furnGhost.valid ? '#4FC3F7' : '#E74C3C'}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
          <FurnitureGhost
            type={selectedType}
            x={furnGhost.x}
            z={furnGhost.z}
            valid={furnGhost.valid}
          />
        </>
      )}
    </>
  );
}

export function EditorView() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [hoverColor, setHoverColor] = useState(null);
  const [buildTool, setBuildTool] = useState(null);
  const [buildRotation, setBuildRotation] = useState('h');
  // Sidebar drawer (hanya efek di layar <768px; desktop selalu terbuka via CSS)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Modal konfirmasi reset ke default
  const [showResetModal, setShowResetModal] = useState(false);
  const orbitControlsRef = useRef();
  const furnitureItems = useHouseStore((state) => state.furnitureItems);
  const buildPieces = useHouseStore((state) => state.buildPieces);
  const updateFurniture = useHouseStore((state) => state.updateFurniture);
  const removeFurniture = useHouseStore((state) => state.removeFurniture);
  const removePiece = useHouseStore((state) => state.removePiece);
  const resetToDefault = useHouseStore((state) => state.resetToDefault);

  const [removeBlockedMsg, setRemoveBlockedMsg] = useState(null);

  const handleSelectFurniture = (type) => {
    setSelectedType(type === selectedType ? null : type);
    setSelectedItemId(null);
    setSelectedPieceId(null);
    setHoverColor(null);
    setBuildTool(null);
    // Di layar sempit: tutup drawer agar viewport terlihat setelah memilih
    setSidebarOpen(false);
  };

  const handleSelectTool = (toolKey) => {
    setBuildTool(toolKey);
    setRemoveBlockedMsg(null);
    if (toolKey) {
      setSelectedType(null);
      setSelectedItemId(null);
      setSelectedPieceId(null);
      setHoverColor(null);
      // Di layar sempit: tutup drawer agar viewport terlihat setelah memilih tool
      setSidebarOpen(false);
    }
  };

  const handlePlaceFurniture = (e) => {
    e.stopPropagation();
    if (!selectedType) return;
    const point = e.point;
    const config = getFurnitureConfig(selectedType);
    const size = config.size;

    // Snap ke grid 0.25m agar cek lantai & tabrakan konsisten dengan drag
    const [clampedX, clampedZ] = clampToPlotBounds(point.x, point.z, size[0] / 2, size[2] / 2);
    const pos = [
      Math.round(clampedX * 4) / 4,
      0,
      Math.round(clampedZ * 4) / 4,
    ];
    const state = useHouseStore.getState();

    if (!isOnFloor(pos, size, state.buildPieces.filter((p) => p.kind === 'floor'))) {
      console.log('Harus ditempatkan di atas lantai');
      return;
    }
    if (collidesWithWalls(pos, size, state.buildPieces.filter((p) => p.kind === 'wall'))) {
      console.log('Menabrak tembok');
      return;
    }
    if (willCollideWithOthers(pos, size, state.furnitureItems, null)) {
      console.log('Cannot place here - collision detected');
      return;
    }

    state.addFurniture(selectedType, pos);
  };

  const handleSelectItem = (id) => {
    setSelectedItemId(id);
    setSelectedPieceId(null);
    setSelectedType(null);
    setBuildTool(null);
  };

  const handleSelectPiece = (pieceId) => {
    setSelectedPieceId((prev) => (prev === pieceId ? null : pieceId));
    setSelectedItemId(null);
    setSelectedType(null);
    setHoverColor(null);
    setRemoveBlockedMsg(null);
  };

  const handlePieceContextMenu = (pieceId) => {
    if (selectedPieceId === pieceId) {
      // Sudah ditandai (kuning): user yakin, coba bongkar
      const piece = buildPieces.find((p) => p.id === pieceId);
      const ok = removePiece(pieceId);
      if (ok) {
        setSelectedPieceId(null);
        setRemoveBlockedMsg(null);
      } else {
        const reason =
          piece?.kind === 'floor'
            ? 'Lantai masih ditumpu furniture atau tembok — bongkar dulu penopangnya'
            : 'Ada tembok lain menumpuk di atasnya — bongkar tembok atas dulu';
        setRemoveBlockedMsg(reason);
      }
    } else {
      // Klik kanan pertama: tandai dulu (kuning) agar tidak salah hapus
      setSelectedPieceId(pieceId);
      setSelectedItemId(null);
      setSelectedType(null);
      setHoverColor(null);
      setRemoveBlockedMsg(null);
    }
  };

  const handleRemoveFurniture = () => {
    if (selectedItemId) {
      removeFurniture(selectedItemId);
      setSelectedItemId(null);
    }
  };

  const handleRemovePiece = () => {
    if (!selectedPieceId) return;
    const piece = buildPieces.find((p) => p.id === selectedPieceId);
    const ok = removePiece(selectedPieceId);
    if (ok) {
      setSelectedPieceId(null);
      setRemoveBlockedMsg(null);
    } else {
      const reason =
        piece?.kind === 'floor'
          ? 'Lantai masih ditumpu furniture atau tembok — bongkar dulu penopangnya'
          : 'Ada tembok lain menumpuk di atasnya — bongkar tembok atas dulu';
      setRemoveBlockedMsg(reason);
    }
  };

  const handleCancelBuildTool = () => {
    setBuildTool(null);
  };

  const handleCancelSelection = () => {
    // Klik di area kosong (bukan piece/furniture yang dipilih) = batal pilih
    if (selectedItemId || selectedType || selectedPieceId) {
      setSelectedItemId(null);
      setSelectedType(null);
      setSelectedPieceId(null);
      setHoverColor(null);
      setRemoveBlockedMsg(null);
    }
  };

  const handleRotateLeft = () => {
    if (!selectedItemId) return;
    const item = furnitureItems.find((f) => f.id === selectedItemId);
    if (item) {
      updateFurniture(selectedItemId, {
        rotation: [item.rotation[0], item.rotation[1] - Math.PI / 8, item.rotation[2]],
      });
    }
  };

  const handleRotateRight = () => {
    if (!selectedItemId) return;
    const item = furnitureItems.find((f) => f.id === selectedItemId);
    if (item) {
      updateFurniture(selectedItemId, {
        rotation: [item.rotation[0], item.rotation[1] + Math.PI / 8, item.rotation[2]],
      });
    }
  };

  const floorCount = buildPieces.filter((p) => p.kind === 'floor').length;
  const wallCount = buildPieces.filter((p) => p.kind === 'wall').length;
  const roofCount = buildPieces.filter((p) => p.kind === 'roof').length;

  const handleResetAll = () => {
    resetToDefault();
    setSelectedItemId(null);
    setSelectedType(null);
    setSelectedPieceId(null);
    setHoverColor(null);
    setBuildTool(null);
    setRemoveBlockedMsg(null);
    setShowResetModal(false);
  };

  // Esc menutup modal konfirmasi reset
  useEffect(() => {
    if (!showResetModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowResetModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showResetModal]);

  return (
    <div className="editor-view" onContextMenu={(e) => e.preventDefault()}>
      <div className={`editor-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <FurniturePicker
          onSelectFurniture={handleSelectFurniture}
          selectedType={selectedType}
        />
        <BuildPanel
          activeTool={buildTool}
          onSelectTool={handleSelectTool}
          rotation={buildRotation}
          onToggleRotation={() =>
            setBuildRotation((r) => (r === 'h' ? 'v' : 'h'))
          }
        />
      </div>

      <Canvas
        camera={{ position: [10, 8, 12], fov: 45 }}
        shadows
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={(e) => {
          setSelectedItemId(null);
          setSelectedType(null);
          setHoverColor(null);
          // Klik kanan di area kosong juga membatalkan build tool
          if (e?.button === 2) setBuildTool(null);
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          <OrbitControls
            ref={orbitControlsRef}
            minDistance={5}
            maxDistance={40}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI * 0.9}
          />
          <HouseShell
            editable
            selectable={!buildTool && !selectedType}
            allowPieceContextMenu={!buildTool}
            selectedPieceId={selectedPieceId}
            onSelectPiece={handleSelectPiece}
            onRemovePiece={handlePieceContextMenu}
          />
          <PlacementPlane
            buildTool={buildTool}
            buildRotation={buildRotation}
            selectedType={selectedType}
            onPlaceFurniture={handlePlaceFurniture}
            onCancelSelection={handleCancelSelection}
            onCancelBuildTool={handleCancelBuildTool}
          />
          {furnitureItems.map((item) => {
            const config = getFurnitureConfig(item.type);
            const size = config.size;
            const isDraggingItem = selectedItemId === item.id;
            const modelColor = hoverColor === 'red' && isDraggingItem ? '#E74C3C' : config.color;

            return (
              <FurnitureItemInteractive
                key={item.id}
                id={item.id}
                position={item.position}
                rotation={item.rotation}
                scale={item.scale}
                isSelected={isDraggingItem}
                onSelect={handleSelectItem}
                onPositionChange={(id, newPos) => {
                  updateFurniture(id, { position: newPos });
                }}
                onColorChange={setHoverColor}
                orbitControlsRef={orbitControlsRef}
                furnitureSize={size}
                furnitureItems={furnitureItems}
              >
                <FurnitureModel type={item.type} color={modelColor} isSelected={isDraggingItem} />
              </FurnitureItemInteractive>
            );
          })}
        </Suspense>
      </Canvas>

      <div className="editor-header">
        <button
          type="button"
          className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Tutup panel' : 'Buka panel'}
          aria-expanded={sidebarOpen}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {sidebarOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
        <div className="editor-title-row">
          <span className="editor-mark">
            <PencilMark />
          </span>
          <h1>Editor Isi Rumah</h1>
        </div>
        <button type="button" className="reset-btn" onClick={() => setShowResetModal(true)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="reset-btn-icon"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4.5V10h5.5" />
          </svg>
          Reset
        </button>
        <a href="/" className="back-btn">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="back-btn-icon"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Kembali ke Rumah
        </a>
      </div>

      {selectedItemId && (
        <div className="editor-controls">
          <div className="rotate-controls">
            <button onClick={handleRotateLeft} className="rotate-btn">↺ Putar Kiri</button>
            <button onClick={handleRotateRight} className="rotate-btn">↻ Putar Kanan</button>
          </div>
          <button onClick={handleRemoveFurniture} className="remove-btn">Hapus Furniture</button>
        </div>
      )}

      {selectedPieceId && (
        <div className="editor-controls">
          <p className="piece-selected-hint">
            Tembok / lantai / atap terpilih (kuning)
          </p>
          <button onClick={handleRemovePiece} className="remove-btn piece-remove-btn">
            Bongkar Piece
          </button>
        </div>
      )}

      <div className="editor-stats">
        <p>Total Furniture: {furnitureItems.length}</p>
        <p>
          Lantai: {floorCount} ubin • Tembok: {wallCount} seksi • Atap: {roofCount} piece
        </p>
        {selectedType && <p>📍 Klik lantai untuk menempatkan "{furnitureCatalog.find(f => f.type === selectedType)?.label}" • Siluet mengikuti kursor</p>}
        {buildTool && (
          <p>
            {getRoofTool(buildTool)
              ? '🏠 Klik di atas tembok untuk memasang piece atap • Arah lereng via tombol Arah • Klik kanan untuk batal'
              : '🔨 Klik tanah untuk memasang piece • Tembok menumpuk otomatis & tidak menembus furniture • Klik kanan untuk batal'}
          </p>
        )}
        {selectedItemId && <p>✓ Drag untuk pindah, tombol putar untuk rotasi • Klik area kosong untuk batal pilih</p>}
        {selectedPieceId && <p>🧱 Klik kanan piece yang sama atau tombol "Bongkar Piece" untuk menghapus • Klik area lain untuk batal pilih</p>}
        {removeBlockedMsg && selectedPieceId && (
          <p className="collision-warning">⚠ {removeBlockedMsg}</p>
        )}
        {hoverColor === 'red' && selectedItemId && (
          <p className="collision-warning">⚠ Tidak bisa di posisi ini (tabrakan / di luar lantai / menembus tembok)</p>
        )}
      </div>

      {/* ===== Modal konfirmasi reset ke default ===== */}
      {showResetModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowResetModal(false)}
          role="presentation"
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="modal-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3.5 21 19.5H3z" />
                <path d="M12 10v4.5" />
                <path d="M12 17.2v.3" />
              </svg>
            </span>
            <h3 id="reset-modal-title">Kembalikan ke Default?</h3>
            <p>
              Seluruh furniture dan piece bangunan (lantai, tembok, atap)
              akan dihapus, lantai kembali ke ubin default 8×8. Tindakan ini
              tidak bisa dibatalkan.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn-ghost"
                onClick={() => setShowResetModal(false)}
              >
                Batal
              </button>
              <button type="button" className="modal-btn-danger" onClick={handleResetAll}>
                Ya, Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
