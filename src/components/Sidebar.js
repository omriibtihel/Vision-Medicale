// Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  const sidebarWidth = isMobile ? "80vw" : "250px";
  const closedWidth = isMobile ? "0" : "70px";

  console.log("Sidebar → isOpen:", isOpen, "| isMobile:", isMobile);

  const sidebarStyle = {
    width: isOpen ? sidebarWidth : closedWidth,
    transform: isMobile && !isOpen ? "translateX(-100%)" : "none",
  };

  const handleProfileClick = () => navigate("/profile");
  const handleGraphsClick = () =>
    navigate(`/graphs/${projectId}/${targetFeature}`);
  const handleProcessingClick = () =>
    navigate(`/processing/${projectId}/${targetFeature}`);
  const handleModelsClick = () =>
    navigate(`/models/${projectId}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${projectId}`);
  const handleDescription = () =>
    navigate(`/description/${projectId}/${targetFeature}`);
  const handleHistorique = () =>
    navigate(`/historique/${projectId}/${targetFeature}`);
  const handleDepClick = () =>
    navigate(`/deployment/${projectId}/${targetFeature}`);

  const navItems = [
    {
      icon: faUser,
      label: "Profile",
      action: handleProfileClick,
      active: false,
    },
    {
      icon: faDatabase,
      label: "Database",
      action: handleDBClick,
      active: true,
    },
    {
      icon: faHistory,
      label: "History",
      action: handleHistorique,
      active: false,
    },
    {
      icon: faFileAlt,
      label: "Description",
      action: handleDescription,
      active: false,
    },
    {
      icon: faChartLine,
      label: "Graphs",
      action: handleGraphsClick,
      active: false,
    },
    {
      icon: faCog,
      label: "Processing",
      action: handleProcessingClick,
      active: false,
    },
    {
      icon: faBrain,
      label: "Models",
      action: handleModelsClick,
      active: false,
    },
    {
      icon: faRocket,
      label: "Deployment",
      action: handleDepClick,
      active: false,
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
                <img
                  src="/lg.png"
                  alt="MedicalVision"
                  className="sidebar-logo"
                />
                <h2>MedicalVision</h2>
              </div>
              <nav className="sidebar-nav">
                {navItems.map((item, index) => (
                  <button
                    key={index}
                    className={`nav-item ${item.active ? "active" : ""}`}
                    onClick={item.action}
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
                <FontAwesomeIcon
                  icon={isOpen ? faChevronLeft : faChevronRight}
                />
              </button>
              {isOpen && (
                <>
                  <img
                    src="/lg.png"
                    alt="MedicalVision"
                    className="sidebar-logo"
                  />
                  <h2>MedicalVision</h2>
                </>
              )}
            </div>
            <nav className="sidebar-nav">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  className={`nav-item ${item.active ? "active" : ""}`}
                  onClick={item.action}
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
