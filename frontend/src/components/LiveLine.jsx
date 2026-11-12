import React from 'react';

function HumanWorkerIcon({ style }) {
  return (
    <svg
      width="54"
      height="74"
      viewBox="0 0 54 74"
      className="animate-human shrink-0"
      style={style}
      fill="none"
      aria-label="Human Worker"
    >
      <path d="M 16 20 C 16 11 38 11 38 20 Z" fill="#EA580C" />
      <rect x="12" y="19" width="30" height="4" rx="2" fill="#EA580C" />
      <rect x="19" y="23" width="16" height="13" rx="4" fill="#FED7AA" />
      <circle cx="23" cy="28" r="1.2" fill="#9A3412" />
      <circle cx="31" cy="28" r="1.2" fill="#9A3412" />
      <path d="M 25 32 Q 27 34 29 32" stroke="#9A3412" strokeWidth="1" strokeLinecap="round" />
      <path d="M 13 36 L 41 36 L 38 54 L 16 54 Z" fill="#EA580C" />
      <path d="M 24 36 L 27 43 L 30 36" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="46" x2="38" y2="46" stroke="#FEF08A" strokeWidth="2" strokeDasharray="3 2" />
      <rect x="17" y="54" width="8" height="15" rx="1.5" fill="#334155" />
      <rect x="29" y="54" width="8" height="15" rx="1.5" fill="#334155" />
      <rect x="15" y="66" width="10" height="5" rx="1.5" fill="#0F172A" />
      <rect x="29" y="66" width="10" height="5" rx="1.5" fill="#0F172A" />
    </svg>
  );
}

function RobotArmIcon({ style }) {
  return (
    <svg
      width="54"
      height="74"
      viewBox="0 0 54 74"
      className="shrink-0 overflow-visible"
      style={style}
      fill="none"
      aria-label="Robot Arm"
    >
      <rect x="12" y="64" width="30" height="7" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />
      <rect x="19" y="59" width="16" height="5" rx="1" fill="#334155" />
      <circle cx="27" cy="59" r="5" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1.5" />

      <g className="animate-robot-arm-1" style={{ transformOrigin: '27px 59px' }}>
        <line x1="27" y1="59" x2="27" y2="36" stroke="#7DD3FC" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="27" y1="56" x2="27" y2="39" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

        <circle cx="27" cy="36" r="4.5" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1.5" />

        <g className="animate-robot-arm-2" style={{ transformOrigin: '27px 36px' }}>
          <line x1="27" y1="36" x2="27" y2="16" stroke="#7DD3FC" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="27" cy="16" r="3.5" fill="#0F172A" stroke="#7DD3FC" strokeWidth="1" />
          <path d="M 23 16 L 23 9 M 31 16 L 31 9 M 21 9 L 24 7 M 33 9 L 30 7" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

export default function LiveLine({
  numHumans = 2,
  numRobots = 2,
  humanServiceTime = 4.0,
  robotServiceTime = 2.0,
  arrivalRatePerHour = 40
}) {
  const durHuman = (humanServiceTime * 0.7).toFixed(2);
  const durRobot = (robotServiceTime * 0.6).toFixed(2);
  const durBelt = (96 / Math.max(arrivalRatePerHour, 1)).toFixed(2);

  const conveyorTile = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='70' height='34' viewBox='0 0 70 34'><line x1='0' y1='17' x2='70' y2='17' stroke='%23334155' stroke-width='1' stroke-dasharray='4 6'/><rect x='25' y='8' width='20' height='18' rx='3' fill='%23F97316' stroke='%23EA580C' stroke-width='1.5'/><line x1='28' y1='12' x2='38' y2='12' stroke='%23FDBA74' stroke-width='2' stroke-linecap='round'/></svg>")`;

  const maxDisplay = 5;
  const humanIcons = Math.min(numHumans, maxDisplay);
  const humanExtra = numHumans - maxDisplay;

  const robotIcons = Math.min(numRobots, maxDisplay);
  const robotExtra = numRobots - maxDisplay;

  return (
    <section
      className="bg-[#0F172A] text-white rounded-[8px] p-5 sm:p-6 shadow-md border border-[#334155]/60 relative overflow-hidden"
      style={{
        '--th': `${durHuman}s`,
        '--tr': `${durRobot}s`,
        '--d': `${durBelt}s`
      }}
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#334155]/60 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
          <h3 className="font-semibold text-sm sm:text-base tracking-[-0.01em] text-white">
            Live line • Active allocation
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>T_H: {humanServiceTime}m</span>
          <span>•</span>
          <span>T_R: {robotServiceTime}m</span>
          <span>•</span>
          <span className="text-[#38BDF8]">λ: {arrivalRatePerHour}/hr</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
        <div className="bg-[#1E293B]/70 rounded-[8px] p-4 border border-[#334155]/50 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-[#FB923C]">
              HUMANS ({numHumans})
            </span>
            <span className="text-[11px] text-slate-400">
              μ_H = {(1 / humanServiceTime).toFixed(2)}/min
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 overflow-x-auto min-h-[78px]">
            {numHumans > 0 ? (
              <>
                {Array.from({ length: humanIcons }).map((_, i) => (
                  <HumanWorkerIcon key={i} />
                ))}
                {humanExtra > 0 && (
                  <span className="text-sm font-semibold text-[#FB923C] bg-[#EA580C]/20 px-2.5 py-1 rounded border border-[#EA580C]/40">
                    +{humanExtra}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-500 italic py-4">none</span>
            )}
          </div>
        </div>

        <div className="bg-[#1E293B]/70 rounded-[8px] p-4 border border-[#334155]/50 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-xs text-[#7DD3FC]">
              ROBOTS ({numRobots})
            </span>
            <span className="text-[11px] text-slate-400">
              μ_R = {(1 / robotServiceTime).toFixed(2)}/min
            </span>
          </div>

          <div className="flex items-center gap-2 pt-2 overflow-x-auto min-h-[78px]">
            {numRobots > 0 ? (
              <>
                {Array.from({ length: robotIcons }).map((_, i) => (
                  <RobotArmIcon key={i} />
                ))}
                {robotExtra > 0 && (
                  <span className="text-sm font-semibold text-[#7DD3FC] bg-[#7DD3FC]/20 px-2.5 py-1 rounded border border-[#7DD3FC]/40">
                    +{robotExtra}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-slate-500 italic py-4">none</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-0.5">
          <span>Inflow buffer stream</span>
          <span className="text-[#F97316]">Belt pace: {durBelt}s/part</span>
        </div>
        <div
          className="w-full h-[34px] rounded-[5px] animate-conveyor border-y-[3px] border-[#334155]"
          style={{
            backgroundColor: '#1E293B',
            backgroundImage: conveyorTile,
            backgroundRepeat: 'repeat-x'
          }}
          aria-label="Moving conveyor belt with parts"
        />
      </div>
    </section>
  );
}
