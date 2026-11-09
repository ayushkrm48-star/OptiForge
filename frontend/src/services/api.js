/**
 * API Service for communicating with FastAPI backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend offline');
    return await res.json();
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
}

export async function simulateConfig(params) {
  const res = await fetch(`${API_BASE_URL}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Simulation request failed' }));
    throw new Error(err.detail || 'Simulation request failed');
  }
  return await res.json();
}

export async function optimizeRatios(params) {
  const res = await fetch(`${API_BASE_URL}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Optimization request failed' }));
    throw new Error(err.detail || 'Optimization request failed');
  }
  return await res.json();
}

