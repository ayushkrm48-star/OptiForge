import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FactoryBackground from './components/FactoryBackground';
import ConfigPanel from './components/ConfigPanel';
import LiveLine from './components/LiveLine';
import FactoryFloor from './components/FactoryFloor';
import ResultsTable from './components/ResultsTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import VivaGuide from './components/VivaGuide';
import { checkHealth, simulateConfig, optimizeRatios } from './services/api';

export default function App() {
  const [params, setParams] = useState({
    arrival_rate_per_hour: 40,
    human_mean_service_time: 4.0,
    robot_mean_service_time: 2.0,
    cost_per_human_hour: 25,
    cost_per_robot_hour: 35,
    budget_per_hour: 120,
    total_positions: 4
  });

  const [selectedConfig, setSelectedConfig] = useState({ h: 2, r: 2 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [simData, setSimData] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check health and run initial optimization on mount
  useEffect(() => {
    async function init() {
      const health = await checkHealth();

      if (health.status === 'ok') {
        runFullOptimization();
      }
    }
    init();
  }, []);

  // Run single configuration simulation
  const runSingleSimulation = async (h = selectedConfig.h, r = selectedConfig.r) => {
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const res = await simulateConfig({
        arrival_rate_per_hour: params.arrival_rate_per_hour,
        human_mean_service_time: params.human_mean_service_time,
        robot_mean_service_time: params.robot_mean_service_time,
        num_humans: h,
        num_robots: r,
        num_replications: 3
      });
      setSimData(res);
    } catch (err) {
      setErrorMessage(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run full N=4 optimization across all 5 configurations
  const runFullOptimization = async () => {
    setIsOptimizing(true);
    setErrorMessage(null);
    try {
      const res = await optimizeRatios({
        arrival_rate_per_hour: params.arrival_rate_per_hour,
        human_mean_service_time: params.human_mean_service_time,
        robot_mean_service_time: params.robot_mean_service_time,
        cost_per_human_hour: params.cost_per_human_hour,
        cost_per_robot_hour: params.cost_per_robot_hour,
        budget_per_hour: params.budget_per_hour,
        total_positions: params.total_positions || 4,
        num_replications: 3
      });
      setOptimizationResult(res);

      if (res.optimal_configuration) {
        const winner = res.optimal_configuration;
        setSelectedConfig({ h: winner.num_humans, r: winner.num_robots });
        setSimData(winner);
      } else {
        runSingleSimulation(selectedConfig.h, selectedConfig.r);
      }
    } catch (err) {
      setErrorMessage(`Optimization error: ${err.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSelectConfig = (h, r) => {
    setSelectedConfig({ h, r });
    if (optimizationResult?.all_configurations) {
      const match = optimizationResult.all_configurations.find(
        (c) => c.num_humans === h && c.num_robots === r
      );
      if (match) {
        setSimData(match);
        return;
      }
    }
    runSingleSimulation(h, r);
  };

  // Active units for Live Line: prioritize optimal configuration, fallback to selected preview
  const liveHumans = optimizationResult?.optimal_configuration
    ? optimizationResult.optimal_configuration.num_humans
    : selectedConfig.h;
  const liveRobots = optimizationResult?.optimal_configuration
    ? optimizationResult.optimal_configuration.num_robots
    : selectedConfig.r;

  return (
    <div className="min-h-screen bg-[#E4E7EA] text-[#0F172A] flex flex-col relative">
      {/* 1. Industrial Concrete + Rotating Gears + Technical Line Art Background */}
      <FactoryBackground />

      {/* App Content Layer at z-10 */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header with Conveyor Belt & Factory Illustration */}
        <Header
          onOpenMethodology={() => setIsMethodologyOpen(true)}
        />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Error Notification if any */}
          {errorMessage && (
            <div className="p-4 rounded-[8px] bg-[#B91C1C]/10 border border-[#B91C1C] text-[#B91C1C] text-xs sm:text-sm flex items-center justify-between shadow-2xs">
              <span>{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-[#B91C1C] hover:text-[#7F1D1D] font-bold ml-4 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* SECTION 1: Configuration & Parameters (Corner-bracketed Main Panel) */}
          <ConfigPanel
            params={params}
            onChange={setParams}
            onRunOptimization={runFullOptimization}
            onRunSingleSim={() => runSingleSimulation(selectedConfig.h, selectedConfig.r)}
            isOptimizing={isOptimizing}
            isSimulating={isSimulating}
            selectedConfig={selectedConfig}
            onSelectConfig={handleSelectConfig}
          />

          {/* SECTION 2: Live Line (Animated Humans, Robots, & Conveyor Belt Stream) */}
          <LiveLine
            numHumans={liveHumans}
            numRobots={liveRobots}
            humanServiceTime={params.human_mean_service_time}
            robotServiceTime={params.robot_mean_service_time}
            arrivalRatePerHour={params.arrival_rate_per_hour}
          />

          {/* SECTION 3: Workstation Allocation & Buffer (Floor visualizer) */}
          <FactoryFloor
            simData={simData}
            selectedConfig={selectedConfig}
            params={params}
          />

          {/* SECTION 4: Optimal Mix & Trade-off Analytics */}
          <section className="space-y-6">
            <div>
              <h2 className="font-semibold text-xl sm:text-2xl text-[#0F172A] tracking-[-0.01em]">
                Optimal mix & trade-off analytics
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
                Evaluation across all 5 candidate ratios under hourly budget constraint B
              </p>
            </div>

            {/* Results Table with Hero Mix Card, Utilization Ring, and Stacked Budget Bar */}
            <ResultsTable
              optimizationResult={optimizationResult}
              selectedConfig={selectedConfig}
              onSelectConfig={handleSelectConfig}
            />

            {/* Recharts Analytics Charts */}
            <AnalyticsCharts
              optimizationResult={optimizationResult}
              budgetLimit={params.budget_per_hour}
            />
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#D3D8DE] bg-white/90 backdrop-blur-xs py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
            <p>
              CSN13402 Operations Research Course Project • PS 16
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span>SimPy DES</span>
              <span>•</span>
              <span className="text-[#EA580C]">Safety Orange Humans</span>
              <span>•</span>
              <span className="text-[#0F172A]">Navy Robots</span>
              <span>•</span>
              <span>Little's Law Verified</span>
            </div>
          </div>
        </footer>

        {/* Methodology Reference Modal */}
        <VivaGuide
          isOpen={isMethodologyOpen}
          onClose={() => setIsMethodologyOpen(false)}
        />
      </div>
    </div>
  );
}
