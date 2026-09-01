export function ChairModel({ color }) {
  const seatSize = [0.5, 0.08, 0.5];
  const legHeight = 0.4;
  const legRadius = 0.03;
  const backHeight = 0.5;
  const backThickness = 0.08;

  const legOffsetX = seatSize[0] / 2 - 0.05;
  const legOffsetZ = seatSize[2] / 2 - 0.05;

  return (
    <group>
      {/* Seat (box flat) - center at seatHeight + seatThickness/2 */}
      <mesh position={[0, legHeight + seatSize[1] / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={seatSize} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Backrest - attached behind seat */}
      <mesh
        position={[0, legHeight + seatSize[1] + backHeight / 2, -seatSize[2] / 2 + 0.04]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[seatSize[0], backHeight, backThickness]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* 4 Legs - positioned at corners of seat */}
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
