import { useGLTF } from '@react-three/drei';
import { Suspense, Component, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { BedModel } from './BedModel';

const MODEL_PATH = '/models/bed.glb';

// Catalog size (meters): 1.7 x 0.62 x 2.1 — model sudah meter-based
const DEFAULT_SCALE = 1.0;

class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(`Failed to load ${MODEL_PATH}, falling back to primitive bed.`, error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function BedGLBInner(props) {
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

    setScene(clonedScene);
    setBoundingInfo({ min: box.min.clone(), center, size });

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [rawScene]);

  // Bottom of model sits at Y=0
  const yOffset = useMemo(() => {
    if (!boundingInfo) return 0;
    return -boundingInfo.min.y * DEFAULT_SCALE;
  }, [boundingInfo]);

  if (!scene) {
    return null;
  }

  return (
    <group position={[0, yOffset, 0]} scale={DEFAULT_SCALE} {...props}>
      <primitive object={scene} dispose={null} />
    </group>
  );
}

export function BedModelGLB(props) {
  return (
    <GLBErrorBoundary fallback={<BedModel color={props.color} isSelected={props.isSelected} />}>
      <Suspense fallback={null}>
        <BedGLBInner {...props} />
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
