import { furnitureCatalog } from '../../data/furnitureCatalog';
import { FurnitureGlyph, RulerMark } from './BlueprintIcons';
import './FurniturePicker.css';

export function FurniturePicker({ onSelectFurniture, selectedType }) {
  return (
    <div className="furniture-picker">
      <h3 className="sidebar-section-title">
        <RulerMark />
        Pilih Furniture
        <span className="section-code">01</span>
      </h3>
      <div className="furniture-list">
        {furnitureCatalog.map((item) => (
          <button
            key={item.type}
            className={`furniture-btn ${selectedType === item.type ? 'active' : ''}`}
            onClick={() => onSelectFurniture(item.type)}
          >
            <span className="furniture-glyph">
              <FurnitureGlyph type={item.type} />
            </span>
            <span className="furniture-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
