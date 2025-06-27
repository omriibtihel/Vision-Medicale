import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  faUser, faChartLine, faCog, faBrain, 
  faDatabase, faFileAlt, faHistory, faRocket,
  faSearch, faFilter, faDownload, faEye
} from '@fortawesome/free-solid-svg-icons';
import './Historique.css';

const Historique = () => {
  const navigate = useNavigate();
  const { id, targetFeature } = useParams();
  const [hist, setHist] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

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

      const rawData = response.data?.data || response.data;
      let parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      
      if (!Array.isArray(parsedData)) parsedData = [parsedData];
      
      setFileData(parsedData);
    } catch (error) {
      setError(`Erreur de chargement: ${error.message}`);
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

  // Navigation
  const navigateTo = (path) => {
    if (!fileData) {
      setError('Sélectionnez des données d\'abord');
      return;
    }
    const encodedData = encodeURIComponent(JSON.stringify(fileData));
    navigate(`${path}/${id}/${targetFeature}?filtdate=${encodedData}`);
  };

  useEffect(() => {
    importhist();
  }, [id]);

  useEffect(() => {
    if (selectedFile) loadFileData(selectedFile.id);
  }, [selectedFile]);

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

  return (
    <div className="historique-container">
      {/* Sidebar modernisée */}
      <div className="app-sidebar">
        <div className="sidebar-header">
          <img src="/lg.png" alt="Logo" className="sidebar-logo" />
          <h2>MedicalVision</h2>
        </div>
        
        <nav className="sidebar-nav">
          {[
            { icon: faDatabase, label: "Base de données", action: () => navigate(`/importSucc/${id}`) },
            { icon: faHistory, label: "Historique", action: () => navigate(`/historique/${id}/${targetFeature}`) },
            { icon: faChartLine, label: "Graphiques", action: () => navigateTo('/graphs') },
            { icon: faCog, label: "Traitement", action: () => navigateTo('/processing') },
            { icon: faBrain, label: "Modèles", action: () => navigateTo('/models') },
            { icon: faRocket, label: "Déploiement", action: () => navigate(`/deployment/${id}/${targetFeature}`) },
          ].map((item, index) => (
            <button 
              key={index}
              className={`nav-item ${window.location.pathname.includes(item.label.toLowerCase()) ? 'active' : ''}`}
              onClick={item.action}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu principal */}
      <main className="historique-content">
        <header className="content-header">
          <h1>
            <FontAwesomeIcon icon={faHistory} />
            Historique des Versions
          </h1>
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
        <section className="version-list">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((file) => (
              <div 
                key={file.id} 
                className={`version-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                onClick={() => setSelectedFile(file)}
              >
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
                  <p className="modification-type">{file.modification || 'Modification non spécifiée'}</p>
                  
                  <div className="card-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(file);
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} /> Voir
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
        </section>

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
                >
                  <FontAwesomeIcon icon={faCog} /> Traiter ces données
                </button>
                
                <button 
                  className="action-btn secondary"
                  onClick={() => navigateTo('/models')}
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
      </main>
    </div>
  );
};

export default Historique;