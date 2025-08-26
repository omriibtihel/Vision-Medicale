import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaExclamationCircle,
  FaUserPlus,
  FaPhone,
  FaBriefcaseMedical,
  FaHospital,
  FaCamera,
} from "react-icons/fa";
import "./Signup.css";

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    speciality: "",
    hospital: "",
    rememberMe: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Charger une image par défaut si aucun fichier n'est choisi
  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl("http://localhost:5000/static/uploads/user.jpg");
 // chemin vers ton image par défaut côté backend/static
    }
  }, [profileImage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      await axios.post("http://localhost:5000/signup", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/login");
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la création du compte");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <div className="signup-header">
          <div className="signup-logo">
            <FaUserPlus />
          </div>
          <h1 className="signup-title">Créer un compte</h1>
          <p className="signup-subtitle">
            Rejoignez notre plateforme médicale dès aujourd'hui
          </p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-columns">
            {/* Colonne gauche */}
            <div className="signup-left">
              <h3 className="signup-column-title">Informations Générales</h3>

              <div className="signup-input-group">
                <span className="signup-icon"><FaUser /></span>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom et Prénom"
                  required
                />
              </div>

              <div className="signup-input-group">
                <span className="signup-icon"><FaEnvelope /></span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Adresse Email"
                  required
                />
              </div>

              <div className="signup-input-group">
                <span className="signup-icon"><FaLock /></span>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mot de passe"
                  required
                  minLength="8"
                />
              </div>

              <div className="signup-input-group">
                <span className="signup-icon"><FaLock /></span>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmer le mot de passe"
                  required
                />
              </div>

              <div className="signup-input-group">
                <span className="signup-icon"><FaBriefcaseMedical /></span>
                <input
                  name="speciality"
                  placeholder="Spécialité"
                  value={formData.speciality}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Colonne droite */}
            <div className="signup-right">
              <h3 className="signup-column-title dark">Coordonnées</h3>

              <div className="signup-input-group">
                <span className="signup-icon dark"><FaPhone /></span>
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="dark-input"
                />
              </div>

              <div className="signup-input-group">
                <span className="signup-icon dark"><FaHospital /></span>
                <input
                  name="hospital"
                  placeholder="Établissement de santé"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="dark-input"
                />
              </div>

              <div className="signup-file-upload">
                <label htmlFor="profileImage" className="signup-upload-label">
                  <FaCamera /> Télécharger une photo de profil
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfileImage(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  style={{ display: "none" }}
                />
                {previewUrl && (
                  <div
                    className="signup-image-preview"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                  />
                )}
              </div>

              <label className="signup-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Se souvenir de moi ({formData.rememberMe ? "Oui" : "Non"})
              </label>
            </div>
          </div>

          {error && (
            <div className="signup-error">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <button type="submit" className="signup-submit">Créer un compte</button>

          <div className="signup-footer">
            Vous avez déjà un compte ?
            <Link to="/login" className="signup-link"> Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
