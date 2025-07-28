import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPlus,
  faSignOutAlt,
  faAngleUp,
  faAngleDown,
  faEllipsisV,
  faTrashAlt,
  faSearch,
  faNotesMedical,
  faRocket,
  faChartLine,
  faBell,
  faLightbulb,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import "./ProfilePage.css";
import UserCard from "./UserCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({ onLogout = () => {} }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [menuOpen, setMenuOpen] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const userResponse = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);
        const projectsResponse = await axios.get(
          `http://localhost:5000/projects/${userResponse.data.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(projectsResponse.data);
      } catch (error) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProjects();
  }, [navigate]);

  const handleUserClick = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/login");
  };

  const handleNewProjectClick = () => setShowNewProjectForm(true);
  const handleCancelClick = () => {
    setShowNewProjectForm(false);
    setProjectName("");
  };

  const handleCreateProject = async () => {
    if (projectName.trim() === "") {
      alert("Project name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/projects",
        { name: projectName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newProjectId = response.data.project_id;

      if (!newProjectId) {
        alert("Could not create project: Missing ID in response.");
        return;
      }

      setProjects([...projects, { id: newProjectId, name: projectName }]);
      setShowNewProjectForm(false);
      setProjectName("");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project. Please try again later.");
    }
  };

  const handleProjectClick = (projectId, projectName) => {
    navigate(`/project/${projectId}/${projectName}`);
  };

  const handleMenuToggle = (projectId) => {
    setMenuOpen((prevState) => ({
      ...prevState,
      [projectId]: !prevState[projectId],
    }));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:5000/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setProjects(projects.filter((project) => project.id !== projectId));
      } else {
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again later.");
    }
  };

  const dailyAITips = [
    "Vérifiez toujours les données d'entrée avant d'entraîner votre modèle.",
    "L'overfitting réduit la généralisation : préférez un modèle équilibré.",
    "Les variables fortement corrélées peuvent nuire à l’apprentissage.",
    "Utilisez la validation croisée pour évaluer la robustesse du modèle.",
    "Nettoyez les données manquantes pour améliorer la précision du modèle.",
    "La normalisation améliore la performance des modèles basés sur la distance.",
    "La matrice de confusion vous aide à détecter les erreurs critiques.",
    "Plus de données ≠ meilleur modèle : la qualité prime.",
    "L’IA n’est qu’un outil : vos décisions médicales restent centrales.",
    "Ajoutez des labels précis pour un apprentissage supervisé efficace.",
  ];

  // Obtenir un index basé sur le jour de l’année
  const getTodayTipIndex = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    return dayOfYear % dailyAITips.length;
  };

  const todayTip = dailyAITips[getTodayTipIndex()];

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">Error loading user data.</div>;

  return (
    <div className="profile-page">
      <header className="header">
        <div className="app-name">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
        <div className="user-info">
          <div className="user-name" onClick={handleUserClick}>
            <FontAwesomeIcon icon={faUser} className="user-icon" />
            <span>{user.name}</span>
            <FontAwesomeIcon
              icon={dropdownOpen ? faAngleUp : faAngleDown}
              className="dropdown-icon"
            />
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />{" "}
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <UserCard user={user} />
        <div className="welcome-banner-modern">
          <div className="welcome-content-modern">
            <div className="welcome-text-modern">
              <div className="welcome-header-modern">
                <span className="welcome-greeting-modern">
                  Bonjour, Dr. {user.name.split(" ")[0]}
                </span>
                <h1 className="welcome-title-modern">
                  Votre Espace{" "}
                  <span className="welcome-highlight-modern">Médical</span>
                </h1>
              </div>

              <p className="welcome-subtitle-modern">
                Optimisez vos diagnostics avec nos outils d’Intelligence
                Artificielle de pointe.
              </p>

              <div className="welcome-stats-modern">
                <div className="stat-modern">
                  <div className="stat-value-modern">{projects.length}</div>
                  <div className="stat-label-modern">Projets actifs</div>
                </div>
                <div className="stat-modern">
                  <div className="stat-value-modern">97%</div>
                  <div className="stat-label-modern">Précision moyenne IA</div>
                </div>
                <div className="stat-modern">
                  <div className="stat-value-modern">📈</div>
                  <div className="stat-label-modern">
                    Performances en hausse
                  </div>
                </div>
              </div>
            </div>

            <div className="welcome-decoration-modern">
              <div className="decoration-circle-modern"></div>
              <div className="decoration-wave-modern"></div>
            </div>
          </div>

          <div className="welcome-footer-modern">
            <div className="welcome-tip-modern">
              <FontAwesomeIcon icon={faLightbulb} className="tip-icon-modern" />
              <span>
                Conseil IA du jour : <em>{todayTip}</em>
              </span>
            </div>
          </div>
        </div>

        <section className="projects-section">
          <div className="projects-header">
            <h2 className="projects-title">
              Projets
              <button
                className="search-icon"
                onClick={() => setSearchVisible(!searchVisible)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
              {searchVisible && (
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Rechercher un projet par son nom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
            </h2>
            <button
              className="new-project-button"
              onClick={handleNewProjectClick}
            >
              <FontAwesomeIcon icon={faPlus} /> Nouveau Projet
            </button>
          </div>

          <div className="projects-list">
            {projects
              .filter((project) =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((project) => (
                <div
                  key={project.id}
                  className="project-item"
                  onClick={() => handleProjectClick(project.id, project.name)}
                >
                  <div className="project-icon">
                    <FontAwesomeIcon icon={faNotesMedical} />
                  </div>
                  <div className="project-name">{project.name}</div>
                  <div
                    className="project-menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuToggle(project.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                    {menuOpen[project.id] && (
                      <div className="project-menu-dropdown">
                        <button
                          className="delete"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                          <span className="delete-text">Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {showNewProjectForm && (
            <div className="new-project-form">
              <h3 className="h3">
                <FontAwesomeIcon icon={faPlus} /> Nouveau Projet
              </h3>
              <div className="form-group">
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Project Name"
                />
                <div className="form-buttons">
                  <button className="cancel-button" onClick={handleCancelClick}>
                    Annuler
                  </button>
                  <button
                    className="create-button"
                    onClick={handleCreateProject}
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

ProfilePage.propTypes = {
  onLogout: PropTypes.func,
};

export default ProfilePage;
