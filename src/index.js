import React from 'react';
import ReactDOM from 'react-dom/client';
import 'country-flag-icons/react/3x2'; // 🇫🇷, 🇹🇳 etc.

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// Filtrer les avertissements de la console
if (process.env.NODE_ENV === 'development') {
  console.warn = (message, ...optionalParams) => {
    if (!message.includes('defaultProps')) {
      console.warn(message, ...optionalParams);
    }
  };
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
