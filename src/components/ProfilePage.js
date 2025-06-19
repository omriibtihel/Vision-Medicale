import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import './ProfilePage.css';
import UserCard from './UserCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const ProfilePage = ({ onLogout = () => {} }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [menuOpen, setMenuOpen] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  

  useEffect(() => {


    const fetchUserAndProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const userResponse = await axios.get('http://localhost:5000/profile', {
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
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProjects();
  }, [navigate]);

  const handleUserClick = () => setDropdownOpen(!dropdownOpen);
  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  const handleNewProjectClick = () => setShowNewProjectForm(true);
  const handleCancelClick = () => {
    setShowNewProjectForm(false);
    setProjectName('');
  };

  const handleCreateProject = async () => {
  if (projectName.trim() === '') {
    alert('Project name cannot be empty');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/projects',
      { name: projectName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newProjectId = response.data.project_id;

    if (!newProjectId) {
      alert('Could not create project: Missing ID in response.');
      return;
    }

    setProjects([...projects, { id: newProjectId, name: projectName }]);
    setShowNewProjectForm(false);
    setProjectName('');
  } catch (error) {
    console.error('Error creating project:', error);
    alert('Error creating project. Please try again later.');
  }
};


  const handleProjectClick = (projectId, projectName) => {
    navigate(`/project/${projectId}/${projectName}`);
  };

  const handleMenuToggle = (projectId) => {
    setMenuOpen((prevState) => ({ ...prevState, [projectId]: !prevState[projectId] }));
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setProjects(projects.filter((project) => project.id !== projectId));
      } else {
        alert('Failed to delete project.');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again later.');
    }
  };

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
            <FontAwesomeIcon icon={dropdownOpen ? faAngleUp : faAngleDown} className="dropdown-icon" />
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      

      <main className="main-content">
        <UserCard user={user} />
        <div className="welcome-banner">
    👋 Hello <strong>{user.name}</strong>!<br />
  Welcome to <strong>MedicalVision</strong> <br />
  your hub for managing medical data and AI-powered diagnosis tools.<br />
  Start by selecting a project or create a new one to get started!<br />
</div>


        <section className="projects-section">
          <div className="projects-header">
            <h2 className="projects-title">
              Projects
              <button className="search-icon" onClick={() => setSearchVisible(!searchVisible)}>
                <FontAwesomeIcon icon={faSearch} />
              </button>
              {searchVisible && (
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search projects by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
            </h2>
            <button className="new-project-button" onClick={handleNewProjectClick}>
              <FontAwesomeIcon icon={faPlus} /> New Project
            </button>
          </div>

          <div className="projects-list">
            {projects
              .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        <button className="delete" onClick={() => handleDeleteProject(project.id)}>
                          <FontAwesomeIcon icon={faTrashAlt} />
                          <span className="delete-text">Delete</span>
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
                <FontAwesomeIcon icon={faPlus} /> New Project
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
                    Cancel
                  </button>
                  <button className="create-button" onClick={handleCreateProject}>
                    Create
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