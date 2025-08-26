import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";

import {
  faUser,
  faChartLine,
  faCog,
  faBrain,
  faDatabase,
  faFileAlt,
  faHistory,
  faRocket,
  faChevronLeft,
  faChevronRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, projectId, targetFeature }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const navItems = [
    {
      icon: faUser,
      label: "Profile",
      path: "/profile",
      action: () => navigate("/profile"),
    },
    {
      icon: faDatabase,
      label: "Database",
      path: `/importSucc/${projectId}`,
      action: () => navigate(`/importSucc/${projectId}`),
    },
    {
      icon: faHistory,
      label: "History",
      path: `/historique/${projectId}/${targetFeature}`,
      action: () => navigate(`/historique/${projectId}/${targetFeature}`),
    },
    {
      icon: faFileAlt,
      label: "Description",
      path: `/description/${projectId}/${targetFeature}`,
      action: () => navigate(`/description/${projectId}/${targetFeature}`),
    },
    {
      icon: faChartLine,
      label: "Graphs",
      path: `/graphs/${projectId}/${targetFeature}`,
      action: () => navigate(`/graphs/${projectId}/${targetFeature}`),
    },
    {
      icon: faCog,
      label: "Processing",
      path: `/processing/${projectId}/${targetFeature}`,
      action: () => navigate(`/processing/${projectId}/${targetFeature}`),
    },
    {
      icon: faBrain,
      label: "Models",
      path: `/models/${projectId}/${targetFeature}`,
      action: () => navigate(`/models/${projectId}/${targetFeature}`),
    },
    {
      icon: faRocket,
      label: "Deployment",
      path: `/deployment/${projectId}/${targetFeature}`,
      action: () => navigate(`/deployment/${projectId}/${targetFeature}`),
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <>
            {/* Drawer mobile */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="app-sidebar mobile"
            >
              <button className="mobile-close-btn" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
              <div className="sidebar-header">
                <img src="/lg.png" alt="MedicalVision" className="sidebar-logo" />
                <h2>MedicalVision</h2>
              </div>
              <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    className={`nav-item ${
                      location.pathname.startsWith(item.path) ? "active" : ""
                    }`}
                    onClick={item.action}
                    data-tooltip={item.label}
                  >
                    <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>

            {/* Overlay */}
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          </>
        )}

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside className={`app-sidebar ${isOpen ? "open" : "closed"}`}>
            <div className="sidebar-header">
              <button className="sidebar-toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={isOpen ? faChevronLeft : faChevronRight} />
              </button>
              {isOpen && (
                <>
                  <img src="/lg.png" alt="MedicalVision" className="sidebar-logo" />
                  <h2>MedicalVision</h2>
                </>
              )}
            </div>
            <nav className="sidebar-nav">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  className={`nav-item ${
                    location.pathname.startsWith(item.path) ? "active" : ""
                  }`}
                  onClick={item.action}
                  data-tooltip={item.label}
                  title={!isOpen ? item.label : ""}
                >
                  <FontAwesomeIcon icon={item.icon} className="nav-icon" />
                  {isOpen && <span className="nav-label">{item.label}</span>}
                </button>
              ))}
            </nav>
          </aside>
        )}
      </AnimatePresence>

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;
