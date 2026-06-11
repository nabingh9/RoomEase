import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('roomease_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('roomease_user');
      }
    }
    setLoading(false);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const parseResponse = async (response) => {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (parseError) {
      return { error: text || 'Unable to parse server response.' };
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponse(res);
      if (!res.ok || data.success === false) {
        const fieldErrors = data.field_errors || {};
        const errorMessage = data.error || `Login failed (${res.status})`;
        setAuthError(errorMessage);
        return { success: false, error: errorMessage, fieldErrors };
      }
      const userObj = data.user || data;
      setUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem('roomease_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      const message = err.message?.includes('Failed to fetch')
        ? 'Unable to contact backend. Make sure the RoomEase backend is running on http://localhost:5000.'
        : 'Login failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponse(res);
      if (!res.ok || data.success === false) {
        const fieldErrors = data.field_errors || {};
        const errorMessage = data.error || `Registration failed (${res.status})`;
        setAuthError(errorMessage);
        return { success: false, error: errorMessage, fieldErrors };
      }
      const userObj = data.user || data;
      setUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem('roomease_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      const message = err.message?.includes('Failed to fetch')
        ? 'Unable to contact backend. Make sure the RoomEase backend is running on http://localhost:5000.'
        : 'Registration failed. Please try again.';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    localStorage.removeItem('roomease_user');
  };

  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      authError,
      login,
      register,
      logout,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
