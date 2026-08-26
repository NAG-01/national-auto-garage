import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nag_user');
      if (!saved || saved === 'undefined' || saved === 'null') {
        localStorage.removeItem('nag_user');
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      localStorage.removeItem('nag_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('nag_token');
      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('nag_token');
        localStorage.removeItem('nag_user');
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        let userData = null;

        if (res?.data?.user) {
          userData = res.data.user;
        } else if (res?.message?.user) {
          userData = res.message.user;
        } else if (res?.user) {
          userData = res.user;
        }

        if (userData) {
          setUser(userData);
          localStorage.setItem('nag_user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('nag_token');
          localStorage.removeItem('nag_user');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('nag_token');
        localStorage.removeItem('nag_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', {
      username: identifier,
      email: identifier,
      password,
    });

    let token = null;
    let userData = null;

    if (res?.data?.token) {
      token = res.data.token;
      userData = res.data.user;
    } else if (res?.message?.token) {
      token = res.message.token;
      userData = res.message.user;
    } else if (res?.token) {
      token = res.token;
      userData = res.user;
    }

    if (token && userData) {
      localStorage.setItem('nag_token', token);
      localStorage.setItem('nag_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    throw new Error('Invalid authentication response from server.');
  };

  const logout = () => {
    localStorage.removeItem('nag_token');
    localStorage.removeItem('nag_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
