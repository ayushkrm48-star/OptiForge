import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { BarChart3, TrendingDown, Activity } from 'lucide-react';

export default function AnalyticsCharts({ optimizationResult, budgetLimit }) {
  if (!optimizationResult) return null;

  const { all_configurations: configs } = optimizationResult;

  const chartData = configs.map((c) => ({
    name: c.ratio_label,
    cycleTime: c.avg_cycle_time,
    waitingTime: c.avg_waiting_time,
    serviceTime: c.avg_service_time,
    cost: c.hourly_cost,
    humanUtil: c.human_utilization ?? 0,
    robotUtil: c.robot_utilization ?? 0,
    isFeasible: c.is_feasible,
    isWinner: c.is_optimal,
    isOverBudget: !c.is_within_budget
  }));

  const fontStyle = { fontFamily: "'Google Sans', sans-serif" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Cycle time (W) vs. allocation ratio */}
        <div className="p-6 rounded-[14px] bg-white border border-[#D3D8DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#EA580C]" />
                <h4 className="font-semibold text-sm text-[#0F172A]">
                  Cycle time (W) vs. allocation ratio
                </h4>
              </div>
              <span className="text-xs text-[#667085]">Objective: Min W</span>
            </div>
            <p className="text-xs text-[#667085] mb-6">
              Total manufacturing cycle time (W = W_q + S) across candidate ratios
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F3" vertical={false} />
                <XAxis dataKey="name" stroke="#667085" fontSize={12} style={fontStyle} />
                <YAxis stroke="#667085" fontSize={12} unit="m" style={fontStyle} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D3D8DE',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#0F172A',
                    fontFamily: "'Google Sans', sans-serif",
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value, name) => [
                    `${value} min`,
                    name === 'cycleTime' ? 'Total cycle time (W)' : 'Waiting time (W_q)'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: "'Google Sans', sans-serif" }} />
                <Bar dataKey="cycleTime" name="Cycle time (W)" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isWinner ? '#EA580C' : entry.isOverBudget ? '#B91C1C' : '#0F172A'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="waitingTime" name="Queue wait (W_q)" fill="#F59E0B" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-[#667085] mt-4 pt-3 border-t border-[#D3D8DE]/60 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
              Optimal winner
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]" />
              Feasible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
              Over budget
            </span>
          </div>
        </div>

        {/* Chart 2: Operating cost vs. budget limit */}
        <div className="p-6 rounded-[14px] bg-white border border-[#D3D8DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0F172A]" />
                <h4 className="font-semibold text-sm text-[#0F172A]">
                  Operating cost vs. budget limit
                </h4>
              </div>
              <span className="text-xs text-[#15803D] font-semibold">
                Budget: ${budgetLimit}/hr
              </span>
            </div>
            <p className="text-xs text-[#667085] mb-6">
              Hourly operational spend comparison against budget ceiling
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F3" vertical={false} />
                <XAxis dataKey="name" stroke="#667085" fontSize={12} style={fontStyle} />
                <YAxis stroke="#667085" fontSize={12} unit="$" style={fontStyle} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D3D8DE',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#0F172A',
                    fontFamily: "'Google Sans', sans-serif",
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => [`$${value}/hr`, 'Hourly cost']}
                />
                <ReferenceLine
                  y={budgetLimit}
                  stroke="#15803D"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Budget ceiling',
                    fill: '#15803D',
                    fontSize: 12,
                    position: 'top',
                    fontFamily: "'Google Sans', sans-serif"
                  }}
                />
                <Bar dataKey="cost" name="Hourly cost ($/hr)" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cost-${index}`}
                      fill={entry.cost <= budgetLimit ? '#0F172A' : '#B91C1C'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-[#667085] text-center mt-4 pt-3 border-t border-[#D3D8DE]/60">
            Ratios exceeding the green line exceed the operational budget limit B.
          </p>
        </div>
      </div>

      {/* Chart 3: Workstation utilization breakdown */}
      <div className="p-6 rounded-[14px] bg-white border border-[#D3D8DE] shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#EA580C]" />
            <h4 className="font-semibold text-sm text-[#0F172A]">
              Workstation utilization breakdown
            </h4>
          </div>
          <span className="text-xs text-[#667085]">FSF priority routing</span>
        </div>
        <p className="text-xs text-[#667085] mb-6">
          Steady-state workload fraction captured by human workers (ρ_H) vs robot units (ρ_R)
        </p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF0F3" vertical={false} />
              <XAxis dataKey="name" stroke="#667085" fontSize={12} style={fontStyle} />
              <YAxis stroke="#667085" fontSize={12} unit="%" domain={[0, 100]} style={fontStyle} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D3D8DE',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0F172A',
                  fontFamily: "'Google Sans', sans-serif",
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(val, name) => [`${val}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontFamily: "'Google Sans', sans-serif" }} />
              <Bar dataKey="humanUtil" name="Human utilization (ρ_H)" fill="#EA580C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="robotUtil" name="Robot utilization (ρ_R)" fill="#0F172A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
