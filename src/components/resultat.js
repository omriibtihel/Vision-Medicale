import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown, faChevronUp, faDownload, 
  faArrowLeft, faHistory, faChartBar, faTable
} from '@fortawesome/free-solid-svg-icons';
import './resultat.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import { Chart, RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend);

const Result = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [showGraph, setShowGraph] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
const chartRef = useRef(null); 


const [chartOptions, setChartOptions] = useState({
  color: '#4299e1',
  borderRadius: 4,
  borderWidth: 1,
  chartType: 'bar',
  doughnutColors: ['#4cc9f0', '#4895ef', '#7209b7', '#f72585', '#f8961e', '#3a0ca3']
});



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
    .slice(0, 15);

  const labels = sorted.map(([feature]) => feature);
  const data = sorted.map(([, value]) => (value * 100).toFixed(2));

  const dataset = {
    label: 'Feature Importance',
    data,
    backgroundColor: chartOptions.chartType === 'doughnut'
      ? chartOptions.doughnutColors.slice(0, labels.length)
      : chartOptions.color,
    borderColor: chartOptions.chartType === 'doughnut'
      ? chartOptions.doughnutColors.slice(0, labels.length)
      : chartOptions.color,
    borderWidth: chartOptions.borderWidth,
    borderRadius: chartOptions.borderRadius,
  };

  return { labels, datasets: [dataset] };
};


const chartConfigOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: chartOptions.chartType === 'bar' || chartOptions.chartType === 'line' ? {
    y: {
      beginAtZero: true,
      grid: { color: colorPalette.border },
      ticks: { color: colorPalette.textLight }
    },
    x: {
      grid: { display: false },
      ticks: { color: colorPalette.textLight }
    }
  } : undefined,
  plugins: {
    legend: { display: chartOptions.chartType === 'doughnut' || chartOptions.chartType === 'radar' },
    tooltip: {
      callbacks: {
        label: (context) => `${context.parsed.y || context.parsed}% importance`
      }
    }
  }
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
  {{
    bar: <Bar ref={chartRef} data={prepareGraphData(importances)} options={chartConfigOptions} />,
    line: <Line ref={chartRef} data={prepareGraphData(importances)} options={chartConfigOptions} />,
    radar: <Radar ref={chartRef} data={prepareGraphData(importances)} options={chartConfigOptions} />,
    doughnut: <Doughnut ref={chartRef} data={prepareGraphData(importances)} options={chartConfigOptions} />,
  }[chartOptions.chartType]}

  <button
    className="download-graph-btn"
    onClick={() => {
      const url = chartRef.current?.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = `graph_${chartOptions.chartType}.png`;
      link.click();
    }}
  >
    Télécharger le graphique
  </button>
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

const renderPredictionSummary = (model, task) => {
  const metrics = model.metrics;
  const importances = model.feature_importances;
  const folds = model.kfold_scores || []; // tableau optionnel de scores k-fold

  if (!metrics) return null;

  const scoreMetrics = ['Accuracy', 'F1 Score', 'ROC AUC', 'R² Score'];
  const validMetric = Object.entries(metrics).find(([name]) =>
    scoreMetrics.includes(name)
  );

  const [metricName, metricValue] = validMetric || [];
  const percent = metricValue ? (metricValue * 100).toFixed(2) : null;

  const topFeatures = importances
    ? Object.entries(importances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)
    : [];

  const suggestion = (() => {
    if (metrics['Recall'] && metrics['Recall'] < 0.6) {
      return "🔁 Suggestion : Améliorer le rappel en ajoutant plus d'exemples de la classe positive.";
    }
    if (metrics['R² Score'] && metrics['R² Score'] < 0.5) {
      return "🔁 Suggestion : Le modèle explique peu de variance. Envisagez d'autres variables.";
    }
    return "";
  })();



  // Graph K-Fold
  const kfoldChart = folds.length > 0 ? {
    labels: folds.map((_, i) => `Fold ${i + 1}`),
    datasets: [{
      label: 'Score',
      data: folds.map(v => v * 100),
      backgroundColor: '#68d391'
    }]
  } : null;

    const classificationChart = {
    labels: Object.keys(metrics),
    datasets: [{
      label: 'Score (%)',
      data: Object.values(metrics).map(v => v * 100),
      backgroundColor: '#4fd1c5'
    }]
  };

  return (
    <div className="prediction-summary">
      <h4>🔮 Prédiction</h4>
      <div className="success-box">
        {percent && <p><strong>Taux de réussite :</strong> {percent}% ({metricName})</p>}
        {topFeatures.length > 0 && <p><strong>Variables influentes :</strong> {topFeatures.join(', ')}</p>}
        {suggestion && <p className="suggestion">{suggestion}</p>}

      <div className="charts-prediction">

                {/* ✅ Jauge circulaire pour régression */}
        {task === 'regression' && metricName === 'R² Score' && (
          <div className="gauge-box">
            <h5>🎯 R² Score (Taux de Réussite)</h5>
            <div style={{ width: 120, height: 120, margin: 'auto' }}>
              <CircularProgressbar
                value={metricValue * 100}
                text={`${percent}%`}
                styles={buildStyles({
                  pathColor: metricValue >= 0.7 ? '#38a169' : metricValue >= 0.4 ? '#f6ad55' : '#e53e3e',
                  textColor: '#2d3748',
                  trailColor: '#edf2f7',
                  textSize: '18px'
                })}
              />
            </div>
            <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
              {metricValue >= 0.7 ? "Excellent pouvoir explicatif ✅"
                : metricValue >= 0.4 ? "Pouvoir explicatif modéré ⚠️"
                : "Faible pouvoir explicatif ❌"}
            </p>
          </div>
        )}

        {task === 'classification' && metricName === 'Accuracy' && (
          <div className="gauge-box">
            <h5>🎯 Accuracy (Taux de Réussite)</h5>
            <div style={{ width: 120, height: 120, margin: 'auto' }}>
              <CircularProgressbar
                value={metricValue * 100}
                text={`${percent}%`}
                styles={buildStyles({
                  pathColor: metricValue >= 0.7 ? '#38a169' : metricValue >= 0.4 ? '#f6ad55' : '#e53e3e',
                  textColor: '#2d3748',
                  trailColor: '#edf2f7',
                  textSize: '18px'
                })}
              />
            </div>
            <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
              {metricValue >= 0.7 ? "Excellent pouvoir explicatif ✅"
                : metricValue >= 0.4 ? "Pouvoir explicatif modéré ⚠️"
                : "Faible pouvoir explicatif ❌"}
            </p>
          </div>
        )}

        {/* ✅ Bar chart des métriques pour classification */}
        {task === 'classification' && (
          <div className="chart-box">
            <h5>Scores par métrique</h5>
            <Bar
              data={{
                labels: Object.keys(metrics),
                datasets: [{
                  label: 'Score (%)',
                  data: Object.values(metrics).map(v => v * 100),
                  backgroundColor: [
                    '#4299e1',
                    '#f6ad55',
                    '#68d391',
                    '#ed64a6',
                    '#9f7aea',
                    '#38b2ac',
                    '#f56565',
                    '#ecc94b',
                    '#718096',
                  ]
                }]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: v => `${v}%` }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => `${ctx.parsed.x.toFixed(2)}%`
                    }
                  }
                }
              }}
            />
          </div>
        )}

        

        {kfoldChart && (
          <div className="chart-box">
            <h5> Variabilité (K-Fold)</h5>
            <Bar data={kfoldChart} options={{
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: value => `${value}%` }
                }
              }
            }} />
          </div>
        )}

        {/* ✅ Train vs Test Chart if split used */}
{model.train_metrics && (
  <div className="chart-box">
    <h5> Performance : Entraînement vs Test</h5>
    <Bar
      data={{
        labels: Object.keys(metrics),
        datasets: [
          {
            label: 'Test',
            data: Object.values(metrics).map(v => v * 100),
            backgroundColor: '#3b82f6'
          },
          {
            label: 'Entraînement',
            data: Object.keys(metrics).map(
              m => model.train_metrics[m] ? model.train_metrics[m] * 100 : 0
            ),
            backgroundColor: '#10b981'
          }
        ]
      }}
      options={{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { callback: v => `${v}%` }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
            }
          }
        }
      }}
    />
  </div>
)}
      </div>
            </div>

    </div>
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
                {model.method === "Train/Test Split" && (
                  <div className="split-info">
                    <p><strong>Train Size:</strong> {(model.train_size * 100).toFixed(1)}%</p>
                    <p><strong>Validation Size:</strong> {(model.val_size * 100).toFixed(1)}%</p>
                    <p><strong>Test Size:</strong> {(model.test_size * 100).toFixed(1)}%</p>
                  </div>
                )}

              </div>
              
              <div className="model-content">
{renderPredictionSummary(model, result?.task)}

                <section className="metrics-section">
  <h3 className="section-title"> Performance Metrics</h3>
  {renderMetrics(model.metrics)}
</section>

<section className="features-section">
  <div className="section-header">
    <h3 className="section-title">🧬 Feature Importance</h3>
    {model.feature_importances && (
      <button 
        className="toggle-graph"
        onClick={() =>
          setShowGraph(prev => ({
            ...prev,
            [model.model]: !prev[model.model]
          }))
        }
      >
        <FontAwesomeIcon icon={showGraph[model.model] ? faChevronUp : faChevronDown} />
        <span>{showGraph[model.model] ? 'Masquer' : 'Afficher'} la visualisation</span>
      </button>
    )}
  </div>

  {showGraph[model.model] && (
    <div className="visualization-container">
      {/* === GRAPHIQUE D’IMPORTANCE === */}
      <div className="chart-container">
        {renderFeatureImportances(model.feature_importances)}
      </div>

      {/* === PANEL DE PERSONNALISATION === */}
      {viewMode === 'chart' && (
        <section className="customization-panel">
          <h3> Personnalisation du graphique</h3>
          <div className="customization-grid">
            <div>
              <label>Couleur des barres</label>
              <input
                type="color"
                value={chartOptions.color}
                onChange={(e) =>
                  setChartOptions({ ...chartOptions, color: e.target.value })
                }
              />
            </div>

            <div>
              <label>Rayon des coins</label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={chartOptions.borderRadius}
                onChange={(e) =>
                  setChartOptions({
                    ...chartOptions,
                    borderRadius: Number(e.target.value),
                  })
                }
              />
              <span>{chartOptions.borderRadius}px</span>
            </div>

            <div>
              <label>Épaisseur de la bordure</label>
              <input
                type="number"
                min="0"
                max="10"
                value={chartOptions.borderWidth}
                onChange={(e) =>
                  setChartOptions({
                    ...chartOptions,
                    borderWidth: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label>Type de graphique</label>
              <select
                value={chartOptions.chartType}
                onChange={(e) =>
                  setChartOptions({ ...chartOptions, chartType: e.target.value })
                }
              >
                <option value="bar">Barres</option>
                <option value="line">Ligne</option>
                <option value="radar">Radar</option>
                <option value="doughnut">Doughnut</option>
              </select>
            </div>

            {chartOptions.chartType === 'doughnut' && (
              <div className="color-list">
                <label>Couleurs du doughnut</label>
                {chartOptions.doughnutColors.map((color, index) => (
                  <input
                    key={index}
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newColors = [...chartOptions.doughnutColors];
                      newColors[index] = e.target.value;
                      setChartOptions({
                        ...chartOptions,
                        doughnutColors: newColors,
                      });
                    }}
                  />
                ))}
                <button
                  className="add-color-btn"
                  onClick={() =>
                    setChartOptions({
                      ...chartOptions,
                      doughnutColors: [...chartOptions.doughnutColors, '#cccccc'],
                    })
                  }
                >
                  + Ajouter une couleur
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )}
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