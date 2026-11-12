import React from 'react';

export default function FactoryScene() {
  return (
    <svg
      className="sf-scene"
      viewBox="0 0 1240 84"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Chimneys 1 & 2 */}
      <rect x="452" y="30" width="12" height="42" fill="var(--sf-bg)" />
      <path d="M450 30h16" />
      <path d="M452 40h12" stroke="#d8612a" />

      <rect x="472" y="46" width="10" height="26" fill="var(--sf-bg)" />
      <path d="M470 46h14" />
      <path d="M472 54h10" stroke="#d8612a" />

      <circle className="sf-pf" cx="458" cy="23" r="4" style={{ '--d': '0.0s' }} />
      <circle className="sf-pf" cx="458" cy="23" r="4" style={{ '--d': '-1.3s' }} />
      <circle className="sf-pf" cx="458" cy="23" r="4" style={{ '--d': '-2.6s' }} />

      <circle className="sf-pf" cx="477" cy="39" r="3.5" style={{ '--d': '-0.7s' }} />
      <circle className="sf-pf" cx="477" cy="39" r="3.5" style={{ '--d': '-2.0s' }} />
      <circle className="sf-pf" cx="477" cy="39" r="3.5" style={{ '--d': '-3.3s' }} />

      {/* Meshing gears */}
      <g className="sf-g1">
        <circle cx="508" cy="62" r="10" strokeWidth="4" strokeDasharray="3.9 3.95" />
        <circle cx="508" cy="62" r="5.5" />
        <circle cx="508" cy="62" r="1.4" />
      </g>
      <g className="sf-g2">
        <circle cx="525" cy="50" r="6.5" strokeWidth="3.2" strokeDasharray="3.4 3.4" />
        <circle cx="525" cy="50" r="3.2" />
      </g>

      {/* Robot arm holding a part */}
      <rect x="543" y="74" width="30" height="10" rx="2" fill="var(--sf-bg)" />
      <path d="M558 74L572 44" strokeWidth="5" />
      <g className="sf-arm">
        <path d="M572 44L612 34" strokeWidth="5" />
        <path d="M616 27V41M616 27h9M616 41h9" />
        <rect x="619" y="30" width="12" height="8" rx="1.5" fill="#d8612a" stroke="none" />
      </g>
      <circle cx="572" cy="44" r="5" fill="#d8612a" stroke="none" />

      {/* Rolling cargo-cart robot */}
      <g className="sf-amr">
        <rect x="596" y="64" width="36" height="14" rx="3" fill="var(--sf-bg)" />
        <rect x="602" y="56" width="14" height="8" rx="1" fill="var(--sf-bg)" />
        <path d="M626 64V56" />
        <circle cx="626" cy="54" r="2.2" fill="#d8612a" stroke="none" />
        <circle cx="604" cy="80" r="4" fill="var(--sf-bg)" />
        <circle cx="624" cy="80" r="4" fill="var(--sf-bg)" />
      </g>

      {/* Dotted handoff arc */}
      <path d="M636 32Q672 8 708 32" strokeDasharray="2 4" />
      <path d="M701 27L708 32L700 35" />

      {/* Hard-hat worker 1 (receiving) */}
      <circle cx="736" cy="26" r="6" fill="var(--sf-bg)" />
      <path d="M728.5 24a7.5 7.5 0 0 1 15 0z" fill="#d8612a" stroke="none" />
      <path d="M726 24h20" stroke="#d8612a" />
      <rect x="730.5" y="33" width="11" height="24" rx="4.5" fill="var(--sf-bg)" />
      <path d="M730.5 41h11" stroke="#d8612a" />
      <path d="M733.5 57L730 82M739 57L743 82" strokeWidth="4" />
      <path d="M731.5 38L718 36" strokeWidth="4" />
      <circle cx="715" cy="35.5" r="2.8" fill="var(--sf-bg)" />
      <path d="M741 38L745 52" strokeWidth="4" />

      {/* Hard-hat worker 2 (waving) */}
      <circle cx="772" cy="28" r="5.5" fill="var(--sf-bg)" />
      <path d="M765 26a7 7 0 0 1 14 0z" fill="#d8612a" stroke="none" />
      <path d="M763 26h18" stroke="#d8612a" />
      <rect x="767.5" y="34" width="9" height="22" rx="4" fill="var(--sf-bg)" />
      <path d="M767.5 42h9" stroke="#d8612a" />
      <path d="M770 56L767 82M775 56L778 82" strokeWidth="4" />
      <path d="M768 38L764 52" strokeWidth="4" />
      <g className="sf-wave">
        <path d="M776 38L786 28" strokeWidth="4" />
        <circle cx="787.5" cy="26.5" r="2.5" fill="var(--sf-bg)" />
      </g>

      {/* Boxy humanoid robot */}
      <path d="M812 22V16" />
      <circle cx="812" cy="14" r="1.8" fill="#d8612a" stroke="none" />
      <rect x="807" y="22" width="10" height="8" rx="2" fill="var(--sf-bg)" />
      <circle cx="812" cy="26" r="1.7" fill="#d8612a" stroke="none" />
      <rect x="804" y="32" width="16" height="20" rx="3" fill="var(--sf-bg)" />
      <circle cx="812" cy="42" r="2.3" fill="#d8612a" stroke="none" />
      <path d="M804 36L797 48M820 36L827 48" strokeWidth="3.5" />
      <path d="M808 52V80M816 52V80" strokeWidth="4" />

      {/* Chimney 3 + smoke puffs */}
      <rect x="836" y="38" width="11" height="34" fill="var(--sf-bg)" />
      <path d="M834 38h15" />
      <path d="M836 48h11" stroke="#d8612a" />
      <circle className="sf-pf" cx="841.5" cy="31" r="4" style={{ '--d': '-0.4s' }} />
      <circle className="sf-pf" cx="841.5" cy="31" r="4" style={{ '--d': '-1.7s' }} />
      <circle className="sf-pf" cx="841.5" cy="31" r="4" style={{ '--d': '-3.0s' }} />
    </svg>
  );
}

