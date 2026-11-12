/**
 * API Service for communicating with FastAPI backend
 */

const API_ROOT = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')
).replace(/\/+$/, '');
const API_BASE_URL = `${API_ROOT}/api`;

export async function checkHealth({ timeoutMs = 3000, signal: externalSignal } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const handleExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      return { status: 'offline', latencyMs: null, aborted: true, error: 'Aborted' };
    }
    externalSignal.addEventListener('abort', handleExternalAbort, { once: true });
  }

  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Backend offline');
    const data = await res.json();
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return {
      ...data,
      status: data?.status === 'ok' ? 'ok' : 'offline',
      latencyMs,
    };
  } catch (error) {
    return {
      status: 'offline',
      latencyMs: null,
      aborted: Boolean(externalSignal?.aborted && !timedOut),
      error: timedOut ? 'Health check timed out' : error.message,
    };
  } finally {
    clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', handleExternalAbort);
    }
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

