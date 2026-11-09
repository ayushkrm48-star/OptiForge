"""
Integration Tests for FastAPI Endpoints (Phase 4)
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("GET /api/health passed:", data)


def test_simulate_endpoint():
    payload = {
        "arrival_rate_per_hour": 36.0,
        "human_mean_service_time": 4.0,
        "robot_mean_service_time": 2.0,
        "num_humans": 2,
        "num_robots": 2,
        "num_replications": 2
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    print("POST /api/simulate passed:")
    print(f"  Cycle time W: {data['avg_cycle_time']} min")
    print(f"  Human util: {data['human_utilization']}%, Robot util: {data['robot_utilization']}%")
    print(f"  Little's Law consistent: {data['littles_law']['is_consistent']}")
    assert data["is_stable"] is True
    assert data["avg_cycle_time"] > 0


def test_optimize_endpoint():
    payload = {
        "arrival_rate_per_hour": 40.0,
        "human_mean_service_time": 4.0,
        "robot_mean_service_time": 2.0,
        "cost_per_human_hour": 20.0,
        "cost_per_robot_hour": 40.0,
        "budget_per_hour": 120.0,
        "total_positions": 4,
        "num_replications": 2
    }
    response = client.post("/api/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    print("POST /api/optimize passed:")
    print(f"  Evaluated configs: {len(data['all_configurations'])}")
    print(f"  Feasible count: {data['feasible_count']}")
    print(f"  Optimal config: {data['optimal_configuration']['ratio_label']}")
    assert data["optimal_configuration"] is not None
    assert data["optimal_configuration"]["is_feasible"] is True


if __name__ == "__main__":
    test_health()
    test_simulate_endpoint()
    test_optimize_endpoint()
    print("\nALL API ENDPOINT TESTS PASSED SUCCESSFULLY!")

