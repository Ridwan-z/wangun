export function SofaModel({ color }) {
  const baseThickness = 0.25;
  const baseHeight = 0.15;
  const backHeight = 0.5;
  const armHeight = backHeight;
  const sofaLength = 1.8;
  const sofaDepth = 0.9;
  const legRadius = 0.04;

  const legOffsetX = sofaLength / 2 - 0.1;
  const legOffsetZ = sofaDepth / 2 - 0.1;

  return (
    <group>
      {/* Seat base */}
      <mesh
        position={[0, baseHeight + baseThickness / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[sofaLength, baseThickness, sofaDepth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Backrest */}
      <mesh
        position={[0, baseHeight + baseThickness + backHeight / 2, -sofaDepth / 2 + 0.05]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[sofaLength, backHeight, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Left armrest */}
      <mesh
        position={[-sofaLength / 2 + 0.05, baseHeight + baseThickness + armHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.1, armHeight, sofaDepth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Right armrest */}
      <mesh
        position={[sofaLength / 2 - 0.05, baseHeight + baseThickness + armHeight / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[0.1, armHeight, sofaDepth]} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Legs */}
      {[
        [legOffsetX, baseHeight / 2, -legOffsetZ],
        [-legOffsetX, baseHeight / 2, -legOffsetZ],
        [legOffsetX, baseHeight / 2, legOffsetZ],
        [-legOffsetX, baseHeight / 2, legOffsetZ],
      ].map((pos, i) => (
        <mesh key={i} position={pos} receiveShadow castShadow>
          <cylinderGeometry args={[legRadius, legRadius, baseHeight, 8]} />
          <meshStandardMaterial color="#4A6D7C" roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
