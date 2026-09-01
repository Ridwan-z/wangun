import { USE_GLB_MODELS, PRIMITIVE_MODELS, GLB_MODELS } from './index';

export function FurnitureModel({ type, color, isSelected }) {
  const Model = USE_GLB_MODELS[type] && GLB_MODELS[type]
    ? GLB_MODELS[type]
    : PRIMITIVE_MODELS[type] || PRIMITIVE_MODELS.chair;

  return <Model color={color} isSelected={isSelected} />;
}
