import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { BugReport, Assignment, Speed, Logout, Dashboard } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import DevDashboard from '../pages/DevDashboard';
import QADashboard from '../pages/QADashboard';
import Login from '../pages/Login';

const drawerWidth = 240;

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getMenuItems = (role) => {
    switch (role) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }
        ];
      case 'dev':
        return [
          { text: 'My Tasks', icon: <Assignment />, path: '/dashboard' }
        ];
      case 'qa':
        return [
          { text: 'QA Review', icon: <Speed />, path: '/dashboard' }
        ];
      default:
        return [
          { text: 'Report Bug', icon: <BugReport />, path: '/dashboard' }
        ];
    }
  };

  if (!user) {
    return <Login />;
  }

  const getDashboardComponent = (role) => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'dev':
        return <DevDashboard />;
      case 'qa':
        return <QADashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            BugBase - {user.role.toUpperCase()}
          </Typography>
          <IconButton color="inherit" onClick={logout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {getMenuItems(user.role).map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Routes>
          <Route 
            path="/dashboard" 
            element={getDashboardComponent(user.role)} 
          />
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default Layout;
