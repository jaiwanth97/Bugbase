import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Dashboard, BugReport, Assignment, Speed, Logout } from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', roles: ['admin', 'dev', 'qa', 'user'] },
    { text: 'Bug Board', icon: <BugReport />, path: '/bugs', roles: ['admin'] },
    { text: 'Dev Tasks', icon: <Assignment />, path: '/dev', roles: ['dev'] },
    { text: 'QA Review', icon: <Speed />, path: '/qa', roles: ['qa'] }
  ].filter(item => user?.role && item.roles.includes(user.role));

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BugBase
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
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout;
