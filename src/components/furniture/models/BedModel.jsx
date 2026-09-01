import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { WrinkledBlanket } from './WrinkledBlanket';

export function BedModel({ color }) {
  const frameWidth = 1.7;
  const frameLength = 2.1;
  const frameHeight = 0.18;
  const mattressThickness = 0.22;
  const pillowCount = 3;

  const frameColor = '#4a2f22';
  const mattressColor = color;
  const pillowColor = '#f8f5ec';
  const blanketColor = '#78909c';

  const pillowOffsets = useMemo(() => {
    return Array.from({ length: pillowCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.08,
      z: -frameLength * 0.18 + i * 0.04,
      rotZ: (Math.random() - 0.5) * 0.06,
    }));
  }, [pillowCount, frameLength]);

  return (
    <group>
      {/* Bed frame */}
      <RoundedBox
        position={[0, frameHeight / 2, 0]}
        args={[frameWidth, frameHeight, frameLength]}
        radius={0.02}
        smoothness={8}
      >
        <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.3} />
      </RoundedBox>

      {/* Mattress */}
      <RoundedBox
        position={[
          0,
          frameHeight + mattressThickness / 2,
          0
        ]}
        args={[frameWidth - 0.06, mattressThickness, frameLength - 0.06]}
        radius={0.06}
        smoothness={12}
      >
        <meshStandardMaterial color={mattressColor} roughness={0.8} metalness={0.05} />
      </RoundedBox>

      {/* Wrinkled blanket */}
      <group
        position={[
          0,
          frameHeight + mattressThickness + 0.01,
          0
        ]}
      >
        <WrinkledBlanket
          width={frameWidth - 0.04}
          length={frameLength * 0.65}
          color={blanketColor}
        />
      </group>

      {/* Pillows */}
      {pillowOffsets.map((p, i) => (
        <RoundedBox
          key={i}
          position={[
            p.x,
            frameHeight + mattressThickness + 0.08,
            p.z
          ]}
          rotation={[0.1, 0, p.rotZ]}
          args={[0.55, 0.18, 0.8]}
          radius={0.12}
          smoothness={16}
        >
          <meshStandardMaterial color={pillowColor} roughness={0.85} metalness={0.03} />
        </RoundedBox>
      ))}
    </group>
  );
}

export default BedModel;

