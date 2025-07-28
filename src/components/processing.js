import {
  faArrowsRotate,
  faBroom,
  faCheckCircle,
  faChevronDown,
  faChevronUp,
  faClone,
  faDownload,
  faFileLines,
  faSave,
  faSpinner,
  faTags,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useOutsideClick from "../useOutsideClick";

import axios from "axios";
import { mean } from "mathjs";
import KNN from "ml-knn";
import pako from "pako";
import "../useOutsideClick.js";
import "./Processing.css";
import Sidebar from "./Sidebar"; // Importer le Sidebar

const Processing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const filtdate = urlParams.get("filtdate");
  const versionId = urlParams.get("versionId");

  const [decodedData, setDecodedData] = useState(null);
  const [categoricalCols, setCategoricalCols] = useState([]);
  const { id, targetFeature: initialTargetFeature } = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedColumnsNr, setSelectedColumnsNr] = useState([]);
  const [normalizedColumns, setNormalizedColumns] = useState([]);
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [selectedColumnsImp, setSelectedColumnsImp] = useState([]);
  const [isImputing, setIsImputing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [operationReports, setOperationReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [targetFeature, setTargetFeature] = useState(
    initialTargetFeature || ""
  );
  const [isOpen4, setIsOpen4] = useState(false);
  const [showImputationDropdown, setShowImputationDropdown] = useState(false);
  const [showEncodingDropdown, setShowEncodingDropdown] = useState(false);
  const [isProcessingCat, setIsProcessingCat] = useState(false);
  const [selectedColumnsCat, setSelectedColumnsCat] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [newColumnName, setNewColumnName] = useState("");
  const [defaultColumnValue, setDefaultColumnValue] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [showAddColumnPopup, setShowAddColumnPopup] = useState(false);
  const [generationMode, setGenerationMode] = useState("manual"); // 'manual', 'auto-increment', 'uuid', 'date'
  const [showRemoveColumnPopup, setShowRemoveColumnPopup] = useState(false);
  const [columnsToRemove, setColumnsToRemove] = useState([]);

  const toggleImputationDropdown = () =>
    setShowImputationDropdown(!showImputationDropdown);
  const toggleEncodingDropdown = () =>
    setShowEncodingDropdown(!showEncodingDropdown);

  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);
  const dropdownRef3 = useRef(null);
  const dropdownRef4 = useRef(null);
  const imputationDropdownRef = useRef(null);
  const encodingDropdownRef = useRef(null);
  const normalizationDropdownRef = useRef(null);

  useOutsideClick([dropdownRef1], () => setIsOpen1(false));
  useOutsideClick([dropdownRef2], () => setIsOpen2(false));
  useOutsideClick([dropdownRef3], () => setIsOpen3(false));
  useOutsideClick([dropdownRef4], () => setIsOpen4(false));
  useOutsideClick([imputationDropdownRef], () =>
    setShowImputationDropdown(false)
  );
  useOutsideClick([encodingDropdownRef], () => setShowEncodingDropdown(false));
  useOutsideClick([normalizationDropdownRef], () => setShowDropdown(false));

  const [encodingMethod, setEncodingMethod] = useState("");
  const [columnTypes, setColumnTypes] = useState({});

  const handleProfileClick = () => navigate("/profile");
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () =>
    navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => {
    const encodedFiltdate = encodeURIComponent(JSON.stringify(filteredData));
    navigate(`/models/${id}/${targetFeature}?filtdate=${encodedFiltdate}`);
  };
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () =>
    navigate(`/description/${id}/${targetFeature}`);
  const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  const cleanData = (data) =>
    typeof data === "string" ? data.replace(/NaN/g, "null") : data;
  const sanitizeJson = (jsonString) => jsonString.replace(/NaN/g, "null");

  useEffect(() => {
    if (filtdate) {
      try {
        const parsed = JSON.parse(decodeURIComponent(filtdate));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDecodedData(parsed);
        } else {
          console.warn("⚠️ Données vides ou mal formatées");
        }
      } catch (err) {
        console.error("Erreur de décodage des données :", err);
      }
    }
  }, [filtdate]);

  const fetchTargetFeature = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/projects/${id}/target-feature`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.currentTarget) {
        setTargetFeature(response.data.currentTarget);
        return response.data.currentTarget;
      }
    } catch (error) {
      console.error("Error fetching target feature:", error);
    }
    return null;
  };

  const importBD = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/projects/${id}/imported-files`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      let cleanedData;
      if (typeof response.data === "object") {
        cleanedData = cleanData(response.data.data);
      } else if (typeof response.data === "string") {
        const parsed = JSON.parse(sanitizeJson(response.data));
        cleanedData = cleanData(parsed.data);
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
        setFilteredData(cleanedData);
        setHistory([
          {
            data: cleanedData,
            operationReports: [],
            selectedColumns: [],
            selectedColumnsNr: [],
            selectedColumnsImp: [],
            selectedColumnsCat: [],
            normalizedColumns: [],
          },
        ]);
        setHistoryIndex(0);

        if (cleanedData.length > 0) {
          const availableFeatures = Object.keys(cleanedData[0]);
          if (!targetFeature || !availableFeatures.includes(targetFeature)) {
            const fetchedTarget = await fetchTargetFeature();
            if (fetchedTarget && availableFeatures.includes(fetchedTarget)) {
              setTargetFeature(fetchedTarget);
            } else if (availableFeatures.length > 0) {
              setTargetFeature(availableFeatures[0]);
              setError(
                `Target feature not found. Using ${availableFeatures[0]} as default.`
              );
            } else {
              setError("No features available in dataset");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(`Error fetching data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (location.state?.isFromHistory && location.state?.fileData) {
        // ✅ Données envoyées depuis Historique
        setData(location.state.fileData);
        setFilteredData(location.state.fileData);
        setHistory([
          {
            data: location.state.fileData,
            operationReports: [],
            selectedColumns: [],
            selectedColumnsNr: [],
            selectedColumnsImp: [],
            selectedColumnsCat: [],
            normalizedColumns: [],
          },
        ]);
        setHistoryIndex(0);
        if (location.state.targetFeature) {
          setTargetFeature(location.state.targetFeature);
        }
        setLoading(false);
        return;
      }

      // 🔁 Sinon, comportement par défaut (via query params comme versionId)
      const urlParams = new URLSearchParams(location.search);
      const versionId = urlParams.get("versionId");
      if (versionId) {
        try {
          const response = await fetch(
            `http://localhost:5000/fichier/${versionId}`
          );
          const result = await response.json();
          if (result.data) {
            setData(result.data);
            setFilteredData(result.data);
            setHistory([
              {
                data: result.data,
                operationReports: [],
                selectedColumns: [],
                selectedColumnsNr: [],
                selectedColumnsImp: [],
                selectedColumnsCat: [],
                normalizedColumns: [],
              },
            ]);
            setHistoryIndex(0);
            if (result.targetFeature) {
              setTargetFeature(result.targetFeature);
            }
          }
        } catch (error) {
          console.error("Error loading version:", error);
        }
      } else {
        await importBD();
      }

      setLoading(false);
    };

    loadData();
  }, [id, location.state, location.search]);

  useEffect(() => {
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      const columns = Object.keys(filteredData[0]);

      if (targetFeature && !columns.includes(targetFeature)) {
        const possibleTargets = columns.filter(
          (col) =>
            col.toLowerCase().includes("target") ||
            col.toLowerCase().includes("class") ||
            col.toLowerCase().includes("label")
        );
        if (possibleTargets.length > 0) {
          setTargetFeature(possibleTargets[0]);
        } else {
          setError(`La target feature "${targetFeature}" est introuvable.`);
        }
      }

      const types = {};
      columns.forEach((col) => {
        types[col] = detectColumnType(col);
      });
      setColumnTypes(types);
    }
  }, [filteredData, targetFeature]);

  const getFullyNullColumns = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) return [];

    const allCols = Object.keys(filteredData[0]);
    return allCols.filter((col) =>
      filteredData.every((row) => row[col] == null || row[col] === "")
    );
  };

  const handleToggleColumnToRemove = (colName) => {
    setColumnsToRemove((prev) =>
      prev.includes(colName)
        ? prev.filter((c) => c !== colName)
        : [...prev, colName]
    );
  };

  const handleSelectFullyNullColumns = () => {
    const fullyNullCols = getFullyNullColumns();
    setColumnsToRemove((prev) => {
      const updated = new Set(prev);
      fullyNullCols.forEach((col) => updated.add(col));
      return [...updated];
    });
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      alert("Veuillez entrer un nom de colonne.");
      return;
    }

    if (
      filteredData.length > 0 &&
      Object.keys(filteredData[0]).includes(newColumnName)
    ) {
      alert("Une colonne avec ce nom existe déjà.");
      return;
    }

    saveStateToHistory();
    setIsAddingColumn(true);

    try {
      let generatedData;
      switch (generationMode) {
        case "auto-increment":
          generatedData = filteredData.map((row, index) => ({
            ...row,
            [newColumnName]: index + 1,
          }));
          break;
        case "uuid":
          generatedData = filteredData.map((row) => ({
            ...row,
            [newColumnName]: crypto.randomUUID(),
          }));
          break;
        case "date":
          const now = new Date().toISOString();
          generatedData = filteredData.map((row) => ({
            ...row,
            [newColumnName]: now,
          }));
          break;
        default:
          generatedData = filteredData.map((row) => ({
            ...row,
            [newColumnName]: defaultColumnValue,
          }));
      }

      const report = addOperationReport(
        "Add Column",
        `Ajout de la colonne "${newColumnName}" (${generationMode})`,
        [newColumnName],
        {
          generationMode,
          defaultValue:
            generationMode === "manual" ? defaultColumnValue : undefined,
          rowCount: generatedData.length,
          columnCount: Object.keys(generatedData[0]).length,
        }
      );

      setFilteredData(generatedData);
      setCurrentReport(report);
      setShowReportModal(true);

      // reset
      setNewColumnName("");
      setDefaultColumnValue("");
      setGenerationMode("manual");
      setShowAddColumnPopup(false);
    } catch (error) {
      console.error("Error adding column:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsAddingColumn(false);
    }
  };

  const detectColumnType = (column) => {
    if (!filteredData.length) return "unknown";
    const sample = filteredData.slice(0, 100).map((row) => row[column]);
    const nonNullSample = sample.filter(
      (val) => val !== null && val !== undefined
    );
    if (nonNullSample.length === 0) return "unknown";
    const allNumeric = nonNullSample.every(
      (val) => !isNaN(parseFloat(val)) && isFinite(val)
    );
    const looksLikeCode = nonNullSample.some(
      (val) =>
        typeof val === "string" && /^[0-9]+$/.test(val) && val.length <= 5
    );
    const uniqueValues = new Set(nonNullSample);
    const lowCardinality =
      uniqueValues.size <= Math.min(20, filteredData.length * 0.1);
    if (allNumeric && !looksLikeCode && !lowCardinality) {
      return "numeric";
    } else if (looksLikeCode || lowCardinality) {
      return "categorical";
    } else {
      return "text";
    }
  };

  const getColumnsNeedingNormalization = () => {
    if (!filteredData.length) return [];

    const columns = Object.keys(filteredData[0]);
    const validColumns = [];

    for (const col of columns) {
      if (
        columnTypes[col] === "numeric" &&
        col !== targetFeature &&
        !normalizedColumns.includes(col)
      ) {
        const values = filteredData
          .map((row) => parseFloat(row[col]))
          .filter((val) => !isNaN(val) && isFinite(val));

        if (values.length === 0) continue;

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;

        const isConstant = range === 0;
        const isBinary = new Set(values).size === 2;
        const hasLargeRange = max > 100 || range > 50;

        if (!isConstant && !isBinary && hasLargeRange) {
          validColumns.push(col);
        }
      }
    }

    return validColumns;
  };

  const saveStateToHistory = () => {
    const newState = {
      data: [...filteredData],
      operationReports: [...operationReports],
      selectedColumns: [...selectedColumns],
      selectedColumnsNr: [...selectedColumnsNr],
      selectedColumnsImp: [...selectedColumnsImp],
      selectedColumnsCat: [...selectedColumnsCat],
      normalizedColumns: [...normalizedColumns],
    };

    setHistory((prev) => {
      // Keep only up to historyIndex, discarding any future states
      const newHistory = [...prev.slice(0, historyIndex + 1)];
      newHistory.push(newState);
      return newHistory.slice(-50); // Keep last 50 states
    });

    setHistoryIndex((prev) => prev + 1);
  };

  const undoOperation = () => {
    if (historyIndex <= 0) {
      alert("No operations to undo");
      return;
    }

    // Get the state before the last operation
    const previousState = history[historyIndex];

    // Find the last non-undo operation to display
    const lastOperation =
      operationReports.find((op) => op.operation !== "Undo Operation")
        ?.operation || "Unknown operation";

    // Restore the previous state
    setFilteredData([...previousState.data]);
    setOperationReports([...previousState.operationReports]);
    setSelectedColumns([...previousState.selectedColumns]);
    setSelectedColumnsNr([...previousState.selectedColumnsNr]);
    setSelectedColumnsImp([...previousState.selectedColumnsImp]);
    setSelectedColumnsCat([...previousState.selectedColumnsCat]);
    setNormalizedColumns([...previousState.normalizedColumns]);

    // Update history index
    setHistoryIndex((prev) => prev - 1);

    // Create undo report just for display (not saved in operationReports)
    const undoReport = {
      timestamp: new Date().toISOString(),
      operation: "Undo Operation",
      details: `Reverted operation: ${lastOperation}`,
      affectedColumns: [],
      stats: {
        undoneOperation: lastOperation,
        restoredStateIndex: historyIndex - 1,
        totalStates: history.length,
        timestamp: new Date().toISOString(),
      },
      dataSample:
        previousState.data.length > 0
          ? [...previousState.data.slice(0, 1)]
          : [],
    };

    // Show the undo report in the modal
    setCurrentReport(undoReport);
    setShowReportModal(true);
  };

  useEffect(() => {
    console.log("History updated:", {
      historyIndex,
      historyLength: history.length,
    });
  }, [historyIndex, history]);

  const addOperationReport = (operation, details, affectedColumns, stats) => {
    // Skip adding undo operations to the reports
    if (operation === "Undo Operation") return null;

    const newReport = {
      timestamp: new Date().toISOString(),
      operation,
      details,
      affectedColumns: affectedColumns.filter((col) => col !== targetFeature),
      stats,
      dataSample: filteredData.length > 0 ? [...filteredData.slice(0, 1)] : [],
    };

    setOperationReports((prev) => [newReport, ...prev].slice(0, 50));
    return newReport;
  };

  const handleDataCleaning = async () => {
    if (filteredData.length === 0) {
      alert("No data to clean");
      return;
    }
    saveStateToHistory();
    setIsCleaning(true);
    try {
      const columns = Object.keys(filteredData[0] || {}).filter(
        (col) => col !== targetFeature
      );
      const means = {};
      const nullStats = {};
      let missingValueCount = 0;

      columns.forEach((column) => {
        const numericValues = filteredData
          .map((row) => parseFloat(row[column]))
          .filter((value) => !isNaN(value));
        means[column] = numericValues.length > 0 ? mean(numericValues) : 0;
        nullStats[column] = filteredData.filter(
          (row) =>
            row[column] === null ||
            row[column] === undefined ||
            isNaN(row[column])
        ).length;
      });

      const cleanedData = filteredData.map((row) => {
        const cleanedRow = { ...row };
        columns.forEach((column) => {
          if (
            cleanedRow[column] === null ||
            cleanedRow[column] === undefined ||
            isNaN(cleanedRow[column])
          ) {
            missingValueCount++;
            cleanedRow[column] = means[column];
          }
        });
        return cleanedRow;
      });

      const report = addOperationReport(
        "Data Cleaning",
        "Removed null values by mean imputation",
        columns.filter((col) => nullStats[col] > 0),
        {
          totalNullValues: Object.values(nullStats).reduce((a, b) => a + b, 0),
          nullValuesByColumn: nullStats,
          meansUsed: means,
          targetFeatureProtected: targetFeature,
        }
      );

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

  const handleRemoveSelectedColumns = () => {
    if (columnsToRemove.length === 0) {
      alert("Aucune colonne sélectionnée.");
      return;
    }

    saveStateToHistory();

    const newData = filteredData.map((row) => {
      const newRow = { ...row };
      columnsToRemove.forEach((col) => delete newRow[col]);
      return newRow;
    });

    const report = addOperationReport(
      "Remove Columns",
      `Colonnes supprimées : ${columnsToRemove.join(", ")}`,
      columnsToRemove,
      {
        removedCount: columnsToRemove.length,
        remainingColumns: Object.keys(newData[0]).length,
      }
    );

    setFilteredData(newData);
    setCurrentReport(report);
    setShowReportModal(true);
    setShowRemoveColumnPopup(false);
    setColumnsToRemove([]);
  };

  const handleDataTransformation = (type) => {
    const columnsToTransform = selectedColumnsNr.filter(
      (col) => col !== targetFeature
    );
    if (columnsToTransform.length === 0) {
      alert(
        "Please select columns to normalize (excluding the target feature)"
      );
      return;
    }
    saveStateToHistory();
    let normalizedData = filteredData.map((row) => ({ ...row }));
    const transformationDetails = {};

    columnsToTransform.forEach((column) => {
      const values = filteredData
        .map((row) => parseFloat(row[column]))
        .filter((v) => !isNaN(v));
      if (values.length === 0) return;

      const min = Math.min(...values);
      const max = Math.max(...values);
      const meanVal = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((acc, val) => acc + Math.pow(val - meanVal, 2), 0) /
          values.length
      );

      transformationDetails[column] = { min, max, mean: meanVal, stdDev };

      normalizedData.forEach((row) => {
        if (row[column] !== null && row[column] !== undefined) {
          const value = parseFloat(row[column]);
          switch (type) {
            case "Min-Max Normalization":
              row[column] = (value - min) / (max - min);
              break;
            case "Z-Score Normalization":
              row[column] = stdDev !== 0 ? (value - meanVal) / stdDev : 0;
              break;
            case "Decimal Scaling":
              const j = Math.ceil(Math.log10(max + 1));
              row[column] = value / Math.pow(10, j);
              break;
            case "Mean Normalization":
              row[column] = (value - meanVal) / (max - min);
              break;
            case "Logarithmic":
              row[column] = Math.log(value + 1);
              break;
            case "Standard Normalization":
              // StandardScaler: (x - mean) / std
              const validValues = filteredData
                .map((row) => parseFloat(row[column]))
                .filter((v) => !isNaN(v));

              if (validValues.length === 0) break;

              const meanValue =
                validValues.reduce((sum, val) => sum + val, 0) /
                validValues.length;
              const stdDevValue = Math.sqrt(
                validValues.reduce(
                  (sum, val) => sum + Math.pow(val - meanValue, 2),
                  0
                ) / validValues.length
              );

              normalizedData.forEach((row) => {
                if (row[column] !== null && row[column] !== undefined) {
                  const numValue = parseFloat(row[column]);
                  if (!isNaN(numValue)) {
                    row[column] =
                      stdDevValue !== 0
                        ? (numValue - meanValue) / stdDevValue
                        : 0;
                  }
                }
              });

              transformationDetails[column].stdDev = stdDevValue;
              transformationDetails[column].mean = meanValue;
              break;
          }
        }
      });
    });

    const report = addOperationReport(
      `Data Transformation - ${type}`,
      `Applied ${type} to selected columns`,
      columnsToTransform,
      {
        transformationType: type,
        columnStats: transformationDetails,
        normalizedColumnsCount: columnsToTransform.length,
        targetFeatureExcluded: targetFeature,
      }
    );

    setNormalizedColumns([
      ...new Set([...normalizedColumns, ...columnsToTransform]),
    ]);
    setFilteredData(normalizedData);
    setSelectedColumnsNr((prev) => prev.filter((col) => col !== targetFeature));
    setCurrentReport(report);
    setShowReportModal(true);
  };

  const handleDatadouble = () => {
    saveStateToHistory();
    const uniqueRows = new Set();
    const duplicateRows = [];
    const dt = filteredData.filter((row, index) => {
      const rowValues = Object.entries(row)
        .filter(([key]) => key !== targetFeature)
        .map(([_, value]) => value)
        .join("|");
      if (uniqueRows.has(rowValues)) {
        duplicateRows.push({ index, data: row });
        return false;
      }
      uniqueRows.add(rowValues);
      return true;
    });

    const report = addOperationReport(
      "Duplicate Removal",
      "Removed duplicate rows from dataset",
      Object.keys(filteredData[0] || {}).filter((col) => col !== targetFeature),
      {
        initialRowCount: filteredData.length,
        finalRowCount: dt.length,
        duplicatesRemoved: filteredData.length - dt.length,
        duplicateExamples: duplicateRows.slice(0, 3),
        targetFeaturePreserved: targetFeature,
      }
    );

    setFilteredData(dt);
    setCurrentReport(report);
    setShowReportModal(true);
  };

  const imputeByMean = (data, columns) => {
    const updatedData = data.map((row) => ({ ...row }));
    const reportDetails = {};
    columns
      .filter((col) => col !== targetFeature)
      .forEach((col) => {
        const validValues = updatedData
          .map((row) => parseFloat(row[col]))
          .filter((value) => !isNaN(value));
        if (validValues.length === 0) return;
        const mean =
          validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        const beforeNullCount = updatedData.filter(
          (row) =>
            row[col] === null ||
            row[col] === undefined ||
            row[col] === "N/A" ||
            isNaN(parseFloat(row[col]))
        ).length;
        updatedData.forEach((row) => {
          if (
            row[col] === null ||
            row[col] === undefined ||
            row[col] === "N/A" ||
            isNaN(parseFloat(row[col]))
          ) {
            row[col] = mean;
          }
        });
        const afterNullCount = updatedData.filter(
          (row) =>
            row[col] === null ||
            row[col] === undefined ||
            row[col] === "N/A" ||
            isNaN(parseFloat(row[col]))
        ).length;
        reportDetails[col] = {
          before: beforeNullCount,
          after: afterNullCount,
          meanUsed: mean,
        };
      });
    return { updatedData, reportDetails };
  };

  const imputeByMedian = (data, columns) => {
    const updatedData = data.map((row) => ({ ...row }));
    const reportDetails = {};
    columns.forEach((col) => {
      const validValues = updatedData
        .map((row) => parseFloat(row[col]))
        .filter((value) => !isNaN(value))
        .sort((a, b) => a - b);
      if (validValues.length === 0) return;
      const mid = Math.floor(validValues.length / 2);
      const median =
        validValues.length % 2 !== 0
          ? validValues[mid]
          : (validValues[mid - 1] + validValues[mid]) / 2;
      const beforeNullCount = updatedData.filter(
        (row) =>
          row[col] === null ||
          row[col] === undefined ||
          row[col] === "N/A" ||
          isNaN(parseFloat(row[col]))
      ).length;
      updatedData.forEach((row) => {
        if (
          row[col] === null ||
          row[col] === undefined ||
          row[col] === "N/A" ||
          isNaN(parseFloat(row[col]))
        ) {
          row[col] = median;
        }
      });
      const afterNullCount = updatedData.filter(
        (row) =>
          row[col] === null ||
          row[col] === undefined ||
          row[col] === "N/A" ||
          isNaN(parseFloat(row[col]))
      ).length;
      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        medianUsed: median,
      };
    });
    return { updatedData, reportDetails };
  };

  const imputeByMode = (data, columns) => {
    const updatedData = data.map((row) => ({ ...row }));
    const reportDetails = {};
    columns.forEach((col) => {
      const validValues = updatedData
        .map((row) => row[col])
        .filter(
          (value) => value !== null && value !== undefined && value !== "N/A"
        );
      if (validValues.length === 0) return;
      const frequencyMap = {};
      validValues.forEach((val) => {
        frequencyMap[val] = (frequencyMap[val] || 0) + 1;
      });
      const mode = Object.keys(frequencyMap).reduce((a, b) =>
        frequencyMap[a] > frequencyMap[b] ? a : b
      );
      const beforeNullCount = updatedData.filter(
        (row) =>
          row[col] === null || row[col] === undefined || row[col] === "N/A"
      ).length;
      updatedData.forEach((row) => {
        if (row[col] === null || row[col] === undefined || row[col] === "N/A") {
          row[col] = mode;
        }
      });
      const afterNullCount = updatedData.filter(
        (row) =>
          row[col] === null || row[col] === undefined || row[col] === "N/A"
      ).length;
      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        modeUsed: mode,
      };
    });
    return { updatedData, reportDetails };
  };

  const imputeByKNN = (data, columns, k = 3) => {
    const updatedData = data.map((row) => ({ ...row }));
    const reportDetails = {};
    const validData = data.filter((row) =>
      columns.some(
        (col) =>
          row[col] !== null &&
          row[col] !== undefined &&
          !isNaN(parseFloat(row[col]))
      )
    );
    if (validData.length < k) {
      console.warn("Not enough data for KNN imputation");
      return { updatedData: data, reportDetails: {} };
    }
    const features = validData.map((row) =>
      columns.map((col) => parseFloat(row[col]) || 0)
    );
    const labels = validData.map((_, idx) => idx);
    const knn = new KNN(features, labels, { k });
    columns.forEach((col) => {
      reportDetails[col] = {
        before: updatedData.filter(
          (row) =>
            row[col] === null ||
            row[col] === undefined ||
            isNaN(parseFloat(row[col]))
        ).length,
      };
    });
    updatedData.forEach((row) => {
      const hasMissing = columns.some(
        (col) =>
          row[col] === null ||
          row[col] === undefined ||
          isNaN(parseFloat(row[col]))
      );
      if (hasMissing) {
        const features = columns.map((col) => {
          const val = parseFloat(row[col]);
          return isNaN(val) ? 0 : val;
        });
        const neighbors = knn.predict([features]);
        neighbors.forEach((neighborIdx) => {
          const neighbor = validData[neighborIdx];
          columns.forEach((col) => {
            if (
              row[col] === null ||
              row[col] === undefined ||
              isNaN(parseFloat(row[col]))
            ) {
              const neighborVal = parseFloat(neighbor[col]);
              if (!isNaN(neighborVal)) {
                row[col] = neighborVal;
              }
            }
          });
        });
      }
    });
    columns.forEach((col) => {
      reportDetails[col].after = updatedData.filter(
        (row) =>
          row[col] === null ||
          row[col] === undefined ||
          isNaN(parseFloat(row[col]))
      ).length;
      reportDetails[col].method = `KNN (k=${k})`;
    });
    return { updatedData, reportDetails };
  };

  const imputeByZero = (data, columns) => {
    const updatedData = data.map((row) => ({ ...row }));
    const reportDetails = {};
    columns.forEach((col) => {
      const beforeNullCount = updatedData.filter(
        (row) =>
          row[col] === null ||
          row[col] === undefined ||
          isNaN(parseFloat(row[col]))
      ).length;
      updatedData.forEach((row) => {
        if (
          row[col] === null ||
          row[col] === undefined ||
          isNaN(parseFloat(row[col]))
        ) {
          row[col] = 0;
        }
      });
      const afterNullCount = updatedData.filter(
        (row) =>
          row[col] === null ||
          row[col] === undefined ||
          isNaN(parseFloat(row[col]))
      ).length;
      reportDetails[col] = {
        before: beforeNullCount,
        after: afterNullCount,
        method: "Zero imputation",
      };
    });
    return { updatedData, reportDetails };
  };

  const handleImputation = (method) => {
    const columnsToImpute = selectedColumnsImp.filter(
      (col) => col !== targetFeature
    );
    if (columnsToImpute.length === 0) {
      alert(
        "Please select columns for imputation (excluding the target feature)"
      );
      return;
    }
    saveStateToHistory();
    setIsImputing(true);
    let result;
    try {
      switch (method) {
        case "Mean Imputation":
          result = imputeByMean(filteredData, columnsToImpute);
          break;
        case "Median Imputation":
          result = imputeByMedian(filteredData, columnsToImpute);
          break;
        case "Mode Imputation":
          result = imputeByMode(filteredData, columnsToImpute);
          break;
        case "KNN Imputation":
          result = imputeByKNN(filteredData, columnsToImpute);
          break;
        case "Zero Imputation":
          result = imputeByZero(filteredData, columnsToImpute);
          break;
        default:
          throw new Error("Unknown imputation method");
      }
      setFilteredData(result.updatedData);
      const report = addOperationReport(
        `Data Imputation - ${method}`,
        `Applied ${method} to selected columns`,
        columnsToImpute,
        {
          method,
          columnStats: result.reportDetails,
          totalNullsBefore: Object.values(result.reportDetails).reduce(
            (sum, col) => sum + col.before,
            0
          ),
          totalNullsAfter: Object.values(result.reportDetails).reduce(
            (sum, col) => sum + col.after,
            0
          ),
          targetFeatureExcluded: targetFeature,
        }
      );
      setCurrentReport(report);
      setShowReportModal(true);
      setSelectedColumnsImp((prev) =>
        prev.filter((col) => col !== targetFeature)
      );
    } catch (error) {
      console.error("Imputation error:", error);
      alert(`Error during imputation: ${error.message}`);
    } finally {
      setIsImputing(false);
    }
  };

  const identifyCategoricalColumns = (data) => {
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      typeof data[0] !== "object"
    )
      return [];

    const keys = Object.keys(data[0]);

    return keys.filter((key) => {
      const values = data.map((row) => row[key]);
      const nonNull = values.filter((v) => v !== null && v !== undefined);
      if (nonNull.length === 0) return false;

      const unique = [...new Set(nonNull)];

      const isString = nonNull.every((v) => typeof v === "string");
      const isBoolean = nonNull.every((v) => typeof v === "boolean");

      // Autoriser les entiers entre 0 et 20, mais seulement si ≤ 5 classes uniques
      const isDiscreteInt =
        nonNull.every(
          (v) =>
            typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 20
        ) && unique.length <= 5;

      const lowCardinality = unique.length <= Math.max(20, data.length * 0.2);

      return (isString || isBoolean || isDiscreteInt) && lowCardinality;
    });
  };

  useEffect(() => {
    if (decodedData) {
      const cats = identifyCategoricalColumns(decodedData);
      setCategoricalCols(cats);
    }
  }, [decodedData]);

  const handleOneHotEncoding = () => {
    if (selectedColumnsCat.length === 0) {
      alert("Veuillez sélectionner des colonnes catégorielles");
      return;
    }
    saveStateToHistory();
    setIsProcessingCat(true);
    try {
      const newColumns = {};
      selectedColumnsCat.forEach((col) => {
        const uniqueValues = [...new Set(filteredData.map((row) => row[col]))];
        uniqueValues.forEach((val) => {
          newColumns[`${col}_${val}`] = filteredData.map((row) =>
            row[col] === val ? 1 : 0
          );
        });
      });
      const newData = filteredData.map((row, index) => {
        const newRow = { ...row };
        selectedColumnsCat.forEach((col) => {
          delete newRow[col];
        });
        Object.keys(newColumns).forEach((newCol) => {
          newRow[newCol] = newColumns[newCol][index];
        });
        return newRow;
      });
      const report = addOperationReport(
        "One-Hot Encoding",
        `Encodage one-hot appliqué à ${selectedColumnsCat.length} colonnes`,
        selectedColumnsCat,
        {
          method: "One-Hot Encoding",
          originalColumns: selectedColumnsCat,
          newColumns: Object.keys(newColumns),
          targetFeaturePreserved: targetFeature,
        }
      );
      setFilteredData(newData);
      setCurrentReport(report);
      setShowReportModal(true);
      setSelectedColumnsCat([]);
    } catch (error) {
      console.error("Erreur d'encodage one-hot:", error);
      alert(`Erreur d'encodage: ${error.message}`);
    } finally {
      setIsProcessingCat(false);
    }
  };

  const handleLabelEncoding = () => {
    if (selectedColumnsCat.length === 0) {
      alert("Veuillez sélectionner des colonnes catégorielles");
      return;
    }
    saveStateToHistory();
    setIsProcessingCat(true);
    try {
      const encodingMaps = {};
      const newData = filteredData.map((row) => ({ ...row }));
      selectedColumnsCat.forEach((col) => {
        const uniqueValues = [...new Set(filteredData.map((row) => row[col]))];
        encodingMaps[col] = {};
        uniqueValues.forEach((val, index) => {
          encodingMaps[col][val] = index;
        });
        newData.forEach((row) => {
          row[col] = encodingMaps[col][row[col]] || 0;
        });
      });
      const report = addOperationReport(
        "Label Encoding",
        `Encodage label appliqué à ${selectedColumnsCat.length} colonnes`,
        selectedColumnsCat,
        {
          method: "Label Encoding",
          encodingMaps: encodingMaps,
          targetFeaturePreserved: targetFeature,
        }
      );
      setFilteredData(newData);
      setCurrentReport(report);
      setShowReportModal(true);
      setSelectedColumnsCat([]);
    } catch (error) {
      console.error("Erreur d'encodage label:", error);
      alert(`Erreur d'encodage: ${error.message}`);
    } finally {
      setIsProcessingCat(false);
    }
  };

  const handleFrequencyEncoding = () => {
    if (selectedColumnsCat.length === 0) {
      alert("Veuillez sélectionner des colonnes catégorielles");
      return;
    }
    saveStateToHistory();
    setIsProcessingCat(true);
    try {
      const frequencyMaps = {};
      const newData = filteredData.map((row) => ({ ...row }));
      selectedColumnsCat.forEach((col) => {
        const valueCounts = filteredData.reduce((acc, row) => {
          acc[row[col]] = (acc[row[col]] || 0) + 1;
          return acc;
        }, {});
        frequencyMaps[col] = valueCounts;
        const total = filteredData.length;
        newData.forEach((row) => {
          row[col] = valueCounts[row[col]] / total;
        });
      });
      const report = addOperationReport(
        "Frequency Encoding",
        `Encodage par fréquence appliqué à ${selectedColumnsCat.length} colonnes`,
        selectedColumnsCat,
        {
          method: "Frequency Encoding",
          frequencyMaps: frequencyMaps,
          targetFeaturePreserved: targetFeature,
        }
      );
      setFilteredData(newData);
      setCurrentReport(report);
      setShowReportModal(true);
      setSelectedColumnsCat([]);
    } catch (error) {
      console.error("Erreur d'encodage par fréquence:", error);
      alert(`Erreur d'encodage: ${error.message}`);
    } finally {
      setIsProcessingCat(false);
    }
  };

  const handleTextLengthExtraction = () => {
    if (selectedColumnsCat.length === 0) {
      alert("Veuillez sélectionner des colonnes textuelles");
      return;
    }
    saveStateToHistory();
    setIsProcessingCat(true);
    try {
      const newData = filteredData.map((row) => ({ ...row }));
      selectedColumnsCat.forEach((col) => {
        newData.forEach((row) => {
          row[`${col}_length`] = String(row[col]).length;
        });
      });
      const report = addOperationReport(
        "Text Length Extraction",
        `Extraction de longueur de texte appliquée à ${selectedColumnsCat.length} colonnes`,
        selectedColumnsCat,
        {
          method: "Text Length Extraction",
          newFeatures: selectedColumnsCat.map((col) => `${col}_length`),
          targetFeaturePreserved: targetFeature,
        }
      );
      setFilteredData(newData);
      setCurrentReport(report);
      setShowReportModal(true);
      setSelectedColumnsCat([]);
    } catch (error) {
      console.error("Erreur d'extraction de texte:", error);
      alert(`Erreur d'extraction: ${error.message}`);
    } finally {
      setIsProcessingCat(false);
    }
  };

  const handleDownload = () => {
    const csvData = [
      Object.keys(filteredData[0] || {}).join(","),
      ...filteredData.slice(0, 15).map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "processed_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const operationDescription =
        operationReports.length > 0
          ? operationReports
              .map((op) => {
                const columns =
                  op.affectedColumns?.length > 0
                    ? `(Colonnes: ${op.affectedColumns.join(", ")})`
                    : "";
                return `${op.operation}: ${op.details} ${columns}`;
              })
              .join(" | ")
          : "Traitement personnalisé";

      const dataToSend = {
        data: filteredData,
        preprocessing_steps: operationReports,
        modification: operationDescription,
      };

      const compressedData = pako.gzip(JSON.stringify(dataToSend));

      const response = await fetch(`http://localhost:5000/save-data/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          Authorization: `Bearer ${token}`,
          "Content-Encoding": "gzip",
        },
        body: compressedData,
      });

      if (!response.ok) throw new Error("Failed to save data");
      saveStateToHistory();
      const report = addOperationReport(
        "Data Save",
        "Saved processed data to server",
        Object.keys(filteredData[0] || {}),
        {
          rowCount: filteredData.length,
          columnCount: Object.keys(filteredData[0] || {}).length,
          savedAt: new Date().toISOString(),
          operationDescription: operationDescription,
        }
      );
      setCurrentReport(report);
      setShowReportModal(true);
      alert("Data saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert(`Error saving data: ${error.message}`);
    }
  };

  const calculateNullPercentages = () => {
    const columns = Object.keys(filteredData[0] || {}).filter(
      (col) => col !== targetFeature
    );
    const totalRows = filteredData.length;
    const nullPercentages = {};
    columns.forEach((column) => {
      const nullCount = filteredData.filter(
        (row) =>
          row[column] === null ||
          row[column] === undefined ||
          row[column] === "N/A"
      ).length;
      nullPercentages[column] = (nullCount / totalRows) * 100;
    });
    return nullPercentages;
  };

  const nullPercentages = calculateNullPercentages();
  const columnsWithHighNulls = Object.keys(nullPercentages).filter(
    (column) => nullPercentages[column] > 20
  );

  const handleColumnCheckboxChange = (column) => {
    if (column === targetFeature) return;
    setSelectedColumns((prev) => {
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
    if (column === targetFeature) return;
    setSelectedColumnsNr((prev) => {
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
    if (column === targetFeature) return;
    setSelectedColumnsImp((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(column)) {
        newSelection.delete(column);
      } else {
        newSelection.add(column);
      }
      return Array.from(newSelection);
    });
  };

  const handleColumnCheckboxChangeCat = (column) => {
    if (column === targetFeature) return;
    setSelectedColumnsCat((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(column)) {
        newSelection.delete(column);
      } else {
        newSelection.add(column);
      }
      return Array.from(newSelection);
    });
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleDropdown1 = () => setIsOpen1(!isOpen1);
  const toggleDropdown2 = () => setIsOpen2(!isOpen2);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const headers =
    filteredData.length > 0
      ? Object.keys(filteredData[0]).filter(
          (header) => header !== targetFeature
        )
      : [];
  const availableColumns = getColumnsNeedingNormalization();
  const categoricalColumns = identifyCategoricalColumns(filteredData); // ✅
  const rows = Array.isArray(filteredData) ? filteredData.slice(0, 15) : [];

  const ReportModal = ({ report, onClose }) => {
    if (!report) return null;
    const renderReportDetails = () => {
      switch (report.operation) {
        case "Data Cleaning":
          return (
            <div className="report-section">
              <h3>Cleaning Details</h3>
              <p>Total null values replaced: {report.stats.totalNullValues}</p>
              <h4>Columns affected:</h4>
              <ul className="column-stats">
                {report.affectedColumns.map((col) => (
                  <li key={col}>
                    <span className="column-name">{col}</span>
                    <span className="stat-value">
                      {report.stats.nullValuesByColumn[col]} nulls replaced with
                      mean {report.stats.meansUsed[col]?.toFixed(2) || "N/A"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        case "Data Imputation - Mean Imputation":
        case "Data Imputation - Median Imputation":
        case "Data Imputation - Mode Imputation":
        case "Data Imputation - KNN Imputation":
        case "Data Imputation - Zero Imputation":
          return (
            <div className="report-section">
              <h3>Imputation Details</h3>
              <p>
                <strong>Method:</strong> {report.stats.method}
              </p>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total nulls before:</span>
                  <span className="stat-value">
                    {report.stats.totalNullsBefore}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total nulls after:</span>
                  <span className="stat-value">
                    {report.stats.totalNullsAfter}
                  </span>
                </div>
              </div>
              <h4>Columns affected:</h4>
              <ul className="column-stats">
                {Object.entries(report.stats.columnStats).map(
                  ([col, stats]) => (
                    <li key={col}>
                      <span className="column-name">{col}</span>
                      <span className="stat-value">
                        {stats.before} → {stats.after} nulls
                        {stats.meanUsed &&
                          ` (Mean: ${stats.meanUsed.toFixed(2)})`}
                        {stats.medianUsed &&
                          ` (Median: ${stats.medianUsed.toFixed(2)})`}
                        {stats.modeUsed && ` (Mode: ${stats.modeUsed})`}
                        {stats.method && ` (${stats.method})`}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          );
        case "Data Transformation - Min-Max Normalization":
        case "Data Transformation - Z-Score Normalization":
        case "Data Transformation - Decimal Scaling":
        case "Data Transformation - Mean Normalization":
        case "Data Transformation - Logarithmic":
          return (
            <div className="report-section">
              <h3>Transformation Details</h3>
              <p>
                <strong>Type:</strong> {report.stats.transformationType}
              </p>
              <p>
                <strong>Columns transformed:</strong>{" "}
                {report.stats.normalizedColumnsCount}
              </p>
              <h4>Column Statistics:</h4>
              <ul className="column-stats">
                {Object.entries(report.stats.columnStats).map(
                  ([col, stats]) => (
                    <li key={col}>
                      <span className="column-name">{col}</span>
                      <ul className="sub-stats">
                        <li>Min: {stats.min?.toFixed(4)}</li>
                        <li>Max: {stats.max?.toFixed(4)}</li>
                        <li>Mean: {stats.mean?.toFixed(4)}</li>
                        {stats.stdDev && (
                          <li>Std Dev: {stats.stdDev?.toFixed(4)}</li>
                        )}
                      </ul>
                    </li>
                  )
                )}
              </ul>
            </div>
          );
        case "Duplicate Removal":
          return (
            <div className="report-section">
              <h3>Duplicate Removal Details</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Initial rows:</span>
                  <span className="stat-value">
                    {report.stats.initialRowCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Final rows:</span>
                  <span className="stat-value">
                    {report.stats.finalRowCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Duplicates removed:</span>
                  <span className="stat-value">
                    {report.stats.duplicatesRemoved}
                  </span>
                </div>
              </div>
              <h4>Sample duplicates:</h4>
              <div className="data-sample">
                <pre>
                  {JSON.stringify(report.stats.duplicateExamples, null, 2)}
                </pre>
              </div>
            </div>
          );
        case "Data Save":
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
              <p>
                <strong>Saved at:</strong>{" "}
                {new Date(report.stats.savedAt).toLocaleString()}
              </p>
            </div>
          );
        case "Undo Operation":
          return (
            <div className="report-section">
              <h3>Undo Details</h3>
              <p>
                <strong>Undone Operation:</strong>{" "}
                {report.stats.undoneOperation}
              </p>
              <p>
                <strong>Restored State:</strong>{" "}
                {report.stats.restoredStateIndex}
              </p>
              <p>
                <strong>Total States Available:</strong>{" "}
                {report.stats.totalStates}
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(report.stats.timestamp).toLocaleString()}
              </p>
            </div>
          );
        case "Full Operations History":
          return (
            <div className="report-section">
              <h3>Complete Operations History</h3>
              <p>
                <strong>Total operations:</strong>{" "}
                {report.stats.operations.length}
              </p>
              <div className="full-history">
                {report.stats.operations.map((op, idx) => (
                  <div key={idx} className="history-item">
                    <h4>{op.operation}</h4>
                    <p className="timestamp">
                      {new Date(op.timestamp).toLocaleString()}
                    </p>
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
        case "One-Hot Encoding":
        case "Label Encoding":
        case "Frequency Encoding":
        case "Text Length Extraction":
          return (
            <div className="report-section">
              <h3>Encoding Details</h3>
              <p>
                <strong>Method:</strong> {report.stats.method}
              </p>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Original Columns:</span>
                  <span className="stat-value">
                    {report.affectedColumns.length}
                  </span>
                </div>
                {report.stats.newColumns && (
                  <div className="stat-item">
                    <span className="stat-label">New Columns:</span>
                    <span className="stat-value">
                      {report.stats.newColumns.length}
                    </span>
                  </div>
                )}
              </div>
              <h4>Columns affected:</h4>
              <ul className="column-stats">
                {report.affectedColumns.map((col) => (
                  <li key={col}>
                    <span className="column-name">{col}</span>
                    {report.stats.encodingMaps?.[col] && (
                      <div className="encoding-map">
                        {Object.entries(report.stats.encodingMaps[col]).map(
                          ([key, val]) => (
                            <div key={key} className="encoding-pair">
                              <span>{key}</span> → <span>{val}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {report.stats.frequencyMaps?.[col] && (
                      <div className="frequency-map">
                        {Object.entries(report.stats.frequencyMaps[col]).map(
                          ([key, val]) => (
                            <div key={key} className="frequency-pair">
                              <span>{key}</span> → <span>{val.toFixed(4)}</span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
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
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
          <div className="report-modal-body">
            <div className="report-meta">
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(report.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Description:</strong> {report.details}
              </p>
            </div>
            {renderReportDetails()}
            <h4>Data Sample (first 3 rows):</h4>
            <div className="data-sample">
              <pre>{JSON.stringify(report.dataSample, null, 2)}</pre>
            </div>
          </div>
          <div className="report-modal-footer">
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  return (
    <div
      className={`app-container ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      {isMobile && !isSidebarOpen && (
        <button
          className="sidebar-toggle-mobile"
          onClick={() => setIsSidebarOpen(true)}
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
      <main className="content-modern">
        <div
          className={`content-modern ${
            isSidebarOpen ? "sidebar-open" : "sidebar-closed"
          }`}
        >
          <h1>Data Processing Center</h1>
          <p className="subtitle-modern">
            Nettoyez, transformez et préparez vos données médicales pour l'analyse
          </p>
          <div className="target-feature-display">
            <span className="target-label">Target Feature:</span>
            <span className="target-value">{targetFeature || "Not set"}</span>
            {error && error.includes("Target feature") && (
              <button
                onClick={fetchTargetFeature}
                className="refresh-target-btn"
              >
                <FontAwesomeIcon icon={faArrowsRotate} /> Refresh
              </button>
            )}
          </div>
          <br />
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
          <div className="action-grid-modern">
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
                      <span>Nettoyage...</span>
                    </>
                  ) : (
                    "Remplacer les valeurs Nulles"
                  )}
                </button>
                <button
                  className="action-btn-modern danger"
                  onClick={() => setShowRemoveColumnPopup(true)}
                >
                  Supprimer des colonnes
                </button>
              </div>
            </div>
            <div className="action-card-modern">
              <div className="card-header-modern">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="card-icon-modern"
                />
                <h3>Data Imputation</h3>
              </div>
              <div className="card-body-modern">
                <div
                  className="dropdown-modern dropdown-imputation"
                  ref={imputationDropdownRef}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={toggleImputationDropdown}
                    disabled={isImputing}
                  >
                    <span>
                      {isImputing ? "Processing..." : "Méthodes d'imputation"}
                    </span>
                    <FontAwesomeIcon
                      icon={
                        showImputationDropdown ? faChevronUp : faChevronDown
                      }
                      className="dropdown-arrow"
                    />
                  </button>
                  {showImputationDropdown && (
                    <div className="dropdown-menu-modern">
                      {["Mean", "Median", "Mode", "KNN", "Zero"].map(
                        (method) => (
                          <button
                            key={method}
                            className="dropdown-item-modern"
                            onClick={() => {
                              setShowImputationDropdown(false);
                              handleImputation(`${method} Imputation`);
                            }}
                          >
                            {method} Imputation
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div
                  className="dropdown-modern dropdown-columns"
                  ref={dropdownRef3}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={() => setIsOpen3(!isOpen3)}
                    disabled={isImputing}
                  >
                    <span>Sélectionner les colonnes</span>
                    <FontAwesomeIcon
                      icon={isOpen3 ? faChevronUp : faChevronDown}
                      className="dropdown-arrow"
                    />
                  </button>
                  {isOpen3 && (
                    <div className="dropdown-menu-modern">
                      <div className="dropdown-header">
                        <span>colonnes valides</span>
                        <button
                          onClick={() => {
                            setSelectedColumnsImp(availableColumns);
                          }}
                          className="select-all-btn"
                        >
                          Selectionner tout
                        </button>
                      </div>
                      {availableColumns.map((header) => (
                        <label key={header} className="checkbox-modern">
                          <input
                            type="checkbox"
                            checked={selectedColumnsImp.includes(header)}
                            onChange={() =>
                              handleColumnCheckboxChangeImp(header)
                            }
                            disabled={header === targetFeature || isImputing}
                          />
                          <span
                            className={`column-name ${
                              header === targetFeature ? "target-feature" : ""
                            }`}
                          >
                            {header}
                            {header === targetFeature && (
                              <span className="target-badge">Target</span>
                            )}
                          </span>
                          {nullPercentages[header] > 0 && (
                            <span className="null-percentage">
                              ({nullPercentages[header].toFixed(1)}% null)
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="action-card-modern">
              <div className="card-header-modern">
                <FontAwesomeIcon
                  icon={faArrowsRotate}
                  className="card-icon-modern"
                />
                <h3>Data Normalization</h3>
              </div>
              <div className="card-body-modern">
                <div
                  className="dropdown-modern dropdown-normalization"
                  ref={normalizationDropdownRef}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={toggleDropdown}
                    disabled={selectedColumnsNr.length === 0}
                  >
                    <span>Méthodes de normalisation</span>
                    <FontAwesomeIcon
                      icon={showDropdown ? faChevronUp : faChevronDown}
                      className="dropdown-arrow"
                    />
                  </button>
                  {showDropdown && (
                    <div className="dropdown-menu-modern">
                      {[
                        "Min-Max",
                        "Z-Score",
                        "Decimal Scaling",
                        "Mean",
                        "Logarithmic",
                        "Standard",
                      ].map((type) => (
                        <button
                          key={type}
                          className="dropdown-item-modern"
                          onClick={() => {
                            setShowDropdown(false);
                            handleDataTransformation(`${type} Normalization`);
                          }}
                        >
                          {type === "Standard"
                            ? "StandardScaler"
                            : `${type} Normalization`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="dropdown-modern dropdown-columns"
                  ref={dropdownRef2}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={toggleDropdown2}
                  >
                    <span>Selectionner les Colonnes</span>
                    <FontAwesomeIcon
                      icon={isOpen2 ? faChevronUp : faChevronDown}
                      className="dropdown-arrow"
                    />
                  </button>
                  {isOpen2 && (
                    <div className="dropdown-menu-modern">
                      <div className="dropdown-header">
                        <span>colonnes valides</span>
                        <button
                          onClick={() => {
                            setSelectedColumnsNr(availableColumns);
                          }}
                          className="select-all-btn"
                        >
                          Selectionner tout
                        </button>
                      </div>
                      {availableColumns.map((header) => (
                        <label key={header} className="checkbox-modern">
                          <input
                            type="checkbox"
                            checked={selectedColumnsNr.includes(header)}
                            onChange={() =>
                              handleColumnCheckboxChangeNr(header)
                            }
                            disabled={header === targetFeature}
                          />
                          <span
                            className={`column-name ${
                              header === targetFeature ? "target-feature" : ""
                            }`}
                          >
                            {header}
                            {header === targetFeature && (
                              <span className="target-badge">Target</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="action-card-modern">
              <div className="card-header-modern">
                <FontAwesomeIcon icon={faTags} className="card-icon-modern" />
                <h3>Categorical Data</h3>
              </div>
              <div className="card-body-modern">
                <div
                  className="dropdown-modern dropdown-encoding"
                  ref={encodingDropdownRef}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={toggleEncodingDropdown}
                    disabled={isProcessingCat}
                  >
                    <span>{encodingMethod || "Méthodes d'encodage"}</span>
                    <FontAwesomeIcon
                      icon={showEncodingDropdown ? faChevronUp : faChevronDown}
                      className="dropdown-arrow"
                    />
                  </button>
                  {showEncodingDropdown && (
                    <div className="dropdown-menu-modern">
                      <button
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowEncodingDropdown(false);
                          handleOneHotEncoding();
                          setEncodingMethod("One-Hot Encoding");
                        }}
                      >
                        One-Hot Encoding
                      </button>
                      <button
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowEncodingDropdown(false);
                          handleLabelEncoding();
                          setEncodingMethod("Label Encoding");
                        }}
                      >
                        Label Encoding
                      </button>
                      <button
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowEncodingDropdown(false);
                          handleFrequencyEncoding();
                          setEncodingMethod("Frequency Encoding");
                        }}
                      >
                        Frequency Encoding
                      </button>
                      <button
                        className="dropdown-item-modern"
                        onClick={() => {
                          setShowEncodingDropdown(false);
                          handleTextLengthExtraction();
                          setEncodingMethod("Text Length");
                        }}
                      >
                        Text Length Extraction
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className="dropdown-modern dropdown-columns"
                  ref={dropdownRef4}
                >
                  <button
                    className="dropdown-toggle-modern"
                    onClick={() => {
                      const catCols = identifyCategoricalColumns(filteredData); // ✅ ici
                      setIsOpen4(!isOpen4);
                      if (catCols.length === 0 && filteredData.length > 0) {
                        alert(
                          "No categorical columns identified in the first 100 rows"
                        );
                      }
                    }}
                    disabled={isProcessingCat}
                  >
                    <span>Selectionner les Colonnes</span>
                    <FontAwesomeIcon
                      icon={isOpen4 ? faChevronUp : faChevronDown}
                      className="dropdown-arrow"
                    />
                  </button>
                  {isOpen4 && (
                    <div className="dropdown-menu-modern">
                      <div className="dropdown-header">
                        <span>Colonnes catégorielles</span>
                        <button
                          onClick={() => {
                            setSelectedColumnsCat(identifyCategoricalColumns());
                          }}
                          className="select-all-btn"
                        >
                          Selectionner tout
                        </button>
                      </div>
                      {categoricalColumns.map((header) => (
                        <label key={header} className="checkbox-modern">
                          <input
                            type="checkbox"
                            checked={selectedColumnsCat.includes(header)}
                            onChange={() =>
                              handleColumnCheckboxChangeCat(header)
                            }
                            disabled={header === targetFeature}
                          />
                          <span
                            className={`column-name ${
                              header === targetFeature ? "target-feature" : ""
                            }`}
                          >
                            {header}
                            {header === targetFeature && (
                              <span className="target-badge">Target</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {isProcessingCat && (
                  <div className="processing-indicator">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="action-card-modern">
              <div className="card-header-modern">
                <FontAwesomeIcon icon={faClone} className="card-icon-modern" />
                <h3>Autres Opérations</h3>
              </div>
              <div className="card-body-modern">
                <button
                  className="action-btn-modern secondary"
                  onClick={handleDatadouble}
                >
                  supprimer les doublons
                </button>
                <button
                  className="action-btn-modern tertiary"
                  onClick={() => setShowAddColumnPopup(true)}
                >
                  Ajouter une colonne
                </button>

                <button
                  className="action-btn-modern warning"
                  onClick={undoOperation}
                  disabled={historyIndex <= 0}
                  title={
                    historyIndex <= 0
                      ? "No operations to undo"
                      : "Undo the last operation"
                  }
                >
                  <FontAwesomeIcon icon={faUndo} />
                  Annuler la dernière opération
                </button>
                <button
                  className="action-btn-modern primary"
                  onClick={handleDownload}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Télécharger les données
                </button>
                <button
                  className="action-btn-modern success"
                  onClick={handleSave}
                >
                  <FontAwesomeIcon icon={faSave} />
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          </div>
          <div className="data-preview-modern">
            <div className="preview-header-modern">
              <h2>Data Preview</h2>
              <p>
                Showing {Array.isArray(rows) ? Math.min(rows.length, 15) : 0} of{" "}
                {Array.isArray(filteredData) ? filteredData.length : 0} rows
              </p>
            </div>

            {rows && rows.length > 0 && headers && Array.isArray(headers) ? (
              <div className="table-wrapper-modern">
                <table className="data-table-modern">
                  <thead>
                    <tr>
                      {headers.map((header) => {
                        const columnType = columnTypes?.[header] || "unknown";
                        const isHighNull = nullPercentages?.[header] > 20;
                        const isImputed = selectedColumnsImp?.includes(header);
                        return (
                          <th
                            key={header}
                            className={`
                    ${isHighNull ? "highlight-column" : ""}
                    ${isImputed ? "imputed-column" : ""}
                    ${columnType === "categorical" ? "categorical-column" : ""}
                    ${columnType === "numeric" ? "numeric-column" : ""}
                  `}
                          >
                            {header}
                            {isHighNull && (
                              <span className="null-percentage">
                                ({nullPercentages?.[header]?.toFixed(1)}% null)
                              </span>
                            )}
                            {isImputed && (
                              <span className="imputed-badge">Imputed</span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => {
                      const hasNulls = Object.values(row || {}).some(
                        (val) =>
                          val === null || val === undefined || val === "N/A"
                      );

                      return (
                        <tr
                          key={rowIndex}
                          className={hasNulls ? "highlight-row" : ""}
                        >
                          {headers.map((column) => {
                            const isNull =
                              row[column] === null ||
                              row[column] === undefined ||
                              row[column] === "N/A";
                            const value = row[column];
                            return (
                              <td
                                key={column}
                                className={`
                        ${isNull ? "highlight-cell" : ""}
                        ${
                          selectedColumnsImp?.includes(column)
                            ? "imputed-cell"
                            : ""
                        }
                        ${
                          categoricalColumns?.includes(column)
                            ? "categorical-cell"
                            : ""
                        }
                      `}
                              >
                                {isNull
                                  ? "N/A"
                                  : normalizedColumns?.includes(column) &&
                                    typeof value === "number"
                                  ? value.toFixed(4)
                                  : value}
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
        </div>
      </main>
      <div className="operations-history">
        <h3>Opérations récentes</h3>
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
                operation: "Full Operations History",
                details: "Complete log of all operations performed",
                stats: { operations: operationReports },
                timestamp: new Date().toISOString(),
              });
              setShowReportModal(true);
            }}
          >
            View All ({operationReports.length})
          </button>
        )}
      </div>
      {showReportModal && (
        <ReportModal
          report={currentReport}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showRemoveColumnPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowRemoveColumnPopup(false)}
        >
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h2>Supprimer des colonnes</h2>

            <button
              className="btn small-btn"
              onClick={handleSelectFullyNullColumns}
            >
              Sélectionner toutes les colonnes entièrement nulles
            </button>

            <div className="column-list-scroll">
              {filteredData.length > 0 &&
                Object.keys(filteredData[0]).map((col) => {
                  const nullCount = filteredData.filter(
                    (row) => row[col] == null || row[col] === ""
                  ).length;
                  return (
                    <label key={col} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={columnsToRemove.includes(col)}
                        onChange={() => handleToggleColumnToRemove(col)}
                      />
                      {col}
                      {nullCount > 0 && (
                        <span className="null-indicator">
                          ⚠️ {nullCount} null
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>

            <div className="popup-actions">
              <button
                className="btn btn-primary"
                onClick={handleRemoveSelectedColumns}
              >
                Supprimer les colonnes sélectionnées
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowRemoveColumnPopup(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddColumnPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowAddColumnPopup(false)}
        >
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h2>Ajouter une colonne</h2>
            <input
              type="text"
              placeholder="Nom de la colonne"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="input-modern"
            />

            <label className="input-label">Méthode de génération</label>
            <select
              className="input-modern"
              value={generationMode}
              onChange={(e) => setGenerationMode(e.target.value)}
            >
              <option value="manual">Valeur personnalisée</option>
              <option value="auto-increment">Auto-increment (1,2,3...)</option>
              <option value="uuid">UUID (identifiant unique)</option>
              <option value="date">Date/Heure actuelle</option>
            </select>

            {generationMode === "manual" && (
              <input
                type="text"
                placeholder="Valeur par défaut"
                value={defaultColumnValue}
                onChange={(e) => setDefaultColumnValue(e.target.value)}
                className="input-modern"
              />
            )}

            <div className="popup-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddColumn}
                disabled={isAddingColumn}
              >
                {isAddingColumn ? "Ajout..." : "Confirmer"}
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowAddColumnPopup(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processing;
