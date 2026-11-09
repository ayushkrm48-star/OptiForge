import React from 'react';

// Gear path generator helper from exact specification
function gearPath(n, ro = 100, ri = 86) {
  let p = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, w = (Math.PI * 2) / n;
    [[0, ri], [0.12, ro], [0.38, ro], [0.5, ri]].forEach((s, j) => {
      const t = a + s[0] * w * 2;
      p += (i + j ? "L" : "M") + (Math.cos(t) * s[1]).toFixed(1) + " " + (Math.sin(t) * s[1]).toFixed(1);
    });
  }
  return p + "Z";
}

// Gear component rendering gear teeth, center hole, and 6 cutouts at radius ri * 0.6
function IndustrialGear({ teeth, className, style, opacity = 0.09 }) {
  const pathData = gearPath(teeth, 100, 86);
  // 6 small circles at radius ri * 0.6 = 86 * 0.6 = 51.6
  const cutouts = [0, 1, 2, 3, 4, 5].map((k) => {
    const ang = (k / 6) * Math.PI * 2;
    const cx = (Math.cos(ang) * 51.6).toFixed(1);
    const cy = (Math.sin(ang) * 51.6).toFixed(1);
    return <circle key={k} cx={cx} cy={cy} r="8" stroke="#0F172A" strokeWidth="2" fill="none" />;
  });

  return (
    <svg
      viewBox="-110 -110 220 220"
      className={className}
      style={{ ...style, opacity }}
      fill="none"
      stroke="#0F172A"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={pathData} />
      <circle cx="0" cy="0" r="22" stroke="#0F172A" strokeWidth="2" fill="none" />
      {cutouts}
    </svg>
  );
}

export default function FactoryBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* 1. 32px Engineering Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* 2. Concrete Noise Texture via SVG Filter (160px tile, baseFrequency 0.8, ~9% opacity) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.09]" xmlns="http://www.w3.org/2000/svg">
        <filter id="concreteNoise" x="0" y="0" width="160" height="160" filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#concreteNoise)" />
      </svg>

      {/* 3. Faint dimension line near top (STATION PITCH 1200 mm, 12px, opacity .1) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[720px] max-w-[90vw] opacity-10 flex items-center">
        <svg viewBox="0 0 720 24" className="w-full h-6 text-[#0F172A]" fill="none" stroke="currentColor">
          <line x1="20" y1="12" x2="700" y2="12" strokeWidth="1.5" />
          <path d="M 28 8 L 20 12 L 28 16" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 692 8 L 700 12 L 692 16" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="4" x2="20" y2="20" strokeWidth="1.5" />
          <line x1="700" y1="4" x2="700" y2="20" strokeWidth="1.5" />
          <text
            x="360"
            y="9"
            textAnchor="middle"
            fill="#0F172A"
            stroke="none"
            className="text-[12px] font-medium tracking-wider"
            style={{ fontFamily: "'Google Sans', sans-serif" }}
          >
            STATION PITCH 1200 mm
          </text>
        </svg>
      </div>

      {/* 4. Three large line-art rotating gears */}
      {/* Gear 1: 620px, top-right (right: -200px, top: -180px), rotate 140s */}
      <div
        className="absolute animate-gear-1"
        style={{
          width: '620px',
          height: '620px',
          right: '-200px',
          top: '-180px'
        }}
      >
        <IndustrialGear teeth={18} opacity={0.11} className="w-full h-full" />
      </div>

      {/* Gear 2: 380px, bottom-left (left: -130px, bottom: -110px), rotate 90s reverse */}
      <div
        className="absolute animate-gear-2"
        style={{
          width: '380px',
          height: '380px',
          left: '-130px',
          bottom: '-110px'
        }}
      >
        <IndustrialGear teeth={14} opacity={0.10} className="w-full h-full" />
      </div>

      {/* Gear 3: 230px (left: 130px, bottom: 150px), rotate 55s, opacity .08 */}
      <div
        className="absolute animate-gear-3"
        style={{
          width: '230px',
          height: '230px',
          left: '130px',
          bottom: '150px'
        }}
      >
        <IndustrialGear teeth={10} opacity={0.08} className="w-full h-full" />
      </div>

      {/* 5. Orange line-art robot arm, bottom-right (440px wide, right: -40px, bottom: -30px, stroke #EA580C, opacity .14, width 2.5) */}
      <div
        className="absolute"
        style={{
          width: '440px',
          height: '420px',
          right: '-40px',
          bottom: '-30px',
          opacity: 0.14
        }}
      >
        <svg
          viewBox="0 0 440 420"
          className="w-full h-full"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Dashed floor line */}
          <line x1="20" y1="390" x2="420" y2="390" strokeDasharray="8 6" />

          {/* Base plate */}
          <rect x="130" y="370" width="140" height="20" rx="3" />
          <rect x="160" y="352" width="80" height="18" rx="2" />

          {/* Main joint & lower arm */}
          <circle cx="200" cy="336" r="16" />
          <circle cx="200" cy="336" r="6" />
          <line x1="200" y1="336" x2="275" y2="195" />
          <line x1="192" y1="336" x2="267" y2="195" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Hydraulic cylinder */}
          <line x1="220" y1="352" x2="255" y2="245" strokeWidth="1.5" />
          <rect x="230" y="290" width="14" height="28" rx="2" strokeWidth="1.5" transform="rotate(-30 230 290)" />

          {/* Elbow joint */}
          <circle cx="275" cy="195" r="14" />
          <circle cx="275" cy="195" r="5" />

          {/* Upper arm */}
          <line x1="275" y1="195" x2="380" y2="215" />
          <line x1="275" y1="202" x2="380" y2="222" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Wrist joint */}
          <circle cx="380" cy="215" r="10" />
          <circle cx="380" cy="215" r="3" />

          {/* Gripper mount & fingers */}
          <path d="M 380 215 L 400 215 M 400 205 L 415 205 L 422 212 M 400 225 L 415 225 L 422 218" />
          <line x1="400" y1="202" x2="400" y2="228" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
