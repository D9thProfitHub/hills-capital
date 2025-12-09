import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ignore benign "Script error." from third-party scripts (like TradingView) in dev mode
const originalOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (message === 'Script error.' || message === 'Script error') {
    // Return true to prevent default handling (error overlay)
    return true;
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
