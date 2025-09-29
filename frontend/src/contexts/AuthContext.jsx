import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
