import React from 'react';
import { Play, Zap } from 'lucide-react';

export default function ConfigPanel({
  params,
  onChange,
  onRunOptimization,
  onRunSingleSim,
  isOptimizing,
  isSimulating,
  selectedConfig,
  onSelectConfig
}) {
  const PRESETS = [
    {
      id: 'balanced',
      name: 'Balanced Standard',
      desc: 'Standard assembly: λ=40/hr, $120/hr budget',
      values: {
        arrival_rate_per_hour: 40,
        human_mean_service_time: 4.0,
        robot_mean_service_time: 2.0,
        cost_per_human_hour: 25,
        cost_per_robot_hour: 35,
        budget_per_hour: 120
      }
    },
    {
      id: 'high-workload',
      name: 'High Workload',
      desc: 'High demand: λ=55/hr, $135/hr budget',
      values: {
        arrival_rate_per_hour: 55,
        human_mean_service_time: 4.5,
        robot_mean_service_time: 1.8,
        cost_per_human_hour: 22,
        cost_per_robot_hour: 40,
        budget_per_hour: 135
      }
    },
    {
      id: 'constrained',
      name: 'Constrained Budget',
      desc: 'Tight funds: λ=30/hr, $95/hr budget',
      values: {
        arrival_rate_per_hour: 30,
        human_mean_service_time: 3.5,
        robot_mean_service_time: 2.2,
        cost_per_human_hour: 20,
        cost_per_robot_hour: 32,
        budget_per_hour: 95
      }
    }
  ];

  const activePresetId = PRESETS.find(
    (p) =>
      p.values.arrival_rate_per_hour === params.arrival_rate_per_hour &&
      p.values.human_mean_service_time === params.human_mean_service_time &&
      p.values.robot_mean_service_time === params.robot_mean_service_time &&
      p.values.cost_per_human_hour === params.cost_per_human_hour &&
      p.values.cost_per_robot_hour === params.cost_per_robot_hour &&
      p.values.budget_per_hour === params.budget_per_hour
  )?.id;

  const handlePreset = (preset) => {
    onChange({ ...params, ...preset.values });
  };

  const handleInputChange = (field, value) => {
    const num = parseFloat(value);
    onChange({
      ...params,
      [field]: isNaN(num) ? 0 : num
    });
  };

  return (
    <section
      className="corner-brackets border border-[#D3D8DE] rounded-[10px] p-6 sm:p-7 relative transition-all"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        boxShadow: '0 18px 40px -22px rgba(15, 23, 42, 0.35)'
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#D3D8DE]/70">
        <div>
          <h2 className="font-semibold text-xl sm:text-2xl text-[#0F172A] tracking-[-0.01em]">
            Configuration & parameters
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5 font-normal">
            Calibrate arrival flows, service rates, and workstation budget
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-[6px] bg-[#EEF0F2] border border-[#D3D8DE] self-start lg:self-auto">
          {PRESETS.map((p) => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePreset(p)}
                className={`text-xs px-3 py-1.5 rounded-[4px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white font-medium shadow-xs'
                    : 'text-[#667085] hover:text-[#0F172A] hover:bg-white/60'
                }`}
                title={p.desc}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#EA580C] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Arrival rate (λ)
            </span>
            <span className="bg-[#EA580C]/10 text-[#EA580C] px-2.5 py-1 rounded text-xs font-semibold border border-[#EA580C]/20">
              {params.arrival_rate_per_hour} <span className="text-[10px] font-normal text-[#667085]">parts/hr</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={params.arrival_rate_per_hour}
              onChange={(e) => handleInputChange('arrival_rate_per_hour', e.target.value)}
              style={{ accentColor: '#EA580C' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>10/hr</span>
            <span className="text-[#0F172A] font-medium">
              {(params.arrival_rate_per_hour / 60).toFixed(2)} parts/min
            </span>
            <span>80/hr</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#EA580C] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Human service (T_H)
            </span>
            <span className="bg-[#EA580C]/10 text-[#EA580C] px-2.5 py-1 rounded text-xs font-semibold border border-[#EA580C]/20">
              {params.human_mean_service_time} <span className="text-[10px] font-normal text-[#667085]">min/part</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.1"
              value={params.human_mean_service_time}
              onChange={(e) => handleInputChange('human_mean_service_time', e.target.value)}
              style={{ accentColor: '#EA580C' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>1.0 min</span>
            <span className="text-[#0F172A] font-medium">
              μ_H = {(1 / params.human_mean_service_time).toFixed(2)}/min
            </span>
            <span>8.0 min</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#0F172A] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Robot service (T_R)
            </span>
            <span className="bg-[#0F172A]/10 text-[#0F172A] px-2.5 py-1 rounded text-xs font-semibold border border-[#0F172A]/20">
              {params.robot_mean_service_time} <span className="text-[10px] font-normal text-[#667085]">min/part</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="0.8"
              max="6.0"
              step="0.1"
              value={params.robot_mean_service_time}
              onChange={(e) => handleInputChange('robot_mean_service_time', e.target.value)}
              style={{ accentColor: '#0F172A' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>0.8 min</span>
            <span className="text-[#0F172A] font-medium">
              μ_R = {(1 / params.robot_mean_service_time).toFixed(2)}/min
            </span>
            <span>6.0 min</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#EA580C] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Human wage (C_H)
            </span>
            <span className="bg-[#EA580C]/10 text-[#EA580C] px-2.5 py-1 rounded text-xs font-semibold border border-[#EA580C]/20">
              ${params.cost_per_human_hour} <span className="text-[10px] font-normal text-[#667085]">/hr</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={params.cost_per_human_hour}
              onChange={(e) => handleInputChange('cost_per_human_hour', e.target.value)}
              style={{ accentColor: '#EA580C' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>$10</span>
            <span className="text-[#0F172A] font-medium">Per human worker</span>
            <span>$60</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#0F172A] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Robot op. cost (C_R)
            </span>
            <span className="bg-[#0F172A]/10 text-[#0F172A] px-2.5 py-1 rounded text-xs font-semibold border border-[#0F172A]/20">
              ${params.cost_per_robot_hour} <span className="text-[10px] font-normal text-[#667085]">/hr</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="15"
              max="80"
              step="1"
              value={params.cost_per_robot_hour}
              onChange={(e) => handleInputChange('cost_per_robot_hour', e.target.value)}
              style={{ accentColor: '#0F172A' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>$15</span>
            <span className="text-[#0F172A] font-medium">Power & upkeep</span>
            <span>$80</span>
          </div>
        </div>

        <div className="bg-white rounded-[8px] p-5 border border-[#D3D8DE] border-l-4 border-l-[#15803D] shadow-2xs flex flex-col justify-between h-[160px]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">
              Total budget (B)
            </span>
            <span className="bg-[#15803D]/10 text-[#15803D] px-2.5 py-1 rounded text-xs font-semibold border border-[#15803D]/20">
              ${params.budget_per_hour} <span className="text-[10px] font-normal text-[#667085]">/hr</span>
            </span>
          </div>

          <div className="my-auto py-2">
            <input
              type="range"
              min="60"
              max="250"
              step="5"
              value={params.budget_per_hour}
              onChange={(e) => handleInputChange('budget_per_hour', e.target.value)}
              style={{ accentColor: '#15803D' }}
              className="w-full h-1.5 bg-[#E4E7EA] rounded-full appearance-none cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-[#667085]">
            <span>$60</span>
            <span className="text-[#0F172A] font-medium">H·C_H + R·C_R ≤ B</span>
            <span>$250</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-[#D3D8DE]/70 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-[#0F172A]">
            Preview ratio:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { h: 4, r: 0 },
              { h: 3, r: 1 },
              { h: 2, r: 2 },
              { h: 1, r: 3 },
              { h: 0, r: 4 }
            ].map((cfg) => {
              const isSelected = selectedConfig.h === cfg.h && selectedConfig.r === cfg.r;
              const cost = cfg.h * params.cost_per_human_hour + cfg.r * params.cost_per_robot_hour;
              const overBudget = cost > params.budget_per_hour;

              return (
                <button
                  key={`${cfg.h}-${cfg.r}`}
                  onClick={() => onSelectConfig(cfg.h, cfg.r)}
                  className={`text-xs px-2.5 py-1.5 rounded-[6px] transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F172A] text-white border-[#0F172A] font-semibold shadow-xs'
                      : overBudget
                      ? 'border-[#D3D8DE] bg-[#E4E7EA]/60 text-[#667085] hover:bg-[#E4E7EA]'
                      : 'border-[#D3D8DE] bg-white text-[#0F172A] hover:bg-[#E4E7EA]'
                  }`}
                >
                  <span>{cfg.h}H : {cfg.r}R</span>
                  <span className={`ml-1.5 text-[11px] ${isSelected ? 'text-orange-300' : overBudget ? 'text-[#B91C1C]' : 'text-[#667085]'}`}>
                    ${cost}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunSingleSim}
            disabled={isSimulating || isOptimizing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-[6px] text-xs font-medium bg-white border border-[#D3D8DE] text-[#0F172A] hover:bg-[#E4E7EA] shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#EA580C]" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate preview'}</span>
          </button>

          <button
            onClick={onRunOptimization}
            disabled={isOptimizing || isSimulating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-[6px] text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-[#EA580C]" />
            <span>{isOptimizing ? 'Optimizing...' : 'Run optimization'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
