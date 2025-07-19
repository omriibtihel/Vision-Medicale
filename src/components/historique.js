import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import {faChevronLeft , faChevronRight  ,faCheckCircle , faListOl         } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import './sidebar.css';
import Sidebar from './Sidebar';
import { 
  faUser, faChartLine, faCog, faBrain, 
  faDatabase, faFileAlt, faHistory, faRocket,
  faSearch, faFilter, faDownload, faEye, faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import './Historique.css';

const Historique = () => {
  const navigate = useNavigate();
  const { id, targetFeature: initialTargetFeature } = useParams();
  const [hist, setHist] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [targetFeature, setTargetFeature] = useState(initialTargetFeature || '');
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);


  const handleProfileClick = () => navigate('/profile');
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);
  const filteredData = fileData ? fileData.filter(row => row[targetFeature] !== undefined) : [];

  // Fonction pour récupérer la target feature depuis le backend
  const fetchTargetFeature = async () => {
    setLoadingTarget(true);
    const token = localStorage.getItem('token');
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
      console.error('Error fetching target feature:', error);
    } finally {
      setLoadingTarget(false);
    }
    return null;
  };

  // Vérifie que la target feature existe dans les données
const validateTargetFeature = (data) => {
  if (!data) return false;

  let availableFeatures = [];

  if (Array.isArray(data) && data.length > 0) {
    availableFeatures = Object.keys(data[0]);
  } else if (typeof data === 'object') {
    availableFeatures = Object.keys(data);
  }

  if (!targetFeature || !availableFeatures.includes(targetFeature)) {
    setError(`La target feature "${targetFeature}" n'existe pas dans ces données.`);
    return false;
  }

  return true;
};


  // Chargement de l'historique
  const importhist = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/historique/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      if (Array.isArray(response.data)) {
        setHist(response.data.map(item => ({
          ...item,
          created_at: item.created_at || new Date().toISOString()
        })));
      }
    } catch (error) {
      setError(`Erreur: ${error.response?.data?.error || error.message}`);
    }
  };

  // Chargement des données d'un fichier spécifique
const loadFileData = async (fileId) => {
  if (!fileId) return;

  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/fichier/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    let rawData = response.data?.data || response.data;

    // Parse si c'est une string
    let parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

    // ⚠️ Extraire le champ "data" si présent
    if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
      parsedData = parsedData.data;
    }

    // Si ce n'est toujours pas un tableau, on le met dans un tableau
    if (!Array.isArray(parsedData)) {
      parsedData = [parsedData];
    }

    // Récupération des features disponibles
    let availableFeatures = [];
    if (parsedData.length > 0 && typeof parsedData[0] === 'object') {
      availableFeatures = Object.keys(parsedData[0]);
    }

    console.log("✅ Clés détectées dans les données :", availableFeatures);

    // Vérification de la target feature
    if (availableFeatures.length > 0) {
      if (!availableFeatures.includes(targetFeature)) {
        const fetchedTarget = await fetchTargetFeature();

        if (fetchedTarget && availableFeatures.includes(fetchedTarget)) {
          setTargetFeature(fetchedTarget);
        } else {
          setError(`La target feature "${fetchedTarget || targetFeature}" est introuvable dans les données.`);
          return;
        }
      }
    }

    setFileData(parsedData);

  } catch (error) {
    setError(`Erreur de chargement: ${error.message}`);
    console.error("❌ Erreur loadFileData:", error);
  }
};




  // Tri des colonnes
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Formatage des valeurs
  const formatValue = (value) => {
    if (value === null || value === undefined) return <span className="null-value">NULL</span>;
    if (typeof value === 'object') return <span className="json-value">[OBJET]</span>;
    return value.toString();
  };

  
  // Navigation avec vérification de la target feature
const navigateTo = (path) => {
  if (!fileData || !selectedFile) {
    setError("Sélectionnez des données d'abord");
    return;
  }

  if (!validateTargetFeature(fileData)) return;

navigate(`${path}/${id}/${targetFeature}`, {
  state: {
    isFromHistory: true,
    fileData,
    targetFeature,
    versionId: selectedFile.id
  }
});



};




  useEffect(() => {
    const initialize = async () => {
      await importhist();
      
      // Si pas de target feature, on essaie de la récupérer
      if (!targetFeature) {
        await fetchTargetFeature();
      }
    };
    
    initialize();
  }, [id]);

  useEffect(() => {
    if (selectedFile) loadFileData(selectedFile.id);
  }, [selectedFile, targetFeature]);

  // Filtrage et tri
  const filteredHistory = hist.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modification?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });




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
      <div className="historique-content">

        <header className="content-header">
          <h1>
            <FontAwesomeIcon icon={faHistory} />
            Historique des Versions
          </h1>
          
          <div className="target-feature-display">
            <span className="target-label">Target Feature:</span>
            {loadingTarget ? (
              <FontAwesomeIcon icon={faSyncAlt} spin />
            ) : (
              <>
                <span className="target-value">{targetFeature || 'Non définie'}</span>
                {error && error.includes('target feature') && (
                  <button 
                    onClick={fetchTargetFeature}
                    className="refresh-target-btn"
                    title="Rafraîchir la target feature"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                  </button>
                )}
              </>
            )}
          </div>
          
          <p className="subtitle">Suivi des modifications de vos données</p>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* Barre de recherche et filtres */}
        <div className="controls-bar">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Rechercher une version..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-options">
            <button className="filter-btn">
              <FontAwesomeIcon icon={faFilter} />
              Filtrer
            </button>
          </div>
        </div>

        {/* Liste des versions */}
        <div className="version-list">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((file) => (
                <div key={file.id} className={`version-card ${selectedFile?.id === file.id ? 'selected' : ''}`}>
                  <div className="card-header">
                    <h3>{file.name}</h3>
                    <span className="version-date">
                      {new Date(file.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <div className="modification-details">
                      {file.modification.split('|').map((mod, i) => {
                        // Extraire les colonnes entre parenthèses si présentes
                        const [mainText, columnsText] = mod.split('(Colonnes:');
                        const columns = columnsText ? columnsText.replace(')', '').trim() : null;
                        
                        return (
                          <div key={i} className="modification-step">
                            <div className="step-main">
                              <FontAwesomeIcon icon={faCheckCircle} className="step-icon" />
                              <span>{mainText.trim()}</span>
                            </div>
                            {columns && (
                              <div className="step-columns">
                                <FontAwesomeIcon icon={faListOl} className="column-icon" />
                                <span>{columns}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="card-actions">
                      <button className="action-btn view-btn" onClick={() => setSelectedFile(file)}>
                        <FontAwesomeIcon icon={faEye} /> Voir
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={async () => {
                          const confirm = window.confirm("Voulez-vous vraiment supprimer cette version ?");
                          if (confirm) {
                            try {
                              const token = localStorage.getItem('token');
                              await axios.delete(`http://localhost:5000/delete-version/${file.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              importhist(); // recharger la liste
                            } catch (err) {
                              alert("Erreur lors de la suppression");
                            }
                          }
                        }}
                      >
                        🗑️ Supprimer
                      </button>
                      <button className="action-btn download-btn">
                        <FontAwesomeIcon icon={faDownload} /> Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Aucune version historique trouvée</p>
              </div>
            )}
          </div>

        {/* Aperçu des données */}
        {selectedFile && fileData && (
          <section className="data-preview">
            <div className="preview-header">
              <h2>
                Aperçu des données: <span>{selectedFile.name}</span>
              </h2>
              
              <div className="preview-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => navigateTo('/processing')}
                  disabled={!targetFeature}
                >
                  <FontAwesomeIcon icon={faCog} /> Traiter ces données
                </button>

                
                <button 
                  className="action-btn secondary"
                  onClick={() => navigateTo('/models')}
                  disabled={!targetFeature}
                >
                  <FontAwesomeIcon icon={faBrain} /> Modéliser
                </button>
              </div>
            </div>
            
            {/* Tableau de données */}
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(fileData[0] || {}).map((key) => (
                      <th 
                        key={key}
                        onClick={() => requestSort(key)}
                        className={key === targetFeature ? 'target-feature' : ''}
                      >
                        {key}
                        {key === targetFeature && <span className="target-badge">Target</span>}
                        {sortConfig.key === key && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {fileData.slice(0, 50).map((row, index) => (
                    <tr key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <td 
                          key={key}
                          className={`
                            ${value === null ? 'null-cell' : ''}
                            ${key === targetFeature ? 'target-cell' : ''}
                          `}
                        >
                          {formatValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="table-footer">
                <p>Affiche 1-{Math.min(fileData.length, 50)} sur {fileData.length} lignes</p>
                {fileData.length > 50 && (
                  <button className="load-more">Charger plus...</button>
                )}
              </div>
            </div>
          </section>
        )}
        </div>
    </div>
  );
};

export default Historique;