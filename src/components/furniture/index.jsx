import { ChairModel } from './models/ChairModel';
import { ChairModelGLB } from './models/ChairModelGLB';
import { TableModel } from './models/TableModel';
import { TableModelGLB } from './models/TableModelGLB';
import { SofaModel } from './models/SofaModel';
import { SofaModelGLB } from './models/SofaModelGLB';
import { BedModel } from './models/BedModel';
import { BedModelGLB } from './models/BedModelGLB';
import { ShelfModel } from './models/ShelfModel';
import { ShelfModelGLB } from './models/ShelfModelGLB';
import { LampModel } from './models/LampModel';
import { LampModelGLB } from './models/LampModelGLB';
import { FurnitureItemInteractive } from './FurnitureItemInteractive';
import { FurnitureModel } from './FurnitureModel';

const USE_GLB_MODELS = {
  bed: true,  // ✅ Active
  chair: true,  // ✅ Active
  table: true,  // ✅ Active
  sofa: true,  // ✅ Active
  shelf: true,  // ✅ Active
  lamp: true,  // ✅ Active
};

const PRIMITIVE_MODELS = {
  chair: ChairModel,
  table: TableModel,
  sofa: SofaModel,
  bed: BedModel,
  shelf: ShelfModel,
  lamp: LampModel,
};

const GLB_MODELS = {
  bed: BedModelGLB,
  chair: ChairModelGLB,
  table: TableModelGLB,
  sofa: SofaModelGLB,
  shelf: ShelfModelGLB,
  lamp: LampModelGLB,
};

export {
  USE_GLB_MODELS,
  PRIMITIVE_MODELS,
  GLB_MODELS,
  FurnitureItemInteractive,
  FurnitureModel,
};
