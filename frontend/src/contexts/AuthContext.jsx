import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [initializing, setInitializing] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://bugbase.onrender.com/api/users/login', {
        email,
        password,
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userResponse = await axios.get('https://bugbase.onrender.com/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Restore session on app load
  useEffect(() => {
    const restore = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('https://bugbase.onrender.com/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (e) {
        localStorage.removeItem('token');
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setInitializing(false);
      }
    };
    restore();
  }, [token]);

  const value = {
    user,
    token,
    initializing,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
