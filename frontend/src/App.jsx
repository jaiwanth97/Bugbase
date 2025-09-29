import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BugBoard from './pages/BugBoard';
import DevDashboard from './pages/DevDashboard';
import QADashboard from './pages/QADashboard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
                <Route path="/bugs" element={<PrivateRoute element={<BugBoard />} />} />
                <Route path="/dev" element={<PrivateRoute element={<DevDashboard />} />} />
                <Route path="/qa" element={<PrivateRoute element={<QADashboard />} />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
