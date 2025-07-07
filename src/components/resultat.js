import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown, faChevronUp, faDownload, 
  faArrowLeft, faHistory, faChartBar, faTable
} from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import './resultat.css';

const Result = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [showGraph, setShowGraph] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const chartRefs = useRef({});

  // Couleurs modernes
  const colorPalette = {
    excellent: '#4fd1c5',
    good: '#4299e1',
    average: '#f6ad55',
    poor: '#fc8181',
    textDark: '#2d3748',
    textLight: '#718096',
    bgLight: '#f8fafc',
    border: '#e2e8f0'
  };

  const getColorByScore = (score) => {
    if (score >= 0.8) return colorPalette.excellent;
    if (score >= 0.6) return colorPalette.good;
    if (score >= 0.4) return colorPalette.average;
    return colorPalette.poor;
  };

  useEffect(() => {
    const storedResult = localStorage.getItem('modelResult');
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult);
        setResult(parsed);
      } catch (e) {
        console.error("Error parsing result:", e);
      }
    }
  }, []);

  const handleDownload = (format) => {
    if (!result) return;

    if (format === 'csv') {
      const rows = [['Model', 'Metric', 'Value']];
      result.results?.forEach(({ model, metrics }) => {
        Object.entries(metrics || {}).forEach(([metric, value]) => {
          rows.push([model, metric, value?.toFixed(4)]);
        });
      });
      const csv = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "model_results.csv";
      link.click();
    } else {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "model_results.json";
      link.click();
    }
  };

  const prepareGraphData = (importances) => {
    if (!importances) return { labels: [], datasets: [] };
    
    const sorted = Object.entries(importances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Limiter aux 15 features les plus importantes

    return {
      labels: sorted.map(([feature]) => feature),
      datasets: [{
        label: 'Feature Importance',
        data: sorted.map(([, value]) => (value * 100).toFixed(2)),
        backgroundColor: colorPalette.good,
        borderColor: colorPalette.good,
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  const renderFeatureImportances = (importances) => {
    if (!importances) return <p className="no-data">No feature importances available</p>;

    const sorted = Object.entries(importances)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Afficher seulement les 10 plus importantes

    return (
      <div className={`feature-importance ${viewMode}`}>
        {viewMode === 'table' ? (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Importance</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(([feature, value], index) => (
                <tr key={index}>
                  <td>{feature}</td>
                  <td>{(value * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="chart-container">
            <Bar
              data={prepareGraphData(importances)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: colorPalette.border },
                    ticks: { color: colorPalette.textLight }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: colorPalette.textLight }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.parsed.y}% importance`
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderMetrics = (metrics) => {
    if (!metrics) return <p className="no-data">No metrics available</p>;

    return (
      <table className="styled-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(metrics).map(([metric, value], index) => (
            <tr key={index}>
              <td>{metric}</td>
              <td style={{ color: getColorByScore(value) }}>
                {typeof value === 'number' ? value.toFixed(4) : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="results-container">
      {/* Header Section */}
      <header className="results-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Models</span>
        </button>
        
        <div className="header-content">
          <h1>Model Performance Results</h1>
          <p className="subtitle">Detailed analysis of your trained models</p>
        </div>
        
        <div className="action-buttons">
          <button 
            className={`view-toggle ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <FontAwesomeIcon icon={faTable} />
            <span>Table</span>
          </button>
          <button 
            className={`view-toggle ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode('chart')}
          >
            <FontAwesomeIcon icon={faChartBar} />
            <span>Chart</span>
          </button>
          <button className="download-button" onClick={() => handleDownload('csv')}>
            <FontAwesomeIcon icon={faDownload} />
            <span>CSV</span>
          </button>
          <button className="download-button" onClick={() => handleDownload('json')}>
            <FontAwesomeIcon icon={faDownload} />
            <span>JSON</span>
          </button>
          <button 
            className="history-button" 
            onClick={() => navigate(`/historique/${id}`)}
          >
            <FontAwesomeIcon icon={faHistory} />
            <span>History</span>
          </button>
        </div>
      </header>

      {/* Project Info */}
      <section className="project-info">
        <div className="info-card">
          <h3>Project Information</h3>
          <div className="info-grid">
            <div>
              <label>Dataset</label>
              <p>{result?.dataset_name || 'N/A'}</p>
            </div>
            <div>
              <label>Target Feature</label>
              <p>{result?.target_feature || 'N/A'}</p>
            </div>
            <div>
              <label>Task Type</label>
              <p>{result?.task || 'N/A'}</p>
            </div>
            <div>
              <label>Trained At</label>
              <p>{result?.trained_at || 'N/A'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="results-main">
        {result?.results?.length > 0 ? (
          result.results.map((model, index) => (
            <article key={index} className="model-card">
              <div className="model-header">
                <h2>{model.model}</h2>
                <span className="validation-method">{model.method || "N/A"}</span>
              </div>
              
              <div className="model-content">
                <section className="metrics-section">
                  <h3>Performance Metrics</h3>
                  {renderMetrics(model.metrics)}
                </section>
                
                <section className="features-section">
                  <div className="section-header">
                    <h3>Feature Importance</h3>
                    {model.feature_importances && (
                      <button 
                        className="toggle-graph"
                        onClick={() => setShowGraph(prev => ({
                          ...prev,
                          [model.model]: !prev[model.model]
                        }))}
                      >
                        <FontAwesomeIcon icon={showGraph[model.model] ? faChevronUp : faChevronDown} />
                        <span>{showGraph[model.model] ? 'Hide' : 'Show'} Visualization</span>
                      </button>
                    )}
                  </div>
                  
                  {showGraph[model.model] && renderFeatureImportances(model.feature_importances)}
                </section>
              </div>
            </article>
          ))
        ) : (
          <div className="no-results">
            <p>No results to display. Please train some models first.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Result;