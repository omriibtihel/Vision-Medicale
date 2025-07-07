import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faChartLine, faCog, faBrain, 
  faDatabase, faFileAlt, faHistory, faRocket,
  faDownload, faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, 
  RadialLinearScale } from 'chart.js';
import { Line, Bar, Pie, Radar, Doughnut, PolarArea, Bubble, Scatter } from 'react-chartjs-2';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './graphs.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, RadialLinearScale
);

const Graphs = () => {
  const navigate = useNavigate();
  const { id, targetFeature } = useParams();
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [xAttribute, setXAttribute] = useState('');
  const [yAttribute, setYAttribute] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  // Navigation handlers
  const navigateTo = (path) => navigate(`/${path}/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);

  // Data fetching
  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/projects/${id}/imported-files`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      const responseData = typeof response.data === 'string' ? 
        JSON.parse(response.data.replace(/NaN/g, 'null')) : 
        response.data;
      
      setData(Array.isArray(responseData.data) ? responseData.data : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Chart data preparation
  const prepareChartData = () => {
    const labels = data.map(item => item[xAttribute] || '');
    const values = data.map(item => parseFloat(item[yAttribute]) || 0);

    return {
      labels,
      datasets: [{
        label: yAttribute,
        data: values,
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
        borderWidth: 2,
        tension: 0.1,
        fill: chartType === 'line'
      }]
    };
  };

  const getBackgroundColor = () => {
    const colors = {
      line: 'rgba(75, 192, 192, 0.2)',
      bar: 'rgba(54, 162, 235, 0.7)',
      pie: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      radar: 'rgba(255, 99, 132, 0.2)',
      doughnut: ['#FF6384', '#36A2EB', '#FFCE56'],
      polarArea: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      bubble: 'rgba(255, 99, 132, 0.6)',
      scatter: 'rgba(75, 192, 192, 0.6)'
    };
    return colors[chartType] || colors.line;
  };

  const getBorderColor = () => {
    const colors = {
      line: 'rgba(75, 192, 192, 1)',
      bar: 'rgba(54, 162, 235, 1)',
      pie: '#ffffff',
      radar: 'rgba(255, 99, 132, 1)',
      doughnut: '#ffffff',
      polarArea: '#ffffff',
      bubble: 'rgba(255, 99, 132, 1)',
      scatter: 'rgba(75, 192, 192, 1)'
    };
    return colors[chartType] || colors.line;
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xAttribute,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: yAttribute,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    }
  };

  // Download chart as image
  const downloadChart = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${chartType}-chart.png`;
      link.click();
    }
  };

  // Available attributes
  const attributes = data.length > 0 ? Object.keys(data[0]) : [];


    const handleProfileClick = () => navigate('/profile');
    const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
    const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
    const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

    const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
    const handleHistorique = () => {navigate(`/historique/${id}/${targetFeature}`)}

  return (
    <div className="graphs-container">
        {/* Sidebar modernisée */}
     <div className={`app-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                            <div className="sidebar-header">
                              <button className="sidebar-toggle" onClick={toggleSidebar}>
                                <FontAwesomeIcon 
                                  icon={isSidebarOpen ? faChevronLeft : faChevronRight} 
                                  className="toggle-icon"
                                />
                              </button>
                              {isSidebarOpen && (
                                <>
                                  <img src="/lg.png" alt="MedicalVision" className="sidebar-logo" />
                                  <h2>MedicalVision</h2>
                                </>
                              )}
                            </div>
      
      <nav className="sidebar-nav">
        {[
          { 
            icon: faUser,
            label: "Profile",
            action: handleProfileClick,
            active: false
          },
          { 
            icon: faDatabase,
            label: "Database", 
            action: handleDBClick,
            active: false
          },
          { 
            icon: faHistory,
            label: "History",
            action: handleHistorique,
            active: false
          },
          { 
            icon: faFileAlt,
            label: "Description",
            action: handleDescription,
            active: false
          },
          { 
            icon: faChartLine,
            label: "Graphs",
            action: () => {}, // Vide car déjà sur cette page
            active: true
          },
          { 
            icon: faCog,
            label: "Processing",
            action: handleProcessingClick,
            active: false
          },
          { 
            icon: faBrain,
            label: "Models",
            action: handleModelsClick,
            active: false
          },
          { 
            icon: faRocket,
            label: "Deployment",
            action: handleDepClick,
            active: false
          }
        ].map((item, index) => (
            <button
              key={index}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.action}
              title={!isSidebarOpen ? item.label : ''}
            >
              <div className="nav-icon-wrapper">
                <FontAwesomeIcon icon={item.icon} className="nav-icon" />
              </div>
              {isSidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
    </div>

      {/* Main Content */}
      <main className="graphs-content">
        <header className="content-header">
          <h1>
            <FontAwesomeIcon icon={faChartLine} />
            Data Visualization
          </h1>
          <p className="subtitle">Transform your data into actionable insights</p>
        </header>

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Controls Panel */}
            <div className="controls-panel">
              <div className="control-group">
                <label htmlFor="chartType">
                  <FontAwesomeIcon icon={faSlidersH} />
                  Chart Type
                </label>
                <select
                  id="chartType"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="polarArea">Polar Area</option>
                  <option value="bubble">Bubble Chart</option>
                  <option value="scatter">Scatter Plot</option>
                </select>
              </div>

              <div className="control-group">
                <label>X-Axis Attribute</label>
                <select
                  value={xAttribute}
                  onChange={(e) => setXAttribute(e.target.value)}
                >
                  <option value="">Select attribute</option>
                  {attributes.map(attr => (
                    <option key={attr} value={attr}>{attr}</option>
                  ))}
                </select>
              </div>

              {chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polarArea' && (
                <div className="control-group">
                  <label>Y-Axis Attribute</label>
                  <select
                    value={yAttribute}
                    onChange={(e) => setYAttribute(e.target.value)}
                  >
                    <option value="">Select attribute</option>
                    {attributes.map(attr => (
                      <option key={attr} value={attr}>{attr}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chart Display Area */}
            <div className="chart-display">
              {xAttribute ? (
                <div className="chart-wrapper">
                  {chartType === 'line' && <Line data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'bar' && <Bar data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'pie' && <Pie data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'radar' && <Radar data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'doughnut' && <Doughnut data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'polarArea' && <PolarArea data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'bubble' && <Bubble data={prepareChartData()} options={chartOptions} />}
                  {chartType === 'scatter' && <Scatter data={prepareChartData()} options={chartOptions} />}
                  
                  <button className="download-btn" onClick={downloadChart}>
                    <FontAwesomeIcon icon={faDownload} />
                    Export Chart
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Please select at least one attribute to display the chart</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Graphs;