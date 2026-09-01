export function TableModel({ color }) {
  const legHeight = 0.7;
  const topSize = [1.2, 0.06, 0.8];
  const legRadius = 0.05;

  const legOffsetX = topSize[0] / 2 - 0.08;
  const legOffsetZ = topSize[2] / 2 - 0.08;

  return (
    <group>
      {/* Table top */}
      <mesh position={[0, legHeight + topSize[1] / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={topSize} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 4 Legs */}
      {[
        [legOffsetX, legHeight / 2, legOffsetZ],
        [-legOffsetX, legHeight / 2, legOffsetZ],
        [legOffsetX, legHeight / 2, -legOffsetZ],
        [-legOffsetX, legHeight / 2, -legOffsetZ],
      ].map((pos, i) => (
        <mesh key={i} position={pos} receiveShadow castShadow>
          <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
