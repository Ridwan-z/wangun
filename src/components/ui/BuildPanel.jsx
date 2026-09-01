import { TILE_SIZE, TILE_LONG_LENGTH, WALL_HEIGHT } from '../../data/houseConfig';
import { BuildGlyph, CompassMark } from './BlueprintIcons';
import './BuildPanel.css';

export const BUILD_TOOLS = [
  {
    key: 'floor-square',
    kind: 'floor',
    size: 'square',
    label: 'Lantai Persegi',
    sub: `${TILE_SIZE} × ${TILE_SIZE} m`,
  },
  {
    key: 'floor-long',
    kind: 'floor',
    size: 'long',
    label: 'Lantai Panjang',
    sub: `${TILE_LONG_LENGTH} × ${TILE_SIZE} m`,
  },
  {
    key: 'wall-square',
    kind: 'wall',
    size: 'square',
    label: 'Tembok Persegi',
    sub: `${TILE_SIZE} × ${WALL_HEIGHT} m`,
  },
  {
    key: 'wall-long',
    kind: 'wall',
    size: 'long',
    label: 'Tembok Panjang',
    sub: `${TILE_LONG_LENGTH} × ${WALL_HEIGHT} m`,
  },
];

export function getBuildTool(toolKey) {
  return BUILD_TOOLS.find((t) => t.key === toolKey) || null;
}

export function BuildPanel({ activeTool, onSelectTool, rotation, onToggleRotation }) {
  const tool = getBuildTool(activeTool);
  const showRotation = tool && (tool.size === 'long' || tool.kind === 'wall');

  return (
    <div className="build-panel">
      <h3 className="sidebar-section-title">
        <CompassMark />
        Bangun Rumah
        <span className="section-code">02</span>
      </h3>
      <div className="build-tools">
        {BUILD_TOOLS.map((t) => (
          <button
            key={t.key}
            className={`build-tool ${activeTool === t.key ? 'active' : ''}`}
            onClick={() => onSelectTool(t.key === activeTool ? null : t.key)}
          >
            <span className="build-glyph">
              <BuildGlyph kind={t.kind} />
            </span>
            <span>{t.label}</span>
            <small>{t.sub}</small>
          </button>
        ))}
      </div>

      {tool && (
        <div className="build-footer">
          {showRotation ? (
            <button className="build-rotate" onClick={onToggleRotation}>
              ↻ Arah: {rotation === 'h' ? 'Mendatar' : 'Menurun'}
            </button>
          ) : (
            <p className="build-hint">Klik tanah untuk memasang • Klik kanan untuk batal</p>
          )}
          <p className="build-hint">Klik kanan piece terpasang untuk tandai (kuning), klik kanan lagi untuk bongkar</p>
        </div>
      )}
    </div>
  );
}
