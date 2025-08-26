import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaArrowRight,
  FaUserMd,
  FaHeartbeat,
  FaDna,
  FaStethoscope,
} from "react-icons/fa";
import "./Login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  // Génération de particules flottantes
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      const { access_token } = response.data;
      localStorage.setItem("token", access_token);

      const profileResponse = await axios.get("http://localhost:5000/profile", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = profileResponse.data;
      localStorage.setItem("userId", userData.id);

      if (userData.isAdmin) {
        navigate("/admin-dashboard");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Échec de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const medicalIcons = [
    { icon: FaHeartbeat, class: "login-icon-1" },
    { icon: FaDna, class: "login-icon-2" },
    { icon: FaStethoscope, class: "login-icon-3" },
  ];

  return (
    <div className="login-container-page">
      {/* Particules animées */}
      <div className="login-particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="login-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Vagues de fond animées */}
      <div className="login-waves-container">
        <div className="login-wave login-wave1"></div>
        <div className="login-wave login-wave2"></div>
        <div className="login-wave login-wave3"></div>
      </div>

      {/* Icônes médicales flottantes */}
      <div className="login-floating-icons">
        {medicalIcons.map(({ icon: Icon, class: iconClass }, index) => (
          <div key={index} className={`login-floating-icon ${iconClass}`}>
            <Icon />
          </div>
        ))}
      </div>

      {/* Formulaire principal */}
      <form className="login-glass-form" onSubmit={handleSubmit}>
        <div className="login-form-header">
          <div className="login-logo-wrapper">
            <div className="login-logo-circle">
              <FaUserMd className="login-main-icon" />
              <div className="login-pulse-ring"></div>
              <div className="login-pulse-ring login-delayed"></div>
            </div>
          </div>
          <div className="login-form-title">
            <span className="login-title-line">MedPredic</span>
            <span className="login-title-subtitle">Intelligence Médicale</span>
          </div>
          <p className="login-form-subtitle">
            Plateforme d'entraînement et de prédiction médicale
          </p>
        </div>

        {error && (
          <div className="login-error-message">
            <FaExclamationCircle className="login-error-icon" />
            <span>{error}</span>
          </div>
        )}

        <div className="login-input-group">
          <div className="login-input-field">
            <input
              type="email"
              placeholder="Adresse email professionnelle"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaEnvelope className="login-input-icon" />
            <div className="login-input-highlight"></div>
          </div>

          <div className="login-input-field">
            <input
              type="password"
              placeholder="Mot de passe sécurisé"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="login-input-icon" />
            <div className="login-input-highlight"></div>
          </div>
        </div>

        <button
          className={`login-submit-button ${isLoading ? "login-loading" : ""}`}
          type="submit"
          disabled={isLoading}
        >
          <span className="login-button-content">
            {isLoading ? (
              <>
                <div className="login-loading-spinner"></div>
                Connexion en cours...
              </>
            ) : (
              <>
                Accéder au tableau de bord
                <FaArrowRight className="login-arrow-icon" />
              </>
            )}
          </span>
        </button>

        <div className="login-form-footer">
          <Link to="/signup" className="login-form-link">
            Créer un compte
          </Link>
          <span className="login-separator">•</span>
          <Link to="/reset-password" className="login-form-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <div className="login-security-badge">
          <div className="login-badge-content">
            <span className="login-shield-icon">🛡️</span>
            <span>Données médicales sécurisées</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;