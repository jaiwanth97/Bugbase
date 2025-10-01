import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Tooltip, Menu, MenuItem, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControlLabel, Switch } from '@mui/material';
import { Logout, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../pages/UserDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import DevDashboard from '../pages/DevDashboard';
import QADashboard from '../pages/QADashboard';
import Login from '../pages/Login';

const drawerWidth = 240;

function Layout({ mode, onToggleMode }) {
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
    <Box sx={{ display: 'flex', backgroundColor: (t) => t.palette.background.default, minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            BugBase · {user.role.toUpperCase()}
          </Typography>
          <TopNavActions mode={mode} onToggleMode={onToggleMode} onLogout={logout} user={user} />
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar />
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

function TopNavActions({ mode, onToggleMode, onLogout, user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
        <IconButton color="inherit" onClick={onToggleMode} sx={{ mr: 1 }}>
          {mode === 'light' ? '🌙' : '☀️'}
        </IconButton>
      </Tooltip>
      <IconButton color="inherit" onClick={handleMenu}>
        <AccountCircle />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>{user?.username || 'User'}</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setSettingsOpen(true); handleClose(); }}>Settings</MenuItem>
        <MenuItem onClick={() => { onLogout(); handleClose(); }}>Logout</MenuItem>
      </Menu>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={onToggleMode} />}
            label="Dark mode"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
