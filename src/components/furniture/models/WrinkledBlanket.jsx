import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

export function WrinkledBlanket({ width = 1.65, length = 1.4, color = '#78909c' }) {
  const blanketRef = useRef();
  const currentTilt = useRef(0);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, length, 24, 24);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const wave =
        Math.sin(x * 6) * 0.015 +
        Math.cos(y * 5) * 0.012 +
        Math.sin((x + y) * 8) * 0.008;

      if (y > length * 0.35) {
        const extraWrinkle = Math.sin(x * 10) * 0.025 + Math.cos(x * 7 + y * 3) * 0.015;
        pos.setZ(i, wave + extraWrinkle);
      } else {
        pos.setZ(i, wave);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, [width, length]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [color]
  );

  useEffect(() => {
    currentTilt.current = (Math.random() - 0.5) * 0.08;
  }, []);

  const rotation = [-Math.PI / 2 + 0.08, 0, currentTilt.current];

  return (
    <mesh
      ref={blanketRef}
      rotation={rotation}
      position={[0, 0.02, 0]}
      castShadow
      receiveShadow
    >
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
