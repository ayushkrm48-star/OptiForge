import React, { useState } from 'react';
import { User, Bot, ArrowRight, AlertOctagon, Terminal } from 'lucide-react';

export default function FactoryFloor({
  simData,
  selectedConfig,
  params
}) {
  const [activeTab, setActiveTab] = useState('floor'); // 'floor' | 'logs'

  const { h, r } = selectedConfig;
  const isStable = simData?.is_stable !== false;
  const mu_H = params.human_mean_service_time > 0 ? (1 / params.human_mean_service_time).toFixed(2) : 0;
  const mu_R = params.robot_mean_service_time > 0 ? (1 / params.robot_mean_service_time).toFixed(2) : 0;
  const fasterType = parseFloat(mu_R) >= parseFloat(mu_H) ? 'ROBOT' : 'HUMAN';

  // Build 4 workstation pods
  const workstations = [];
  for (let i = 1; i <= h; i++) {
    const isBusy = (simData?.human_utilization ?? 50) > 20;
    workstations.push({
      id: `Human-${i}`,
      type: 'HUMAN',
      name: `Human station #${i}`,
      rate: mu_H,
      meanTime: params.human_mean_service_time,
      utilization: simData?.human_utilization ?? 0,
      isFaster: fasterType === 'HUMAN',
      isBusy: isBusy
    });
  }
  for (let j = 1; j <= r; j++) {
    const isBusy = (simData?.robot_utilization ?? 50) > 20;
    workstations.push({
      id: `Robot-${j}`,
      type: 'ROBOT',
      name: `Robot station #${j}`,
      rate: mu_R,
      meanTime: params.robot_mean_service_time,
      utilization: simData?.robot_utilization ?? 0,
      isFaster: fasterType === 'ROBOT',
      isBusy: isBusy
    });
  }

  const queueLength = simData?.littles_law ? Math.min(Math.round(simData.littles_law.observed_Lq || 1), 6) : 2;
  const queueTokens = Array.from({ length: Math.max(queueLength, 1) }, (_, i) => i + 1);

  return (
    <section className="bg-white border border-[#D3D8DE] rounded-[10px] p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D3D8DE]/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-lg text-[#0F172A] tracking-[-0.01em]">
              Workstation allocation & buffer
            </h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E4E7EA] text-[#0F172A] border border-[#D3D8DE]">
              Active: {h}H : {r}R
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5 font-normal">
            Single shared FIFO queue with Fastest-Server-First (FSF) dispatch routing
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-[6px] bg-[#EEF0F2] border border-[#D3D8DE] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('floor')}
            className={`text-xs px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
              activeTab === 'floor'
                ? 'bg-[#0F172A] text-white font-medium shadow-2xs'
                : 'text-[#667085] hover:text-[#0F172A]'
            }`}
          >
            Floor layout
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#0F172A] text-white font-medium shadow-2xs'
                : 'text-[#667085] hover:text-[#0F172A]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Events ({simData?.event_log?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Stability Warning Banner if Unstable */}
      {!isStable && (
        <div className="mt-5 p-4 rounded-[6px] bg-[#B91C1C]/10 border border-[#B91C1C] text-[#B91C1C] flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-[#B91C1C]">System capacity overloaded (unstable queue)</h4>
            <p className="text-xs text-[#B91C1C]/90 mt-1 leading-relaxed">
              Arrival rate λ ({simData?.arrival_rate_per_min || (params.arrival_rate_per_hour/60).toFixed(2)} parts/min)
              exceeds total service capacity ({simData?.total_capacity_per_min || 0} parts/min).
              Queue length will explode to infinity without bound.
            </p>
          </div>
        </div>
      )}

      {/* Clean Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-[6px] bg-[#E4E7EA]/60 border border-[#D3D8DE]">
          <span className="text-xs text-[#667085] block font-normal">Traffic intensity (ρ)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-xl font-bold tracking-tight ${
              (simData?.traffic_intensity || 0) >= 1.0 ? 'text-[#B91C1C]' : 'text-[#0F172A]'
            }`}>
              {simData?.traffic_intensity ? simData.traffic_intensity : ((params.arrival_rate_per_hour / 60) / Math.max(h*(1/params.human_mean_service_time) + r*(1/params.robot_mean_service_time), 0.001)).toFixed(2)}
            </span>
            <span className="text-xs text-[#667085]">(&lt; 1.0 target)</span>
          </div>
        </div>

        <div className="p-4 rounded-[6px] bg-[#E4E7EA]/60 border border-[#D3D8DE]">
          <span className="text-xs text-[#667085] block font-normal">Avg waiting time (W_q)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">
              {simData?.avg_waiting_time !== undefined && simData?.avg_waiting_time !== null ? simData.avg_waiting_time : '--'}
            </span>
            <span className="text-xs text-[#667085]">min</span>
          </div>
        </div>

        <div className="p-4 rounded-[6px] bg-[#E4E7EA]/60 border border-[#D3D8DE]">
          <span className="text-xs text-[#667085] block font-normal">Avg cycle time (W)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold tracking-tight text-[#EA580C]">
              {simData?.avg_cycle_time !== undefined && simData?.avg_cycle_time !== null ? simData.avg_cycle_time : '--'}
            </span>
            <span className="text-xs text-[#667085]">min (W_q + S)</span>
          </div>
        </div>

        <div className="p-4 rounded-[6px] bg-[#E4E7EA]/60 border border-[#D3D8DE]">
          <span className="text-xs text-[#667085] block font-normal">Dispatch routing</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-sm font-semibold text-[#0F172A]">
              FSF policy
            </span>
            <span className="text-xs text-[#EA580C] font-medium">
              (Favors {fasterType})
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'floor' ? (
        /* Visualizer Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Inflow Buffer */}
          <div className="lg:col-span-4 bg-[#E4E7EA]/50 rounded-[6px] p-5 border border-[#D3D8DE] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#D3D8DE]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EA580C]"></span>
                  <span className="text-xs font-semibold text-[#0F172A]">Shared FIFO queue</span>
                </div>
                <span className="text-xs text-[#667085]">
                  L_q: {simData?.littles_law?.observed_Lq ?? queueLength}
                </span>
              </div>

              <p className="text-xs text-[#667085] my-3 leading-relaxed">
                Parts arrive at λ = {(params.arrival_rate_per_hour/60).toFixed(2)} parts/min and queue when all 4 workstations are busy.
              </p>

              {/* Queue Tokens */}
              <div className="space-y-2 mt-3">
                {queueTokens.map((token) => (
                  <div
                    key={token}
                    className="flex items-center justify-between px-3 py-2 rounded bg-white border border-[#D3D8DE] text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-[#EA580C]/10 text-[#EA580C] text-[11px] font-bold flex items-center justify-center border border-[#EA580C]/20">
                        #{token}
                      </span>
                      <span className="text-[#0F172A] font-medium">Part in queue</span>
                    </div>
                    <span className="text-[11px] text-[#667085]">Pos {token}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Routing indicator */}
            <div className="mt-5 pt-3 border-t border-[#D3D8DE] flex items-center justify-center text-[#667085] gap-1.5 text-xs">
              <span>Fastest-Server-First</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EA580C]" />
            </div>
          </div>

          {/* Right: 4 Workstation Bays */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {workstations.map((ws, idx) => (
              <div
                key={ws.id}
                className="p-5 rounded-[6px] bg-white border border-[#D3D8DE] shadow-2xs hover:border-[#0F172A] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded border ${
                        ws.type === 'ROBOT'
                          ? 'bg-[#0F172A]/10 text-[#0F172A] border-[#0F172A]/20'
                          : 'bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20'
                      }`}>
                        {ws.type === 'ROBOT' ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#0F172A]">{ws.name}</h4>
                        <span className="text-[11px] text-[#667085]">Bay #{idx + 1}</span>
                      </div>
                    </div>

                    {ws.isFaster && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30">
                        FASTEST
                      </span>
                    )}
                  </div>

                  {/* Processing Specs Box */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-[#E4E7EA]/50 p-2.5 rounded border border-[#D3D8DE]/70">
                    <div>
                      <span className="text-[#667085] block text-[10px]">Rate (μ)</span>
                      <span className="font-semibold text-[#0F172A]">{ws.rate}/min</span>
                    </div>
                    <div>
                      <span className="text-[#667085] block text-[10px]">Mean (T)</span>
                      <span className="font-semibold text-[#0F172A]">{ws.meanTime} min</span>
                    </div>
                  </div>
                </div>

                {/* Utilization Progress Track */}
                <div className="mt-4 pt-3 border-t border-[#D3D8DE]/60">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-[#667085]">Utilization (ρ)</span>
                    <span className="font-semibold text-[#0F172A]">{ws.utilization}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E4E7EA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ws.type === 'ROBOT' ? 'bg-[#0F172A]' : 'bg-[#EA580C]'
                      }`}
                      style={{ width: `${Math.min(ws.utilization, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Event Log Stream */
        <div className="bg-[#0F172A] border border-[#334155] rounded-[6px] p-5 text-xs max-h-80 overflow-y-auto text-slate-300">
          {simData?.event_log && simData.event_log.length > 0 ? (
            <div className="space-y-2">
              {simData.event_log.map((log, index) => (
                <div key={index} className="flex items-start gap-3 py-1.5 border-b border-[#334155]/60 text-slate-300">
                  <span className="text-slate-400 text-[11px] shrink-0">[{log.time}m]</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                    log.event === 'ASSIGNED' ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/30' :
                    log.event === 'COMPLETED' ? 'bg-[#15803D]/20 text-[#86EFAC] border border-[#15803D]/30' :
                    log.event === 'PULLED_FROM_QUEUE' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                    'bg-[#EA580C]/20 text-[#FB923C] border border-[#EA580C]/30'
                  }`}>
                    {log.event}
                  </span>
                  <span className="text-slate-300 text-xs">{log.detail}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              No event log recorded yet. Run a simulation to stream live SimPy events.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
