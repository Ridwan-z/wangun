import { PLOT_BOUNDS } from '../data/houseConfig';
import { furnitureCatalog } from '../data/furnitureCatalog';

export function getCatalogSizeByType(type) {
  const item = furnitureCatalog.find((f) => f.type === type);
  return item ? item.size : [1, 1, 1];
}

export function clampToPlotBounds(x, z, halfWidth = 0, halfDepth = 0) {
  const margin = 0.05;

  const clampedX = Math.min(
    PLOT_BOUNDS.maxX - margin - halfWidth,
    Math.max(PLOT_BOUNDS.minX + margin + halfWidth, x)
  );

  const clampedZ = Math.min(
    PLOT_BOUNDS.maxZ - margin - halfDepth,
    Math.max(PLOT_BOUNDS.minZ + margin + halfDepth, z)
  );

  return [clampedX, clampedZ];
}
