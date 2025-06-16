import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus, faSignOutAlt, faAngleUp, faAngleDown, faEllipsisV, faTrashAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  console.log('ProfilePage useEffect triggered'); // Confirmer que le hook s'exécute
  const fetchUserAndProjects = async () => {
    const token = localStorage.getItem('token');
    console.log('Token retrieved in ProfilePage:', token); // Log crucial
    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      console.log('Sending GET /profile with Authorization: Bearer', token);
      const userResponse = await axios.get('http://localhost:5000/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile response:', userResponse.data);
      setUser(userResponse.data);

      console.log('Sending GET /projects/', userResponse.data.id);
      const projectsResponse = await axios.get(`http://localhost:5000/projects/${userResponse.data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Projects response:', projectsResponse.data);
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error fetching user or projects:', error.response?.data, error.response?.status);
      console.error('Full error object:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  fetchUserAndProjects();
}, [navigate]);

  const handleUserClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const handleNewProjectClick = () => {
    setShowNewProjectForm(true);
  };

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
      setProjects([...projects, { id: response.data.project_id, name: projectName }]);
      setShowNewProjectForm(false);
      setProjectName('');
    } catch (error) {
      console.error('Error creating project:', error);
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
        const updatedProjects = projects.filter((project) => project.id !== projectId);
        setProjects(updatedProjects);
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
            <FontAwesomeIcon
              icon={dropdownOpen ? faAngleUp : faAngleDown}
              className="dropdown-icon"
            />
          </div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="content">
        <div className="projects-header">
          <h2 className='projects-title'>
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
            .filter((project) =>
              project.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((project) => (
<div className="project-item" style={{ paddingTop: '0px',paddingLeft:'0px', paddingRight: '0px',paddingBottom:'0px' }} key={project.id}>
<div className='img'><img 
          src="/image/a.jpg" 
          alt="Project" 
          className="project-image-item"
        /></div>
        <div className="project-details" onClick={() => handleProjectClick(project.id, project.name)}>
          <span className="project-name">{project.name}</span>
        </div>
              <div className="project-menu" onClick={(e) => { e.stopPropagation(); handleMenuToggle(project.id); }}>
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
            <h3 className='h3'><FontAwesomeIcon icon={faPlus} /> New Project</h3>
            <div className="form-group">
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
              />
              <div className="form-buttons">
                <button className="cancel-button" onClick={handleCancelClick}>Cancel</button>
                <button className="create-button" onClick={handleCreateProject}>Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProfilePage.propTypes = {
  onLogout: PropTypes.func,
};

export default ProfilePage;
