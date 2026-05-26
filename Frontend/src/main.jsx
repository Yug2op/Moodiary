// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Vercel optimization monitoring scripts
injectSpeedInsights();

// Render core React application layout trees
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Unified, high-fidelity PWA Service Worker initialization hook
if ("serviceWorker" in navigator) {
  const registerSW = () => {
    navigator.serviceWorker
      .register("/service-worker.js") // Points straight to your public file path
      .then((registration) => {
        console.log("PWA Service Worker registered successfully:", registration.scope);
      })
      .catch((error) => {
        console.error("PWA Service Worker registration failed:", error);
      });
  };

  if (document.readyState === "complete") {
    registerSW();
  } else {
    window.addEventListener("load", registerSW);
  }
}