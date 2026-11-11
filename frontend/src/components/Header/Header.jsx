import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Sun, Moon, ChevronDown } from 'lucide-react';
import { checkHealth } from '../../services/api';
import FactoryScene from './FactoryScene';
import './header.css';

const AMBIENT_PARTS = [
  { id: 'ambient-1', delay: '0s', width: undefined },
  { id: 'ambient-2', delay: '-4.7s', width: '26px' },
  { id: 'ambient-3', delay: '-9.3s', width: '16px' },
];

const MAX_BELT_PARTS = 14;

export default function Header({ onOpenMethodology }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    document.documentElement.classList.toggle('dark', prefersDark);
    return prefersDark;
  });

  // Shared panel state: null | 'status' | 'methodology' (only one open at a time)
  const [openPanel, setOpenPanel] = useState(null);

  // Real backend health state: 'ok' | 'check' | 'offline'
  const [engineState, setEngineState] = useState('check');
  const [latencyMs, setLatencyMs] = useState(null);
  const [lastCheck, setLastCheck] = useState('Not yet');

  // Conveyor belt parts state
  const [partsShipped, setPartsShipped] = useState(0);
  const [extraParts, setExtraParts] = useState([]);

  const statusWrapRef = useRef(null);
  const methBtnRef = useRef(null);
  const drawerRef = useRef(null);
  const activeControllerRef = useRef(null);
  const nextPartIdRef = useRef(1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const runHealthCheck = useCallback(async () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setEngineState('check');
    const result = await checkHealth({ timeoutMs: 3000, signal: controller.signal });
    if (activeControllerRef.current === controller) {
      activeControllerRef.current = null;
    }

    if (result.aborted || controller.signal.aborted) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLastCheck(timestamp);

    if (result.status === 'ok') {
      setEngineState('ok');
      setLatencyMs(result.latencyMs);
    } else {
      setEngineState('offline');
      setLatencyMs(null);
    }
  }, []);

  // Ping on mount, every 30 s while visible, and pause while document.hidden
  useEffect(() => {
    let intervalId = null;

    const startPolling = () => {
      if (intervalId !== null) return;
      intervalId = window.setInterval(() => {
        if (!document.hidden) {
          runHealthCheck();
        }
      }, 30000);
    };

    const stopPolling = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        runHealthCheck();
        startPolling();
      }
    };

    if (!document.hidden) {
      runHealthCheck();
      startPolling();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [runHealthCheck]);

  // Outside click and Escape close whichever panel is open
  useEffect(() => {
    if (openPanel === null) return undefined;

    const handleOutsideClick = (e) => {
      const target = e.target;
      if (
        statusWrapRef.current?.contains(target) ||
        methBtnRef.current?.contains(target) ||
        drawerRef.current?.contains(target)
      ) {
        return;
      }
      setOpenPanel(null);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenPanel(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPanel]);

  const handleSpawnPart = () => {
    setExtraParts((prev) => {
      if (AMBIENT_PARTS.length + prev.length >= MAX_BELT_PARTS) {
        return prev;
      }
      const id = nextPartIdRef.current++;
      const width = `${16 + Math.floor(Math.random() * 12)}px`;
      return [...prev, { id, width }];
    });
  };

  const handleBeltKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSpawnPart();
    }
  };

  const statusDesktopLabel =
    engineState === 'ok'
      ? 'Engine ready'
      : engineState === 'check'
      ? 'Checking…'
      : 'Engine offline';

  const statusMobileLabel =
    engineState === 'ok'
      ? 'Ready'
      : engineState === 'check'
      ? 'Checking…'
      : 'Offline';

  return (
    <header className="sf-hd sticky top-0 z-40">
      {/* Illustrated background layer */}
      <div className="sf-art" aria-hidden="true">
        <div className="sf-smog">
          <i className="sf-smog-patch" style={{ left: 'calc(8% - 180px)', opacity: 0.6 }} />
          <i className="sf-smog-patch" style={{ left: 'calc(37% - 180px)' }} />
          <i className="sf-smog-patch or" style={{ left: 'calc(52% - 180px)', animationDelay: '-9s' }} />
          <i className="sf-smog-patch" style={{ left: 'calc(66% - 180px)', animationDelay: '-17s' }} />
          <i className="sf-smog-patch" style={{ left: 'calc(90% - 180px)', animationDelay: '-5s', opacity: 0.6 }} />
        </div>
        <div className="sf-saw" />
        <FactoryScene />
      </div>

      {/* Main header bar */}
      <div className="sf-bar mx-auto flex items-center">
        <a
          className="sf-brand flex items-center gap-3 text-inherit no-underline"
          href="#"
          aria-label="SmartFactory home"
        >
          <span className="sf-logo">
            <Layers aria-hidden="true" />
          </span>
          <span className="sf-name">SmartFactory</span>
        </a>

        <span className="sf-tag" tabIndex={0}>
          HRC Optimizer
        </span>

        <span className="flex-1" />

        {/* Engine Status Pill + Popover */}
        <div className="relative" ref={statusWrapRef}>
          <button
            type="button"
            className="sf-status"
            data-s={engineState}
            aria-expanded={openPanel === 'status'}
            aria-controls="sf-engine-popover"
            onClick={() => setOpenPanel((prev) => (prev === 'status' ? null : 'status'))}
          >
            <span className="sf-dot" />
            <span className="sf-lg">{statusDesktopLabel}</span>
            <span className="sf-sm">{statusMobileLabel}</span>
          </button>

          <div
            id="sf-engine-popover"
            className={`sf-pop ${openPanel === 'status' ? 'open' : ''}`}
            role="region"
            aria-label="Engine status"
          >
            <div className="sf-row">
              <span>Engine</span>
              <b>SimPy, 5 replications</b>
            </div>
            <div className="sf-row">
              <span>Response time</span>
              <b>{latencyMs !== null ? `${latencyMs} ms` : engineState === 'offline' ? 'Offline' : '—'}</b>
            </div>
            <div className="sf-row">
              <span>Last check</span>
              <b>{lastCheck}</b>
            </div>
            <div className="sf-row">
              <span>Parts shipped</span>
              <b>{partsShipped}</b>
            </div>

            {engineState === 'offline' && (
              <div className="sf-hint">
                Start backend: <code>cd backend &amp;&amp; python main.py</code>
              </div>
            )}

            <button
              type="button"
              className="sf-go"
              onClick={runHealthCheck}
              disabled={engineState === 'check'}
            >
              {engineState === 'check' ? 'Checking…' : 'Check engine'}
            </button>
          </div>
        </div>

        <span className="sf-vr" aria-hidden="true" />

        {/* Methodology drawer toggle */}
        <button
          type="button"
          ref={methBtnRef}
          className="sf-link"
          aria-expanded={openPanel === 'methodology'}
          aria-controls="sf-methodology-drawer"
          onClick={() => setOpenPanel((prev) => (prev === 'methodology' ? null : 'methodology'))}
        >
          <span>Methodology</span>
          <ChevronDown strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          className="sf-ib"
          onClick={() => setIsDark((prev) => !prev)}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Interactive hazard-stripe conveyor belt */}
      <div
        className="sf-rail"
        role="button"
        tabIndex={0}
        onClick={handleSpawnPart}
        onKeyDown={handleBeltKeyDown}
        title="Click to send a part down the line"
        aria-label="Conveyor belt. Click to send an extra part down the line."
      >
        <div className="sf-lane">
          {AMBIENT_PARTS.map((part) => (
            <div
              key={part.id}
              className="sf-part"
              style={{
                animationDelay: part.delay,
                ...(part.width ? { width: part.width } : {}),
              }}
              onAnimationIteration={(e) => {
                if (e.animationName === 'sf-ride') {
                  setPartsShipped((count) => count + 1);
                }
              }}
            />
          ))}
          {extraParts.map((part) => (
            <div
              key={part.id}
              className="sf-part once"
              style={{ width: part.width }}
              onAnimationEnd={(e) => {
                if (e.animationName === 'sf-ride') {
                  setExtraParts((prev) => prev.filter((item) => item.id !== part.id));
                  setPartsShipped((count) => count + 1);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Methodology Drawer */}
      <div
        ref={drawerRef}
        id="sf-methodology-drawer"
        className={`sf-drawer ${openPanel === 'methodology' ? 'open' : ''}`}
        aria-hidden={openPanel !== 'methodology'}
      >
        <div className="sf-dwi">
          <div className="sf-dwc">
            <div className="sf-card" style={{ '--i': 0 }}>
              <div className="sf-n">1</div>
              <h3>Parts arrive at random</h3>
              <p>Gaps follow Exp(λ): random interarrival times with a steady average rate.</p>
            </div>

            <div className="sf-card" style={{ '--i': 1 }}>
              <div className="sf-n">2</div>
              <h3>Fastest server first</h3>
              <p>Idle workstations are chosen fastest-first; when all are busy, parts wait in one shared FIFO buffer.</p>
            </div>

            <div className="sf-card" style={{ '--i': 2 }}>
              <div className="sf-n">3</div>
              <h3>Stability check</h3>
              <p>
                λ &lt; H·μ<sub>H</sub> + R·μ<sub>R</sub> keeps queues bounded; otherwise the ratio is flagged UNSTABLE.
              </p>
            </div>

            <div className="sf-card" style={{ '--i': 3 }}>
              <div className="sf-n">4</div>
              <h3>Warm-up, 5 replications &amp; audit</h3>
              <p>
                Warm-up parts are discarded, 5 replications are averaged, and Little&apos;s Law audits L<sub>q</sub> ≈ λ·W<sub>q</sub> (within 15%).
              </p>
            </div>

            <div className="sf-note">
              <span>
                <b>Candidates with H + R = 4:</b> (4,0) (3,1) (2,2) (1,3) (0,4)
              </span>
              {onOpenMethodology && (
                <button
                  type="button"
                  className="sf-note-link"
                  onClick={() => {
                    setOpenPanel(null);
                    onOpenMethodology();
                  }}
                >
                  Read full methodology
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

