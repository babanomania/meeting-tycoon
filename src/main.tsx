import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { useGame } from './game/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Dev/preview-only: expose the Zustand store on window for the screenshot
// script in scripts/take-screenshots.mjs. Never exposed in production.
if (import.meta.env.DEV) {
  // @ts-expect-error — debug hook
  window.__useGame = useGame;
}
