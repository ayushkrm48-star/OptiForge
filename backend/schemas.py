"""
Pydantic Schemas for Request and Response Validation
CSN13402 Operations Research Course Project
"""

from typing import List, Optional, Any
from pydantic import BaseModel, Field


class SimulateRequest(BaseModel):
    """Payload to simulate a single specific (H, R) configuration."""
    arrival_rate_per_hour: float = Field(..., gt=0, description="Poisson arrival rate in parts per hour")
    human_mean_service_time: float = Field(..., gt=0, description="Average human service time in minutes")
    robot_mean_service_time: float = Field(..., gt=0, description="Average robot service time in minutes")
    num_humans: int = Field(..., ge=0, description="Number of human workers H")
    num_robots: int = Field(..., ge=0, description="Number of robots R")
    num_replications: int = Field(3, ge=1, le=10, description="Number of independent simulation runs to average")


class OptimizeRequest(BaseModel):
    """Payload to evaluate all N=4 configurations and find the optimal ratio."""
    arrival_rate_per_hour: float = Field(..., gt=0, description="Poisson arrival rate in parts per hour")
    human_mean_service_time: float = Field(..., gt=0, description="Average human service time in minutes")
    robot_mean_service_time: float = Field(..., gt=0, description="Average robot service time in minutes")
    cost_per_human_hour: float = Field(..., ge=0, description="Hourly operating cost per human worker ($/hr)")
    cost_per_robot_hour: float = Field(..., ge=0, description="Hourly operating cost per robot ($/hr)")
    budget_per_hour: float = Field(..., gt=0, description="Total hourly budget limit B ($/hr)")
    total_positions: int = Field(4, ge=1, le=10, description="Fixed total workstation slots N (default: 4)")
    num_replications: int = Field(3, ge=1, le=10, description="Replications per configuration")

