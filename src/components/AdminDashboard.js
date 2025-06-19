import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/admin/pending-users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const approveUser = (id) => {
    axios.post(`http://localhost:5000/admin/user/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });
  };

  const rejectUser = (id) => {
    axios.delete(`http://localhost:5000/admin/user/${id}/reject`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });
  };

  return (
    <div className="admin-dashboard">
      <h2 className="dashboard-title">Utilisateurs en attente</h2>
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
            {users.map((user) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
