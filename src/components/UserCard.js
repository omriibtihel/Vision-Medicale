import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faGraduationCap,
  faHospital,
  faIdBadge,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import './UserCard.css';

const UserCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="user-card-modern">
      <div className="user-card-header-modern">
        <div className="profile-img-container-modern">
          <img
            src={`http://localhost:5000${user.imageUrl}` || "/default-avatar.png"}
            alt={`Dr. ${user.name}`}
            className="profile-img-modern"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="profile-status-modern"></div>
        </div>
        <div className="user-info-modern">
          <h2 className="user-name-modern">Dr. {user.name}</h2>
          <span className="badge-modern">
            <FontAwesomeIcon icon={faIdBadge} className="badge-icon-modern" />
            {user.qualification || 'Médecin'}
          </span>
        </div>
      </div>
      
      <div className="user-card-body-modern">
        <div className="info-grid-modern">
          <div className="info-item-modern">
            <div className="info-icon-modern">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div className="info-content-modern">
              <span className="info-label-modern">Email</span>
              <span className="info-value-modern">{user.email || 'non spécifié'}</span>
            </div>
          </div>
          
          <div className="info-item-modern">
            <div className="info-icon-modern">
              <FontAwesomeIcon icon={faPhone} />
            </div>
            <div className="info-content-modern">
              <span className="info-label-modern">Téléphone</span>
              <span className="info-value-modern">{user.phone || 'non spécifié'}</span>
            </div>
          </div>
          
          <div className="info-item-modern">
            <div className="info-icon-modern">
              <FontAwesomeIcon icon={faStethoscope} />
            </div>
            <div className="info-content-modern">
              <span className="info-label-modern">Spécialité</span>
              <span className="info-value-modern">{user.speciality || 'non spécifiée'}</span>
            </div>
          </div>
          
          <div className="info-item-modern">
            <div className="info-icon-modern">
              <FontAwesomeIcon icon={faHospital} />
            </div>
            <div className="info-content-modern">
              <span className="info-label-modern">Établissement</span>
              <span className="info-value-modern">{user.hospital || 'non spécifié'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="user-card-footer-modern">
        <span className="member-since-modern">Membre depuis {new Date(user.createdAt).getFullYear()}</span>
      </div>
    </div>
  );
};

export default UserCard;