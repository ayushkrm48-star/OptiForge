"""
Test for Configuration Evaluation & Optimization Logic (Phase 3)
"""

from optimizer import optimize_human_robot_ratio


def test_optimizer():
    print("=" * 60)
    print("TESTING OPTIMIZER: Budget = $120/hr, C_H = $25/hr, C_R = $35/hr")
    print("=" * 60)
    # 4H:0R -> 4*25 + 0*35 = $100 <= 120 (FEASIBLE)
    # 3H:1R -> 3*25 + 1*35 = $110 <= 120 (FEASIBLE)
    # 2H:2R -> 2*25 + 2*35 = $120 <= 120 (FEASIBLE)
    # 1H:3R -> 1*25 + 3*35 = $130 > 120  (OVER_BUDGET)
    # 0H:4R -> 0*25 + 4*35 = $140 > 120  (OVER_BUDGET)

    result = optimize_human_robot_ratio(
        arrival_rate_per_hour=40.0,
        human_mean_service_time=4.0,
        robot_mean_service_time=2.0,
        cost_per_human_hour=25.0,
        cost_per_robot_hour=35.0,
        budget_per_hour=120.0,
        total_positions=4,
        num_replications=2
    )

    print(f"Total Evaluated: {result['total_evaluated']}")
    print(f"Feasible Count: {result['feasible_count']}")
    print("\nSummary of Configurations:")
    for c in result["all_configurations"]:
        opt_flag = " *** WINNER ***" if c["is_optimal"] else ""
        print(f"  {c['ratio_label']} | Cost: ${c['hourly_cost']}/hr | W: {c['avg_cycle_time']} min | Status: {c['status_label']}{opt_flag}")

    winner = result["optimal_configuration"]
    assert winner is not None
    print(f"\nWinning Optimal Configuration: {winner['ratio_label']} (Cycle Time: {winner['avg_cycle_time']} min, Cost: ${winner['hourly_cost']}/hr)")
    assert winner["is_within_budget"] is True
    assert winner["is_stable"] is True
    assert winner["ratio_label"] == "2H : 2R"  # 2H:2R gives lowest cycle time within the $120 budget
    print("OPTIMIZER TEST PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    test_optimizer()

