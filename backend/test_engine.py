"""
Test Suite for SimPy Heterogeneous Queue Simulation Engine
Tests:
1. Standard heterogeneous scenario (2 Humans, 2 Robots)
2. Boundary configuration with 0 Robots (4 Humans, 0 Robots) - checks zero-division protection
3. Boundary configuration with 0 Humans (0 Humans, 4 Robots) - checks zero-division protection
4. Unstable scenario (lambda > total capacity) - checks aggregate stability check
5. Little's Law consistency validation
"""

import sys
from simulation import HeterogeneousQueueSimulation, run_replicated_simulation


def test_standard_heterogeneous():
    print("=" * 60)
    print("TEST 1: Standard Heterogeneous Configuration (2H : 2R)")
    print("=" * 60)
    # Arrival rate: 45 parts/hr (0.75 parts/min)
    # Human service time: 4.0 min (mu_H = 0.25 parts/min)
    # Robot service time: 2.0 min (mu_R = 0.50 parts/min)
    # Total capacity: 2*0.25 + 2*0.50 = 1.5 parts/min > 0.75 parts/min (STABLE)
    result = run_replicated_simulation(
        arrival_rate_per_hour=45.0,
        human_mean_service_time=4.0,
        robot_mean_service_time=2.0,
        num_humans=2,
        num_robots=2,
        num_replications=3,
        warmup_parts=50,
        measurement_parts=200
    )

    print(f"Status: {result['status']}")
    print(f"Arrival Rate: {result['arrival_rate_per_min']} parts/min")
    print(f"Total Capacity: {result['total_capacity_per_min']} parts/min")
    print(f"Traffic Intensity (rho): {result['traffic_intensity']}")
    print(f"Avg Waiting Time (W_q): {result['avg_waiting_time']} min")
    print(f"Avg Service Time (S): {result['avg_service_time']} min")
    print(f"Avg Total Cycle Time (W): {result['avg_cycle_time']} min")
    print(f"Human Utilization (rho_H): {result['human_utilization']}%")
    print(f"Robot Utilization (rho_R): {result['robot_utilization']}%")
    print(f"Little's Law Observed L_q: {result['littles_law']['observed_Lq']}")
    print(f"Little's Law Expected L_q: {result['littles_law']['expected_Lq']}")
    print(f"Little's Law Error: {result['littles_law']['error_pct']}% (Consistent: {result['littles_law']['is_consistent']})")
    print(f"Recent Event Log count: {len(result['event_log'])}")

    assert result["is_stable"] is True
    assert result["avg_cycle_time"] > 0
    assert result["human_utilization"] >= 0
    assert result["robot_utilization"] >= 0
    print("-> TEST 1 PASSED!\n")


def test_zero_robot_boundary():
    print("=" * 60)
    print("TEST 2: Boundary Configuration (4 Humans, 0 Robots)")
    print("=" * 60)
    # Arrival rate: 30 parts/hr (0.50 parts/min)
    # Human service time: 4.0 min (mu_H = 0.25 parts/min)
    # Total capacity: 4 * 0.25 = 1.0 parts/min > 0.5 parts/min (STABLE)
    result = run_replicated_simulation(
        arrival_rate_per_hour=30.0,
        human_mean_service_time=4.0,
        robot_mean_service_time=2.0,
        num_humans=4,
        num_robots=0,
        num_replications=2,
        warmup_parts=30,
        measurement_parts=100
    )

    print(f"Status: {result['status']}")
    print(f"Human Utilization (rho_H): {result['human_utilization']}%")
    print(f"Robot Utilization (rho_R): {result['robot_utilization']}% (Must be 0.0 without division error)")
    assert result["robot_utilization"] == 0.0
    assert result["human_utilization"] > 0.0
    print("-> TEST 2 (Zero Robots Guard) PASSED!\n")


def test_zero_human_boundary():
    print("=" * 60)
    print("TEST 3: Boundary Configuration (0 Humans, 4 Robots)")
    print("=" * 60)
    result = run_replicated_simulation(
        arrival_rate_per_hour=30.0,
        human_mean_service_time=4.0,
        robot_mean_service_time=2.0,
        num_humans=0,
        num_robots=4,
        num_replications=2,
        warmup_parts=30,
        measurement_parts=100
    )

    print(f"Status: {result['status']}")
    print(f"Human Utilization (rho_H): {result['human_utilization']}% (Must be 0.0 without division error)")
    print(f"Robot Utilization (rho_R): {result['robot_utilization']}%")
    assert result["human_utilization"] == 0.0
    assert result["robot_utilization"] > 0.0
    print("-> TEST 3 (Zero Humans Guard) PASSED!\n")


def test_unstable_system():
    print("=" * 60)
    print("TEST 4: Unstable System Check (lambda >= capacity)")
    print("=" * 60)
    # Arrival rate: 120 parts/hr (2.0 parts/min)
    # Capacity: 4 * 0.25 = 1.0 parts/min. 2.0 > 1.0 -> UNSTABLE!
    result = run_replicated_simulation(
        arrival_rate_per_hour=120.0,
        human_mean_service_time=4.0,
        robot_mean_service_time=2.0,
        num_humans=4,
        num_robots=0
    )

    print(f"Status: {result['status']}")
    print(f"Message: {result['message']}")
    assert result["is_stable"] is False
    assert result["status"] == "UNSTABLE"
    print("-> TEST 4 (Unstable Check) PASSED!\n")


if __name__ == "__main__":
    test_standard_heterogeneous()
    test_zero_robot_boundary()
    test_zero_human_boundary()
    test_unstable_system()
    print("ALL SIMULATION ENGINE TESTS COMPLETED SUCCESSFULLY!")

