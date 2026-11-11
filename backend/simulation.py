"""
SimPy Simulation Engine for Heterogeneous Human-Robot Collaboration
CSN13402 Operations Research Course Project

Key Operations Research Concepts Implemented:
1. Heterogeneous Servers: Humans and Robots have distinct mean service rates (mu_H != mu_R).
2. Shared FIFO Buffer: All incoming parts wait in a single common queue.
3. Fastest-Server-First (FSF) Policy: When multiple servers are idle upon arrival,
   route the part to the server with the higher service rate (mu).
4. Aggregate Stability Condition: lambda < (H * mu_H + R * mu_R).
5. Little's Law Consistency Audit: L_q ≈ lambda * W_q (after discarding warm-up).
6. Safe Utilization Tracking: Prevents division-by-zero when H=0 or R=0.
"""

import random
import simpy
import numpy as np


class HeterogeneousQueueSimulation:
    def __init__(
        self,
        arrival_rate_per_min: float,   # lambda (parts/minute)
        human_mean_service_time: float, # T_H (minutes/part)
        robot_mean_service_time: float, # T_R (minutes/part)
        num_humans: int,                # H
        num_robots: int,                # R
        warmup_parts: int = 100,        # Parts discarded to clear initial emptiness
        measurement_parts: int = 500,   # Parts recorded for steady-state statistics
        random_seed: int | None = None
    ):
        self.arrival_rate = arrival_rate_per_min
        self.T_H = human_mean_service_time
        self.T_R = robot_mean_service_time
        self.num_humans = num_humans
        self.num_robots = num_robots
        self.warmup_parts = warmup_parts
        self.measurement_parts = measurement_parts

        # Calculate service rates (mu = 1 / mean_service_time)
        # mu represents how many parts a server can finish in 1 minute.
        self.mu_H = 1.0 / self.T_H if self.T_H > 0 else 0.0
        self.mu_R = 1.0 / self.T_R if self.T_R > 0 else 0.0

        if random_seed is not None:
            random.seed(random_seed)
            np.random.seed(random_seed)
            # everytime the program runs it will generate the same random nunber sequence

        # Simulation environment
        self.env = simpy.Environment()

        # Build individual server tracking objects
        # Each server has an ID, type, service rate, and busy status.
        self.servers = []
        for i in range(1, num_humans + 1):
            self.servers.append({
                "id": f"Human-{i}",
                "type": "HUMAN",
                "rate": self.mu_H,
                "mean_time": self.T_H,
                "busy": False,
                "total_busy_time": 0.0,
                "busy_start_time": 0.0
            })
        for j in range(1, num_robots + 1):
            self.servers.append({
                "id": f"Robot-{j}",
                "type": "ROBOT",
                "rate": self.mu_R,
                "mean_time": self.T_R,
                "busy": False,
                "total_busy_time": 0.0,
                "busy_start_time": 0.0
            })

        # Shared FIFO queue: parts waiting when all servers are busy
        self.queue = []

        # Data collection buffers (only recorded after warmup_parts)
        self.completed_parts_count = 0  # means ab tak kitne products complete hue
        self.recorded_waiting_times = []      # W_q samples (minutes)
        self.recorded_service_times = []      # S samples (minutes)
        self.recorded_cycle_times = []        # W = W_q + S samples (minutes)

        # Time-integrated queue length tracking for Little's Law
        # Area under queue length curve: Integral of Q(t) dt
        self.last_queue_change_time = 0.0
        self.queue_time_integral = 0.0  #Little's Law ke liye average queue length calculate karna chahte hain
        self.warmup_end_time = 0.0

    def _update_queue_integral(self):
        """Track time-average queue length (L_q) for Little's Law validation."""
        now = self.env.now
        # Only integrate during the measurement phase (after warmup)
        if self.completed_parts_count >= self.warmup_parts and self.warmup_end_time > 0:
            dt = now - self.last_queue_change_time
            if dt > 0:
                self.queue_time_integral += len(self.queue) * dt
        self.last_queue_change_time = now

    def _get_fastest_idle_server(self):
        """
        Fastest-Server-First (FSF) Policy:
        Filter idle servers, then pick the server with the highest service rate (mu).
        If tied, pick the first available.
        """
        idle_servers = [s for s in self.servers if not s["busy"]]
        if not idle_servers:
            return None
        # Sort descending by service rate (fastest server first)
        idle_servers.sort(key=lambda s: s["rate"], reverse=True)
        return idle_servers[0]

    def _arrival_process(self):
        """
        Poisson Arrival Process:
        Interarrival times between consecutive parts are exponentially distributed
        with mean = 1 / arrival_rate.
        """
        part_id = 0
        total_target_parts = self.warmup_parts + self.measurement_parts

        while self.completed_parts_count < total_target_parts:
            # Generate exponential interarrival time: Exp(lambda)
            interarrival = random.expovariate(self.arrival_rate)
            yield self.env.timeout(interarrival)

            part_id += 1
            arrival_time = self.env.now

            # Check if any server is idle
            server = self._get_fastest_idle_server()

            if server is not None:
                # Server is free: assign immediately (Queue waiting time W_q = 0)
                self.env.process(self._serve_part(part_id, arrival_time, server))
            else:
                # All servers busy: part must wait in the shared FIFO queue
                self._update_queue_integral()
                self.queue.append({"part_id": part_id, "arrival_time": arrival_time})
                self._update_queue_integral()

    def _serve_part(self, part_id: int, arrival_time: float, server: dict):
        """
        Process a part on a given server.
        Service time is exponentially distributed: Exp(mu_server).
        """
        service_start_time = self.env.now
        waiting_time = service_start_time - arrival_time  # W_q for this part

        # Mark server as busy
        server["busy"] = True
        server["busy_start_time"] = service_start_time

        # Generate exponential service time: Exp(mu)
        service_time = random.expovariate(server["rate"])
        yield self.env.timeout(service_time)

        service_end_time = self.env.now
        actual_service_duration = service_end_time - service_start_time
        cycle_time = waiting_time + actual_service_duration  # W = W_q + S

        # Accumulate server busy time for utilization calculation
        server["total_busy_time"] += actual_service_duration
        server["busy"] = False

        self.completed_parts_count += 1

        # Check if warm-up period just finished
        if self.completed_parts_count == self.warmup_parts:
            self.warmup_end_time = self.env.now
            self.last_queue_change_time = self.env.now
            self.queue_time_integral = 0.0  # Reset queue integral for steady-state window
            # Reset server busy times so utilization only measures steady-state
            for s in self.servers:
                s["total_busy_time"] = 0.0

        # Record steady-state statistics if past warm-up
        if self.completed_parts_count > self.warmup_parts:
            self.recorded_waiting_times.append(waiting_time)
            self.recorded_service_times.append(actual_service_duration)
            self.recorded_cycle_times.append(cycle_time)

        # Upon finishing, server checks if parts are waiting in the FIFO queue
        if len(self.queue) > 0:
            self._update_queue_integral()
            next_part = self.queue.pop(0)  # FIFO: pull oldest waiting item
            self._update_queue_integral()

            self.env.process(self._serve_part(next_part["part_id"], next_part["arrival_time"], server))

    def run(self):
        """Run the simulation until the target number of parts is completed."""
        self.env.process(self._arrival_process())
        self.env.run()

        # Final queue integral flush
        self._update_queue_integral()

        # Measurement time duration (after warm-up phase)
        measurement_duration = max(self.env.now - self.warmup_end_time, 0.001)

        # 1. Average Cycle Times
        avg_Wq = float(np.mean(self.recorded_waiting_times)) if self.recorded_waiting_times else 0.0
        avg_S = float(np.mean(self.recorded_service_times)) if self.recorded_service_times else 0.0
        avg_W = float(np.mean(self.recorded_cycle_times)) if self.recorded_cycle_times else 0.0

        # 2. Server Utilizations with Zero-Division Protection
        # rho = total_busy_time / (num_servers * measurement_duration)
        human_busy_sum = sum(s["total_busy_time"] for s in self.servers if s["type"] == "HUMAN")
        robot_busy_sum = sum(s["total_busy_time"] for s in self.servers if s["type"] == "ROBOT")

        if self.num_humans > 0:
            rho_H = min(human_busy_sum / (self.num_humans * measurement_duration), 1.0)
        else:
            rho_H = 0.0  # Safe zero when no humans are deployed

        if self.num_robots > 0:
            rho_R = min(robot_busy_sum / (self.num_robots * measurement_duration), 1.0)
        else:
            rho_R = 0.0  # Safe zero when no robots are deployed

        # 3. Little's Law Consistency Check (L_q ≈ lambda * W_q)
        # Empirical time-averaged queue length
        L_q_observed = self.queue_time_integral / measurement_duration
        L_q_expected = self.arrival_rate * avg_Wq

        # Discrepancy percentage as a consistency audit
        littles_law_diff = abs(L_q_observed - L_q_expected)
        littles_law_error_pct = (littles_law_diff / max(L_q_observed, 0.05)) * 100.0

        return {
            "avg_cycle_time": round(avg_W, 3),          # W (minutes)
            "avg_waiting_time": round(avg_Wq, 3),       # W_q (minutes)
            "avg_service_time": round(avg_S, 3),        # S (minutes)
            "human_utilization": round(rho_H * 100, 1), # rho_H (%)
            "robot_utilization": round(rho_R * 100, 1), # rho_R (%)
            "littles_law": {
                "observed_Lq": round(L_q_observed, 3),
                "expected_Lq": round(L_q_expected, 3),
                "difference": round(littles_law_diff, 3),
                "error_pct": round(littles_law_error_pct, 1),
                "consistent": littles_law_error_pct < 15.0 # True if within reasonable statistical sampling noise
            },
            "simulated_time_min": round(self.env.now, 1),
            "parts_measured": len(self.recorded_cycle_times)
        }


def run_replicated_simulation(
    arrival_rate_per_hour: float,
    human_mean_service_time: float,
    robot_mean_service_time: float,
    num_humans: int,
    num_robots: int,
    num_replications: int = 5,
    warmup_parts: int = 80,
    measurement_parts: int = 400
):
    """
    Run multiple independent replications of the SimPy simulation
    and average the results to produce reliable, steady-state estimates.
    """
    arrival_rate_per_min = arrival_rate_per_hour / 60.0

    # Aggregate Stability Check: lambda < H * mu_H + R * mu_R
    mu_H = 1.0 / human_mean_service_time if human_mean_service_time > 0 else 0.0
    mu_R = 1.0 / robot_mean_service_time if robot_mean_service_time > 0 else 0.0
    total_capacity = (num_humans * mu_H) + (num_robots * mu_R)

    is_stable = arrival_rate_per_min < total_capacity

    if not is_stable:
        return {
            "is_stable": False,
            "status": "UNSTABLE",
            "message": f"Unstable system! Arrival rate ({round(arrival_rate_per_min, 3)} parts/min) exceeds total capacity ({round(total_capacity, 3)} parts/min). Queue will grow infinitely.",
            "arrival_rate_per_min": round(arrival_rate_per_min, 3),
            "total_capacity_per_min": round(total_capacity, 3),
            "avg_cycle_time": None,
            "avg_waiting_time": None,
            "avg_service_time": None,
            "human_utilization": None,
            "robot_utilization": None,
            "littles_law": None
        }

    # Run replications sequentially
    rep_results = []
    base_seed = 42

    for r in range(num_replications):
        sim = HeterogeneousQueueSimulation(
            arrival_rate_per_min=arrival_rate_per_min,
            human_mean_service_time=human_mean_service_time,
            robot_mean_service_time=robot_mean_service_time,
            num_humans=num_humans,
            num_robots=num_robots,
            warmup_parts=warmup_parts,
            measurement_parts=measurement_parts,
            random_seed=base_seed + (r * 101)
        )
        res = sim.run()
        rep_results.append(res)

    # Average metrics across all replications
    avg_W = np.mean([r["avg_cycle_time"] for r in rep_results])
    avg_Wq = np.mean([r["avg_waiting_time"] for r in rep_results])
    avg_S = np.mean([r["avg_service_time"] for r in rep_results])
    avg_rho_H = np.mean([r["human_utilization"] for r in rep_results])
    avg_rho_R = np.mean([r["robot_utilization"] for r in rep_results])
    avg_Lq_obs = np.mean([r["littles_law"]["observed_Lq"] for r in rep_results])
    avg_Lq_exp = np.mean([r["littles_law"]["expected_Lq"] for r in rep_results])

    diff_Lq = abs(avg_Lq_obs - avg_Lq_exp)
    error_pct = (diff_Lq / max(avg_Lq_obs, 0.05)) * 100.0

    return {
        "is_stable": True,
        "status": "STABLE",
        "num_humans": num_humans,
        "num_robots": num_robots,
        "arrival_rate_per_min": round(arrival_rate_per_min, 3),
        "total_capacity_per_min": round(total_capacity, 3),
        "traffic_intensity": round(arrival_rate_per_min / total_capacity, 3),
        "avg_cycle_time": round(float(avg_W), 2),
        "avg_waiting_time": round(float(avg_Wq), 2),
        "avg_service_time": round(float(avg_S), 2),
        "human_utilization": round(float(avg_rho_H), 1),
        "robot_utilization": round(float(avg_rho_R), 1),
        "littles_law": {
            "observed_Lq": round(float(avg_Lq_obs), 3),
            "expected_Lq": round(float(avg_Lq_exp), 3),
            "difference": round(float(diff_Lq), 3),
            "error_pct": round(float(error_pct), 1),
            "is_consistent": bool(error_pct < 15.0)
        },
        "replications": num_replications
    }

