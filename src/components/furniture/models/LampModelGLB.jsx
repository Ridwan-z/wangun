import { useGLTF } from '@react-three/drei';
import { Suspense, Component, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { LampModel } from './LampModel';

const MODEL_PATH = '/models/light.glb';

// Target size (meters) from furniture catalog: 0.3 x 1.5 x 0.3
const TARGET_SIZE = { x: 0.3, y: 1.5, z: 0.3 };

class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(`Failed to load ${MODEL_PATH}, falling back to primitive lamp.`, error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function LampGLBInner(props) {
  const { scene: rawScene } = useGLTF(MODEL_PATH);
  const [scene, setScene] = useState(null);
  const [boundingInfo, setBoundingInfo] = useState(null);

  useEffect(() => {
    if (!rawScene) return;
    const clonedScene = rawScene.clone();

    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Auto-scale: uniform scale so the model's largest dimension
    // matches the largest target dimension (catalog size)
    const maxModelDim = Math.max(size.x, size.y, size.z);
    const maxTargetDim = Math.max(TARGET_SIZE.x, TARGET_SIZE.y, TARGET_SIZE.z);
    const autoScale = maxModelDim > 0 ? maxTargetDim / maxModelDim : 1;

    console.log('--- LampModelGLB Debug ---');
    console.log('Raw bounding size:', { x: size.x, y: size.y, z: size.z });
    console.log('Auto scale applied:', autoScale);

    setScene(clonedScene);
    setBoundingInfo({ min: box.min.clone(), center, size, autoScale });

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [rawScene]);

  // Bottom of model sits at Y=0, centered on X/Z
  const { yOffset, xOffset, zOffset } = useMemo(() => {
    if (!boundingInfo) return { yOffset: 0, xOffset: 0, zOffset: 0 };
    const { min, center, autoScale } = boundingInfo;
    return {
      yOffset: -min.y * autoScale,
      xOffset: -center.x * autoScale,
      zOffset: -center.z * autoScale,
    };
  }, [boundingInfo]);

  if (!scene) {
    return null;
  }

  return (
    <group
      position={[xOffset, yOffset, zOffset]}
      scale={boundingInfo ? boundingInfo.autoScale : 1}
      {...props}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
}

export function LampModelGLB(props) {
  return (
    <GLBErrorBoundary fallback={<LampModel color={props.color} isSelected={props.isSelected} />}>
      <Suspense fallback={null}>
        <LampGLBInner {...props} />
      </Suspense>
    </GLBErrorBoundary>
  );
}

try {
  const preload = useGLTF.preload(MODEL_PATH);
  if (preload && typeof preload.catch === 'function') {
    preload.catch(() => {});
  }
} catch (e) {
  // File not available yet; runtime will fall back via ErrorBoundary
}
