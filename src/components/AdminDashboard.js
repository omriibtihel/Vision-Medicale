import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// Options communes pour les charts avec style moderne & fluide
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 900,
    easing: 'easeOutQuart'
  },
  plugins: {
    legend: {
      labels: {
        font: {
          size: 14,
          family: "'Poppins', sans-serif",
          weight: '600',
        },
        color: '#2C3E50',

      }
    },
    tooltip: {
      backgroundColor: 'rgba(26, 123, 211, 0.85)',
      titleFont: { size: 16, weight: '700' },
      bodyFont: { size: 14 },
      cornerRadius: 8,
      padding: 10,
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#2C3E50',
        font: { size: 13, family: "'Poppins', sans-serif" }
      }
    },
    y: {
      grid: {
        color: 'rgba(44, 62, 80, 0.1)' ,// au lieu de bleu clair
        borderDash: [5, 5],
      },
      ticks: {
        color: '#2C3E50',
        font: { size: 13, family: "'Poppins', sans-serif" },
        beginAtZero: true,
        stepSize: 1,
      }
    }
  },
  elements: {
    bar: {
      borderRadius: 10,
      borderSkipped: false,
    },
    point: {
      radius: 6,
      hoverRadius: 8,
      backgroundColor: '#1a7bd3',
    },
    line: {
      tension: 0.4, // courbe douce
      borderWidth: 3,
      borderColor: '#1a7bd3',
      backgroundColor:'rgba(44, 62, 80, 0.1)',
      fill: true,
    }
  }
};

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Récupérer les utilisateurs en attente
    axios.get('http://localhost:5000/admin/pending-users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

    // Récupérer les statistiques
    axios.get('http://localhost:5000/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, [token]);

  const approveUser = (id) => {
    axios.post(`http://localhost:5000/admin/user/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setUsers(prev => prev.filter(u => u.id !== id));
    });
  };

  const rejectUser = (id) => {
    axios.delete(`http://localhost:5000/admin/user/${id}/reject`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setUsers(prev => prev.filter(u => u.id !== id));
    });
  };

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Tableau de bord Admin</h2>

      <div className="charts-grid">
        <div className="chart-box">
              <div className="chart-wrapper">

          <h4>Inscriptions par semaine</h4>
          {stats.signupsPerWeek ? (
            <Bar data={stats.signupsPerWeek} options={chartOptions} />
          ) : (
            <p>Chargement...</p>
          )}
        </div></div>

        <div className="chart-box">
        <div className="chart-wrapper">
          <h4>Répartition des spécialités</h4>
          {stats.specialities ? (
            <Pie data={stats.specialities} options={chartOptions} />
          ) : (
            <p>Chargement...</p>
          )}
        </div></div>

        <div className="chart-box">
        <div className="chart-wrapper">
          <h4>Approuvés vs En attente</h4>
          {stats.approvalStatus ? (
            <Doughnut data={stats.approvalStatus} options={chartOptions} />
          ) : (
            <p>Chargement...</p>
          )}
        </div></div>

        <div className="chart-box">
        <div className="chart-wrapper">
          <h4>Connexions par jour</h4>
          {stats.loginsPerDay ? (
            <Line data={stats.loginsPerDay} options={chartOptions} />
          ) : (
            <p>Chargement...</p>
          )}
        </div>
        </div>
      </div>

      <h3 className="dashboard-title">Utilisateurs en attente</h3>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Spécialité</th>
              <th>Qualification</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.speciality}</td>
                  <td>{user.qualification}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <button className="btn-approve" onClick={() => approveUser(user.id)}>Approuver</button>
                    <button className="btn-reject" onClick={() => rejectUser(user.id)}>Refuser</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>
                  Aucun utilisateur en attente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
