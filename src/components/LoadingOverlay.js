import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ message = "Chargement en cours..." }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
