import React from 'react';
import { Layers } from 'lucide-react';

export default function Header({ backendStatus, onOpenMethodology }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D3D8DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left: 42px Orange Square + Brand & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-[6px] bg-[#EA580C] flex items-center justify-center text-white shadow-xs shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="font-bold text-[23px] tracking-tight text-[#0F172A] leading-none">
              SmartFactory
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white text-[#667085] border border-[#D3D8DE]">
              HRC Optimizer
            </span>
          </div>
        </div>

        {/* Right: "Engine ready" pill + Methodology link */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {backendStatus === 'ok' ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#15803D] border border-[#D3D8DE] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse-dot" />
                <span>Engine ready</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#B91C1C] border border-[#D3D8DE] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                <span>Connecting...</span>
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-[#D3D8DE]" />

          <button
            onClick={onOpenMethodology}
            className="text-xs font-medium text-[#667085] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            Methodology
          </button>
        </div>
      </div>

      {/* Industrial Hazard Stripe Bar: 10px tall, radius 2px */}
      <div
        className="w-full h-[10px] rounded-[2px]"
        style={{
          background: 'repeating-linear-gradient(-45deg, #0F172A 0 12px, #EA580C 12px 24px)'
        }}
      />
    </header>
  );
}
