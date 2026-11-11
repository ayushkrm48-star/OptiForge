"""
Optimizer Module for Human-Robot Collaboration Ratio
CSN13402 Operations Research Course Project

Evaluates the 5 candidate configurations for N = 4 total positions:
  (4H : 0R), (3H : 1R), (2H : 2R), (1H : 3R), (0H : 4R)

Key Operations Research Logic:
1. Hourly Budget Filter: Cost = H * C_H + R * C_R <= B
2. Queue Stability Check: lambda < H * mu_H + R * mu_R
3. Objective: Minimize Average Cycle Time (W) among all feasible configurations.
4. Trade-off Analysis: Generates full comparison data for diminishing returns analysis.
"""

from simulation import run_replicated_simulation


def optimize_human_robot_ratio(
    arrival_rate_per_hour: float,
    human_mean_service_time: float,
    robot_mean_service_time: float,
    cost_per_human_hour: float,
    cost_per_robot_hour: float,
    budget_per_hour: float,
    total_positions: int = 4,
    num_replications: int = 3
):
    """
    Sequentially evaluates all (H, R) configurations where H + R = total_positions.
    Filters by budget and stability, then identifies the optimal configuration.
    """
    arrival_rate_per_min = arrival_rate_per_hour / 60.0
    mu_H = 1.0 / human_mean_service_time if human_mean_service_time > 0 else 0.0
    mu_R = 1.0 / robot_mean_service_time if robot_mean_service_time > 0 else 0.0

    evaluations = []

    # Sequential evaluation from 4H:0R down to 0H:4R
    for h in range(total_positions, -1, -1):
        r = total_positions - h
        ratio_label = f"{h}H : {r}R"

        # 1. Budget calculation
        hourly_cost = round((h * cost_per_human_hour) + (r * cost_per_robot_hour), 2)
        is_within_budget = hourly_cost <= budget_per_hour

        # 2. Stability check
        total_capacity_per_min = (h * mu_H) + (r * mu_R)
        is_stable = arrival_rate_per_min < total_capacity_per_min

        # Feasibility requires both: stable queue and within hourly budget
        is_feasible = is_within_budget and is_stable

        config_data = {
            "num_humans": h,
            "num_robots": r,
            "ratio_label": ratio_label,
            "hourly_cost": hourly_cost,
            "budget_limit": budget_per_hour,
            "is_within_budget": is_within_budget,
            "cost_difference": round(budget_per_hour - hourly_cost, 2),
            "is_stable": is_stable,
            "is_feasible": is_feasible,
            "total_capacity_per_min": round(total_capacity_per_min, 3),
            "status_label": "FEASIBLE" if is_feasible else ("OVER_BUDGET" if not is_within_budget else "UNSTABLE")
        }

        # 3. If the configuration is stable, simulate to obtain cycle times and utilization
        # (We simulate even if over budget so the student can plot the full frontier curve)
        if is_stable:
            sim_result = run_replicated_simulation(
                arrival_rate_per_hour=arrival_rate_per_hour,
                human_mean_service_time=human_mean_service_time,
                robot_mean_service_time=robot_mean_service_time,
                num_humans=h,
                num_robots=r,
                num_replications=num_replications,
                warmup_parts=50,
                measurement_parts=250
            )

            config_data.update({
                "avg_cycle_time": sim_result["avg_cycle_time"],
                "avg_waiting_time": sim_result["avg_waiting_time"],
                "avg_service_time": sim_result["avg_service_time"],
                "human_utilization": sim_result["human_utilization"],
                "robot_utilization": sim_result["robot_utilization"],
                "traffic_intensity": sim_result["traffic_intensity"],
                "littles_law": sim_result["littles_law"]
            })
        else:
            config_data.update({
                "avg_cycle_time": None,
                "avg_waiting_time": None,
                "avg_service_time": None,
                "human_utilization": None,
                "robot_utilization": None,
                "traffic_intensity": round(arrival_rate_per_min / max(total_capacity_per_min, 0.001), 2),
                "littles_law": None
            })

        evaluations.append(config_data)

    # 4. Determine the Optimal Configuration:
    # Filter only FEASIBLE configurations (within budget AND stable queue),
    # then pick the one with MINIMUM average cycle time W.
    feasible_configs = [c for c in evaluations if c["is_feasible"] and c["avg_cycle_time"] is not None]

    if feasible_configs:
        best_config = min(feasible_configs, key=lambda c: c["avg_cycle_time"])
        # Mark winner flag
        for c in evaluations:
            c["is_optimal"] = (c["ratio_label"] == best_config["ratio_label"])
    else:
        best_config = None
        for c in evaluations:
            c["is_optimal"] = False

    return {
        "parameters": {
            "arrival_rate_per_hour": arrival_rate_per_hour,
            "arrival_rate_per_min": round(arrival_rate_per_min, 3),
            "human_mean_service_time": human_mean_service_time,
            "robot_mean_service_time": robot_mean_service_time,
            "cost_per_human_hour": cost_per_human_hour,
            "cost_per_robot_hour": cost_per_robot_hour,
            "budget_per_hour": budget_per_hour,
            "total_positions": total_positions
        },
        "optimal_configuration": best_config,
        "all_configurations": evaluations,
        "feasible_count": len(feasible_configs),
        "total_evaluated": len(evaluations)
    }

