import { Environment } from '@react-three/drei';
import { Suspense } from 'react';

function EnvironmentWithFallback() {
  return (
    <Suspense fallback={null}>
      <Environment preset="sunset" />
    </Suspense>
  );
}

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
      />
      <EnvironmentWithFallback />
    </>
  );
}
