// Layout.js
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./importSucc.css";
import "./Description.css";
import "./graphs.css"
import "./Processing.css";
import "./models.css";
import "./test.css";    
import "./sidebar.css";

const Layout = ({ children, projectId, targetFeature }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // fermé par défaut
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  return (
    <div className="app-layout">
      {/* Bouton ☰ flottant en mobile */}
      {isMobile && !isSidebarOpen && (
        <button
          className="sidebar-toggle-mobile"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        projectId={projectId}
        targetFeature={targetFeature}
      />

      {/* Overlay en mobile */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Contenu */}
      <main
        className={`content1 ${
          isMobile ? "" : isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
