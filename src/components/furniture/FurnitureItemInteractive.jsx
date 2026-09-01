import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { clampToPlotBounds } from '../../utils/boundsHelper';
import { willCollideWithOthers, isOnFloor, collidesWithWalls } from '../../utils/buildHelper';
import { useHouseStore } from '../../store/useHouseStore';

const HIGHLIGHT = {
  collide: { color: '#FF0000', intensity: 0.6 },
  selected: { color: '#FFD700', intensity: 0.35 },
  hover: { color: '#4FC3F7', intensity: 0.25 },
};

export function FurnitureItemInteractive({
  id,
  position,
  rotation,
  scale,
  isSelected,
  onSelect,
  onPositionChange,
  onColorChange,
  orbitControlsRef,
  furnitureSize,
  furnitureItems,
  children,
}) {
  const groupRef = useRef();
  const { camera, gl } = useThree();
  const [hovered, setHovered] = useState(false);
  const [isColliding, setIsColliding] = useState(false);

  const buildPieces = useHouseStore((state) => state.buildPieces);
  const floorPieces = useMemo(
    () => buildPieces.filter((p) => p.kind === 'floor'),
    [buildPieces]
  );
  const wallPieces = useMemo(
    () => buildPieces.filter((p) => p.kind === 'wall'),
    [buildPieces]
  );

  const dragState = useRef({
    isDragging: false,
    plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
  });

  const halfW = furnitureSize ? furnitureSize[0] / 2 : 0.5;
  const halfD = furnitureSize ? furnitureSize[2] / 2 : 0.5;

  // Clone materials once per mesh so the glow only affects this instance
  // (GLB materials are shared between instances of the same model)
  const applyHighlight = (mode) => {
    const group = groupRef.current;
    if (!group) return;

    group.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      if (!child.userData._materialCloned) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => m.clone());
        } else {
          child.material = child.material.clone();
        }
        child.userData._materialCloned = true;
      }

      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material];

      mats.forEach((mat) => {
        if (!mat.emissive) return;

        if (mat.userData._hlOriginal === undefined) {
          mat.userData._hlOriginal = {
            color: mat.emissive.getHex(),
            intensity: mat.emissiveIntensity ?? 1,
          };
        }

        if (mode === 'none') {
          mat.emissive.setHex(mat.userData._hlOriginal.color);
          mat.emissiveIntensity = mat.userData._hlOriginal.intensity;
        } else {
          mat.emissive.set(HIGHLIGHT[mode].color);
          mat.emissiveIntensity = HIGHLIGHT[mode].intensity;
        }
      });
    });
  };

  useEffect(() => {
    const mode = isColliding
      ? 'collide'
      : isSelected
        ? 'selected'
        : hovered
          ? 'hover'
          : 'none';
    applyHighlight(mode);
  }, [hovered, isSelected, isColliding, children]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    }
  }, [rotation]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(scale[0], scale[1], scale[2]);
    }
  }, [scale]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragState.current.isDragging || !groupRef.current) return;

      e.preventDefault();

      const rect = gl.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const cameraRay = new THREE.Ray();
      cameraRay.origin.copy(camera.position);
      cameraRay.direction
        .set(mouse.x, mouse.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();

      const intersectionPoint = new THREE.Vector3();
      cameraRay.intersectPlane(dragState.current.plane, intersectionPoint);

      if (intersectionPoint) {
        const [clampedX, clampedZ] = clampToPlotBounds(
          intersectionPoint.x,
          intersectionPoint.z,
          halfW,
          halfD
        );

        const size = furnitureSize || [1, 1, 1];
        const candidate = [clampedX, 0, clampedZ];

        const hitFurniture = willCollideWithOthers(candidate, size, furnitureItems || [], id);
        const hitWall = collidesWithWalls(candidate, size, wallPieces);
        const offFloor = !isOnFloor(candidate, size, floorPieces);

        // Furniture yang terdampar di luar lantai (ubin dibongkar)
        // boleh digeser agar bisa diperbaiki
        const currentlyOffFloor =
          !isOnFloor([groupRef.current.position.x, 0, groupRef.current.position.z], size, floorPieces);

        const blocked = hitFurniture || hitWall || (offFloor && !currentlyOffFloor);

        setIsColliding(blocked);
        onColorChange?.(blocked ? 'red' : 'white');

        if (!blocked) {
          const snappedX = Math.round(clampedX * 4) / 4;
          const snappedZ = Math.round(clampedZ * 4) / 4;

          groupRef.current.position.x = snappedX;
          groupRef.current.position.z = snappedZ;
        }
      }
    };

    const onMouseUp = () => {
      if (!dragState.current.isDragging) return;

      dragState.current.isDragging = false;

      if (orbitControlsRef?.current) {
        orbitControlsRef.current.enabled = true;
      }

      gl.domElement.style.cursor = hovered ? 'pointer' : 'auto';
      setIsColliding(false);
      onColorChange?.('white');

      if (groupRef.current && isSelected) {
        const pos = groupRef.current.position;
        const [clampedX, clampedZ] = clampToPlotBounds(
          pos.x,
          pos.z,
          halfW,
          halfD
        );

        onPositionChange?.(id, [
          Math.round(clampedX * 4) / 4,
          0,
          Math.round(clampedZ * 4) / 4,
        ]);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [
    camera,
    gl,
    orbitControlsRef,
    isSelected,
    onPositionChange,
    id,
    hovered,
    halfW,
    halfD,
    floorPieces,
    wallPieces,
    furnitureSize,
    furnitureItems,
    onColorChange,
  ]);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    if (orbitControlsRef?.current) {
      orbitControlsRef.current.enabled = false;
    }

    dragState.current.isDragging = true;
    dragState.current.plane.set(new THREE.Vector3(0, 1, 0), 0);

    gl.domElement.style.cursor = 'grabbing';
    onSelect?.(id);
  };

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        // Klik pada furniture tidak diteruskan ke lantai/tanah,
        // agar seleksi tidak ikut terbatalkan (misal setelah selesai drag)
        e.stopPropagation();
      }}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        gl.domElement.style.cursor = 'pointer';
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        if (!dragState.current.isDragging) {
          gl.domElement.style.cursor = 'auto';
        }
      }}
    >
      {children}
    </group>
  );
}
