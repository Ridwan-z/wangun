import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { HouseShell } from '../components/house/HouseShell';
import { SceneLighting } from '../components/house/SceneLighting';
import { CameraRig } from '../components/house/CameraRig';
import { FurnitureItem } from '../components/furniture/FurnitureItem';
import {
  LogoMark,
  BuildGlyph,
  FurnitureGlyph,
  OrbitMark,
  SaveMark,
} from '../components/ui/BlueprintIcons';
import { useHouseStore } from '../store/useHouseStore';
import './HouseView.css';

const iconBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function ArrowRight() {
  return (
    <svg {...iconBase} className="btn-icon">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Viewport 3D di dalam container section preview.
// Data tetap dibaca dari store yang sama (sinkron dengan Editor & localStorage).
// resize.scroll = false: matikan pengukuran ulang saat halaman di-scroll —
// ukuran canvas dikunci ke container (mencegah area putih saat interaksi orbit).
function PreviewCanvas() {
  const furnitureItems = useHouseStore((state) => state.furnitureItems);

  return (
    <Canvas
      camera={{ position: [8, 6, 10], fov: 45 }}
      shadows
      resize={{ scroll: false }}
      onCreated={({ gl }) => gl.setClearColor('#d9e6f2', 1)}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Langit terang agar rumah jelas terlihat di dalam frame */}
      <color attach="background" args={['#d9e6f2']} />
      <Suspense fallback={null}>
        <SceneLighting />
        <CameraRig />
        <HouseShell />
        {furnitureItems.map((item) => (
          <FurnitureItem
            key={item.id}
            id={item.id}
            type={item.type}
            position={item.position}
            rotation={item.rotation}
            scale={item.scale}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}

export function HouseView() {
  const furnitureItems = useHouseStore((state) => state.furnitureItems);

  const features = [
    {
      icon: <BuildGlyph kind="floor" />,
      title: 'Rancang Lantai & Tembok',
      desc: 'Susun ubin lantai dan tembok presisi di atas grid — bahkan bangun bertingkat.',
    },
    {
      icon: <FurnitureGlyph type="sofa" />,
      title: 'Tata Furniture Bebas',
      desc: 'Kursi, meja, sofa, kasur, rak, hingga lampu — geser dan putar sesuka hati.',
    },
    {
      icon: <OrbitMark />,
      title: 'Preview 3D Real-time',
      desc: 'Putar dan zoom rumahmu dari segala sudut, langsung dari browser.',
    },
    {
      icon: <SaveMark />,
      title: 'Tersimpan Otomatis',
      desc: 'Desain tersimpan di perangkatmu — kembali kapan pun dan lanjutkan dari titik terakhir.',
    },
  ];

  return (
    <div className="landing">
      {/* ===== 1. HERO ===== */}
      <section className="landing-hero">
        <div className="landing-container hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker">Arsitek Studio — Rancang dalam 3D</p>
            <h1 className="hero-title">
              Wujudkan <span className="hero-accent">Rumah Impianmu</span>
            </h1>
            <p className="hero-sub">
              Dari satu ubin lantai menjadi rumah utuh: rancang denah, bangun
              tembok, tata furniture, dan lihat semuanya hidup dalam visual 3D —
              langsung dari browser.
            </p>
            <div className="hero-actions">
              <a href="/editor" className="btn-primary">
                Mulai Bangun Rumah
                <ArrowRight />
              </a>
              <a href="#preview" className="btn-ghost">
                Lihat Preview
              </a>
            </div>
          </div>
          <div className="hero-deco" aria-hidden="true">
            <span className="hero-orbit" />
            <span className="hero-orbit hero-orbit-2" />
            <LogoMark />
          </div>
        </div>
      </section>

      {/* ===== 2. KENAPA WANGUN ===== */}
      <section className="landing-features">
        <div className="landing-container">
          <header className="landing-section-head">
            <p className="section-kicker">Kenapa Wangun</p>
            <h2 className="section-title">Dari Gambar Teknik ke Rumah Nyata</h2>
            <span className="section-rule" />
          </header>
          <div className="feature-grid">
            {features.map((f) => (
              <article className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. PREVIEW 3D RUMAH ===== */}
      <section className="landing-preview" id="preview">
        <div className="landing-container">
          <header className="landing-section-head">
            <p className="section-kicker">Preview Live</p>
            <h2 className="section-title">Lihat Progres Rumahmu</h2>
            <span className="section-rule" />
          </header>
          <div className="preview-frame">
            <div className="preview-canvas-host">
              <PreviewCanvas />
            </div>
            <div className="preview-card">
              <div className="preview-title-row">
                <span className="preview-mark">
                  <LogoMark />
                </span>
                <h3>Preview Rumah</h3>
              </div>
              <p className="preview-sub">
                Total furniture: <span className="preview-count">{furnitureItems.length}</span>
              </p>
            </div>
            <p className="preview-hint">seret untuk memutar &bull; scroll untuk zoom</p>
          </div>
        </div>
      </section>

      {/* ===== 4. CTA PENUTUP ===== */}
      <section className="landing-cta">
        <div className="landing-container cta-inner">
          <p className="section-kicker">Kanvas 3D-mu Menunggu</p>
          <h2 className="cta-title">Siap Mewujudkan Impianmu?</h2>
          <p className="cta-sub">Setiap rumah besar dimulai dari satu ubin lantai.</p>
          <a href="/editor" className="btn-primary btn-large">
            Mulai Bangun Rumah
            <ArrowRight />
          </a>
        </div>
      </section>

      <footer className="landing-footer">
        <span className="footer-credit">RDW</span>
      </footer>
    </div>
  );
}
