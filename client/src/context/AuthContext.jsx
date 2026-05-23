import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(JSON.parse(localStorage.getItem('currentUser')) || null);
    }
    setLoading(false);
  }, [token]);

  const login = (currentUser, accessToken) => {
    setUser(currentUser);
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
