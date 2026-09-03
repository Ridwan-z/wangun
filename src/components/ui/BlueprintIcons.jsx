// Kumpulan ikon garis (line-icon) bertema cetak biru / blueprint arsitek.
// Semua ikon stroke-based dengan currentColor agar mengikuti warna teks.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

// Logo: siluet rumah dengan garis tanah ala gambar teknik
export function LogoMark() {
  return (
    <svg {...base} className="logo-mark">
      <path d="M3.5 11.5 12 4l8.5 7.5" />
      <path d="M6 10.2V20h12v-9.8" />
      <path d="M10 20v-4.5h4V20" />
      <path d="M2.5 20h19" opacity="0.55" />
    </svg>
  );
}

// Ikon section sidebar
export function RulerMark() {
  return (
    <svg {...base} className="section-mark">
      <rect x="3" y="8.5" width="18" height="7" rx="1" />
      <path d="M7 8.5v3M11 8.5v3M15 8.5v3M19 8.5v3" />
    </svg>
  );
}

export function CompassMark() {
  return (
    <svg {...base} className="section-mark">
      <path d="M12 3.5v3" />
      <circle cx="12" cy="5" r="1.2" />
      <path d="M12 7l-5.5 13M12 7l5.5 13" />
      <path d="M9.3 14.5h5.4" />
    </svg>
  );
}

export function PencilMark() {
  return (
    <svg {...base} className="section-mark">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

// Preview 3D real-time: bola + cincin orbit + titik satelit
export function OrbitMark() {
  return (
    <svg {...base} className="section-mark">
      <circle cx="12" cy="12" r="4.5" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-18 12 12)" />
      <circle cx="20.6" cy="9.1" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Tersimpan otomatis: kotak arsip
export function SaveMark() {
  return (
    <svg {...base} className="section-mark">
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v11h14V9" />
      <path d="M10 13.5h4" />
    </svg>
  );
}

const furnitureIcons = {
  chair: (
    <svg {...base}>
      <path d="M8 3.5V12h8v8.5" />
      <path d="M8 12v8.5" />
      <path d="M8 15.5h8" />
    </svg>
  ),
  table: (
    <svg {...base}>
      <path d="M3 8.5h18" />
      <path d="M5 8.5V19M19 8.5V19" />
      <path d="M5 12h14" />
    </svg>
  ),
  sofa: (
    <svg {...base}>
      <rect x="3" y="10" width="18" height="7.5" rx="2" />
      <path d="M6.5 10V8a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
      <path d="M12 10v7.5" />
      <path d="M6 17.5v2.5M18 17.5v2.5" />
    </svg>
  ),
  bed: (
    <svg {...base}>
      <path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 19v1.5M21 19v1.5" />
      <path d="M4.5 10V5.5" />
      <rect x="5" y="11.5" width="4.5" height="3" rx="1" />
      <path d="M3 16h18" />
    </svg>
  ),
  shelf: (
    <svg {...base}>
      <rect x="5.5" y="3.5" width="13" height="17" rx="1" />
      <path d="M5.5 9.5h13M5.5 15.5h13" />
    </svg>
  ),
  lamp: (
    <svg {...base}>
      <path d="M9.5 3.5h5l1.8 5.5H7.7l1.8-5.5z" />
      <path d="M12 9v11" />
      <path d="M8 20h8" />
    </svg>
  ),
};

export function FurnitureGlyph({ type }) {
  const icon = furnitureIcons[type] || furnitureIcons.chair;
  return icon;
}

const buildIcons = {
  floor: (
    <svg {...base}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
      <path d="M3.5 12h17M12 3.5v17" />
    </svg>
  ),
  wall: (
    <svg {...base}>
      <rect x="3.5" y="5" width="17" height="14" rx="1" />
      <path d="M3.5 9.7h17M3.5 14.3h17" />
      <path d="M9 5v4.7M15.5 5v4.7M12 9.7v4.6M8.5 14.3V19M16 14.3V19" />
    </svg>
  ),
};

export function BuildGlyph({ kind }) {
  return buildIcons[kind] || buildIcons.floor;
}

// ===== Ikon model piece atap — siluet profil tiap bentuk =====
const roofIcons = {
  datar: (
    <svg {...base}>
      <rect x="3.5" y="8.5" width="17" height="3" rx="0.8" />
      <path d="M5.5 11.5V19h13v-7.5" />
      <path d="M9 15.5h6" opacity="0.55" />
    </svg>
  ),
  kiri: (
    <svg {...base}>
      <path d="M3.5 16.5 20.5 8v8.5z" />
      <path d="M2.5 18.5h19" opacity="0.55" />
    </svg>
  ),
  kanan: (
    <svg {...base}>
      <path d="M20.5 16.5 3.5 8v8.5z" />
      <path d="M2.5 18.5h19" opacity="0.55" />
    </svg>
  ),
  limas: (
    <svg {...base}>
      <path d="M3.5 18.5v-4.5L20.5 8v10.5z" />
      <path d="M12 16.3v-5.6" opacity="0.55" />
      <path d="M2.5 20.5h19" opacity="0.55" />
    </svg>
  ),
};

export function RoofGlyph({ model }) {
  return roofIcons[model] || roofIcons.datar;
}
