import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faGraduationCap,
  faCalendarAlt,
  faHospital,
  faCity,
  faGlobe,
  faRoad,
  faMailBulk,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import './UserCard.css';

const UserCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="user-card">
      <div className="user-card-header">
        <img
          src={`http://localhost:5000${user.imageUrl}` || "/default-avatar.png"}
          alt="Profile"
          className="profile-img"
        />
        <div className="user-info">
          <h2>{user.name}</h2>
          <span className="badge">{user.qualification || 'Qualification non spécifiée'}</span>
        </div>
      </div>
      <div className="user-card-body">
        <div className="info-item">
          <FontAwesomeIcon icon={faEnvelope} />
          <span>{user.email || 'Email non spécifié'}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faPhone} />
          <span>{user.phone || 'Téléphone non spécifié'}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>{user.age ? `${user.age} ans` : 'Âge non spécifié'}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faGraduationCap} />
          <span>{user.speciality || 'Spécialité non spécifiée'}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faStar} />
          <span>{user.experience ? `${user.experience} ans d'expérience` : "Expérience non spécifiée"}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faHospital} />
          <span>{user.hospital || "Hôpital non spécifié"}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faGlobe} />
          <span>{user.country || "Pays non spécifié"}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faCity} />
          <span>{user.region || "Région non spécifiée"}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faRoad} />
          <span>{user.street || "Rue non spécifiée"}</span>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={faMailBulk} />
          <span>{user.postalCode || "Code postal non spécifié"}</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
