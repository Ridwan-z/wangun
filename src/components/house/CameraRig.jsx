import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export function CameraRig() {
  const { camera } = useThree();

  return (
    <OrbitControls
      camera={camera}
      minDistance={5}
      maxDistance={25}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI * 0.9}
      autoRotate={false}
    />
  );
}
