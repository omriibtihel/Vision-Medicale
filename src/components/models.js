import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBoxArchive,
  faChartLine,
  faCog,
  faBrain,
  faDatabase,
  faPlay,
  faFileAlt,
  faLightbulb,
  faCheck,
  faHistory,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./models.css";
import Sidebar from "./Sidebar";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "./sidebar.css"; // Assurez-vous que le chemin est correct
import FeatureImportanceChart from "./FeatureImportanceChart"; // Assurez-vous que le chemin est correct
import { useLocation } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";

const Models = () => {
  const navigate = useNavigate();
  const { id, targetFeature, fileData } = useParams();
  const [data, setData] = useState([]);
  const [taskType, setTaskType] = useState("");
  const [trainingSetSize, setTrainingSetSize] = useState(70);
  const [validationSetSize, setValidationSetSize] = useState(0);
  const [testSetSize, setTestSetSize] = useState(30);
  const [error, setError] = useState(null);
  const location = useLocation(); // Pour accéder à l'URL et ses paramètres
  const [crossValidationType, setCrossValidationType] = useState("division"); // État pour les boutons radio
  const [kSets, setKSets] = useState(5);
  const [models, setModels] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Gérer l'état du dropdown
  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useGridSearch, setUseGridSearch] = useState(false);
  const activeVersionId = location.state?.versionId || null;
  const [savedModels, setSavedModels] = useState([]);
  const [useSmote, setUseSmote] = useState(false);
  const [customCode, setCustomCode] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const classificationModels = [
    "Random Forest",
    "Gradient Boosting",
    "Logistic Regression",
    "LightGBM",
    "XGBoost",
    "Decision Tree",
    "Support Vector Machine",
    "KNN",
    "Extra Random Trees",
    "Single Layer Perceptron",
  ];

  const regressionModels = [
    "Random Forest",
    "Gradient Boosting",
    "LightGBM",
    "XGBoost",
    "Decision Tree",
    "Support Vector Machine",
    "Stochastic Gradient Descent",
    "KNN",
    "Extra Random Trees",
    "Single Layer Perceptron",
    "Lasso Path",
  ];

  const metrics = [
    "Accuracy",
    "Precision",
    "Recall",
    "F1 Score",
    "ROC AUC",
    "Mean Absolute Error",
    "Mean Squared Error",
    "R² Score",
  ];

  // Métriques pour Classification
  const classificationMetrics = metrics.filter((metric) =>
    ["Accuracy", "Precision", "Recall", "F1 Score", "ROC AUC"].includes(metric)
  );

  // Métriques pour Régression
  const regressionMetrics = metrics.filter((metric) =>
    ["R² Score", "Mean Absolute Error", "Mean Squared Error"].includes(metric)
  );

  useEffect(() => {
    const loadFromURL = () => {
      const urlParams = new URLSearchParams(location.search);
      const encodedFiltdate = urlParams.get("filtdate");

      if (encodedFiltdate) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(encodedFiltdate));
          setData(decodedData);
          console.log("✅ Données chargées depuis URL", decodedData);
          return true;
        } catch (error) {
          console.error("❌ Erreur décodage URL", error);
          return false;
        }
      }
      return false;
    };

    const loadFromFileData = () => {
      if (location.state?.fileData) {
        try {
          const parsedData =
            typeof location.state.fileData === "string"
              ? JSON.parse(location.state.fileData)
              : location.state.fileData;
          setData(parsedData);
          console.log("✅ Données chargées depuis state.fileData", parsedData);
          return true;
        } catch (e) {
          console.error("❌ Erreur parsing fileData", e);
          return false;
        }
      }
      return false;
    };

    const loadFromLocalStorage = () => {
      const savedData = localStorage.getItem(`projectData_${id}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setData(parsedData);
          console.log("✅ Données chargées depuis localStorage", parsedData);
          return true;
        } catch (e) {
          console.error("❌ Erreur parsing localStorage", e);
          return false;
        }
      }
      return false;
    };

    const loaded =
      loadFromURL() || loadFromFileData() || loadFromLocalStorage();

    if (!loaded) {
      alert("Données manquantes. Redirection vers la page de traitement...");
      navigate(`/processing/${id}/${targetFeature}`);
    }

    if (data.length > 0 && targetFeature) {
      const targetValues = data.map((row) => row[targetFeature]);
      const inferredTask = detectTaskType(targetValues);
      setTaskType(inferredTask);
      console.log("🔍 Task type détecté :", inferredTask);
    }
  }, [id, targetFeature, location.search, location.state]); // ✅ ajoute location.state

  useEffect(() => {
    if (activeVersionId) {
      const token = localStorage.getItem("token");

      fetch(`http://localhost:5000/models/${id}/version/${activeVersionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to fetch saved models");
          }
          return res.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error("Invalid data format received");
          }
          setSavedModels(data);
        })
        .catch((err) => {
          console.error("❌ Error fetching saved models:", err);
          setSavedModels([]);
          // Optionnel : afficher un message à l'utilisateur
        });
    }
  }, [id, activeVersionId]);

  const handleProfileClick = () => navigate("/profile");
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () =>
    navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () =>
    navigate(`/description/${id}/${targetFeature}`);
  /*const handleTest = () => navigate(`/test/${id}/${selectedModel}`);*/
  const handleHistorique = () => {
    navigate(`/historique/${id}/${targetFeature}`);
  };
  // Gestion de la sélection des modèles
  const handleModelSelection = (model) => {
    if (models.includes(model)) {
      // Supprime le modèle si déjà sélectionné
      setModels(models.filter((m) => m !== model));
    } else {
      // Ajoute le modèle si non sélectionné
      setModels([...models, model]);
    }
  };

  const handleMetricSelection = (metric) => {
    setSelectedMetrics((prevMetrics) => {
      if (prevMetrics.includes(metric)) {
        // Désélectionner la métrique
        return prevMetrics.filter((m) => m !== metric);
      } else {
        // Sélectionner la métrique
        return [...prevMetrics, metric];
      }
    });
  };
  const handleK = (e) => {
    // Extraire la nouvelle valeur de l'input
    const newKSets = parseInt(e.target.value, 10);

    // Mettre à jour l'état avec la nouvelle valeur
    if (!isNaN(newKSets) && newKSets > 0) {
      // Validation basique
      setKSets(newKSets);
    }
  };

  const handleSubmit = async () => {
    if (models.length === 0 && customCode.trim() === "") {
      alert(
        "Veuillez sélectionner au moins un modèle ou fournir un code personnalisé"
      );
      return;
    }

    if (selectedMetrics.length === 0) {
      alert("Veuillez sélectionner au moins une métrique");
      return;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      alert("Aucune donnée à traiter ou données corrompues !");
      console.error("Data invalide:", {
        type: typeof data,
        length: data?.length,
        sample: data?.slice(0, 3),
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        model: models,
        targ: targetFeature,
        metrics: selectedMetrics,
        data: data,
        task: taskType,
        method: crossValidationType,
        use_grid_search: useGridSearch,
        use_smote: useSmote,
        custom_code: customCode,
        versionId: activeVersionId,
      };
      console.log("Payload envoyé au backend :", payload);

      if (crossValidationType === "kfold") {
        payload.k = kSets;
      } else {
        payload.trainset = trainingSetSize;
        payload.valtest = validationSetSize;
        payload.testset = testSetSize;
      }

      const response = await axios.post(
        `http://localhost:5000/train/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );

      const resultData = response.data;

      // ✅ Vérifie s'il y a des erreurs dans certains modèles
      const failedModels = resultData.results?.filter((r) => r.error);

      if (failedModels.length > 0) {
        setError(failedModels); // on les affichera dans le JSX
      } else {
        setError(null);
        localStorage.setItem("modelResult", JSON.stringify(resultData));
        navigate(`/resultat/${id}`);
      }
    } catch (error) {
      alert("Erreur lors de l'entraînement du modèle : " + error.message);
      console.error("Erreur d'entraînement :", error);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingSize = (currentSetSize) =>
    Math.max(0, 100 - currentSetSize);

  // Fonction pour gérer le changement de la taille du training set
  const handleTrainingSetSizeChange = (e) => {
    const newTrainingSetSize = Math.min(
      parseInt(e.target.value, 10),
      getRemainingSize(validationSetSize + testSetSize)
    );
    setTrainingSetSize(newTrainingSetSize);
    setValidationSetSize(
      Math.min(validationSetSize, 100 - newTrainingSetSize - testSetSize)
    );
  };

  // Fonction pour gérer le changement de la taille du validation set
  const handleValidationSetSizeChange = (e) => {
    const newValidationSetSize = Math.min(
      parseInt(e.target.value, 10),
      getRemainingSize(trainingSetSize + testSetSize)
    );
    setValidationSetSize(newValidationSetSize);
    setTestSetSize(
      Math.min(testSetSize, 100 - trainingSetSize - newValidationSetSize)
    );
  };

  // Fonction pour gérer le changement de la taille du test set
  const handleTestSetSizeChange = (e) => {
    const newTestSetSize = Math.min(
      parseInt(e.target.value, 10),
      getRemainingSize(trainingSetSize + validationSetSize)
    );
    setTestSetSize(newTestSetSize);
    setValidationSetSize(
      Math.min(validationSetSize, 100 - trainingSetSize - newTestSetSize)
    );
  };

  const availableModels =
    taskType === "classification"
      ? classificationModels
      : taskType === "regression"
      ? regressionModels
      : [];
  const availableMetrics =
    taskType === "classification"
      ? classificationMetrics
      : taskType === "regression"
      ? regressionMetrics
      : [];

  const lineStyle = {
    width: "100%", // largeur de la ligne
    height: "1px", // épaisseur de la ligne
    backgroundColor: "#a9aeb4", // couleur de la ligne
    margin: "5px 0", // espacement autour de la ligne
  };

  const detectTaskType = (targetValues) => {
    const uniqueValues = [...new Set(targetValues)];
    const uniqueCount = uniqueValues.length;

    if (typeof targetValues[0] === "string" || uniqueCount <= 10) {
      return "classification";
    }
    return "regression";
  };



  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteModel = async (modelId) => {
    const confirmed = window.confirm(
      "❗ Voulez-vous vraiment supprimer ce modèle ?"
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/models/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Met à jour l'affichage en supprimant localement
      setSavedModels((prev) => prev.filter((m) => m.id !== modelId));
    } catch (err) {
      alert("Erreur lors de la suppression du modèle");
      console.error("Erreur suppression modèle :", err);
    }
  };

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
      {/* Contenu principal */}
      <div className="content-wrapper">
        {loading && (
          <LoadingOverlay
            message={"Training models...\nAnalyzing performance metrics"}
          />
        )}

        <header className="page-header">
          <h1>Model Training Studio</h1>
          <p className="header-subtitle">
            Configure and train machine learning models with precision
          </p>
          {error && error.length > 0 && (
            <div className="train-errors">
              <h4>🚨 Modèles échoués</h4>
              <ul>
                {error.map((e, i) => (
                  <li key={i}>
                    <strong>{e.model}</strong> — {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="header-divider"></div>
        </header>

        <div className="content-grid">
          {/* Section Configuration */}
          <section className="config-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faCog} className="section-icon" />
              <h2>Configuration</h2>
            </div>

            <div className="config-item">
              <label className="config-label">Target Feature</label>
              <div className="feature-display">{targetFeature}</div>
            </div>

            <div className="config-item">
              <label className="config-label">Task Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="elegant-select"
              >
                <option value="" disabled>
                  Select task type
                </option>
                <option value="classification">Classification</option>
                <option value="regression">Regression</option>
              </select>
            </div>

          </section>

          {/* Section Modèles */}
          <section className="models-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faBrain} className="section-icon" />
              <h2>Model Selection</h2>
            </div>

            <div className="dropdown-container">
              <button
                className="dropdown-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Select Models ({models.length})</span>
                <FontAwesomeIcon
                  icon={isDropdownOpen ? faChevronLeft : faChevronRight}
                />
              </button>

              {isDropdownOpen && (
                <div className="model-dropdown">
                  {availableModels.map((model) => (
                    <label key={model} className="model-option">
                      <input
                        type="checkbox"
                        checked={models.includes(model)}
                        onChange={() => handleModelSelection(model)}
                      />
                      <span className="checkmark"></span>
                      {model}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="selected-models">
              {models.map((model) => (
                <span key={model} className="model-tag">
                  {model}
                  <button onClick={() => handleModelSelection(model)}>×</button>
                </span>
              ))}
            </div>
            <div className="gridsearch-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useGridSearch}
                  onChange={() => setUseGridSearch(!useGridSearch)}
                />
                🔍 Optimiser les hyperparamètres (Grid Search)
              </label>
            </div>

            <div className="gridsearch-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={useSmote}
                  onChange={() => setUseSmote(!useSmote)}
                  disabled={taskType !== "classification"} // SMOTE que pour classification
                />
                🧪 Appliquer SMOTE (équilibrage des classes)
              </label>
              <p className="toggle-description">
                Génère des exemples synthétiques pour équilibrer les classes
                dans les jeux de données déséquilibrés.
              </p>
            </div>
          </section>
          <section className="custom-model-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faFileAlt} className="section-icon" />
              <h2>Custom Model Code</h2>
            </div>
            <p className="custom-model-description">
              Vous pouvez insérer ici votre propre code Python pour définir un
              modèle personnalisé.
            </p>
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              rows={10}
              placeholder={`# Exemple:\nfrom sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100)`}
              className="custom-code-editor"
            />
          </section>

          {/* Section Paramètres */}
          <section className="params-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faChartLine} className="section-icon" />
              <h2>Training Parameters</h2>
            </div>

            <div className="params-tabs">
              <button
                className={`tab ${
                  crossValidationType === "division" ? "active" : ""
                }`}
                onClick={() => setCrossValidationType("division")}
              >
                Train/Val/Test Split
              </button>
              <button
                className={`tab ${
                  crossValidationType === "kfold" ? "active" : ""
                }`}
                onClick={() => setCrossValidationType("kfold")}
              >
                K-Fold CV
              </button>
            </div>

            {crossValidationType === "division" ? (
              <div className="split-params">
                <div className="param-group">
                  <label>Training Set</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={trainingSetSize}
                      onChange={handleTrainingSetSizeChange}
                    />
                    <span>{trainingSetSize}%</span>
                  </div>
                </div>

                <div className="param-group">
                  <label>Validation Set</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max={100 - trainingSetSize}
                      value={validationSetSize}
                      onChange={handleValidationSetSizeChange}
                    />
                    <span>{validationSetSize}%</span>
                  </div>
                </div>

                <div className="param-group">
                  <label>Test Set</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max={100 - trainingSetSize - validationSetSize}
                      value={testSetSize}
                      onChange={handleTestSetSizeChange}
                    />
                    <span>{testSetSize}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="kfold-params">
                <label>Number of Folds (K)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={kSets}
                  onChange={handleK}
                  className="k-input"
                />
              </div>
            )}
          </section>

          {/* Section Métriques */}
          <section className="metrics-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faCheck} className="section-icon" />
              <h2>Evaluation Metrics</h2>
            </div>

            <div className="dropdown-container">
              <button
                className="dropdown-toggle"
                onClick={() => setIsDropdownOpen1(!isDropdownOpen1)}
              >
                <span>Select Metrics ({selectedMetrics.length})</span>
                <FontAwesomeIcon
                  icon={isDropdownOpen1 ? faChevronLeft : faChevronRight}
                />
              </button>

              {isDropdownOpen1 && (
                <div className="metrics-dropdown">
                  {availableMetrics.map((metric) => (
                    <label key={metric} className="metric-option">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={() => handleMetricSelection(metric)}
                      />
                      <span className="checkmark"></span>
                      {metric}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="selected-metrics">
              {selectedMetrics.map((metric) => (
                <span key={metric} className="metric-tag">
                  {metric}
                  <button onClick={() => handleMetricSelection(metric)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Bouton d'action */}
          <div className="action-section">
            <button
              onClick={handleSubmit}
              className="train-button"
              disabled={
                (models.length === 0 && customCode.trim() === "") ||
                selectedMetrics.length === 0
              }
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Train Models</span>
            </button>
          </div>
        </div>

        {/* Section Modèles Sauvegardés */}
        {savedModels.length > 0 && (
          <section className="saved-models-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faBoxArchive} className="section-icon" />
              <h2>Model Repository</h2>
              <p className="subtitle">
                Previously trained models for this dataset version
              </p>
            </div>

            <div className="saved-models-grid">
              {savedModels.map((model) => {
                // ✅ Conversion sûre de featureimportance
                let parsedImportance;
                try {
                  parsedImportance =
                    typeof model.featureimportance === "string"
                      ? JSON.parse(model.featureimportance)
                      : model.featureimportance;
                } catch (e) {
                  console.error("Erreur de parsing de featureimportance :", e);
                  parsedImportance = {};
                }

                return (
                  <div key={model.id} className="model-card">
                    {/* En-tête modèle */}
                    <div className="model-header">
                      <h3>{model.modelname}</h3>
                      <span
                        className={`model-type-badge ${
                          model.RScore ? "regression" : "classification"
                        }`}
                      >
                        {model.RScore ? "Regression" : "Classification"}
                      </span>
                    </div>

                    {/* Infos générales */}
                    <div className="model-info">
                      <p>
                        <strong>Validation:</strong>{" "}
                        {model.k
                          ? `${model.k}-Fold`
                          : `${model.trainingset}% Train / ${model.testset}% Test`}
                      </p>
                      <p>
                        <strong>Dataset:</strong>{" "}
                        {model.file?.filename || "N/A"}
                      </p>
                    </div>

                    {/* Mini métriques */}
                    <div className="model-metrics-preview">
                      {model.Accuracy !== undefined && (
                        <div className="metric">
                          <span className="metric-label">Accuracy</span>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${model.Accuracy * 100}%` }}
                            />
                            <span className="metric-value">
                              {(model.Accuracy * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {model.RScore !== undefined && (
                        <div className="metric">
                          <span className="metric-label">R² Score</span>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${Math.max(0, model.RScore) * 100}%`,
                                backgroundColor:
                                  model.RScore > 0.7
                                    ? "#4ade80"
                                    : model.RScore > 0.4
                                    ? "#fbbf24"
                                    : "#f87171",
                              }}
                            />
                            <span className="metric-value">
                              {model.RScore.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      )}

                      {model.F1_Score !== undefined && (
                        <div className="metric">
                          <span className="metric-label">F1 Score</span>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${model.F1_Score * 100}%` }}
                            />
                            <span className="metric-value">
                              {(model.F1_Score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features les plus importantes */}
                    {parsedImportance &&
                      Object.keys(parsedImportance).length > 0 && (
                        <div className="feature-importance-preview">
                          <h4>Top Features</h4>
                          <div className="features-list">
                            {Object.entries(parsedImportance)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 3)
                              .map(([feature, importance]) => (
                                <div key={feature} className="feature-item">
                                  <span className="feature-name">
                                    {feature}
                                  </span>
                                  <span className="feature-value">
                                    {(importance * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="model-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() =>
                          navigate(`/resultat/${id}?modelId=${model.id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faChartLine} /> Details
                      </button>
                      <button
                        className="action-btn deploy-btn"
                        onClick={() =>
                          navigate(`/deployment/${id}?model=${model.id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faRocket} /> Deploy
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteModel(model.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Models;
