export function LampModel({ color }) {
  const baseThickness = 0.08;
  const baseRadius = 0.4;
  const poleHeight = 1.3;
  const poleRadius = 0.04;
  const shadeHeight = 0.35;
  const shadeRadius = 0.25;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, baseThickness / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[baseRadius, baseRadius, baseThickness, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Pole */}
      <mesh
        position={[0, baseThickness + poleHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry args={[poleRadius, poleRadius, poleHeight, 8]} />
        <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* Shade */}
      <mesh
        position={[0, baseThickness + poleHeight - shadeHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <coneGeometry args={[shadeRadius, shadeHeight, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
