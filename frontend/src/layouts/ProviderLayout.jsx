import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menu = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <DashboardIcon /> },
  { label: 'Bookings', path: '/app/bookings', icon: <AssignmentIcon /> },
  { label: 'Profile', path: '/app/profile', icon: <PersonIcon /> },
  { label: 'Services & Skills', path: '/app/skills', icon: <BuildIcon /> },
  { label: 'Availability & Slots', path: '/app/availability', icon: <ScheduleIcon /> },
];

export default function ProviderLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, logout } = useAuth();

  const drawerContent = (
    <Box sx={{ height: '100%', bgcolor: '#0f172a', color: '#cbd5e1' }}>
      <Toolbar sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.16)' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
            FixItPro
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Technician Panel
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ p: 1.5 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: '#94a3b8',
              '& .MuiListItemIcon-root': {
                color: '#94a3b8',
                minWidth: 38,
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                '& .MuiListItemIcon-root': {
                  color: '#38bdf8',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.12)',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          color: '#0f172a',
          boxShadow: 'none',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              Welcome, {provider?.name || provider?.mobile}
            </Typography>
          </Box>
          <Chip
            label={`Status: ${provider?.status || 'INACTIVE'}`}
            color={provider?.status === 'ACTIVE' ? 'success' : 'warning'}
            sx={{ mr: 2 }}
          />
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#0ea5e9', mr: 1, fontSize: 14 }}>
            {(provider?.name || provider?.mobile || 'P').slice(0, 1).toUpperCase()}
          </Avatar>
          <KeyboardArrowDownIcon sx={{ color: '#64748b', mr: 1 }} />
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
