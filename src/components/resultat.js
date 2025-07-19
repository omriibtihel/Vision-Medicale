import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams , useLocation} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown, faChevronUp, faDownload, 
  faArrowLeft, faHistory, faChartBar, faTable, faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import './resultat.css';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import QRCode from 'qrcode';

import { Chart, RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';


import { Chart as ChartJS } from 'chart.js';
import Plot from 'react-plotly.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

Chart.register(RadialLinearScale, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Tooltip, Legend);

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);




const Result = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [result, setResult] = useState(null);

  const location = useLocation();
  const modelId = new URLSearchParams(location.search).get('modelId');
  const [showGraph, setShowGraph] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
const chartRef = useRef(null); 
const [overlayInfo, setOverlayInfo] = useState(null);
    const [confusionMode, setConfusionMode] = useState('heatmap'); // 'table' | 'chart' | 'heatmap'

const [confusionViewMode, setConfusionViewMode] = useState('table'); // 'table' | 'chart' | 'heatmap'


useEffect(() => {
  let isMounted = true;

  const fetchModelDetails = async (modelId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/model-details/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch model');
      
      const modelData = await response.json();

      if (isMounted) {
        setResult({
          results: [{
            model: modelData.model,
            metrics: modelData.metrics,
            feature_importances: modelData.feature_importances,
            method: modelData.method,
            train_size: modelData.train_size / 100,
            test_size: modelData.test_size / 100,
            k: modelData.k,
            confusion_matrix: modelData.confusion_matrix || null,
            confusion_labels: modelData.confusion_labels || null
          }],
          dataset_name: modelData.dataset_name,
          target_feature: modelData.target_feature,
          task: modelData.task,
          trained_at: modelData.created_at || new Date().toISOString()
        });
      }
    } catch (err) {
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const modelId = searchParams.get('modelId');

  if (modelId) {
    fetchModelDetails(modelId);
  } else {
    try {
      const storedResult = localStorage.getItem('modelResult');
      if (storedResult) {
        setResult(JSON.parse(storedResult));
      } else {
        setError('No model results found');
      }
    } catch (e) {
      setError('Invalid saved results format');
    }
    setLoading(false);
  }

  return () => { isMounted = false };
}, [location.search]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
const handleSaveModel = async (model) => {
  try {
    const token = localStorage.getItem("token");
    const payload = {
      modelname: model.model,
      modelpath: model.model_path || "placeholder_model.pkl",
      validpath: model.valid_path || "placeholder_valid.csv",
      Accuracy: model.metrics?.Accuracy || 0.0,
      Precisionn: model.metrics?.Precision || 0.0,
      Recall: model.metrics?.Recall || 0.0,
      F1_Score: model.metrics?.["F1 Score"] || 0.0,
      ROC_AUC: model.metrics?.["ROC AUC"] || 0.0,
      MeanAbsoluteError: model.metrics?.["Mean Absolute Error"] || 0.0,
      MeanSquaredError: model.metrics?.["Mean Squared Error"] || 0.0,
      RScore: model.metrics?.["R² Score"] || 0.0,
      featureimportance: model.feature_importances || {},
      confusion_matrix: JSON.stringify(model.confusion_matrix),
      confusion_labels: JSON.stringify(model.confusion_labels),
      file_id: model.version_id,
      trainingset: model.train_size * 100,
      testset: model.test_size * 100,
      k: model.k,
      file_id: model.version_id // 🔽 Assure-toi que ce champ existe dans chaque modèle

    };

    console.log("🟡 Payload envoyé :", payload);

    const response = await fetch(`http://localhost:5000/models/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("🔵 Texte brut reçu :", text);

    if (!response.ok) {
      throw new Error(`Status ${response.status} : ${text}`);
    }

    const data = JSON.parse(text);
    alert("✅ Modèle sauvegardé avec succès !");
  } catch (error) {
    console.error("❌ Erreur complète :", error);
    alert("❌ Erreur lors de la sauvegarde : " + error.message);
  }
};



const ConfusionHeatmapPlotly = ({ matrix, labels }) => {
  const safeLabels = Array.isArray(labels) ? labels : JSON.parse(labels || "[]");
  const safeMatrix = Array.isArray(matrix) ? matrix : JSON.parse(matrix || "[]");

  return (
    <div className="confusion-heatmap-plotly" style={{ width: '100%', height: '200px' }}>
      <Plot
        data={[{
          z: safeMatrix,
          x: safeLabels.map((l) => `Prédit : ${l}`),
          y: safeLabels.map((l) => `Réel : ${l}`),
          type: 'heatmap',
          hoverongaps: false,
          colorscale: 'Blues',
          showscale: true,
        }]}
        layout={{
          autosize: true,
          margin: { t: 30, l: 60, r: 10, b: 40 },
          xaxis: {
            title: { text: 'Classe prédite', font: { size: 11 } },
            tickfont: { size: 10 }
          },
          yaxis: {
            title: { text: 'Classe réelle', font: { size: 11 } },
            tickfont: { size: 10 }
          }
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true }}
      />
    </div>
  );
};



const renderConfusionMatrix = (matrix, labels) => {
  const safeLabels = Array.isArray(labels) ? labels : JSON.parse(labels || "[]");
  const safeMatrix = Array.isArray(matrix) ? matrix : JSON.parse(matrix || "[]");

  if (!safeMatrix || !safeLabels.length) return null;

  return (
    <div className="confusion-matrix">
      <table className="confusion-table">
        <thead>
          <tr>
            <th></th>
            {safeLabels.map((label, i) => (
              <th key={`pred-${i}`}>Prédit : {label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeMatrix.map((row, i) => (
            <tr key={`actual-${i}`}>
              <th>Réel : {safeLabels[i]}</th>
              {row.map((value, j) => (
                <td key={`cell-${i}-${j}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};



const ConfusionMatrixChart = ({ matrix, labels }) => {
  const safeLabels = Array.isArray(labels) ? labels : JSON.parse(labels || "[]");
  const safeMatrix = Array.isArray(matrix) ? matrix : JSON.parse(matrix || "[]");

  const colorPalette = [
    'rgba(67, 97, 238, 0.7)',
    'rgba(114, 9, 183, 0.7)',
    'rgba(249, 168, 38, 0.7)',
    'rgba(247, 37, 133, 0.7)',
    'rgba(76, 201, 240, 0.7)',
    'rgba(58, 12, 163, 0.7)'
  ];

  const borderPalette = colorPalette.map(color => color.replace('0.7', '1'));

  const data = {
    labels: safeLabels.map(label => `Réel ${label}`),
    datasets: safeLabels.map((predLabel, j) => ({
      label: `Prédit ${predLabel}`,
      data: safeMatrix.map(row => row[j]),
      backgroundColor: colorPalette[j % colorPalette.length],
      borderColor: borderPalette[j % borderPalette.length],
      borderWidth: 1,
    }))
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`
        }
      },
      legend: { position: 'top' },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre d\'échantillons',
          color: '#2d3748'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Classe réelle',
          color: '#2d3748'
        }
      }
    }
  };

  return (
    <div className="confusion-heatmap" style={{ maxWidth: '600px', margin: '1rem auto' }}>
      <Bar data={data} options={options} />
    </div>
  );
};



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

const shouldBePercentage = (metricName) => {
  const percentMetrics = [
    'Accuracy', 'F1 Score', 'Precision', 'Recall',
    'ROC AUC', 'Specificity', 'Sensitivity'
  ];
  return percentMetrics.includes(metricName);
};

const normalizeMetricName = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '')       // supprime les espaces
    .replace('²', '2')         // remplace le ²
    .replace(/_/g, '')         // supprime les underscores
    .replace('score', '');     // supprime le mot 'score'


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
{Object.entries(metrics).map(([metric, value], index) => {
  const normalized = normalizeMetricName(metric);
  return (
    <tr key={index}>
      <td>{metric}</td>
      <td style={{ color: getColorByScore(value) }}>
        {typeof value === 'number'
          ? shouldBePercentage(normalized)
            ? `${(value * 100).toFixed(2)}%`
            : value.toFixed(4)
          : value}
      </td>
    </tr>
  );
})}

      </tbody>
    </table>
  );
};



const handleDownloadReport = async () => {
  const modelCards = document.querySelectorAll(".model-card");
  const projectName = result?.dataset_name || "Projet ML";
  const targetFeature = result?.target_feature || "N/A";
  const trainedAt = result?.trained_at
    ? new Date(result.trained_at).toLocaleString()
    : new Date().toLocaleString();

  if (!modelCards.length) return;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const now = new Date().toLocaleString();

  const logo = new Image();
  logo.src = '/logo.png';

  logo.onload = async () => {
    const qrDataURL = await QRCode.toDataURL("https://medical-vision.app");

    // === PAGE DE COUVERTURE ===
    pdf.addImage(logo, 'PNG', 40, 40, 40, 40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Medical Vision", 90, 65);
    pdf.text("Rapport des Modèles Entraînés", 40, 120);

    pdf.setDrawColor(70, 130, 180);
    pdf.setLineWidth(2);
    pdf.line(40, 130, pageWidth - 40, 130);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Dataset : ${projectName}`, 40, 170);
    pdf.text(`Cible : ${targetFeature}`, 40, 200);
    pdf.text(`Date d'entraînement : ${trainedAt}`, 40, 230);
    pdf.text(`Rapport généré le : ${now}`, 40, 260);

    // ✅ QR code uniquement
    pdf.addImage(qrDataURL, 'PNG', pageWidth - 160, pageHeight - 140, 80, 80);
    pdf.setFontSize(10);
    pdf.text("Scan pour accéder à Medical Vision", pageWidth - 200, pageHeight - 50);

    // === SOMMAIRE ===
    pdf.addPage();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text("Sommaire", 40, 70);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(40, 80, pageWidth - 40, 80);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(60, 60, 60);
    const summaryStartY = 100;

    modelCards.forEach((card, i) => {
      const titleEl = card.querySelector("h2");
      const title = titleEl ? titleEl.innerText : `Modèle ${i + 1}`;
      const y = summaryStartY + i * 20;
      pdf.text(`${i + 1}. ${title}`, 60, y);
    });

    pdf.addPage();

    // === MODÈLES UN PAR PAGE ===
    const captureCard = async (card, index, total) => {
      const canvas = await html2canvas(card, {
        scrollY: -window.scrollY,
        scale: 2
      });

      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (index > 0) pdf.addPage();

      pdf.addImage(imgData, "PNG", 0, 40, pdfWidth, pdfHeight);

      // En-tête
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Medical Vision - ${projectName} - ${targetFeature}`, 40, 20);

      // Pied de page
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${index + 3} / ${total + 3}`, pageWidth - 80, pageHeight - 20);
    };

    for (let i = 0; i < modelCards.length; i++) {
      await captureCard(modelCards[i], i, modelCards.length);
    }

    pdf.save(`rapport_models_${Date.now()}.pdf`);
  };
};







const renderPredictionSummary = (model, task) => {
  const metrics = model.metrics;
  const importances = model.feature_importances;
  const folds = model.kfold_scores || [];

  if (!metrics) return null;

  const scoreMetrics = ['Accuracy', 'F1 Score', 'ROC AUC', 'R² Score'];
const validMetric = Object.entries(metrics).find(([name]) =>
  scoreMetrics.map(normalizeMetricName).includes(normalizeMetricName(name))
);
  const [metricName, metricValue] = validMetric || [];

  const topFeatures = importances
    ? Object.entries(importances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)
    : [];

  const suggestion = (() => {


const recallEntry = Object.entries(metrics).find(
  ([name]) => normalizeMetricName(name) === 'recall'
);
if (recallEntry && recallEntry[1] < 0.6) {
  return "🔁 Suggestion : Améliorer le rappel en ajoutant plus d'exemples de la classe positive.";
}

const r2Entry = Object.entries(metrics).find(
  ([name]) => normalizeMetricName(name) === 'r2'
);
if (r2Entry && r2Entry[1] < 0.5) {
  return "🔁 Suggestion : Le modèle explique peu de variance. Envisagez d'autres variables.";
}

    return "";
  })();

  const kfoldChart = folds.length > 0 ? {
    labels: folds.map((_, i) => `Fold ${i + 1}`),
    datasets: [{
      label: 'Score',
      data: folds.map((v, i) => {
        const m = model.kfold_metric_names?.[i] || metricName;
        return shouldBePercentage(m) ? v * 100 : v;
      }),
      backgroundColor: '#68d391'
    }]
  } : null;

  return (
    <div className="prediction-summary">
      <h4>🔮 Prédiction</h4>
      <div className="success-box">
        {metricName && (
          <p>
            <strong>Taux de réussite :</strong>{' '}
            {shouldBePercentage(metricName)
              ? `${(metricValue * 100).toFixed(2)}%`
              : metricValue.toFixed(4)}{' '}
            ({metricName})
          </p>
        )}
        {topFeatures.length > 0 && (
          <p><strong>Variables influentes :</strong> {topFeatures.join(', ')}</p>
        )}
        {suggestion && <p className="suggestion">{suggestion}</p>}

        {model.best_params && (
          <div className="best-params">
            <h5>🔧 Meilleurs paramètres trouvés (Grid Search)</h5>
            <ul>
              {Object.entries(model.best_params).map(([param, value]) => (
                <li key={param}><strong>{param}</strong> : {String(value)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="charts-prediction">
          <div className="gauge-box">
            <h5>{metricName}</h5>
            <div style={{ width: 120, height: 120, margin: 'auto' }}>
              <CircularProgressbar
                value={shouldBePercentage(metricName) ? metricValue * 100 : metricValue}
                text={
                  shouldBePercentage(metricName)
                    ? `${(metricValue * 100).toFixed(2)}%`
                    : metricValue.toFixed(4)
                }
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

          <div className="chart-box">
            <h5>Scores par métrique</h5>
            <Bar
              data={{
                labels: Object.keys(metrics),
                datasets: [{
                  label: 'Score',
                  data: Object.entries(metrics).map(([m, v]) =>
                    shouldBePercentage(m) ? v * 100 : v
                  ),
                  backgroundColor: [
                    '#4299e1','#f6ad55','#68d391','#ed64a6','#9f7aea','#38b2ac','#f56565','#ecc94b','#718096']
                }]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      callback: function (v, i) {
                        return `${v}${v > 1 ? '' : ''}`;
                      }
                    }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: ctx => {
                        const m = metrics[ctx.label];
                        return shouldBePercentage(ctx.label)
                          ? `${ctx.label}: ${(ctx.raw).toFixed(2)}%`
                          : `${ctx.label}: ${(ctx.raw).toFixed(4)}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>

          {kfoldChart && (
            <div className="chart-box">
              <h5>Variabilité (K-Fold)</h5>
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

          {model.train_metrics && (
            <div className="chart-box">
              <h5>Performance : Entraînement vs Test</h5>
              <Bar
                data={{
                  labels: Object.keys(metrics),
                  datasets: [
                    {
                      label: 'Test',
                      data: Object.entries(metrics).map(([m, v]) =>
                        shouldBePercentage(m) ? v * 100 : v
                      ),
                      backgroundColor: '#3b82f6'
                    },
                    {
                      label: 'Entraînement',
                      data: Object.keys(metrics).map(
                        m => model.train_metrics[m]
                          ? (shouldBePercentage(m) ? model.train_metrics[m] * 100 : model.train_metrics[m])
                          : 0
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
                      ticks: {
                        callback: value => `${value}${value > 1 ? '' : ''}`
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: ctx => {
                          return shouldBePercentage(ctx.label)
                            ? `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`
                            : `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          )}

          {model.confusion_matrix && model.confusion_labels && (
                        <div className="chart-box">

  <div className="confusion-inside-prediction">
      <h5>Matrice de Confusion</h5>
      <div className="dropdown-container">
        <label htmlFor={`conf-view-${model.model}`}>Afficher :</label>
        <select
          id={`conf-view-${model.model}`}
          value={confusionMode}
          onChange={(e) => setConfusionMode(e.target.value)}
        >
          <option value="table">Tableau</option>
          <option value="chart">Barres empilées</option>
          <option value="heatmap">Heatmap</option>
        </select>
      </div>

    {confusionMode === 'table' && renderConfusionMatrix(model.confusion_matrix, model.confusion_labels)}
    {confusionMode === 'chart' && (
      <ConfusionMatrixChart
        matrix={model.confusion_matrix}
        labels={model.confusion_labels}
      />
    )}
    {confusionMode === 'heatmap' && (
      <ConfusionHeatmapPlotly
        matrix={model.confusion_matrix}
        labels={model.confusion_labels}
      />
    )}
  </div></div>
)}

        </div>
      </div>
    </div>
  );
};


function evaluateModel(model) {
  const score = model.metrics || {};
  const train = model.train_metrics || {};
  const task = model.task || 'classification';

  const errorMetrics = ['mae', 'mse', 'rmse', 'meanabsoluteerror', 'meansquarederror', 'rootmeansquarederror'];
  const perfClassification = ['accuracy', 'f1', 'rocauc', 'precision', 'recall'];
  const perfRegression = ['r2', 'explainedvariance'];

  let mainMetric = null;
  let isError = false;

  const scoreKeys = Object.keys(score);

  // === Recherche prioritaire de 'R² Score' ===
  if (task === 'regression') {
    const r2 = scoreKeys.find(k => normalizeMetricName(k) === 'r2');
    if (r2) {
      mainMetric = r2;
      isError = false;
    }
  }

  // === Sinon chercher la 1re bonne métrique de performance ===
  if (!mainMetric) {
    const perfList = task === 'regression' ? perfRegression : perfClassification;
    for (const m of perfList) {
      const match = scoreKeys.find(k => normalizeMetricName(k) === m);
      if (match) {
        mainMetric = match;
        isError = false;
        break;
      }
    }
  }

  // === Sinon chercher une métrique d'erreur ===
  if (!mainMetric) {
    for (const m of errorMetrics) {
      const match = scoreKeys.find(k => normalizeMetricName(k) === m);
      if (match) {
        mainMetric = match;
        isError = true;
        break;
      }
    }
  }

  // === Sinon, fallback brut
  if (!mainMetric) {
    mainMetric = scoreKeys[0];
    isError = errorMetrics.includes(normalizeMetricName(mainMetric));
  }

  const val = score[mainMetric] ?? 0;
  const trn = train[mainMetric] ?? 0;
  const diff = Math.abs(trn - val);
  const diffRatio = diff / Math.max(trn, val || 1);

  let status = '❌ Risqué';
  let description = 'Le modèle est instable ou peu performant. Fort risque de sur/sous-apprentissage.';

  if (task === 'regression') {
    if (isError) {
      if (diffRatio < 0.05 && val < 10) {
        status = '✅ Fiable';
        description = 'Erreur faible et stabilité entre train/test.';
      } else if (diffRatio < 0.15) {
        status = '🟡 Acceptable';
        description = 'Erreur modérée et raisonnablement stable.';
      }
    } else {
      if (val >= 0.85 && diffRatio < 0.05) {
        status = '✅ Fiable';
        description = 'Modèle performant et stable.';
      } else if (val >= 0.7 && diffRatio < 0.1) {
        status = '🟡 Acceptable';
        description = 'Performance correcte avec stabilité modérée.';
      }
    }
  } else {
    if (val >= 0.9 && diffRatio < 0.05) {
      status = '✅ Fiable';
      description = 'Excellente performance et stabilité.';
    } else if (val >= 0.75 && diffRatio < 0.1) {
      status = '🟡 Acceptable';
      description = 'Bonne performance mais attention au surapprentissage.';
    }
  }

  if (!isError && val < trn && diffRatio > 0.3) {
    description += ' 📛 Le modèle semble sur-appris (overfitting).';
  }

  return {
    label: status,
    type: status.includes('Fiable') ? 'good' : (status.includes('Acceptable') ? 'warn' : 'bad'),
    description,
    mainMetric,
    trainScore: trn,
    testScore: val,
    task
  };
}



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
         <button className="download-button" onClick={handleDownloadReport}>
  <FontAwesomeIcon icon={faFilePdf} />
  <span>Rapport PDF</span>
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

<button
  className={`model-badge-btn ${evaluateModel(model).type}`}
  onClick={() => setOverlayInfo({ model: model.model, ...evaluateModel(model) })}
>
  {evaluateModel(model).label}
</button>




                <span className="validation-method">{model.method || "N/A"}</span>
                {model.method === "Train/Test Split" && (
                  <div className="split-info">
                    <p><strong>Train Size:</strong> {(model.train_size * 100).toFixed(1)}%</p>
                    <p><strong>Validation Size:</strong> {(model.val_size * 100).toFixed(1)}%</p>
                    <p><strong>Test Size:</strong> {(model.test_size * 100).toFixed(1)}%</p>
                  </div>
                )}
                 <button
            className="save-model-btn"
            style={{ marginTop: '1rem', backgroundColor: '#38a169', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none' }}
            onClick={() => handleSaveModel(model)}
          >
            💾 Enregistrer ce modèle
          </button>
          

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
          <h3> Costomiser le graphique</h3>
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
        )
        }
      </main>
      {overlayInfo && (
  <div className="popup-overlay" onClick={() => setOverlayInfo(null)}>
    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
      <button className="popup-close" onClick={() => setOverlayInfo(null)}>×</button>
      <h3>{overlayInfo.label} — {overlayInfo.model}</h3>
      <p>{overlayInfo.description}</p>
      {overlayInfo.mainMetric && (
  <div className="metric-breakdown">
    <p><strong>Métrique :</strong> {overlayInfo.mainMetric}</p>
    <p><strong>Train :</strong> {overlayInfo.trainScore.toFixed(4)}</p>
    <p><strong>Validation/Test :</strong> {overlayInfo.testScore.toFixed(4)}</p>
    
  </div>
)}

    </div>
  </div>
)}

    </div>
  );
  
};

export default Result;