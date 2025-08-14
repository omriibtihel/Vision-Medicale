import { faCheckCircle, faListOl, faFileAlt, faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  faBrain,
  faCog,
  faDownload,
  faEye,
  faFilter,
  faHistory,
  faRocket,
  faSearch,
  faSyncAlt,
  faExclamationTriangle,
  faInfoCircle,
  faCheckSquare,
  faDatabase,
  faHeartbeat,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Historique.css";
import Sidebar from "./Sidebar";
import "./sidebar.css";

const Historique = () => {
  const navigate = useNavigate();
  const { id, targetFeature: initialTargetFeature } = useParams();
  
  // États principaux
  const [hist, setHist] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  
  // États de recherche et filtrage
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [filterType, setFilterType] = useState("all");
  
  // États de navigation
  const [targetFeature, setTargetFeature] = useState(initialTargetFeature || "");
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // États de responsive
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Gestionnaires d'événements
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleProfileClick = () => navigate("/profile");
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  // Fonction pour afficher les notifications
  const showNotification = useCallback((message, type = 'info') => {
    // Implémentation d'une notification toast (peut être remplacée par une lib comme react-toastify)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }, []);

  // Fonction pour récupérer la target feature depuis le backend
  const fetchTargetFeature = useCallback(async () => {
    setLoadingTarget(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(
        `http://localhost:5000/projects/${id}/target-feature`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000 // Timeout de 10 secondes
        }
      );

      if (response.data.currentTarget) {
        setTargetFeature(response.data.currentTarget);
        setError(""); // Clear any previous errors
        return response.data.currentTarget;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la target feature:", error);
      const errorMessage = error.response?.data?.message || "Impossible de récupérer la target feature";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoadingTarget(false);
    }
    return null;
  }, [id, showNotification]);

  // Vérifie que la target feature existe dans les données
  const validateTargetFeature = useCallback((data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError("Aucune donnée disponible pour validation");
      return false;
    }

    const availableFeatures = Object.keys(data[0] || {});
    
    if (!targetFeature || !availableFeatures.includes(targetFeature)) {
      const errorMsg = `La target feature "${targetFeature}" n'existe pas dans ces données.`;
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return false;
    }

    setError(""); // Clear error if validation passes
    return true;
  }, [targetFeature, showNotification]);

  // Chargement de l'historique avec gestion d'erreur améliorée
  const loadHistoryData = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(
        `http://localhost:5000/historique/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 15000
        }
      );

      if (Array.isArray(response.data)) {
        const processedData = response.data.map((item) => ({
          ...item,
          created_at: item.created_at || new Date().toISOString(),
          // Ajouter des métadonnées pour améliorer l'affichage
          fileSize: item.file_size || 'N/A',
          recordCount: item.record_count || 'N/A',
          lastModified: item.updated_at || item.created_at,
        }));
        
        setHist(processedData);
        setError("");
        showNotification(`${processedData.length} versions chargées avec succès`, 'success');
      } else {
        throw new Error("Format de données invalide reçu du serveur");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      const errorMessage = error.response?.data?.error || error.message || "Erreur de chargement de l'historique";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  // Téléchargement de fichier avec feedback utilisateur
  const handleDownload = useCallback(async (fileId, fileName) => {
    const token = localStorage.getItem("token");
    
    try {
      showNotification(`Téléchargement de ${fileName} en cours...`, 'info');
      
      const response = await axios.get(
        `http://localhost:5000/download-version/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
          timeout: 30000 // 30 secondes pour le téléchargement
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "fichier.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showNotification(`${fileName} téléchargé avec succès`, 'success');
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      const errorMessage = "Échec du téléchargement. Veuillez réessayer.";
      showNotification(errorMessage, 'error');
    }
  }, [showNotification]);

  // Chargement des données d'un fichier spécifique avec validation renforcée
  const loadFileData = useCallback(async (fileId) => {
    if (!fileId) return;
    
    setDataLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/fichier/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          timeout: 20000
        }
      );

      let rawData = response.data?.data || response.data;
      let parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      // Extraction du champ "data" si présent
      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        parsedData = parsedData.data;
      }

      // Conversion en tableau si nécessaire
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      // Validation des données
      if (parsedData.length === 0) {
        throw new Error("Le fichier ne contient aucune donnée");
      }

      // Récupération des features disponibles
      const availableFeatures = Object.keys(parsedData[0] || {});
      console.log("✅ Features détectées:", availableFeatures);

      // Vérification de la target feature sauf pour les fichiers de prédiction
      if (
        selectedFile?.is_for_prediction !== true &&
        availableFeatures.length > 0 &&
        !availableFeatures.includes(targetFeature)
      ) {
        const fetchedTarget = await fetchTargetFeature();

        if (fetchedTarget && availableFeatures.includes(fetchedTarget)) {
          setTargetFeature(fetchedTarget);
        } else {
          const errorMsg = `Target feature "${fetchedTarget || targetFeature}" introuvable`;
          setError(errorMsg);
          showNotification(errorMsg, 'warning');
          return;
        }
      }

      setFileData(parsedData);
      setError("");
      showNotification(`Données chargées: ${parsedData.length} enregistrements`, 'success');
      
    } catch (error) {
      console.error("❌ Erreur loadFileData:", error);
      const errorMessage = `Erreur de chargement: ${error.message}`;
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [selectedFile?.is_for_prediction, targetFeature, fetchTargetFeature, showNotification]);

  // Suppression d'une version avec confirmation
  const handleDeleteVersion = useCallback(async (fileId, fileName) => {
    const confirmMessage = `⚠️ Êtes-vous sûr de vouloir supprimer "${fileName}" ?\n\nCette action est irréversible.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/delete-version/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      showNotification(`"${fileName}" supprimé avec succès`, 'success');
      loadHistoryData(); // Recharger la liste
      
      // Si le fichier supprimé était sélectionné, le désélectionner
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
        setFileData(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error.response?.data?.message || "Erreur lors de la suppression";
      showNotification(errorMessage, 'error');
    }
  }, [loadHistoryData, selectedFile?.id, showNotification]);

  // Tri des colonnes
  const requestSort = useCallback((key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Formatage des valeurs avec types médicaux
  const formatValue = useCallback((value, key) => {
    if (value === null || value === undefined)
      return <span className="null-value">NULL</span>;
    if (typeof value === "object")
      return <span className="json-value">[OBJET]</span>;
    
    // Formatage spécial pour les valeurs médicales
    if (key && key.toLowerCase().includes('date')) {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    
    if (typeof value === 'number' && key && (key.toLowerCase().includes('age') || key.toLowerCase().includes('score'))) {
      return <span className="medical-value">{value.toFixed(2)}</span>;
    }
    
    return value.toString();
  }, []);

  // Navigation avec vérification de la target feature
  const navigateTo = useCallback((path) => {
    if (!fileData || !selectedFile) {
      const errorMsg = "Sélectionnez des données d'abord";
      setError(errorMsg);
      showNotification(errorMsg, 'warning');
      return;
    }

    const navigationState = {
      isFromHistory: true,
      fileData,
      targetFeature: selectedFile?.is_for_prediction ? "" : targetFeature,
      versionId: selectedFile.id,
    };

    if (selectedFile?.is_for_prediction || !validateTargetFeature(fileData)) {
      navigate(`${path}/${id}/none`, { state: navigationState });
      return;
    }

    navigate(`${path}/${id}/${targetFeature}`, { state: navigationState });
  }, [fileData, selectedFile, targetFeature, id, validateTargetFeature, navigate, showNotification]);

  // Filtrage et tri optimisés avec useMemo
  const filteredHistory = useMemo(() => {
    return hist
      .filter((item) => {
        const matchesSearch = 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.modification?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
          filterType === "all" ||
          (filterType === "prediction" && item.is_for_prediction) ||
          (filterType === "classic" && !item.is_for_prediction);

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [hist, searchTerm, filterType, sortConfig]);

  // Gestion du redimensionnement de fenêtre
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialisation
  useEffect(() => {
    const initialize = async () => {
      await loadHistoryData();
      
      if (!targetFeature) {
        await fetchTargetFeature();
      }
    };

    initialize();
  }, [id, loadHistoryData, targetFeature, fetchTargetFeature]);

  // Chargement des données lors de la sélection d'un fichier
  useEffect(() => {
    if (selectedFile) {
      loadFileData(selectedFile.id);
    }
  }, [selectedFile, loadFileData]);

  // Composant de statut de chargement
  const LoadingSpinner = ({ size = "24" }) => (
    <div className="loading-spinner" style={{ width: size, height: size }} />
  );

  // Composant de badge de statut
  const StatusBadge = ({ type, children }) => (
    <span className={`status-indicator ${type}`}>
      {children}
    </span>
  );

  const isMobile = windowWidth <= 768;

  return (
    <div className={`app-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Toggle mobile */}
      {isMobile && !isSidebarOpen && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        projectId={id}
        targetFeature={targetFeature}
      />

      {/* Contenu principal */}
      <div className="historique-content">
        {/* Header avec informations médicales */}
        <header className="content-header">
          <h1>
            <FontAwesomeIcon icon={faHistory} />
            Historique des Versions Médicales
          </h1>

          {/* Affichage de la target feature avec statut */}
          <div className="target-feature-display">
            <span className="target-label">
              <FontAwesomeIcon icon={faHeartbeat} /> Target Feature:
            </span>
            {loadingTarget ? (
              <LoadingSpinner size="20" />
            ) : (
              <>
                <span className="target-value">
                  {targetFeature || "Non définie"}
                </span>
                {error && error.includes("target feature") && (
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

          <p className="subtitle">
            <FontAwesomeIcon icon={faShieldAlt} />
            Suivi sécurisé des modifications de vos données médicales
          </p>
        </header>

        {/* Banner d'erreur avec style médical */}
        {error && (
          <div className="error-banner">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            {error}
          </div>
        )}

        {/* Barre de contrôles avec recherche et filtres */}
        <div className="controls-bar">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Rechercher une version médicale..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher dans l'historique"
            />
          </div>

          <div className="filter-options">
            <FontAwesomeIcon icon={faFilter} />
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filtrer par type"
            >
              <option value="all">Tous les fichiers</option>
              <option value="classic">Données d'entraînement</option>
              <option value="prediction">Fichiers de prédiction</option>
            </select>
          </div>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="loading-state">
            <LoadingSpinner size="32" />
            <p>Chargement de l'historique médical...</p>
          </div>
        )}

        {/* Liste des versions avec design médical */}
        <div className="version-list">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((file, index) => (
              <div
                key={file.id}
                className={`version-card ${
                  selectedFile?.id === file.id ? "selected" : ""
                } ${file.is_for_prediction ? "prediction-version" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <h3>
                    <FontAwesomeIcon icon={faFileAlt} />
                    {file.name}
                    {file.is_for_prediction && (
                      <StatusBadge type="warning">
                        <FontAwesomeIcon icon={faRocket} />
                        Prédiction
                      </StatusBadge>
                    )}
                  </h3>
                  <div className="version-metadata">
                    <span className="version-date">
                      {new Date(file.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {file.recordCount !== 'N/A' && (
                      <StatusBadge type="info">
                        <FontAwesomeIcon icon={faDatabase} />
                        {file.recordCount} enregistrements
                      </StatusBadge>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  <div className="modification-details">
                    {file.modification.split("|").map((mod, i) => {
                      const [mainText, columnsText] = mod.split("(Colonnes:");
                      const columns = columnsText
                        ? columnsText.replace(")", "").trim()
                        : null;

                      return (
                        <div key={i} className="modification-step">
                          <div className="step-main">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="step-icon"
                            />
                            <span>{mainText.trim()}</span>
                          </div>
                          {columns && (
                            <div className="step-columns">
                              <FontAwesomeIcon
                                icon={faListOl}
                                className="column-icon"
                              />
                              <span>Colonnes: {columns}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions de la carte */}
                  <div className="card-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedFile(file)}
                      disabled={dataLoading && selectedFile?.id === file.id}
                    >
                      {dataLoading && selectedFile?.id === file.id ? (
                        <LoadingSpinner size="16" />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                      Voir
                    </button>

                    {file.is_for_prediction && (
                      <button
                        className="action-btn predict-btn"
                        onClick={() =>
                          navigate(`/deployment/${id}/none`, {
                            state: {
                              isFromHistory: true,
                              fileData,
                              targetFeature: "",
                              versionId: file.id,
                            },
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faRocket} />
                        Prédire
                      </button>
                    )}

                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteVersion(file.id, file.name)}
                    >
                      🗑️ Supprimer
                    </button>

                    <button
                      className="action-btn download-btn"
                      onClick={() => handleDownload(file.id, file.name)}
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : loading ? null : (
            <div className="empty-state">
              <h3>Aucune version trouvée</h3>
              <p>
                {searchTerm
                  ? `Aucun résultat pour "${searchTerm}"`
                  : "Aucune version historique disponible"}
              </p>
              {searchTerm && (
                <button
                  className="action-btn primary"
                  onClick={() => setSearchTerm("")}
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
        </div>

        {/* Aperçu des données médicales */}
        {selectedFile && fileData && (
          <section className="data-preview">
            <div className="preview-header">
              <h2>
                <FontAwesomeIcon icon={faChartLine} />
                Aperçu Médical: <span>{selectedFile.name}</span>
              </h2>

              <div className="preview-actions">
                <button
                  className="action-btn primary"
                  onClick={() => navigateTo("/processing")}
                  disabled={
                    !selectedFile ||
                    (!targetFeature && !selectedFile.is_for_prediction)
                  }
                >
                  <FontAwesomeIcon icon={faCog} />
                  Traiter les données
                </button>

                <button
                  className="action-btn secondary"
                  onClick={() => navigateTo("/models")}
                  disabled={!targetFeature && !selectedFile.is_for_prediction}
                >
                  <FontAwesomeIcon icon={faBrain} />
                  Modéliser
                </button>

                {selectedFile.is_for_prediction && (
                  <button
                    className="action-btn predict-btn"
                    onClick={() => navigateTo("/deployment")}
                  >
                    <FontAwesomeIcon icon={faRocket} />
                    Déployer modèle
                  </button>
                )}
              </div>
            </div>

            {/* Métadonnées du fichier */}
            <div className="file-metadata">
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="metadata-label">Enregistrements:</span>
                  <span className="metadata-value">{fileData.length}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Colonnes:</span>
                  <span className="metadata-value">
                    {Object.keys(fileData[0] || {}).length}
                  </span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Type:</span>
                  <StatusBadge type={selectedFile.is_for_prediction ? "warning" : "info"}>
                    {selectedFile.is_for_prediction ? "Prédiction" : "Entraînement"}
                  </StatusBadge>
                </div>
                {targetFeature && (
                  <div className="metadata-item">
                    <span className="metadata-label">Target:</span>
                    <StatusBadge type="success">
                      <FontAwesomeIcon icon={faHeartbeat} />
                      {targetFeature}
                    </StatusBadge>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau de données médical */}
            <div className="data-table-container">
              {dataLoading ? (
                <div className="table-loading">
                  <LoadingSpinner size="32" />
                  <p>Chargement des données médicales...</p>
                </div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        {Object.keys(fileData[0] || {}).map((key) => (
                          <th
                            key={key}
                            onClick={() => requestSort(key)}
                            className={`
                              ${key === targetFeature ? "target-feature" : ""}
                              sortable-header
                            `}
                          >
                            {key}
                            {key === targetFeature && (
                              <span className="target-badge">
                                <FontAwesomeIcon icon={faHeartbeat} />
                                Target
                              </span>
                            )}
                            {sortConfig.key === key && (
                              <span className="sort-indicator">
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
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
                                ${value === null || value === undefined ? "null-cell" : ""}
                                ${key === targetFeature ? "target-cell" : ""}
                              `}
                            >
                              {formatValue(value, key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="table-footer">
                    <div className="table-stats">
                      <StatusBadge type="info">
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Affiche 1-{Math.min(fileData.length, 50)} sur {fileData.length} lignes
                      </StatusBadge>
                      
                      {Object.keys(fileData[0] || {}).includes(targetFeature) && (
                        <StatusBadge type="success">
                          <FontAwesomeIcon icon={faCheckSquare} />
                          Target feature validée
                        </StatusBadge>
                      )}
                    </div>
                    
                    {fileData.length > 50 && (
                      <button className="load-more">
                        Charger plus de données
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Footer avec informations médicales */}
        <footer className="content-footer">
          <div className="footer-info">
            <StatusBadge type="info">
              <FontAwesomeIcon icon={faShieldAlt} />
              Données sécurisées et conformes aux normes médicales
            </StatusBadge>
            
            {filteredHistory.length > 0 && (
              <StatusBadge type="success">
                <FontAwesomeIcon icon={faDatabase} />
                {filteredHistory.length} version{filteredHistory.length > 1 ? 's' : ''} disponible{filteredHistory.length > 1 ? 's' : ''}
              </StatusBadge>
            )}
          </div>
        </footer>
      </div>

      {/* Styles CSS additionnels pour les nouveaux composants */}
      <style jsx>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .version-metadata {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .version-metadata {
            flex-direction: row;
            align-items: center;
            gap: 1rem;
          }
        }

        .file-metadata {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: var(--card-secondary-bg);
          border-radius: var(--border-radius);
          border: 1px solid var(--glass-border);
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .metadata-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }

        .metadata-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem;
          background: white;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
        }

        .metadata-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .metadata-value {
          font-weight: 700;
          color: var(--medical-primary);
        }

        .table-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .table-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .sortable-header {
          cursor: pointer;
          user-select: none;
          transition: background var(--transition-fast);
        }

        .sortable-header:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .medical-value {
          font-weight: 600;
          color: var(--medical-primary);
          background: rgba(59, 130, 246, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
        }

        .content-footer {
          margin-top: 3rem;
          padding: 2rem;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: var(--border-radius-large);
          border: 1px solid var(--glass-border);
        }

        .footer-info {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Notification styles */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: var(--border-radius);
          color: white;
          font-weight: 600;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
          max-width: 400px;
          box-shadow: var(--shadow-lg);
        }

        .notification-success {
          background: var(--status-success);
        }

        .notification-error {
          background: var(--status-error);
        }

        .notification-warning {
          background: var(--status-warning);
        }

        .notification-info {
          background: var(--status-info);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Historique;