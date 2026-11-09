"""
FastAPI Server for SmartFactory Human-Robot Collaboration Ratio Optimizer
CSN13402 Operations Research Course Project
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import SimulateRequest, OptimizeRequest
from simulation import run_replicated_simulation
from optimizer import optimize_human_robot_ratio

app = FastAPI(
    title="SmartFactory Human-Robot Ratio Optimizer API",
    description="Backend API for CSN13402 Operations Research Course Project: PS 16",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "app": "SmartFactory Optimizer Backend"}


@app.post("/api/simulate")
def simulate_configuration(payload: SimulateRequest):
    """
    Simulate a single specific (H, R) configuration using SimPy.
    Returns cycle times, waiting times, utilization, Little's Law check, and event logs.
    """
    try:
        result = run_replicated_simulation(
            arrival_rate_per_hour=payload.arrival_rate_per_hour,
            human_mean_service_time=payload.human_mean_service_time,
            robot_mean_service_time=payload.robot_mean_service_time,
            num_humans=payload.num_humans,
            num_robots=payload.num_robots,
            num_replications=payload.num_replications
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize")
def optimize_configurations(payload: OptimizeRequest):
    """
    Evaluate all 5 candidate configurations for N=4,
    filter by hourly budget and queue stability,
    and select the optimal configuration that minimizes average cycle time W.
    """
    try:
        result = optimize_human_robot_ratio(
            arrival_rate_per_hour=payload.arrival_rate_per_hour,
            human_mean_service_time=payload.human_mean_service_time,
            robot_mean_service_time=payload.robot_mean_service_time,
            cost_per_human_hour=payload.cost_per_human_hour,
            cost_per_robot_hour=payload.cost_per_robot_hour,
            budget_per_hour=payload.budget_per_hour,
            total_positions=payload.total_positions,
            num_replications=payload.num_replications
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

