# SmartFactory: Human-Robot Collaboration Ratio Optimizer
> **CSN13402 Operations Research Course Project** — **PS 16**: *"Use queuing models to determine optimal human-robot collaboration ratios for minimized cycle time."*

---

## 1. Quick Start Guide (Local Execution)

The project consists of a Python FastAPI simulation backend and a React + Vite frontend.

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Start the Backend (FastAPI + SimPy)
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment (if not already done)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
python test_engine.py
python test_optimizer.py
python test_api.py

# Start FastAPI server on port 8000
python main.py
```
*The backend API will run at `http://127.0.0.1:8000` with interactive docs at `http://127.0.0.1:8000/docs`.*

### Step 2: Start the Frontend (React + Vite)
In a new terminal window:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start Vite dev server on port 5173
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 2. Operations Research Formulation & Viva Defense Guide

This section is structured specifically to help you defend your project in the oral viva examination.

### Question 1: Why can't we use the textbook M/M/c analytical formula?
- **Answer**: The standard Erlang-C ($M/M/c$) analytical formula assumes **homogeneous servers** (all $c$ servers have identical service rate $\mu$).
- In human-robot manufacturing cells, humans and robots are **heterogeneous**:
  $$\mu_H = \frac{1}{T_H} \neq \mu_R = \frac{1}{T_R}$$
- The departure rate from state $n$ depends on *which specific server types are currently busy*, creating a multi-dimensional state space with state-dependent routing.
- Therefore, closed-form formulas do not apply without complex matrix-geometric derivations. **SimPy discrete-event simulation** is the industry standard for modeling true heterogeneous queueing behavior.

### Question 2: What is the queue discipline and dispatching policy?
- **Shared FIFO Buffer**: All arriving parts enter a single shared queue.
- **Fastest-Server-First (FSF) Policy**:
  - When an incoming part finds multiple idle workstations, it is routed to the server with the highest service rate:
    $$\text{Server} = \arg\max_{k \in \text{Idle}} (\mu_k)$$
  - When a workstation finishes a job, it immediately pulls the oldest part waiting in the FIFO buffer.
  - This dispatching policy minimizes average waiting time in queue ($W_q$).

### Question 3: How is Little's Law used in this project?
- **Answer**: Little's Law is a fundamental queueing theorem:
  $$L_q = \lambda \cdot W_q \quad \text{and} \quad L = \lambda \cdot W$$
  - $L_q$: Average number of parts in the queue.
  - $W_q$: Average waiting time in the queue.
  - $\lambda$: Mean arrival rate.
- **Viva Defense Caution**: Little's Law holds for any stable system in steady-state, but empirical simulation estimates can be skewed by initial emptiness. To ensure a reliable consistency audit:
  1. We implement a **warm-up period** (discarding initial parts) to remove startup bias.
  2. We measure a **sufficiently long window** (e.g., 400+ steady-state parts).
  3. We run **multiple independent replications** and average the results.
  4. We check the percentage discrepancy between observed $\bar{L}_q = \frac{1}{T}\int Q(t)dt$ and expected $\lambda W_q$. A low error confirms mathematical stability and consistency.

### Question 4: What is the aggregate stability condition?
- For the queue length not to grow to infinity, the aggregate service capacity must strictly exceed the arrival rate:
  $$\lambda < H \cdot \mu_H + R \cdot \mu_R$$
- If $\lambda \ge H \cdot \mu_H + R \cdot \mu_R$, the traffic intensity $\rho \ge 1.0$. The simulation engine detects this condition beforehand and flags the configuration as **UNSTABLE**, preventing runaway queues.

### Question 5: How are human and robot utilizations calculated without division errors?
- Utilizations are calculated separately over the steady-state measurement window $T_{sim}$:
  $$\rho_H = \frac{\sum_{i=1}^H \text{BusyTime}_{H,i}}{H \cdot T_{sim}} \quad (\text{if } H > 0, \text{ else } 0.0)$$
  $$\rho_R = \frac{\sum_{j=1}^R \text{BusyTime}_{R,j}}{R \cdot T_{sim}} \quad (\text{if } R > 0, \text{ else } 0.0)$$
- Boundary configurations like $4H:0R$ and $0H:4R$ are protected against division-by-zero, returning $0.0\%$ utilization for absent server types.

### Question 6: What is the optimization problem formulation?
- **Decision Variables**: $(H, R) \in \mathbb{Z}_{\ge 0}^2$
- **Total Slots**: $H + R = 4 \implies (4,0), (3,1), (2,2), (1,3), (0,4)$
- **Budget Constraint**:
  $$\text{Hourly Cost} = H \cdot C_H + R \cdot C_R \le B$$
- **Stability Constraint**:
  $$\lambda < H \cdot \mu_H + R \cdot \mu_R$$
- **Objective**:
  $$\min_{(H, R)} W(H, R) \quad [W = W_q + S]$$
- The optimizer evaluates the 5 candidates sequentially, filters out over-budget and unstable configurations, and selects the feasible configuration that achieves the lowest average cycle time $W$.

---

## 3. Technology Stack Summary
- **Frontend**: React.js (Vite), Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic.
- **OR Simulation Engine**: SimPy (discrete-event simulation), NumPy.
- **Strict Exclusions**: No databases, no Docker, no Redis, no auth. Clean, beginner-friendly architecture.

