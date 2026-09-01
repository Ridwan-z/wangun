import { getFurnitureConfig } from '../../data/furnitureCatalog';
import { FurnitureModel } from './FurnitureModel';

export function FurnitureItem({ id, type, position, rotation, scale, isSelected }) {
  const config = getFurnitureConfig(type);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <FurnitureModel type={type} color={config.color} isSelected={isSelected} />
    </group>
  );
}
