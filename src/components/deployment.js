import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  faUser,
  faChartLine,
  faCog,
  faBrain,
  faDatabase,
  faFileAlt,
  faHistory,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import "./deployment.css";
import Sidebar from "./Sidebar";

import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Deployment = () => {
  const navigate = useNavigate();
  const { id, targetFeature } = useParams();
  const [hist, setHist] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedModelData, setSelectedModelData] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [featureImportanceData, setFeatureImportanceData] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const importhist = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`http://localhost:5000/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setHist(response.data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des fichiers modifiés :",
        error
      );
    }
  };

  useEffect(() => {
    importhist();
  }, [id, targetFeature]);

  const handleSelectChange = async (event) => {
    const fileId = event.target.value;
    setSelectedFile(fileId);

    if (fileId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/model/${fileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setSelectedModelData(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails du modèle :",
          error
        );
      }
    }
  };

  const handleTestClick = (modelName) => {
    navigate(`/test/${id}/${modelName}`);
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
        >
          ☰
        </button>
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        projectId={id}
        targetFeature={targetFeature}
      />

      <div
        className={`content1 ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <h2>Model Deployment</h2>
        <p className="header-subtitle">Deploy and test your trained models</p>

        <div className="target-feature">
          <p>
            <strong>Target Feature:</strong> {targetFeature || "Not available"}
          </p>
        </div>

        <div className="model-selector">
          {hist.length > 0 ? (
            <select onChange={handleSelectChange} value={selectedFile}>
              <option value="">Select a Model to Deploy</option>
              {hist.map((file) => (
                <option key={file.id} value={file.id}>
                  {file.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="no-model">
              <p>No trained models available. Please train a model first.</p>
            </div>
          )}
        </div>

        {selectedModelData && (
          <div className="model-details">
            <h3>
              {selectedModelData.name}
              <button
                className="test-button"
                onClick={() => handleTestClick(selectedModelData.name)}
              >
                Test Model
              </button>
            </h3>

            <h4>Model Parameters</h4>
            {selectedModelData?.trainingset != null &&
            selectedModelData?.testset != null ? (
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>Training Set</strong>
                    </td>
                    <td>{selectedModelData.trainingset}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Test Set</strong>
                    </td>
                    <td>{selectedModelData.testset}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table>
                <tbody>
                  <tr>
                    <td>
                      <strong>k-folds</strong>
                    </td>
                    <td>{selectedModelData.k}</td>
                  </tr>
                </tbody>
              </table>
            )}

            <div className="metrics">
              <h4>Evaluation Metrics</h4>
              <table>
                <tbody>
                  {selectedModelData.Accuracy > 0 && (
                    <tr>
                      <td>
                        <strong>Accuracy</strong>
                      </td>
                      <td>{selectedModelData.Accuracy}</td>
                    </tr>
                  )}
                  {selectedModelData.Precisionn > 0 && (
                    <tr>
                      <td>
                        <strong>Precision</strong>
                      </td>
                      <td>{selectedModelData.Precisionn}</td>
                    </tr>
                  )}
                  {selectedModelData.F1_Score > 0 && (
                    <tr>
                      <td>
                        <strong>F1 Score</strong>
                      </td>
                      <td>{selectedModelData.F1_Score}</td>
                    </tr>
                  )}
                  {selectedModelData.ROC_AUC > 0 && (
                    <tr>
                      <td>
                        <strong>ROC AUC</strong>
                      </td>
                      <td>{selectedModelData.ROC_AUC}</td>
                    </tr>
                  )}
                  {selectedModelData.MeanAbsoluteError > 0 && (
                    <tr>
                      <td>
                        <strong>Mean Absolute Error</strong>
                      </td>
                      <td>{selectedModelData.MeanAbsoluteError}</td>
                    </tr>
                  )}
                  {selectedModelData.MeanSquaredError > 0 && (
                    <tr>
                      <td>
                        <strong>Mean Squared Error</strong>
                      </td>
                      <td>{selectedModelData.MeanSquaredError}</td>
                    </tr>
                  )}
                  {selectedModelData.RScore > 0 && (
                    <tr>
                      <td>
                        <strong>R² Score</strong>
                      </td>
                      <td>{selectedModelData.RScore}</td>
                    </tr>
                  )}
                  {selectedModelData.Recall > 0 && (
                    <tr>
                      <td>
                        <strong>Recall</strong>
                      </td>
                      <td>{selectedModelData.Recall}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="feature-importance">
              <h4>Feature Importance</h4>
              {selectedModelData.featureimportance ? (
                (() => {
                  try {
                    const correctedFeatureImportance =
                      selectedModelData.featureimportance.replace(/'/g, '"');
                    const featureImportanceData = JSON.parse(
                      correctedFeatureImportance
                    );
                    const sortedFeatureImportance = Object.entries(
                      featureImportanceData
                    ).sort(
                      ([, importanceA], [, importanceB]) =>
                        importanceB - importanceA
                    );

                    return (
                      <table>
                        <thead>
                          <tr>
                            <th>Feature</th>
                            <th>Importance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedFeatureImportance.map(
                            ([feature, importance]) => (
                              <tr key={feature}>
                                <td>{feature}</td>
                                <td>{importance.toFixed(4)}</td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    );
                  } catch (error) {
                    console.error(
                      "Erreur de parsing JSON pour featureimportance:",
                      error
                    );
                    return <p>Unable to parse feature importance data.</p>;
                  }
                })()
              ) : (
                <p>No feature importance data available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deployment;
