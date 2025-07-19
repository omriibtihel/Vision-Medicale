import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Doughnut } from 'react-chartjs-2';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt, faHistory, faRocket, faTimes,faChevronLeft , faChevronRight} from '@fortawesome/free-solid-svg-icons';
import './importSucc.css';
import './modal.css';
import axios from 'axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Sidebar from './Sidebar';
import GaugeChart from 'react-gauge-chart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const ImportSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);
  const [columnTypes, setColumnTypes] = useState({});
  const [targetFeature, setTargetFeature] = useState('');
  const [isTargetFeatureSet, setIsTargetFeatureSet] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minCorr, setMinCorr] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [featureSearch, setFeatureSearch] = useState('');
  const [isFeaturePopupOpen, setIsFeaturePopupOpen] = useState(false);
  const [targetFeatureError, setTargetFeatureError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  const cleanData = (data) => (typeof data === 'string' ? data.replace(/NaN/g, 'null') : data);
  const sanitizeJson = (jsonString) => jsonString.replace(/NaN/g, 'null');

  const fetchTargetFeature = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/projects/${id}/target-feature`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      // Debug log
      console.log('API Response:', response.data);

      if (response.data.currentTarget) {
        setTargetFeature(response.data.currentTarget);
        setIsTargetFeatureSet(true);
      }
      
      // S'assurer que les colonnes sont bien disponibles
      if (response.data.columns && response.data.columns.length > 0 && availableFeatures.length === 0) {
          setAvailableFeatures(response.data.columns);
        }

    } catch (error) {
      console.error('Error fetching target feature:', error);
      // En cas d'erreur, utiliser les colonnes du dataset local
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        setAvailableFeatures(columns);
      }
    }
  };

  const importBD = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/projects/${id}/imported-files`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      let cleanedData;
      if (typeof response.data === 'object') {
        cleanedData = cleanData(response.data.data);
      } else if (typeof response.data === 'string') {
        const parsed = JSON.parse(sanitizeJson(response.data));
        cleanedData = cleanData(parsed.data);
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
        setTotalRows(cleanedData.length);
        setTotalColumns(cleanedData.length > 0 ? Object.keys(cleanedData[0]).length : 0);

        const types = Object.keys(cleanedData[0]).reduce((acc, key) => {
          acc[key] = typeof cleanedData[0][key];
          return acc;
        }, {});
        setColumnTypes(types);
        setAvailableFeatures(Object.keys(types));
      }
    } catch (error) {
      console.error('Error fetching imported files:', error);
    }
  };

  useEffect(() => {
  const load = async () => {
    await importBD();
    await fetchTargetFeature();
  };
  load();
  }, [id]);

  



  const saveTargetFeature = async () => {
    const token = localStorage.getItem('token');
    setTargetFeatureError('');
    setIsSaving(true);

    if (!targetFeature) {
      setTargetFeatureError('Please select a target feature');
      setIsSaving(false);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/projects/${id}/set-target`,
        { targetFeature },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsTargetFeatureSet(true);
        fetchTargetFeature();
        navigate(`/importSucc/${id}`, { replace: true });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setTargetFeatureError(error.response.data.error || 'Invalid target feature');
          if (error.response.data.availableFeatures) {
            setAvailableFeatures(error.response.data.availableFeatures);
          }
        } else {
          setTargetFeatureError('Failed to save target feature');
        }
      } else {
        setTargetFeatureError('Network error - please try again');
      }
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileClick = () => navigate('/profile');
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

const handleChange = (e) => {
  setTargetFeature(e.target.value);
};

  const typeCounts = Object.values(columnTypes).reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const pieData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#8BC34A'],
        hoverOffset: 4,
      },
    ],
  };

  const missingCounts = {};
  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    keys.forEach((key) => {
      missingCounts[key] = data.filter((row) => !row[key] || row[key] === 'null').length;
    });
  }
  const barData = {
    labels: Object.keys(missingCounts),
    datasets: [
      {
        label: 'Missing Values',
        data: Object.values(missingCounts),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const nullVsNonNullData = {
    labels: Object.keys(missingCounts),
    datasets: [
      {
        label: 'Non null',
        data: Object.keys(missingCounts).map(
          (col) => totalRows - missingCounts[col]
        ),
        backgroundColor: '#4CAF50',
      },
      {
        label: 'Null',
        data: Object.values(missingCounts),
        backgroundColor: '#F44336',
      },
    ],
  };

  const selectedColumnValues = selectedFeature
    ? data
        .map((row) => {
          const val = row[selectedFeature];
          return typeof val === 'number' ? val : parseFloat(val);
        })
        .filter((v) => !isNaN(v))
    : [];

  const histogramBins = 10;
  const minVal = Math.min(...selectedColumnValues);
  const maxVal = Math.max(...selectedColumnValues);
  const binSize = (maxVal - minVal) / histogramBins;
  const histogramCounts = new Array(histogramBins).fill(0);
  selectedColumnValues.forEach((v) => {
    const binIndex = Math.min(Math.floor((v - minVal) / binSize), histogramBins - 1);
    histogramCounts[binIndex]++;
  });

  const histogramData = {
    labels: histogramCounts.map((_, i) => 
      `${(minVal + i * binSize).toFixed(2)} - ${(minVal + (i + 1) * binSize).toFixed(2)}`
    ),
    datasets: [
      {
        label: `Distribution of ${selectedFeature}`,
        data: histogramCounts,
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const getStatistics = (values) => {
    if (!values.length) return {};
    const sorted = [...values].sort((a, b) => a - b);
    const mean = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const std = Math.sqrt(sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length);
    const q1 = sorted[Math.floor(sorted.length / 4)];
    const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
    return { mean, median, std, min, max, q1, q3 };
  };

  const stats = getStatistics(selectedColumnValues);

  const numericCols = data.length > 0
    ? Object.keys(data[0]).filter(col =>
        data.some(row => !isNaN(parseFloat(row[col])))): [];

  const filteredCols = selectedFeatures.length > 0 ? selectedFeatures : numericCols;

  const heatmapData = filteredCols.map(rowCol => filteredCols.map(col => {
    const rowValues = data.map(r => parseFloat(r[rowCol])).filter(v => !isNaN(v));
    const colValues = data.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
    const n = Math.min(rowValues.length, colValues.length);
    const meanX = rowValues.reduce((a,b) => a+b,0)/n;
    const meanY = colValues.reduce((a,b) => a+b,0)/n;
    const cov = rowValues.reduce((acc, v, i) => acc + ((v - meanX)*(colValues[i] - meanY)), 0)/n;
    const stdX = Math.sqrt(rowValues.reduce((acc,v) => acc + Math.pow(v - meanX,2), 0)/n);
    const stdY = Math.sqrt(colValues.reduce((acc,v) => acc + Math.pow(v - meanY,2), 0)/n);
    const corr = stdX * stdY !== 0 ? cov / (stdX * stdY) : 0;
    return +corr.toFixed(2);
  }));

  const filteredRows = heatmapData.map((row, i) => ({
    rowName: filteredCols[i],
    values: row.map((val, j) => ({
      val,
      show: Math.abs(val) >= minCorr,
      col: filteredCols[j]
    }))
  })).filter(r => r.values.some(v => v.show));

  const visibleCols = filteredCols.filter((_, colIdx) =>
    heatmapData.some(row => Math.abs(row[colIdx]) >= minCorr)
  );

  const exportCSV = () => {
    const rows = ["", ...visibleCols].join(",") + "\n" +
      filteredRows.map(r => [r.rowName, ...r.values.filter(v => visibleCols.includes(v.col)).map(v => v.show ? v.val : "")].join(",")).join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'correlation_heatmap.csv';
    link.click();
  };

  const normalizedMedian = stats && stats.max !== stats.min
    ? (stats.median - stats.min) / (stats.max - stats.min)
    : 0.5;

  const getMedicalSuggestionsForFeature = (feature, values, type) => {
    const cleanedValues = values
      .map((v) => (v === 'null' || v === '' || v === null ? null : v))
      .filter((v) => v !== null);

    const suggestions = [];

    if (values.some((v) => v === 'null' || v === '' || v === null)) {
      suggestions.push("🧹 Nettoyage : détecter les valeurs manquantes ou invalides.");
    }

    if (type === 'number') {
      const numericValues = cleanedValues.map((v) =>
        typeof v === 'number' ? v : parseFloat(v)
      ).filter((v) => !isNaN(v));

      if (numericValues.length === 0) return suggestions;

      suggestions.push("🧩 Imputation (médiane) : pour gérer les valeurs manquantes de manière robuste.");

      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
      const std = Math.sqrt(numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numericValues.length);

      if (std > 0 && max !== min) {
        suggestions.push("📏 Normalisation (Z-score) : si la distribution est normale.");
        suggestions.push("📏 Normalisation (Min-Max) : si les bornes physiologiques sont connues.");
      }
    }

    if (type === 'string') {
      suggestions.push("🧩 Imputation (mode) : pour remplacer les valeurs manquantes par la plus fréquente.");
    }

    return suggestions;
  };

  const featureValues = data.map((row) => row[selectedFeature]);
  const featureType = columnTypes[selectedFeature];
  const suggestions = getMedicalSuggestionsForFeature(selectedFeature, featureValues, featureType);

const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const isMobile = windowWidth <= 768;

return (
  <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
    {isMobile && !isSidebarOpen && (
      <button 
        className="sidebar-toggle-mobile"
          onClick={() => {
            setIsSidebarOpen(true);
          }}
      >
        ☰
      </button>
    )}
    
    <Sidebar
      isOpen={isSidebarOpen}
      toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      projectId={id}
      targetFeature={targetFeature}
    />

      <div className={`content1 ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <h2>Imported Data Overview</h2>
        <p className="header-subtitle">Understand your dataset at a glance</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      onClick={() => {
                        setSelectedFeature(key);
                        setIsModalOpen(true);
                      }}
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                      title={`Click to view charts for "${key}"`}
                    >
                      <div className="col">{key}</div>
                      <div className="column-type">{columnTypes[key]}</div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="description">
          <p><strong>Total Rows:</strong> {totalRows}</p>
          <p><strong>Total Columns:</strong> {totalColumns}</p>

          <div className="target-feature-section">
            {!isTargetFeatureSet ? (
              <div className="target-feature-selector">
                <h3>Select Target Feature</h3>
                <div className="target-feature-controls">
                  <select 
                    value={targetFeature} 
                    onChange={handleChange}
                    className="feature-select"
                  >
                    <option value="">-- Select a target --</option>
                    {availableFeatures.map((column) => (
                      <option key={column} value={column}>
                        {column} ({columnTypes[column]})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={saveTargetFeature}
                    className="save-button"
                    disabled={!targetFeature || isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Target Feature'}
                  </button>
                </div>
                {targetFeatureError && (
                  <div className="error-message">
                    {targetFeatureError}
                  </div>
                )}
              </div>
            ) : (
              <div className="target-feature-display">
                <h3>Current Target Feature</h3>
                <div className="selected-target">
                  <span>{targetFeature}</span>
                  <button 
                    onClick={() => {
                      setIsTargetFeatureSet(false);
                      setTargetFeature('');
                    }}
                    className="change-button"
                  >
                    Change Target
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-section">
            <h3>Column Types</h3>
            <Pie data={pieData} />
          </div>

          <div className="chart-section">
            <h3>Valeurs Nulles vs Non Nulles</h3>
            <Bar
              data={nullVsNonNullData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: {
                    display: true,
                    text: 'Répartition des valeurs par colonne',
                  },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true },
                },
              }}
            />
          </div>

          <div className="chart-section">
            <h3>Missing Values</h3>
            <Bar data={barData} />
          </div>
        </div>

        <div className="heatmap-section">
          <h3>Correlation Heatmap</h3>
          <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label htmlFor="corr-threshold">
              Corrélation ≥
            </label>
            <input
              id="corr-threshold"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={minCorr}
              onChange={(e) => setMinCorr(parseFloat(e.target.value))}
              style={{ width: '200px' }}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={minCorr}
              onChange={(e) => setMinCorr(parseFloat(e.target.value))}
              style={{ width: '60px' }}
            />
            <button onClick={exportCSV}>Exporter CSV</button>
          </div>

          <div style={{ position: 'relative', zIndex: 9999 }}>
            <button
              onClick={() => setIsFeaturePopupOpen(!isFeaturePopupOpen)}
              className="feature-buttons"
              style={{
                backgroundColor: '#3182ce',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
               Choisir les features à corréler
            </button>

            {isFeaturePopupOpen && (
              <div className="feature-popup-box" onClick={(e) => e.stopPropagation()}>
                <button className="feature-popup-close" onClick={() => setIsFeaturePopupOpen(false)}>
                  &times;
                </button>
                <h4>Sélectionner les features</h4>

                <input
                  type="text"
                  placeholder="🔍 Rechercher une feature..."
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="feature-search"
                />

                <div className="feature-list">
                  {numericCols
                    .filter((col) => col.toLowerCase().includes(featureSearch.toLowerCase()))
                    .map((col) => (
                      <label key={col} className="feature-item">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(col)}
                          onChange={() => {
                            setSelectedFeatures((prev) =>
                              prev.includes(col)
                                ? prev.filter((f) => f !== col)
                                : [...prev, col]
                            );
                          }}
                        />
                        {col}
                      </label>
                    ))}
                </div>

                <div className="feature-buttons" style={{ marginTop: '1rem' }}>
                  <button onClick={() => setSelectedFeatures(numericCols)}>✅ Tout sélectionner</button>
                  <button onClick={() => setSelectedFeatures([])}>♻️ Réinitialiser</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th></th>
                  {visibleCols.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, i) => (
                  <tr key={i}>
                    <th>{row.rowName}</th>
                    {visibleCols.map((col, j) => {
                      const cell = row.values.find(v => v.col === col);
                      return (
                        <td
                          key={j}
                          style={{
                            background: cell?.show ? `rgba(54, 162, 235, ${Math.abs(cell.val)})` : '#f0f0f0',
                            color: cell?.show && Math.abs(cell.val) > 0.5 ? 'white' : 'black',
                            textAlign: 'center',
                          }}
                        >
                          {cell?.show ? cell.val : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal isOpen={!!selectedFeature} onClose={() => setSelectedFeature(null)}>
          <h3>Distribution of {selectedFeature}</h3>
          {selectedColumnValues.length > 0 ? (
            <>
              <Bar data={histogramData} />

              <div className="missing-donut-container">
                <div className="missing-donut-title">Valeurs manquantes</div>
                <Doughnut
                  data={{
                    labels: ['Manquantes', 'Présentes'],
                    datasets: [
                      {
                        data: [
                          missingCounts[selectedFeature],
                          totalRows - missingCounts[selectedFeature],
                        ],
                        backgroundColor: ['#e74c3c', '#2ecc71'],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `${context.label}: ${context.parsed} (${(
                              (context.parsed / totalRows) *
                              100
                            ).toFixed(1)}%)`,
                        },
                      },
                    },
                  }}
                />
                <div className="missing-donut-percent">
                  {((missingCounts[selectedFeature] / totalRows) * 100).toFixed(1)}%
                </div>
              </div>

              {stats && selectedColumnValues.length > 0 && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <h4 style={{ color: '#003366' }}>🎯 Médiane sur l'échelle [min → max]</h4>
                  <GaugeChart
                    id="feature-gauge"
                    nrOfLevels={20}
                    percent={normalizedMedian}
                    colors={['#FF5F6D', '#FFC371']}
                    arcWidth={0.3}
                    textColor="#003366"
                    needleColor="#003366"
                    animate={false}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                    <span>Min: {stats.min.toFixed(2)}</span>
                    <span>Médiane: {stats.median.toFixed(2)}</span>
                    <span>Max: {stats.max.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {suggestions.length > 0 && (
                <div style={{ marginTop: '1.5rem', background: '#f7fafc', padding: '1rem', borderRadius: '10px' }}>
                  <h4 style={{ color: '#003366', marginBottom: '0.5rem' }}>💡 Suggestions pour "{selectedFeature}"</h4>
                  <ul style={{ paddingLeft: '1.2rem' }}>
                    {suggestions.map((sugg, idx) => (
                      <li key={idx} style={{ marginBottom: '0.4rem', color: '#333' }}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>No numeric data available for this column.</p>
          )}
        </Modal>
      </div>
      </div>
  );
};

export default ImportSuccess;