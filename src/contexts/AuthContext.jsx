import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Pointing to our new auth endpoints
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error("Login error", error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Login failed" 
      };
    }
  };

  const signup = async (data) => {
    try {
      const response = await axios.post('/api/auth/signup', data);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error("Signup error", error);
      return { 
        success: false, 
        error: error.response?.data?.error || "Signup failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateLocalUser = (partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const updateProfile = async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await axios.put('/api/auth/profile', data, config);
      const updatedUser = response.data?.user || { ...(user || {}), ...(isFormData ? {} : data) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (_primaryError) {
      try {
        const isFormData = data instanceof FormData;
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        const response = await axios.patch('/api/users/me', data, config);
        const updatedUser = response.data?.user || { ...(user || {}), ...(isFormData ? {} : data) };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } catch {
        if (!(data instanceof FormData)) updateLocalUser(data);
        return {
          success: true,
          user: { ...(user || {}), ...(data instanceof FormData ? {} : data) },
          warning: 'Profile updated locally. Sync endpoint unavailable.',
        };
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
