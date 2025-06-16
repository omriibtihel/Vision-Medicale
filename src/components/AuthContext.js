import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte d'authentification
export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Composant fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Récupérer l'utilisateur depuis localStorage lors de l'initialisation
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Utiliser un effet pour mettre à jour localStorage lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Fonction de connexion simulée
  const login = (username, password) => {
    const loggedInUser = { name: username }; // Exemple simplifié
    setUser(loggedInUser);
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null); // Déconnexion de l'utilisateur
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
