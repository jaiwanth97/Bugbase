import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ element }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default PrivateRoute;
