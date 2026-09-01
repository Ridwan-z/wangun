export function ShelfModel({ color }) {
  const totalHeight = 1.8;
  const width = 1.0;
  const depth = 0.4;
  const thickness = 0.05;

  const plankCount = 4;
  const plankSpacing = totalHeight / (plankCount + 1);

  return (
    <group>
      {/* Left side panel */}
      <mesh position={[-width / 2 + thickness / 2, totalHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[thickness, totalHeight, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[width / 2 - thickness / 2, totalHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[thickness, totalHeight, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, totalHeight - thickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, thickness / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, thickness, depth]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Internal shelves */}
      {Array.from({ length: plankCount }, (_, i) => {
        const y = plankSpacing * (i + 1);
        return (
          <mesh
            key={i}
            position={[0, y, -depth / 2 + thickness / 2]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[width - 0.02, thickness, 0.02]} />
            <meshStandardMaterial color="#3E2723" roughness={0.5} metalness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}
