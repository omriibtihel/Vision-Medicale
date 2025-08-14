import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaArrowRight,
  FaUserShield,
} from "react-icons/fa";
import "./Login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="login-container-page">
      <form className="login-glass-form" onSubmit={handleSubmit}>
        <div className="login-form-header">
          <div className="login-logo-wrapper">
            <FaUserShield />
          </div>
          <h1 className="login-form-title">Bienvenue</h1>
          <p className="login-form-subtitle">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {error && (
          <div className="login-error-message">
            <FaExclamationCircle style={{ marginRight: "10px" }} />
            {error}
          </div>
        )}

        <div className="login-input-field">
          <span className="login-input-icon">
            <FaEnvelope />
          </span>
          <input
            type="email"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-input-field">
          <span className="login-input-icon">
            <FaLock />
          </span>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="login-submit-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
          {!isLoading && <FaArrowRight style={{ marginLeft: "10px" }} />}
        </button>

        <div className="login-form-footer">
          <Link to="/signup" className="login-form-link">Créer un compte</Link>
          <span className="login-separator">•</span>
          <Link to="/reset-password" className="login-form-link">Mot de passe oublié?</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
