import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);



// Filtrer les avertissements de la console
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn; // Store original console.warn
  console.warn = (message, ...optionalParams) => {
    if (typeof message === 'string' && !message.includes('defaultProps')) {
      originalWarn(message, ...optionalParams); // Use original instead of console.warn
    }
  };
}

reportWebVitals();