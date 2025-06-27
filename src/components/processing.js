import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { 
  faUser, faChartLine, faCog, faDatabase, faClone, 
  faFileAlt, faTrash, faHistory, faBrain, faRocket, 
  faCheckCircle, faSave, faBroom, faArrowsRotate, 
  faDownload, faFileLines, faChevronDown, faChevronUp,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { mean } from 'mathjs';
import axios from 'axios';
import KNN from 'ml-knn';
import './Processing.css';

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, targetFeature } = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedColumnsNr, setSelectedColumnsNr] = useState([]);
  const [normalizedColumns, setNormalizedColumns] = useState([]);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [showDropdown3, setShowDropdown3] = useState(false);
  const [selectedColumnsImp, setSelectedColumnsImp] = useState([]);
  const [isImputing, setIsImputing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [operationReports, setOperationReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);

  // Navigation handlers
  const handleProfileClick = () => navigate('/profile');
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => {
    const encodedFiltdate = encodeURIComponent(JSON.stringify(filteredData));
    navigate(`/models/${id}/${targetFeature}?filtdate=${encodedFiltdate}`);   
  };
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  // Data fetching and cleaning
  const cleanData = (data) => (typeof data === 'string' ? data.replace(/NaN/g, 'null') : data);
  const sanitizeJson = (jsonString) => jsonString.replace(/NaN/g, 'null');

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
        setFilteredData(cleanedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data from server');
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const encodedFiltdate = urlParams.get('filtdate');

    if (encodedFiltdate) {
      try {
        const decodedFiltdate = JSON.parse(decodeURIComponent(encodedFiltdate));
        setData(decodedFiltdate);
        setFilteredData(decodedFiltdate);
        setLoading(false);
      } catch (error) {
        console.error("Decoding error:", error);
        importBD();
      }
    } else {
      importBD();
    }
  }, [id, location.search]);

  // Helper to add operation report
  const addOperationReport = (operation, details, affectedColumns, stats) => {
    const newReport = {
      timestamp: new Date().toISOString(),
      operation,
      details,
      affectedColumns,
      stats,
      dataSample: filteredData.slice(0, 3)
    };
    
    setOperationReports(prev => [newReport, ...prev].slice(0, 50));
    return newReport;
  };

  // Data processing functions with reporting
  const handleDataCleaning = async () => {
    if (filteredData.length === 0) {
      alert("No data to clean");
      return;
    }

    setIsCleaning(true);
    try {
      const columns = Object.keys(filteredData[0] || {});
      const means = {};
      const nullStats = {};
      let missingValueCount = 0;

      // Calculate means and null counts for each column
      columns.forEach(column => {
        const numericValues = filteredData
          .map(row => parseFloat(row[column]))
          .filter(value => !isNaN(value));
        
        means[column] = numericValues.length > 0 ? mean(numericValues) : 0;
        nullStats[column] = filteredData.filter(row => 
          row[column] === null || row[column] === undefined || isNaN(row[column])
        ).length;
      });

      // Clean the data
      const cleanedData = filteredData.map(row => {
        const cleanedRow = { ...row };
        columns.forEach(column => {
          if (cleanedRow[column] === null || cleanedRow[column] === undefined || isNaN(cleanedRow[column])) {
            missingValueCount++;
            cleanedRow[column] = means[column];
          }
        });
        return cleanedRow;
      });

      // Create report
      const report = addOperationReport(
        'Data Cleaning',
        'Removed null values by mean imputation',
        columns.filter(col => nullStats[col] > 0),
        {
          totalNullValues: Object.values(nullStats).reduce((a, b) => a + b, 0),
          nullValuesByColumn: nullStats,
          meansUsed: means
        }
      );

      // Update state
      setFilteredData(cleanedData);
      setCurrentReport(report);
      setShowReportModal(true);
    } catch (error) {
      console.error("Error during data cleaning:", error);
      alert(`Error during data cleaning: ${error.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleRemoveSelectedColumns = async () => {
    if (selectedColumns.length === 0) {
      alert("Please select columns to remove");
      return;
    }

    setIsRemoving(true);
    try {
      const cleanedData = filteredData.map(row => {
        const newRow = { ...row };
        selectedColumns.forEach(col => {
          delete newRow[col];
        });
        return newRow;
      });

      // Create report
      const report = addOperationReport(
        'Column Removal',
        `Removed ${selectedColumns.length} columns from dataset`,
        selectedColumns,
        {
          columnsRemoved: selectedColumns,
          remainingColumns: Object.keys(cleanedData[0] || {}),
          rowCount: cleanedData.length
        }
      );

      // Update state
      setFilteredData(cleanedData);
      setSelectedColumns([]);
      setCurrentReport(report);
      setShowReportModal(true);
    } catch (error) {
      console.error("Error removing columns:", error);
      alert(`Error removing columns: ${error.message}`);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDataTransformation = (type) => {
    if (selectedColumnsNr.length === 0) {
      alert("Please select columns to normalize");
      return;
    }

    let normalizedData = filteredData.map(row => ({ ...row }));
    const transformationDetails = {};

    selectedColumnsNr.forEach(column => {
      const values = filteredData.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
      if (values.length === 0) return;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const meanVal = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - meanVal, 2), 0) / values.length);

      transformationDetails[column] = { min, max, mean: meanVal, stdDev };

      normalizedData.forEach(row => {
        if (row[column] !== null && row[column] !== undefined) {
          const value = parseFloat(row[column]);
          switch (type) {
            case 'Min-Max Normalization':
              row[column] = (value - min) / (max - min);
              break;
            case 'Z-Score Normalization':
              row[column] = stdDev !== 0 ? (value - meanVal) / stdDev : 0;
              break;
            case 'Decimal Scaling':
              const j = Math.ceil(Math.log10(max + 1));
              row[column] = value / Math.pow(10, j);
              break;
            case 'Mean Normalization':
              row[column] = (value - meanVal) / (max - min);
              break;
            case 'Logarithmic Scaling':
              row[column] = Math.log(value + 1);
              break;
          }
        }
      });
    });

    const report = addOperationReport(
      `Data Transformation - ${type}`,
      `Applied ${type} to selected columns`,
      selectedColumnsNr,
      {
        transformationType: type,
        columnStats: transformationDetails,
        normalizedColumnsCount: selectedColumnsNr.length
      }
    );

    setNormalizedColumns([...new Set([...normalizedColumns, ...selectedColumnsNr])]);
    setFilteredData(normalizedData);
    setSelectedColumnsNr([]);
    setCurrentReport(report);
    setShowReportModal(true);
  };

  const handleDatadouble = () => {
    const uniqueRows = new Set();
    const duplicateRows = [];
    const dt = filteredData.filter((row, index) => {
      const rowValues = Object.values(row).join('|');
      if (uniqueRows.has(rowValues)) {
        duplicateRows.push({ index, data: row });
        return false;
      }
      uniqueRows.add(rowValues);
      return true;
    });

    const report = addOperationReport(
      'Duplicate Removal',
      'Removed duplicate rows from dataset',
      Object.keys(filteredData[0] || {}),
      {
        initialRowCount: filteredData.length,
        finalRowCount: dt.length,
        duplicatesRemoved: filteredData.length - dt.length,
        duplicateExamples: duplicateRows.slice(0, 3)
      }
    );

    setFilteredData(dt);
    setCurrentReport(report);
    setShowReportModal(true);
  };

  // Imputation functions with reporting
  const imputeByMean = (data, columns) => {
    const updatedData = data.map(row => ({ ...row }));
    const reportDetails = {};
    
    columns.forEach(col => {
      const validValues = updatedData
        .map(row => parseFloat(row[col]))
        .filter(value => !isNaN(value));
      
      if (validValues.length === 0) return;
      
      const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
      const beforeNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))).length;
      
      updatedData.forEach(row => {
        if (row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))) {
          row[col] = mean;
        }
      });

      const afterNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))).length;

      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        meanUsed: mean
      };
    });
    
    return { updatedData, reportDetails };
  };

  const imputeByMedian = (data, columns) => {
    const updatedData = data.map(row => ({ ...row }));
    const reportDetails = {};
    
    columns.forEach(col => {
      const validValues = updatedData
        .map(row => parseFloat(row[col]))
        .filter(value => !isNaN(value))
        .sort((a, b) => a - b);
      
      if (validValues.length === 0) return;
      
      const mid = Math.floor(validValues.length / 2);
      const median = validValues.length % 2 !== 0 
        ? validValues[mid] 
        : (validValues[mid - 1] + validValues[mid]) / 2;

      const beforeNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))).length;
      
      updatedData.forEach(row => {
        if (row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))) {
          row[col] = median;
        }
      });

      const afterNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A' || isNaN(parseFloat(row[col]))).length;

      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        medianUsed: median
      };
    });
    
    return { updatedData, reportDetails };
  };

  const imputeByMode = (data, columns) => {
    const updatedData = data.map(row => ({ ...row }));
    const reportDetails = {};
    
    columns.forEach(col => {
      const validValues = updatedData
        .map(row => row[col])
        .filter(value => value !== null && value !== undefined && value !== 'N/A');
      
      if (validValues.length === 0) return;
      
      const frequencyMap = {};
      validValues.forEach(val => {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      });
      
      const mode = Object.keys(frequencyMap).reduce((a, b) => 
        frequencyMap[a] > frequencyMap[b] ? a : b
      );

      const beforeNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A').length;
      
      updatedData.forEach(row => {
        if (row[col] === null || row[col] === undefined || row[col] === 'N/A') {
          row[col] = mode;
        }
      });

      const afterNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || row[col] === 'N/A').length;

      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        modeUsed: mode
      };
    });
    
    return { updatedData, reportDetails };
  };

  const imputeByKNN = (data, columns, k = 3) => {
    const updatedData = data.map(row => ({ ...row }));
    const reportDetails = {};
    
    // Filter rows with at least one valid value
    const validData = data.filter(row => 
      columns.some(col => row[col] !== null && row[col] !== undefined && !isNaN(parseFloat(row[col])))
    );
    
    if (validData.length < k) {
      console.warn('Not enough data for KNN imputation');
      return { updatedData: data, reportDetails: {} };
    }

    // Prepare features and labels
    const features = validData.map(row => 
      columns.map(col => parseFloat(row[col]) || 0)
    );
    const labels = validData.map((_, idx) => idx);

    // Train KNN model
    const knn = new KNN(features, labels, { k });

    // Calculate before counts
    columns.forEach(col => {
      reportDetails[col] = {
        before: updatedData.filter(row => 
          row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))).length
      };
    });

    // Impute missing values
    updatedData.forEach(row => {
      const hasMissing = columns.some(col => 
        row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col])));
      
      if (hasMissing) {
        const features = columns.map(col => {
          const val = parseFloat(row[col]);
          return isNaN(val) ? 0 : val;
        });
        
        const neighbors = knn.predict([features]);
        neighbors.forEach(neighborIdx => {
          const neighbor = validData[neighborIdx];
          columns.forEach(col => {
            if (row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))) {
              const neighborVal = parseFloat(neighbor[col]);
              if (!isNaN(neighborVal)) {
                row[col] = neighborVal;
              }
            }
          });
        });
      }
    });

    // Calculate after counts
    columns.forEach(col => {
      reportDetails[col].after = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))).length;
      reportDetails[col].method = `KNN (k=${k})`;
    });

    return { updatedData, reportDetails };
  };

  const imputeByZero = (data, columns) => {
    const updatedData = data.map(row => ({ ...row }));
    const reportDetails = {};
    
    columns.forEach(col => {
      const beforeNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))).length;
      
      updatedData.forEach(row => {
        if (row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))) {
          row[col] = 0;
        }
      });

      const afterNullCount = updatedData.filter(row => 
        row[col] === null || row[col] === undefined || isNaN(parseFloat(row[col]))).length;

      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        method: 'Zero imputation'
      };
    });
    
    return { updatedData, reportDetails };
  };

  const handleImputation = (method) => {
    if (selectedColumnsImp.length === 0) {
      alert("Please select columns for imputation");
      return;
    }

    setIsImputing(true);
    let result;

    try {
      switch (method) {
        case 'Mean Imputation':
          result = imputeByMean(filteredData, selectedColumnsImp);
          break;
        case 'Median Imputation':
          result = imputeByMedian(filteredData, selectedColumnsImp);
          break;
        case 'Mode Imputation':
          result = imputeByMode(filteredData, selectedColumnsImp);
          break;
        case 'KNN Imputation':
          result = imputeByKNN(filteredData, selectedColumnsImp);
          break;
        case 'Zero Imputation':
          result = imputeByZero(filteredData, selectedColumnsImp);
          break;
        default:
          throw new Error("Unknown imputation method");
      }

      setFilteredData(result.updatedData);

      const report = addOperationReport(
        `Data Imputation - ${method}`,
        `Applied ${method} to selected columns`,
        selectedColumnsImp,
        {
          method,
          columnStats: result.reportDetails,
          totalNullsBefore: Object.values(result.reportDetails).reduce((sum, col) => sum + col.before, 0),
          totalNullsAfter: Object.values(result.reportDetails).reduce((sum, col) => sum + col.after, 0)
        }
      );

      setCurrentReport(report);
      setShowReportModal(true);

    } catch (error) {
      console.error("Imputation error:", error);
      alert(`Error during imputation: ${error.message}`);
    } finally {
      setIsImputing(false);
    }
  };

  const handleDownload = () => {
    const csvData = [
      Object.keys(filteredData[0] || {}).join(','),
      ...filteredData.slice(0, 15).map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const response = await fetch(`http://localhost:5000/save-data/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: filteredData })
      });

      if (!response.ok) throw new Error('Failed to save data');
      
      const report = addOperationReport(
        'Data Save',
        'Saved processed data to server',
        Object.keys(filteredData[0] || {}),
        {
          rowCount: filteredData.length,
          columnCount: Object.keys(filteredData[0] || {}).length,
          savedAt: new Date().toISOString()
        }
      );

      setCurrentReport(report);
      setShowReportModal(true);
      alert("Data saved successfully!");
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error saving data: ${error.message}`);
    }
  };

  // UI helpers
  const calculateNullPercentages = () => {
    const columns = Object.keys(filteredData[0] || {});
    const totalRows = filteredData.length;
    const nullPercentages = {};

    columns.forEach(column => {
      const nullCount = filteredData.filter(row => 
        row[column] === null || row[column] === undefined || row[column] === 'N/A'
      ).length;
      nullPercentages[column] = (nullCount / totalRows) * 100;
    });

    return nullPercentages;
  };

  const nullPercentages = calculateNullPercentages();
  const columnsWithHighNulls = Object.keys(nullPercentages).filter(
    column => nullPercentages[column] > 20
  );

  const handleColumnCheckboxChange = (column) => {
    setSelectedColumns(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(column)) {
        newSelection.delete(column);
      } else {
        newSelection.add(column);
      }
      return Array.from(newSelection);
    });
  };

  const handleColumnCheckboxChangeNr = (column) => {
    setSelectedColumnsNr(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(column)) {
        newSelection.delete(column);
      } else {
        newSelection.add(column);
      }
      return Array.from(newSelection);
    });
  };

  const handleColumnCheckboxChangeImp = (column) => {
    setSelectedColumnsImp(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(column)) {
        newSelection.delete(column);
      } else {
        newSelection.add(column);
      }
      return Array.from(newSelection);
    });
  };

  // Dropdown toggles
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleDropdown1 = () => setIsOpen1(!isOpen1);
  const toggleDropdown2 = () => setIsOpen2(!isOpen2);
  const toggleDropdown3 = () => setIsOpen3(!isOpen3);
  const toggleDropdown4 = () => setShowDropdown3(!showDropdown3);

  // Data for rendering
  const headers = filteredData.length > 0 ? 
    Object.keys(filteredData[0]).filter(header => header !== targetFeature) : [];
  const availableColumns = headers.filter(header => !normalizedColumns.includes(header));
  const rows = filteredData.slice(0, 15); // Only show first 15 rows for performance

  // Report Modal Component
  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;

    const renderReportDetails = () => {
      switch (report.operation) {
        case 'Data Cleaning':
          return (
            <div className="report-section">
              <h3>Cleaning Details</h3>
              <p>Total null values replaced: {report.stats.totalNullValues}</p>
              <h4>Columns affected:</h4>
              <ul className="column-stats">
                {report.affectedColumns.map(col => (
                  <li key={col}>
                    <span className="column-name">{col}</span>
                    <span className="stat-value">
                      {report.stats.nullValuesByColumn[col]} nulls replaced with mean {
                        report.stats.meansUsed[col]?.toFixed(2) || 'N/A'
                      }
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        
        case 'Data Imputation - Mean Imputation':
        case 'Data Imputation - Median Imputation':
        case 'Data Imputation - Mode Imputation':
        case 'Data Imputation - KNN Imputation':
        case 'Data Imputation - Zero Imputation':
          return (
            <div className="report-section">
              <h3>Imputation Details</h3>
              <p><strong>Method:</strong> {report.stats.method}</p>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total nulls before:</span>
                  <span className="stat-value">{report.stats.totalNullsBefore}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total nulls after:</span>
                  <span className="stat-value">{report.stats.totalNullsAfter}</span>
                </div>
              </div>
              <h4>Columns affected:</h4>
              <ul className="column-stats">
                {Object.entries(report.stats.columnStats).map(([col, stats]) => (
                  <li key={col}>
                    <span className="column-name">{col}</span>
                    <span className="stat-value">
                      {stats.before} → {stats.after} nulls
                      {stats.meanUsed && ` (Mean: ${stats.meanUsed.toFixed(2)})`}
                      {stats.medianUsed && ` (Median: ${stats.medianUsed.toFixed(2)})`}
                      {stats.modeUsed && ` (Mode: ${stats.modeUsed})`}
                      {stats.method && ` (${stats.method})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        
        case 'Data Transformation - Min-Max Normalization':
        case 'Data Transformation - Z-Score Normalization':
        case 'Data Transformation - Decimal Scaling':
        case 'Data Transformation - Mean Normalization':
        case 'Data Transformation - Logarithmic Scaling':
          return (
            <div className="report-section">
              <h3>Transformation Details</h3>
              <p><strong>Type:</strong> {report.stats.transformationType}</p>
              <p><strong>Columns transformed:</strong> {report.stats.normalizedColumnsCount}</p>
              <h4>Column Statistics:</h4>
              <ul className="column-stats">
                {Object.entries(report.stats.columnStats).map(([col, stats]) => (
                  <li key={col}>
                    <span className="column-name">{col}</span>
                    <ul className="sub-stats">
                      <li>Min: {stats.min?.toFixed(4)}</li>
                      <li>Max: {stats.max?.toFixed(4)}</li>
                      <li>Mean: {stats.mean?.toFixed(4)}</li>
                      {stats.stdDev && <li>Std Dev: {stats.stdDev?.toFixed(4)}</li>}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          );
        
        case 'Duplicate Removal':
          return (
            <div className="report-section">
              <h3>Duplicate Removal Details</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Initial rows:</span>
                  <span className="stat-value">{report.stats.initialRowCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Final rows:</span>
                  <span className="stat-value">{report.stats.finalRowCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duplicates removed:</span>
                  <span className="stat-value">{report.stats.duplicatesRemoved}</span>
                </div>
              </div>
              <h4>Sample duplicates:</h4>
              <div className="data-sample">
                <pre>{JSON.stringify(report.stats.duplicateExamples, null, 2)}</pre>
              </div>
            </div>
          );
        
        case 'Data Save':
          return (
            <div className="report-section">
              <h3>Save Details</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Rows saved:</span>
                  <span className="stat-value">{report.stats.rowCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Columns saved:</span>
                  <span className="stat-value">{report.stats.columnCount}</span>
                </div>
              </div>
              <p><strong>Saved at:</strong> {new Date(report.stats.savedAt).toLocaleString()}</p>
            </div>
          );
        
        case 'Full Operations History':
          return (
            <div className="report-section">
              <h3>Complete Operations History</h3>
              <p><strong>Total operations:</strong> {report.stats.operations.length}</p>
              <div className="full-history">
                {report.stats.operations.map((op, idx) => (
                  <div key={idx} className="history-item">
                    <h4>{op.operation}</h4>
                    <p className="timestamp">{new Date(op.timestamp).toLocaleString()}</p>
                    <p className="details">{op.details}</p>
                    <button 
                      onClick={() => {
                        setCurrentReport(op);
                      }}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );

        default:
          return (
            <div className="report-section">
              <h3>Operation Details</h3>
              <div className="data-sample">
                <pre>{JSON.stringify(report.stats, null, 2)}</pre>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="report-modal-overlay">
        <div className="report-modal">
          <div className="report-modal-header">
            <h2>{report.operation}</h2>
            <button onClick={onClose} className="close-btn">&times;</button>
          </div>
          <div className="report-modal-body">
            <div className="report-meta">
              <p><strong>Timestamp:</strong> {new Date(report.timestamp).toLocaleString()}</p>
              <p><strong>Description:</strong> {report.details}</p>
            </div>
            
            {renderReportDetails()}

            <h4>Data Sample (first 3 rows):</h4>
            <div className="data-sample">
              <pre>{JSON.stringify(report.dataSample, null, 2)}</pre>
            </div>
          </div>
          <div className="report-modal-footer">
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="processing-modern">
      {/* Sidebar */}
      <div className="sidebar-modern">
        <div className="sidebar-header-modern">
          <img src="/lg.png" alt="MedicalVision" className="logo-modern" />
          <h2>MedicalVision</h2>
        </div>
        
        <nav className="nav-modern">
          <button className="nav-item-modern" onClick={handleProfileClick}>
            <FontAwesomeIcon icon={faUser} className="nav-icon-modern" />
            <span>Profile</span>
          </button>
          <button className="nav-item-modern" onClick={handleDBClick}>
            <FontAwesomeIcon icon={faDatabase} className="nav-icon-modern" />
            <span>Database</span>
          </button>
          <button className="nav-item-modern" onClick={handleHistorique}>
            <FontAwesomeIcon icon={faHistory} className="nav-icon-modern" />
            <span>History</span>
          </button>
          <button className="nav-item-modern" onClick={handleDescription}>
            <FontAwesomeIcon icon={faFileAlt} className="nav-icon-modern" />
            <span>Description</span>
          </button>
          <button className="nav-item-modern" onClick={handleGraphsClick}>
            <FontAwesomeIcon icon={faChartLine} className="nav-icon-modern" />
            <span>Graphs</span>
          </button>
          <button className="nav-item-modern active-modern">
            <FontAwesomeIcon icon={faCog} className="nav-icon-modern" />
            <span>Processing</span>
          </button>
          <button className="nav-item-modern" onClick={handleModelsClick}>
            <FontAwesomeIcon icon={faBrain} className="nav-icon-modern" />
            <span>Models</span>
          </button>
          <button className="nav-item-modern" onClick={handleDepClick}>
            <FontAwesomeIcon icon={faRocket} className="nav-icon-modern" />
            <span>Deployment</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="content-modern">
        <header className="content-header-modern">
          <h1>Data Processing Center</h1>
          <p className="subtitle-modern">Clean, transform and prepare your medical data for analysis</p>
        </header>

        {loading && (
          <div className="loading-modern">
            <div className="spinner-modern"></div>
            <p>Loading your data...</p>
          </div>
        )}

        {error && (
          <div className="error-modern">
            <p>{error}</p>
          </div>
        )}

        {/* Action Cards */}
        <div className="action-grid-modern">
          {/* Cleaning Card */}
          <div className="action-card-modern">
            <div className="card-header-modern">
              <FontAwesomeIcon icon={faBroom} className="card-icon-modern" />
              <h3>Data Cleaning</h3>
            </div>
            <div className="card-body-modern">
              <button 
                className="action-btn-modern primary"
                onClick={handleDataCleaning}
                disabled={loading || isCleaning}
              >
                {isCleaning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Cleaning...</span>
                  </>
                ) : 'Remove Null Values'}
              </button>
              
              <button 
                className="action-btn-modern secondary"
                onClick={handleRemoveSelectedColumns}
                disabled={selectedColumns.length === 0 || isRemoving}
              >
                {isRemoving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Removing...</span>
                  </>
                ) : 'Remove Columns'}
              </button>
              
              <div className="dropdown-modern">
                <button 
                  className="dropdown-toggle-modern"
                  onClick={toggleDropdown1}
                  disabled={columnsWithHighNulls.length === 0}
                >
                  <span>Select Columns</span>
                  <FontAwesomeIcon icon={isOpen1 ? faChevronUp : faChevronDown} className="dropdown-arrow" />
                </button>
                {isOpen1 && (
                  <div className="dropdown-menu-modern">
                    <div className="dropdown-header">
                      <span>Columns with null values</span>
                      <button 
                        onClick={() => {
                          setSelectedColumns(columnsWithHighNulls);
                        }}
                        className="select-all-btn"
                      >
                        Select All
                      </button>
                    </div>
                    {columnsWithHighNulls.map(column => (
                      <label key={column} className="checkbox-modern">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={() => handleColumnCheckboxChange(column)}
                        />
                        <span className="column-name">{column}</span>
                        <span className="null-percentage">({nullPercentages[column].toFixed(1)}% null)</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Imputation Card */}
          <div className="action-card-modern">
            <div className="card-header-modern">
              <FontAwesomeIcon icon={faCheckCircle} className="card-icon-modern" />
              <h3>Data Imputation</h3>
            </div>
            <div className="card-body-modern">
              <div className="dropdown-modern">
                <button 
                  className="dropdown-toggle-modern"
                  onClick={toggleDropdown4}
                  disabled={isImputing}
                >
                  <span>{isImputing ? 'Processing...' : 'Imputation Methods'}</span>
                  <FontAwesomeIcon icon={showDropdown3 ? faChevronUp : faChevronDown} className="dropdown-arrow" />
                </button>
                {showDropdown3 && (
                  <div className="dropdown-menu-modern">
                    {['Mean', 'Median', 'Mode', 'KNN', 'Zero'].map(method => (
                      <button
                        key={method}
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowDropdown3(false);
                          handleImputation(`${method} Imputation`);
                        }}
                      >
                        {method} Imputation
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="dropdown-modern">
                <button 
                  className="dropdown-toggle-modern"
                  onClick={toggleDropdown3}
                  disabled={isImputing}
                >
                  <span>Select Columns</span>
                  <FontAwesomeIcon icon={isOpen3 ? faChevronUp : faChevronDown} className="dropdown-arrow" />
                </button>
                {isOpen3 && (
                  <div className="dropdown-menu-modern">
                    <div className="dropdown-header">
                      <span>Available columns</span>
                      <button 
                        onClick={() => {
                          setSelectedColumnsImp(availableColumns);
                        }}
                        className="select-all-btn"
                      >
                        Select All
                      </button>
                    </div>
                    {availableColumns.map(header => (
                      <label key={header} className="checkbox-modern">
                        <input
                          type="checkbox"
                          checked={selectedColumnsImp.includes(header)}
                          onChange={() => handleColumnCheckboxChangeImp(header)}
                          disabled={isImputing}
                        />
                        <span className="column-name">{header}</span>
                        {nullPercentages[header] > 0 && (
                          <span className="null-percentage">({nullPercentages[header].toFixed(1)}% null)</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Normalization Card */}
          <div className="action-card-modern">
            <div className="card-header-modern">
              <FontAwesomeIcon icon={faArrowsRotate} className="card-icon-modern" />
              <h3>Data Normalization</h3>
            </div>
            <div className="card-body-modern">
              <div className="dropdown-modern">
                <button 
                  className="dropdown-toggle-modern"
                  onClick={toggleDropdown}
                  disabled={selectedColumnsNr.length === 0}
                >
                  <span>Normalization Methods</span>
                  <FontAwesomeIcon icon={showDropdown ? faChevronUp : faChevronDown} className="dropdown-arrow" />
                </button>
                {showDropdown && (
                  <div className="dropdown-menu-modern">
                    {['Min-Max', 'Z-Score', 'Decimal Scaling', 'Mean', 'Logarithmic'].map(type => (
                      <button
                        key={type}
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowDropdown(false);
                          handleDataTransformation(`${type} Normalization`);
                        }}
                      >
                        {type} Normalization
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="dropdown-modern">
                <button 
                  className="dropdown-toggle-modern"
                  onClick={toggleDropdown2}
                >
                  <span>Select Columns</span>
                  <FontAwesomeIcon icon={isOpen2 ? faChevronUp : faChevronDown} className="dropdown-arrow" />
                </button>
                {isOpen2 && (
                  <div className="dropdown-menu-modern">
                    <div className="dropdown-header">
                      <span>Available columns</span>
                      <button 
                        onClick={() => {
                          setSelectedColumnsNr(availableColumns);
                        }}
                        className="select-all-btn"
                      >
                        Select All
                      </button>
                    </div>
                    {availableColumns.map(header => (
                      <label key={header} className="checkbox-modern">
                        <input
                          type="checkbox"
                          checked={selectedColumnsNr.includes(header)}
                          onChange={() => handleColumnCheckboxChangeNr(header)}
                        />
                        <span className="column-name">{header}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Other Actions Card */}
          <div className="action-card-modern">
            <div className="card-header-modern">
              <FontAwesomeIcon icon={faClone} className="card-icon-modern" />
              <h3>Other Actions</h3>
            </div>
            <div className="card-body-modern">
              <button 
                className="action-btn-modern secondary"
                onClick={handleDatadouble}
              >
                Remove Duplicates
              </button>
              
              <button 
                className="action-btn-modern primary"
                onClick={handleDownload}
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Data
              </button>
              
              <button 
                className="action-btn-modern success"
                onClick={handleSave}
              >
                <FontAwesomeIcon icon={faSave} />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Data Preview */}
        <div className="data-preview-modern">
          <div className="preview-header-modern">
            <h2>Data Preview</h2>
            <p>Showing {Math.min(rows.length, 15)} of {filteredData.length} rows</p>
          </div>
          
          {rows.length > 0 ? (
            <div className="table-wrapper-modern">
              <table className="data-table-modern">
                <thead>
                  <tr>
                    {headers.map(header => (
                      <th 
                        key={header} 
                        className={
                          `${nullPercentages[header] > 20 ? 'highlight-column' : ''} 
                          ${selectedColumnsImp.includes(header) ? 'imputed-column' : ''}`
                        }
                      >
                        {header}
                        {nullPercentages[header] > 20 && (
                          <span className="null-percentage">
                            ({nullPercentages[header].toFixed(1)}% null)
                          </span>
                        )}
                        {selectedColumnsImp.includes(header) && (
                          <span className="imputed-badge">Imputed</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => {
                    const hasNulls = Object.values(row).some(
                      val => val === null || val === undefined || val === 'N/A'
                    );
                    
                    return (
                      <tr 
                        key={rowIndex} 
                        className={hasNulls ? 'highlight-row' : ''}
                      >
                        {headers.map(column => {
                          const isNull = row[column] === null || row[column] === undefined || row[column] === 'N/A';
                          return (
                            <td 
                              key={column} 
                              className={
                                `${isNull ? 'highlight-cell' : ''} 
                                ${selectedColumnsImp.includes(column) ? 'imputed-cell' : ''}`
                              }
                            >
                              {isNull ? 'N/A' : 
                               normalizedColumns.includes(column) ? row[column].toFixed(4) : 
                               row[column]}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-modern">
              <p>No data available for preview</p>
            </div>
          )}
        </div>
      </main>

      {/* Operations History Panel */}
      <div className="operations-history">
        <h3>Recent Operations</h3>
        <div className="operations-list">
          {operationReports.slice(0, 5).map((report, index) => (
            <div 
              key={index} 
              className="operation-item"
              onClick={() => {
                setCurrentReport(report);
                setShowReportModal(true);
              }}
            >
              <FontAwesomeIcon icon={faFileLines} className="report-icon" />
              <div className="operation-summary">
                <h4>{report.operation}</h4>
                <p>{new Date(report.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
        {operationReports.length > 5 && (
          <button 
            className="view-all-btn"
            onClick={() => {
              setCurrentReport({
                operation: 'Full Operations History',
                details: 'Complete log of all operations performed',
                stats: { operations: operationReports },
                timestamp: new Date().toISOString()
              });
              setShowReportModal(true);
            }}
          >
            View All ({operationReports.length})
          </button>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal 
          report={currentReport} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default Processing;