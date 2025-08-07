import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faColumns,
  faChartLine,
  faCog,
  faDownload,
  faDatabase,
  faFileAlt,
  faBullseye,
  faHistory,
  faRocket,
  faTimes,
  faStethoscope,
  faBroom,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./test.css";
import Sidebar from "./Sidebar";

const Test = () => {
  const navigate = useNavigate();
  const { id, model } = useParams();
  const [data, setData] = useState([]);
  const [targetFeature, setTargetFeature] = useState("");
  const [inputValues, setInputValues] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [predictionVersions, setPredictionVersions] = useState([]);
  const [selectedPredictionFileId, setSelectedPredictionFileId] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [fileSource, setFileSource] = useState("local"); // "local" ou "saved"
  const [selectedVersionContent, setSelectedVersionContent] = useState(null);
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Nouvelle fonction pour charger les versions de prédiction
  const fetchPredictionVersions = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/historique/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const predictions = response.data.filter((f) => f.is_for_prediction);
      setPredictionVersions(predictions);
    } catch (err) {
      console.error("Erreur chargement versions prédiction", err);
    }
  };

  const cleanData = (data) => {
    if (typeof data === "string") {
      return data.replace(/NaN/g, "null");
    }
    return data;
  };

  const sanitizeJson = (jsonString) => {
    return jsonString.replace(/NaN/g, "null");
  };

  const importBD = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:5000/projects/${id}/imported-files`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const data = response.data;
      let cleanedData;
      let last_column_name;

      if (typeof data === "object") {
        last_column_name = data.last_column_name;
        cleanedData = cleanData(data.data);
      } else if (typeof data === "string") {
        try {
          const sanitizedData = sanitizeJson(data);
          const parsedData = JSON.parse(sanitizedData);
          last_column_name = parsedData.last_column_name;
          cleanedData = cleanData(parsedData.data);
        } catch (e) {
          console.error("Error parsing JSON data:", e);
          alert("Error parsing JSON data: " + e.message);
          return;
        }
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
        setTargetFeature(last_column_name);

        const featureKeys = Object.keys(cleanedData[0]).filter(
          (key) => key !== last_column_name
        );
        const initialValues = featureKeys.reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});
        setInputValues(initialValues);
      }
    } catch (error) {
      console.error("Error fetching imported files:", error);
      alert("Error fetching imported files: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    importBD();
    fetchPredictionVersions();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues({
      ...inputValues,
      [name]: value,
    });
    setUploadedFile(null);
    setPrediction(null);
    setPredictionError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedPredictionFileId(""); // Réinitialiser sélection
    if (file && file.type === "text/csv") {
      console.log("File name:", file.name);
      console.log("MIME type:", file.type);

      setUploadedFile(file);
      console.log("CSV file content:");
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log(e.target.result.slice(0, 100));
      };
      reader.readAsText(file);

      setInputValues(
        Object.keys(inputValues).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {})
      );
      setPrediction(null);
      setPredictionError(null);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };
  const handlePredictFromSavedVersion = async () => {
    if (!selectedPredictionFileId) return;
    const token = localStorage.getItem("token");

    try {
      setIsLoading(true);

      const res = await axios.get(
        `http://localhost:5000/fichier/${selectedPredictionFileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let content = res.data;

      // Si le contenu est déjà un tableau, l'utiliser directement
      if (Array.isArray(content)) {
        // Pas besoin de transformation supplémentaire
      }
      // Si c'est un objet avec une propriété data qui est un tableau
      else if (content && Array.isArray(content.data)) {
        content = content.data;
      }
      // Sinon, essayer de parser comme JSON ou CSV
      else {
        if (typeof content === "string") {
          try {
            content = JSON.parse(content);
            if (content && content.data) {
              content = content.data;
            }
          } catch (err) {
            // Gestion CSV si nécessaire
            const lines = content.trim().split("\n");
            const headers = lines[0].split(",");
            content = lines.slice(1).map((line) => {
              const values = line.split(",");
              const obj = {};
              headers.forEach((header, i) => {
                obj[header.trim()] = values[i]?.trim();
              });
              return obj;
            });
          }
        }
      }

      // S'assurer que content est un tableau
      if (!Array.isArray(content)) {
        content = [content];
      }

      // Envoyer les données pour prédiction
      const response = await axios.post(
        `http://localhost:5000/projects/${id}/predict`,
        {
          model: model,
          data: content, // Envoyer directement le tableau
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPrediction(response.data.predictions);
      setPredictionError(null);
    } catch (error) {
      console.error("Erreur prédiction avec version :", error);
      setPredictionError(error.message);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSelectedVersion = async () => {
    if (!selectedPredictionFileId) return;
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        `http://localhost:5000/fichier/${selectedPredictionFileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let content = res.data;

      if (typeof content === "string") {
        try {
          content = JSON.parse(content);
        } catch (err) {
          const lines = content.trim().split("\n");
          const headers = lines[0].split(",");
          content = lines.slice(1).map((line) => {
            const values = line.split(",");
            const obj = {};
            headers.forEach((header, i) => {
              obj[header.trim()] = values[i]?.trim();
            });
            return obj;
          });
        }
      }

      if (content && content.data) content = content.data;

      if (!Array.isArray(content)) content = [content];

      setSelectedVersionContent(content.slice(0, 50)); // ⚠️ On limite l'affichage à 50 lignes
      setShowVersionModal(true);
    } catch (err) {
      console.error("Erreur affichage version prédiction :", err);
      alert("Erreur lors du chargement du contenu.");
    }
  };

  const handleCleanDataBeforePrediction = () => {
    if (!uploadedFile) {
      alert("Veuillez d'abord importer un fichier.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result;
        const rows = csvContent.trim().split("\n");
        const headers = rows[0].split(",");
        const data = rows.slice(1).map((row) => {
          const values = row.split(",");
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        });

        navigate(`/processing/${id}/${targetFeature}`, {
          state: {
            isFromTestPage: true,
            fileData: data,
            targetFeature: targetFeature,
          },
        });
      } catch (err) {
        alert("Erreur lors de la lecture du fichier CSV : " + err.message);
      }
    };

    reader.readAsText(uploadedFile);
  };

  const handlePredict = async () => {
    if (!model) {
      console.error("Model parameter is missing.");
      alert("No model selected.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      let response;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("model", model);
        formData.append("file", uploadedFile);
        response = await axios.post(
          `http://localhost:5000/projects/${id}/predict`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
      } else {
        const featureKeys = Object.keys(inputValues);
        const missingFeatures = featureKeys.filter((key) => !inputValues[key]);
        if (missingFeatures.length > 0) {
          alert(`Please fill all features: ${missingFeatures.join(", ")}`);
          return;
        }
        response = await axios.post(
          `http://localhost:5000/projects/${id}/predict`,
          {
            model: model,
            data: [inputValues],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }
      setPrediction(response.data.predictions);
      setPredictionError(null);
    } catch (error) {
      console.error("Prediction error:", error);
      alert("Prediction error: " + error.message);
      setPredictionError(error.message);
      setPrediction(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = () => navigate("/profile");
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () =>
    navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () =>
    navigate(`/description/${id}/${targetFeature}`);
  const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const [isClosing, setIsClosing] = useState(false);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowVersionModal(false);
      setIsClosing(false);
    }, 200);
  };

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
          aria-label="Toggle sidebar"
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

      <div
        className={`content1 ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <h1>
          <FontAwesomeIcon icon={faStethoscope} className="header-icon" />
          Medical Model Testing
        </h1>
        <div className="line-divider"></div>
        <p className="header-subtitle">
          Evaluate your diagnostic model with patient data or batch uploads.
        </p>

        <div className="container1">
          <div className="target-feature-container">
            <h2>Target Diagnosis:</h2>
            <p>{targetFeature || "Not available"}</p>
          </div>

          {isLoading && <div className="loading-spinner">Loading...</div>}

          <div className="sections-container">
            <div className="section manual-input">
              <h3 className="section-title">
                Entrer les données de prédiction manuellement
              </h3>
              <h3
                className="accordion-header"
                onClick={() => setShowManualInput(!showManualInput)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  📝 Cliquez pour remplir manuellement les champs du patient
                </span>
                <span>{showManualInput ? "▲" : "▼"}</span>
              </h3>

              {showManualInput && (
                <div className="accordion-content">
                  {Object.keys(inputValues).length > 0 ? (
                    <form aria-label="Manual patient data input">
                      <div className="manual-input-grid">
                        {Object.keys(inputValues).map((key, index) => (
                          <div key={index} className="form-group">
                            <label htmlFor={key}>{key}</label>
                            <input
                              type="text"
                              id={key}
                              name={key}
                              placeholder={`Entrer ${key}`}
                              value={inputValues[key] || ""}
                              onChange={handleInputChange}
                              className="form-input"
                              aria-required="true"
                            />
                          </div>
                        ))}
                      </div>
                    </form>
                  ) : (
                    <p>Chargement des champs du patient...</p>
                  )}
                </div>
              )}
            </div>

            <div className="section batch-upload">
              <h3 className="section-title">
                Importer un fichier de prédiction
              </h3>

              <div className="file-source-toggle">
                <label className={fileSource === "local" ? "active" : ""}>
                  <input
                    type="radio"
                    name="fileSource"
                    value="local"
                    checked={fileSource === "local"}
                    onChange={() => {
                      setFileSource("local");
                      setSelectedPredictionFileId("");
                      setUploadedFile(null);
                    }}
                  />
                  <span>📂 Fichier local</span>
                </label>

                <label className={fileSource === "saved" ? "active" : ""}>
                  <input
                    type="radio"
                    name="fileSource"
                    value="saved"
                    checked={fileSource === "saved"}
                    onChange={() => {
                      setFileSource("saved");
                      setUploadedFile(null);
                    }}
                  />
                  <span>💾 Version enregistrée</span>
                </label>
              </div>

              {fileSource === "local" && (
                <div className="file-upload-enhanced">
                  <label className="file-upload-box">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                    {uploadedFile ? (
                      <>
                        <span className="upload-icon">✅</span>
                        <span className="upload-text">
                          Fichier : <strong>{uploadedFile.name}</strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="upload-icon">⬆️</span>
                        <span className="upload-text">
                          Glissez un fichier ou cliquez ici
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}

              {fileSource === "saved" && (
                <div className="saved-version-preview">
                  <label>Version :</label>
                  <select
                    value={selectedPredictionFileId}
                    onChange={(e) =>
                      setSelectedPredictionFileId(e.target.value)
                    }
                  >
                    <option value="">-- Choisir une version --</option>
                    {predictionVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  {selectedPredictionFileId && (
                    <div className="preview-buttons">
                      <button
                        type="button"
                        className="bb secondary"
                        onClick={handleViewSelectedVersion}
                      >
                        👁️ Aperçu contenu
                      </button>
                    </div>
                  )}
                </div>
              )}

              {uploadedFile && (
                <button
                  type="button"
                  onClick={handleCleanDataBeforePrediction}
                  className="bb warning"
                  style={{ marginTop: "1rem" }}
                >
                  <FontAwesomeIcon icon={faBroom} /> Nettoyer les données avant
                  prédiction
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fileSource === "saved"
                ? handlePredictFromSavedVersion()
                : handlePredict()
            }
            className="bb"
            disabled={isLoading}
            aria-label="Generate prediction"
          >
            <FontAwesomeIcon icon={faBullseye} className="menu-icon" />
            {isLoading ? "Predicting..." : "Prédire le diagnostic"}
          </button>

          {predictionError && (
            <div className="prediction-error">
              <h3>Prediction Error</h3>
              <p>{predictionError}</p>
            </div>
          )}

          {prediction && (
            <div className="prediction-result">
              <h3>Resultats du diagnostic</h3>
              {Array.isArray(prediction) ? (
                <ul>
                  {prediction.map((pred, index) => (
                    <li key={index}>
                      Prédiction {index + 1}: {pred}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {targetFeature}: {prediction}
                </p>
              )}

              {prediction && (
                <button
                  className="bb secondary"
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await axios.post(
                        `http://localhost:5000/export-prediction-pdf/${id}`,
                        {
                          model: model,
                          predictions: prediction,
                        },
                        {
                          responseType: "blob",
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      const blob = new Blob([response.data], {
                        type: "application/pdf",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute("download", "rapport_prediction.pdf");
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (err) {
                      alert("Erreur lors du téléchargement du PDF.");
                      console.error(err);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} /> Télécharger le rapport
                  PDF
                </button>
              )}
            </div>
          )}

          {showVersionModal && (
            <div
              className={`modal-overlay ${isClosing ? "closing" : ""}`}
              onClick={handleCloseModal}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>
                    <FontAwesomeIcon icon={faFileAlt} />
                    Détails de la version
                  </h3>
                  <button
                    className="modal-close-btn"
                    onClick={handleCloseModal}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>

                <div className="modal-content">
                  {selectedVersionContent ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          {Object.keys(selectedVersionContent[0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVersionContent.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i}>
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="data-loading">
                      <div className="data-loading-spinner" />
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <div className="modal-stats">
                    <span>
                      <FontAwesomeIcon icon={faDatabase} />
                      {selectedVersionContent?.length || 0} lignes
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faColumns} />
                      {selectedVersionContent?.[0]
                        ? Object.keys(selectedVersionContent[0]).length
                        : 0}{" "}
                      colonnes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test;
