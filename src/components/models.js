import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase,faPlay, faFileAlt,faLightbulb,  faCheck,  faHistory ,faRocket} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './models.css';
import Sidebar from './Sidebar';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './sidebar.css'; // Assurez-vous que le chemin est correct
import FeatureImportanceChart from './FeatureImportanceChart'; // Assurez-vous que le chemin est correct
import { useLocation } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';




const Models = () => {
  const navigate = useNavigate();
  const { id,targetFeature,fileData } = useParams();
  const [data, setData] = useState([]);
  const [taskType, setTaskType] = useState('');
  const [trainingSetSize, setTrainingSetSize] = useState(60);
  const [validationSetSize, setValidationSetSize] = useState(20);
  const [testSetSize, setTestSetSize] = useState(20);
  const [error, setError] = useState(null);
  const location = useLocation(); // Pour accéder à l'URL et ses paramètres
  const [crossValidationType, setCrossValidationType] = useState('division'); // État pour les boutons radio
  const [kSets, setKSets] = useState(5);
  const[models,setModels]=useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Gérer l'état du dropdown
  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
  const [loading, setLoading] = useState(false);


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  

  const classificationModels = [
    'Random Forest',
    'Gradient Boosting',
    'Logistic Regression',
    'LightGBM',
    'XGBoost',
    'Decision Tree',
    'Support Vector Machine',
    'KNN',
    'Extra Random Trees',
    'Single Layer Perceptron'
  ];

  const regressionModels = [
    'Random Forest',
    'Gradient Boosting',
    'LightGBM',
    'XGBoost',
    'Decision Tree',
    'Support Vector Machine',
    'Stochastic Gradient Descent',
    'KNN',
    'Extra Random Trees',
    'Single Layer Perceptron',
    'Lasso Path'
  ];

  const metrics = [
    'Accuracy',
    'Precision',
    'Recall',
    'F1 Score',
    'ROC AUC',
    'Mean Absolute Error',
    'Mean Squared Error',
    'R² Score'
  ];

  // Métriques pour Classification
const classificationMetrics = metrics.filter(metric =>
  ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC'].includes(metric)
);

// Métriques pour Régression
const regressionMetrics = metrics.filter(metric =>
  ['Mean Absolute Error', 'Mean Squared Error', 'R² Score'].includes(metric)
);

  useEffect(() => {
  // 1. Essayer de charger depuis l'URL
  const loadFromURL = () => {
    const urlParams = new URLSearchParams(location.search);
    const encodedFiltdate = urlParams.get('filtdate');
    
    if (encodedFiltdate) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(encodedFiltdate));
        setData(decodedData);
        console.log("Données chargées depuis URL", decodedData);
        return true;
      } catch (error) {
        console.error("Erreur décodage URL", error);
        return false;
      }
    }
    return false;
  };

  // 2. Essayer de charger depuis fileData
  const loadFromFileData = () => {
    if (fileData) {
      try {
        const parsedData = typeof fileData === 'string' ? JSON.parse(fileData) : fileData;
        setData(parsedData);
        console.log("Données chargées depuis fileData", parsedData);
        return true;
      } catch (e) {
        console.error("Erreur parsing fileData", e);
        return false;
      }
    }
    return false;
  };

  // 3. Essayer de charger depuis le localStorage
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(`projectData_${id}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setData(parsedData);
        console.log("Données chargées depuis localStorage", parsedData);
        return true;
      } catch (e) {
        console.error("Erreur parsing localStorage", e);
        return false;
      }
    }
    return false;
  };

  // Tentative de chargement dans l'ordre de priorité
  const loaded = loadFromURL() || loadFromFileData() || loadFromLocalStorage();

  if (!loaded) {
    alert("Données manquantes. Redirection vers la page de traitement...");
    navigate(`/processing/${id}/${targetFeature}`);
  }

  if (data.length > 0 && targetFeature) {
    const targetValues = data.map(row => row[targetFeature]);
    const inferredTask = detectTaskType(targetValues);
    setTaskType(inferredTask);
    console.log("🔍 Task type détecté :", inferredTask);
  }


}, [id, targetFeature, location.search]); // fileData retiré des dépendances






  const handleProfileClick = () => navigate('/profile');
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  /*const handleTest = () => navigate(`/test/${id}/${selectedModel}`);*/
  const handleHistorique=()=>{navigate(`/historique/${id}/${targetFeature}`)}
  // Gestion de la sélection des modèles
  const handleModelSelection = (model) => {
    if (models.includes(model)) {
      // Supprime le modèle si déjà sélectionné
      setModels(models.filter(m => m !== model));
    } else {
      // Ajoute le modèle si non sélectionné
      setModels([...models, model]);
    }
  };

  const handleMetricSelection = (metric) => {
    setSelectedMetrics(prevMetrics => {
      if (prevMetrics.includes(metric)) {
        // Désélectionner la métrique
        return prevMetrics.filter(m => m !== metric);
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
    if (!isNaN(newKSets) && newKSets > 0) { // Validation basique
      setKSets(newKSets);
    }
  };

  const handleSubmit = async () => {
  // Vérification que des modèles sont sélectionnés
  if (models.length === 0) {
    alert("Veuillez sélectionner au moins un modèle");
    return;
  }
  
  // Vérification que des métriques sont sélectionnées
  if (selectedMetrics.length === 0) {
    alert("Veuillez sélectionner au moins une métrique");
    return;
  }

  // Dans votre handleSubmit, vérifiez que data n'est pas vide
  if (!data || data.length === 0) {
    alert("Aucune donnée à traiter !");
    return;
  }

   if (!data || !Array.isArray(data) || data.length === 0) {
    alert("Données corrompues. Veuillez recharger les données.");
    console.error("Data invalide:", {
      type: typeof data,
      length: data?.length,
      sample: data?.slice(0, 3)
    });
    return;
  }

  
  setLoading(true); // ⏳ juste avant l’appel
  try {
    const payload = {
  model: models,
  targ: targetFeature,
  metrics: selectedMetrics,
  data: data,
  task: taskType,
  method: crossValidationType // 'kfold' ou 'division'
};

if (crossValidationType === 'kfold') {
  payload.k = kSets;
} else {
  payload.trainset = trainingSetSize;
  payload.valtest = validationSetSize;
  payload.testset = testSetSize;
}

const response = await axios.post(`http://localhost:5000/train/${id}`, payload, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  withCredentials: true
});

    
    localStorage.setItem('modelResult', JSON.stringify(response.data));
    setError(null);
    navigate(`/resultat/${id}`);
  } catch (error) {
    alert('Erreur lors de l\'entraînement du modèle: ' + error.message);
    console.error('Error during model training:', error);
  } finally {
    setLoading(false); // ✅ désactive après réponse ou erreur
  }
};

  const getRemainingSize = (currentSetSize) => Math.max(0, 100 - currentSetSize);

  // Fonction pour gérer le changement de la taille du training set
  const handleTrainingSetSizeChange = (e) => {
    const newTrainingSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(validationSetSize + testSetSize));
    setTrainingSetSize(newTrainingSetSize);
    setValidationSetSize(Math.min(validationSetSize, 100 - newTrainingSetSize - testSetSize));
  };

  // Fonction pour gérer le changement de la taille du validation set
  const handleValidationSetSizeChange = (e) => {
    const newValidationSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(trainingSetSize + testSetSize));
    setValidationSetSize(newValidationSetSize);
    setTestSetSize(Math.min(testSetSize, 100 - trainingSetSize - newValidationSetSize));
  };

  // Fonction pour gérer le changement de la taille du test set
  const handleTestSetSizeChange = (e) => {
    const newTestSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(trainingSetSize + validationSetSize));
    setTestSetSize(newTestSetSize);
    setValidationSetSize(Math.min(validationSetSize, 100 - trainingSetSize - newTestSetSize));
  };


  const availableModels = taskType === 'classification' ? classificationModels : (taskType === 'regression' ? regressionModels : []);
  const availableMetrics = taskType === 'classification' ? classificationMetrics : (taskType === 'regression' ? regressionMetrics : []);

  const lineStyle = {
    width: '100%',      // largeur de la ligne
    height: '1px',      // épaisseur de la ligne
    backgroundColor: '#a9aeb4', // couleur de la ligne
    margin: '5px 0'    // espacement autour de la ligne
};

const detectTaskType = (targetValues) => {
  const uniqueValues = [...new Set(targetValues)];
  const uniqueCount = uniqueValues.length;

  if (typeof targetValues[0] === 'string' || uniqueCount <= 10) {
    return 'classification';
  }
  return 'regression';
};

useEffect(() => {
  if (taskType === 'classification') {
    setModels(['Random Forest', 'Logistic Regression']); // Suggestion de base
  } else if (taskType === 'regression') {
    setModels(['Random Forest', 'Gradient Boosting']);
  }
}, [taskType]);

useEffect(() => {
  if (taskType === 'classification') {
    setSelectedMetrics(['Accuracy', 'F1 Score']);
  } else if (taskType === 'regression') {
    setSelectedMetrics(['Mean Absolute Error', 'R² Score']);
  }
}, [taskType]);

const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

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
        {loading && <LoadingOverlay message={"Training models...\nAnalyzing performance metrics"} />}

        <header className="page-header">
          <h1>Model Training Studio</h1>
          <p className="header-subtitle">Configure and train machine learning models with precision</p>
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
                <option value="" disabled>Select task type</option>
                <option value="classification">Classification</option>
                <option value="regression">Regression</option>
              </select>
            </div>

            {taskType && (
              <div className="auto-suggestions">
                <div className="suggestion-header">
                  <FontAwesomeIcon icon={faLightbulb} />
                  <span>Smart Suggestions</span>
                </div>
                <ul>
                  <li><strong>Recommended models:</strong> {taskType === 'classification' ? 'Random Forest, XGBoost' : 'Gradient Boosting, Neural Network'}</li>
                  <li><strong>Key metrics:</strong> {taskType === 'classification' ? 'Accuracy, F1 Score' : 'RMSE, R²'}</li>
                </ul>
              </div>
            )}
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
                <FontAwesomeIcon icon={isDropdownOpen ? faChevronLeft : faChevronRight} />
              </button>

              {isDropdownOpen && (
                <div className="model-dropdown">
                  {availableModels.map(model => (
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
              {models.map(model => (
                <span key={model} className="model-tag">
                  {model}
                  <button onClick={() => handleModelSelection(model)}>×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Section Paramètres */}
          <section className="params-section glass-card">
            <div className="section-header">
              <FontAwesomeIcon icon={faChartLine} className="section-icon" />
              <h2>Training Parameters</h2>
            </div>

            <div className="params-tabs">
              <button 
                className={`tab ${crossValidationType === 'division' ? 'active' : ''}`}
                onClick={() => setCrossValidationType('division')}
              >
                Train/Val/Test Split
              </button>
              <button 
                className={`tab ${crossValidationType === 'kfold' ? 'active' : ''}`}
                onClick={() => setCrossValidationType('kfold')}
              >
                K-Fold CV
              </button>
            </div>

            {crossValidationType === 'division' ? (
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
                <FontAwesomeIcon icon={isDropdownOpen1 ? faChevronLeft : faChevronRight} />
              </button>

              {isDropdownOpen1 && (
                <div className="metrics-dropdown">
                  {availableMetrics.map(metric => (
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
              {selectedMetrics.map(metric => (
                <span key={metric} className="metric-tag">
                  {metric}
                  <button onClick={() => handleMetricSelection(metric)}>×</button>
                </span>
              ))}
            </div>
          </section>

          {/* Bouton d'action */}
          <div className="action-section">
            <button 
              onClick={handleSubmit} 
              className="train-button"
              disabled={models.length === 0 || selectedMetrics.length === 0}
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Train Models</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
