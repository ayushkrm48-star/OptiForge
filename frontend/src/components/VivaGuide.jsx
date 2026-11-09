import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function VivaGuide({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#D3D8DE] rounded-[10px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D3D8DE]">
          <div>
            <h3 className="font-semibold text-lg text-[#0F172A]">Operations research methodology</h3>
            <p className="text-xs text-[#667085] mt-0.5">CSN13402 Course Project • PS 16 Technical Reference</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#E4E7EA] hover:bg-[#D3D8DE] text-[#0F172A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Topics */}
        <div className="space-y-4 pt-5 text-xs sm:text-sm text-[#0F172A]">
          {/* Topic 1 */}
          <div className="p-4 rounded-[6px] bg-[#E4E7EA]/40 border border-[#D3D8DE]">
            <h4 className="font-semibold text-[#EA580C] text-xs sm:text-sm flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              1. Heterogeneous queuing vs standard M/M/c
            </h4>
            <p className="leading-relaxed text-[#667085] text-xs">
              Standard Erlang-C formulas assume identical servers with homogeneous rate μ. In human-robot cells, humans (μ_H = 1/T_H) and robots (μ_R = 1/T_R) have distinct rates. The departure rate depends on which server types are actively busy. SimPy discrete-event simulation captures this true multi-server heterogeneous queueing behavior without biased approximations.
            </p>
          </div>

          {/* Topic 2 */}
          <div className="p-4 rounded-[6px] bg-[#E4E7EA]/40 border border-[#D3D8DE]">
            <h4 className="font-semibold text-[#EA580C] text-xs sm:text-sm flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              2. Fastest-Server-First (FSF) policy
            </h4>
            <p className="leading-relaxed text-[#667085] text-xs">
              Arriving parts enter a single shared FIFO queue. When multiple workstations are idle, parts route immediately to the unit with the highest service rate (max μ). When a workstation completes a job, it pulls the oldest part waiting in the FIFO buffer. This minimizes average queue waiting time (W_q).
            </p>
          </div>

          {/* Topic 3 */}
          <div className="p-4 rounded-[6px] bg-[#E4E7EA]/40 border border-[#D3D8DE]">
            <h4 className="font-semibold text-[#EA580C] text-xs sm:text-sm flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              3. Little's Law consistency audit
            </h4>
            <p className="leading-relaxed text-[#667085] text-xs">
              Little's Law defines L_q = λ · W_q. Rather than assuming convergence, our simulation applies a warm-up period (clearing empty-system startup bias), measures over steady-state parts, and averages across multiple replications. The relative discrepancy between observed L_q and expected λ·W_q audits simulation consistency.
            </p>
          </div>

          {/* Topic 4 */}
          <div className="p-4 rounded-[6px] bg-[#E4E7EA]/40 border border-[#D3D8DE]">
            <h4 className="font-semibold text-[#EA580C] text-xs sm:text-sm flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              4. Aggregate stability condition
            </h4>
            <p className="leading-relaxed text-[#667085] text-xs">
              For queue stability, arrival rate λ must strictly remain below aggregate capacity:
              <span className="block my-1.5 p-2 bg-white border border-[#D3D8DE] rounded text-[#0F172A] font-medium">
                λ &lt; H · μ_H + R · μ_R
              </span>
              If λ exceeds capacity, traffic intensity ρ ≥ 1.0. The optimizer flags these combinations as UNSTABLE before simulation.
            </p>
          </div>

          {/* Topic 5 */}
          <div className="p-4 rounded-[6px] bg-[#E4E7EA]/40 border border-[#D3D8DE]">
            <h4 className="font-semibold text-[#EA580C] text-xs sm:text-sm flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" />
              5. Optimization formulation
            </h4>
            <p className="leading-relaxed text-[#0F172A] text-xs p-2 bg-white border border-[#D3D8DE] rounded">
              minimize: W(H, R) = W_q + S<br />
              subject to: H + R = 4, &nbsp; H·C_H + R·C_R ≤ B, &nbsp; λ &lt; H·μ_H + R·μ_R
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#D3D8DE] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
