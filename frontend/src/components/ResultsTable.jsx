import React from 'react';
import { Download } from 'lucide-react';

// 112px SVG Donut Utilization Ring with rounded caps and center percentage
export function UtilizationRing({ percentage = 0 }) {
  const pct = Math.min(Math.max(percentage, 0), 100);
  const r = 44;
  const circ = 2 * Math.PI * r; // ~276.46
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112" className="overflow-visible" aria-label={`Utilization: ${pct}%`}>
        {/* Background Donut Track */}
        <circle
          cx="56"
          cy="56"
          r={r}
          stroke="#1E293B"
          strokeWidth="10"
          fill="none"
        />
        {/* Progress Arc */}
        <circle
          cx="56"
          cy="56"
          r={r}
          stroke="#F97316"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 56 56)"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
        {/* Center Percentage & Label */}
        <text
          x="56"
          y="53"
          textAnchor="middle"
          fill="#FFFFFF"
          className="text-[19px] font-semibold tracking-[-0.025em]"
          style={{ fontFamily: "'Google Sans', sans-serif" }}
        >
          {Math.round(pct)}%
        </text>
        <text
          x="56"
          y="68"
          textAnchor="middle"
          fill="#94A3B8"
          className="text-[10px] font-normal"
          style={{ fontFamily: "'Google Sans', sans-serif" }}
        >
          utilization
        </text>
      </svg>
    </div>
  );
}

export default function ResultsTable({
  optimizationResult,
  selectedConfig,
  onSelectConfig
}) {
  if (!optimizationResult) {
    return (
      <div className="p-8 text-center bg-white border border-[#D3D8DE] rounded-[10px] shadow-xs">
        <p className="text-[#667085] text-sm font-normal">
          Click <strong className="text-[#0F172A] font-semibold">"Run optimization"</strong> above to evaluate all human-robot collaboration ratios.
        </p>
      </div>
    );
  }

  const { optimal_configuration: winner, all_configurations: configs, parameters } = optimizationResult;

  const exportToCSV = () => {
    const headers = [
      "Configuration",
      "Hourly Cost ($/hr)",
      "Budget Limit ($/hr)",
      "Within Budget",
      "Queue Stable",
      "Feasible",
      "Avg Cycle Time W (min)",
      "Avg Waiting Time Wq (min)",
      "Avg Service Time S (min)",
      "Human Utilization rho_H (%)",
      "Robot Utilization rho_R (%)",
      "Observed Lq",
      "Expected Lq",
      "Littles Law Error (%)",
      "Optimal Winner"
    ];
    const rows = configs.map((c) => [
      c.ratio_label,
      c.hourly_cost,
      c.budget_limit,
      c.is_within_budget ? "YES" : "NO",
      c.is_stable ? "YES" : "NO",
      c.is_feasible ? "YES" : "NO",
      c.avg_cycle_time ?? "N/A",
      c.avg_waiting_time ?? "N/A",
      c.avg_service_time ?? "N/A",
      c.human_utilization ?? "N/A",
      c.robot_utilization ?? "N/A",
      c.littles_law?.observed_Lq ?? "N/A",
      c.littles_law?.expected_Lq ?? "N/A",
      c.littles_law?.error_pct ?? "N/A",
      c.is_optimal ? "YES" : "NO"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HRC_Optimal_Mix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Winner Hero & Budget
  const budgetLimit = parameters?.budget_per_hour || 120;
  const humanCost = winner ? winner.num_humans * (parameters?.cost_per_human_hour || 25) : 0;
  const robotCost = winner ? winner.num_robots * (parameters?.cost_per_robot_hour || 35) : 0;
  const totalCost = winner ? winner.hourly_cost : 0;
  const humanPct = Math.min((humanCost / budgetLimit) * 100, 100);
  const robotPct = Math.min((robotCost / budgetLimit) * 100, Math.max(100 - humanPct, 0));
  const totalPct = Math.min(Math.round((totalCost / budgetLimit) * 100), 100);

  // Blended utilization
  const avgUtil = winner
    ? winner.num_humans + winner.num_robots > 0
      ? ((winner.human_utilization || 0) * winner.num_humans + (winner.robot_utilization || 0) * winner.num_robots) /
        (winner.num_humans + winner.num_robots)
      : 0
    : 0;

  // Max cycle time among configs for progress bar scale
  const maxCycleTime = Math.max(
    ...configs.map((c) => (c.avg_cycle_time ? parseFloat(c.avg_cycle_time) : 0)),
    4.0
  );

  // Compute "Faster than all-human" for KPI strip
  const allHumanConfig = configs.find((c) => c.num_humans === 4 && c.num_robots === 0);
  const fasterThanHumanPct =
    allHumanConfig?.avg_cycle_time && winner?.avg_cycle_time
      ? Math.round(
          ((allHumanConfig.avg_cycle_time - winner.avg_cycle_time) / allHumanConfig.avg_cycle_time) * 100
        )
      : null;

  return (
    <div className="space-y-6">
      {/* 1. Hero Card: Navy bg, 2px orange border, 8px radius */}
      {winner ? (
        <div className="bg-[#0F172A] border-2 border-[#EA580C] rounded-[8px] p-6 sm:p-7 shadow-lg relative overflow-hidden text-white">
          {/* Decorative top-right circle filled with orange hazard stripes at ~22% opacity */}
          <div
            className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none opacity-[0.22] overflow-hidden"
            style={{
              background: 'repeating-linear-gradient(-45deg, #0F172A 0 8px, #EA580C 8px 16px)'
            }}
            aria-hidden="true"
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* Left Info: Big Mix Text + Metrics */}
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#EA580C] bg-[#EA580C]/20 px-2.5 py-0.5 rounded border border-[#EA580C]/30">
                Optimal mix
              </span>

              {/* Big Mix Text: 44px, weight 600, letter-spacing -0.025em */}
              <div className="font-semibold text-3xl sm:text-[44px] tracking-[-0.025em] leading-tight mt-2 flex items-baseline gap-3 flex-wrap">
                <span className="text-[#FB923C]">{winner.num_humans} humans</span>
                <span className="text-slate-500 font-light text-2xl sm:text-3xl">+</span>
                <span className="text-[#7DD3FC]">{winner.num_robots} robots</span>
              </div>

              {/* Below: avg cycle time (min) and total cost ($/hr) */}
              <div className="flex items-center gap-6 mt-4 flex-wrap pt-1 text-[16px] sm:text-[18px] text-white">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400">Avg cycle time:</span>
                  <span className="font-semibold text-[#F97316] tracking-[-0.01em]">
                    {winner.avg_cycle_time} min
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-700 hidden sm:block" />
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400">Total cost:</span>
                  <span className="font-semibold text-[#15803D] tracking-[-0.01em]">
                    ${winner.hourly_cost}/hr
                  </span>
                </div>
              </div>
            </div>

            {/* Right: 112px SVG Donut Utilization Ring */}
            <div className="flex items-center gap-5 pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8">
              <UtilizationRing percentage={avgUtil} />
              <div className="text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  <span>Human util: {winner.human_utilization}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7DD3FC]" />
                  <span>Robot util: {winner.robot_utilization}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-[8px] bg-white border border-[#B91C1C] text-[#B91C1C] shadow-sm">
          <h4 className="font-semibold text-base mb-1">No stable mix</h4>
          <p className="text-xs text-[#667085]">
            Arrivals exceed what the budget can serve. Raise the budget or lower the arrival rate.
          </p>
        </div>
      )}

      {/* 2. Budget Card: White card with 14px pill-shaped stacked bar */}
      <div className="bg-white border border-[#D3D8DE] rounded-[8px] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#0F172A]">Budget used</span>
            <span className="text-xs text-[#667085]">(${budgetLimit}/hr ceiling)</span>
          </div>
          {winner ? (
            <span className="text-xs font-semibold text-[#0F172A]">
              ${totalCost} of ${budgetLimit} ({totalPct}%)
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#B91C1C]">
              No stable mix within budget
            </span>
          )}
        </div>

        {/* 14px Pill-shaped Stacked Bar */}
        <div className="w-full h-[14px] rounded-full bg-[#E4E7EA] overflow-hidden flex border border-[#D3D8DE]">
          {winner && (
            <>
              {/* Human Cost Segment (Orange) */}
              <div
                style={{ width: `${humanPct}%` }}
                className="h-full bg-[#EA580C] transition-all duration-500"
                title={`Human Cost: $${humanCost}/hr (${Math.round(humanPct)}%)`}
              />
              {/* Robot Cost Segment (Navy) */}
              <div
                style={{ width: `${robotPct}%` }}
                className="h-full bg-[#0F172A] transition-all duration-500"
                title={`Robot Cost: $${robotCost}/hr (${Math.round(robotPct)}%)`}
              />
            </>
          )}
        </div>

        {/* Small Legend */}
        <div className="flex items-center gap-5 mt-3 text-xs text-[#667085] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
            <span>Human: ${humanCost}/hr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
            <span>Robot: ${robotCost}/hr</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D3D8DE]" />
            <span>Remaining: ${Math.max(budgetLimit - totalCost, 0)}/hr</span>
          </div>
        </div>
      </div>

      {/* 3. Allocation Comparison Table Card */}
      <div className="space-y-3">
        {/* Toolbar: title + "N = 4 workers" + Export CSV button */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold text-[20px] text-[#0F172A] tracking-[-0.01em]">
              Allocation comparison
            </h3>
            <span className="text-xs text-[#667085] font-normal">
              N = 4 workers
            </span>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-[8px] bg-white hover:bg-[#E4E7EA] text-[#0F172A] border border-[#D3D8DE] shadow-2xs transition-colors cursor-pointer"
            title="Download CSV for project defense"
          >
            <Download className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Card: white, 1px --bd border, radius 14px, overflow-x: auto */}
        <div className="bg-white border border-[#D3D8DE] rounded-[14px] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1020px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr className="bg-[#F8F9FB] border-b border-[#D3D8DE] text-[#667085] text-[12.5px] font-medium">
                  <th className="py-3 px-4 font-medium">
                    <div>Configuration</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">H : R</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Hourly cost</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">$/hr</div>
                  </th>
                  <th className="py-3 px-3 font-medium">
                    <div>Budget check</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">≤ B</div>
                  </th>
                  <th className="py-3 px-3 font-medium">
                    <div>Stability</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">λ &lt; C</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Cycle time</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">W (min)</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Wait time</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">W_q (min)</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Human util</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">ρ_H</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Robot util</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">ρ_R</div>
                  </th>
                  <th className="py-3 px-3 text-right font-medium">
                    <div>Little's law</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">error</div>
                  </th>
                  <th className="py-3 px-4 text-right font-medium">
                    <div>Action</div>
                    <div className="text-[11px] text-[#667085]/80 font-normal">preview</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF0F3]">
                {configs.map((c) => {
                  const isSelected = selectedConfig.h === c.num_humans && selectedConfig.r === c.num_robots;
                  const isWinner = c.is_optimal;
                  const isOverBudget = !c.is_within_budget;
                  const diffCost = c.hourly_cost - budgetLimit;

                  // Bar percentage for cycle time
                  const ctNum = c.avg_cycle_time ? parseFloat(c.avg_cycle_time) : 0;
                  const ctBarWidth = maxCycleTime > 0 ? Math.min((ctNum / maxCycleTime) * 84, 84) : 0;

                  // Delta vs best
                  let deltaText = '--';
                  if (isWinner) {
                    deltaText = 'fastest in budget';
                  } else if (winner && c.avg_cycle_time) {
                    const diff = (parseFloat(c.avg_cycle_time) - parseFloat(winner.avg_cycle_time)).toFixed(2);
                    deltaText = `+${diff} vs best`;
                  }

                  return (
                    <tr
                      key={c.ratio_label}
                      className={`h-16 transition-colors hover:bg-[#F8F9FB]`}
                      style={{
                        background: isWinner
                          ? 'linear-gradient(90deg, rgba(234,88,12,0.09), rgba(234,88,12,0.03) 60%)'
                          : undefined
                      }}
                    >
                      {/* Configuration: "2H : 2R", weight 600 15px, "H" part orange, "R" part navy, ":" in light grey #B0B7C3 */}
                      <td
                        className="py-3 px-4"
                        style={{
                          boxShadow: isWinner ? 'inset 3px 0 0 #EA580C' : undefined
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[15px]">
                            <span className="text-[#EA580C]">{c.num_humans}H</span>
                            <span className="text-[#B0B7C3] mx-1">:</span>
                            <span className="text-[#0F172A]">{c.num_robots}R</span>
                          </span>
                          {isWinner && (
                            <span className="text-[10.5px] font-semibold bg-[#EA580C] text-white px-1.5 py-0.5 rounded-[5px] tracking-[0.05em]">
                              BEST
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Hourly Cost: "$120" weight 500 + "/hr" small muted */}
                      <td className="py-3 px-3 text-right">
                        <span className={`text-[14px] font-medium text-[#0F172A] ${isOverBudget ? 'opacity-75' : ''}`}>
                          ${c.hourly_cost}
                        </span>
                        <span className="text-[11px] text-[#667085] ml-0.5">/hr</span>
                      </td>

                      {/* Budget Check: soft pill with 6px dot (radius 99px, 12.5px/500) */}
                      <td className="py-3 px-3">
                        {c.is_within_budget ? (
                          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#15803D] bg-[#ECFDF3] px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                            <span>Within</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#B91C1C] bg-[#FEF3F2] px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                            <span>Over by ${diffCost}</span>
                          </span>
                        )}
                      </td>

                      {/* Stability: neutral pill (#475467 on #F2F4F7) with dot */}
                      <td className="py-3 px-3">
                        {c.is_stable ? (
                          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#475467] bg-[#F2F4F7] px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#475467]" />
                            <span>Stable</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#B91C1C] bg-[#FEF3F2] px-2.5 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                            <span>Overload</span>
                          </span>
                        )}
                      </td>

                      {/* Cycle time: right-aligned bold value, below it 84x4px bar, below that 11.5px muted delta */}
                      <td className="py-3 px-3 text-right">
                        {c.avg_cycle_time !== null ? (
                          <div className={`flex flex-col items-end ${isOverBudget ? 'opacity-75' : ''}`}>
                            <span className={`text-[13px] font-bold ${isWinner ? 'text-[#EA580C]' : 'text-[#0F172A]'}`}>
                              {c.avg_cycle_time} min
                            </span>
                            <div className="w-[84px] h-[4px] bg-[#E4E7EA] rounded-full overflow-hidden my-1">
                              <div
                                className="h-full rounded-full bg-[#98A2B3]"
                                style={{ width: `${ctBarWidth}px` }}
                              />
                            </div>
                            <span className="text-[11.5px] text-[#667085] font-normal">
                              {deltaText}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#667085] text-xs">--</span>
                        )}
                      </td>

                      {/* Wait time: muted color, normal weight */}
                      <td className="py-3 px-3 text-right text-xs text-[#667085] font-normal">
                        {c.avg_waiting_time !== null ? `${c.avg_waiting_time} min` : '--'}
                      </td>

                      {/* Human util: orange value + 84x4px orange progress bar */}
                      <td className="py-3 px-3 text-right">
                        {c.human_utilization !== null ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-[#EA580C]">
                              {c.human_utilization}%
                            </span>
                            <div className="w-[84px] h-[4px] bg-[#E4E7EA] rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full bg-[#EA580C]"
                                style={{ width: `${Math.min(c.human_utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#667085] text-xs">--</span>
                        )}
                      </td>

                      {/* Robot util: navy value + navy bar */}
                      <td className="py-3 px-3 text-right">
                        {c.robot_utilization !== null ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-[#0F172A]">
                              {c.robot_utilization}%
                            </span>
                            <div className="w-[84px] h-[4px] bg-[#E4E7EA] rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full bg-[#0F172A]"
                                style={{ width: `${Math.min(c.robot_utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#667085] text-xs">--</span>
                        )}
                      </td>

                      {/* Little's law: muted color, normal weight */}
                      <td className="py-3 px-3 text-right text-xs text-[#667085] font-normal">
                        {c.littles_law ? (
                          <span title={`Observed Lq: ${c.littles_law.observed_Lq}, Expected: ${c.littles_law.expected_Lq}`}>
                            ±{c.littles_law.error_pct}%
                          </span>
                        ) : (
                          '--'
                        )}
                      </td>

                      {/* Action column: "Select" = white outline button (radius 8px), "Active" = navy filled button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectConfig(c.num_humans, c.num_robots)}
                          className={`text-xs px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F172A] text-white font-semibold shadow-xs'
                              : 'bg-white text-[#0F172A] hover:bg-[#E4E7EA] border border-[#D3D8DE]'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Under the table: KPI strip (bg #F8F9FB, top border, 4 equal cells separated by 1px lines) */}
          <div className="bg-[#F8F9FB] border-t border-[#D3D8DE] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#EDF0F3]">
            {/* Cell 1: Best mix */}
            <div className="p-4 sm:p-5">
              <span className="text-[12.5px] text-[#667085] block font-normal">
                Best mix
              </span>
              <div className="text-[26px] sm:text-[30px] font-semibold text-[#EA580C] tracking-[-0.01em] mt-1">
                {winner ? `${winner.num_humans}H : ${winner.num_robots}R` : 'None'}
              </div>
            </div>

            {/* Cell 2: Cycle time */}
            <div className="p-4 sm:p-5">
              <span className="text-[12.5px] text-[#667085] block font-normal">
                Cycle time
              </span>
              <div className="text-[26px] sm:text-[30px] font-semibold text-[#0F172A] tracking-[-0.01em] mt-1">
                {winner ? `${winner.avg_cycle_time} min` : '--'}
              </div>
            </div>

            {/* Cell 3: Faster than all-human */}
            <div className="p-4 sm:p-5">
              <span className="text-[12.5px] text-[#667085] block font-normal">
                Faster than all-human
              </span>
              <div className="text-[26px] sm:text-[30px] font-semibold text-[#0F172A] tracking-[-0.01em] mt-1">
                {fasterThanHumanPct !== null
                  ? `${fasterThanHumanPct > 0 ? '+' : ''}${fasterThanHumanPct}%`
                  : 'N/A'}
              </div>
            </div>

            {/* Cell 4: Budget used */}
            <div className="p-4 sm:p-5">
              <span className="text-[12.5px] text-[#667085] block font-normal">
                Budget used
              </span>
              <div className="text-[22px] sm:text-[28px] font-semibold text-[#0F172A] tracking-[-0.01em] mt-1">
                ${totalCost} of ${budgetLimit}/hr
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
