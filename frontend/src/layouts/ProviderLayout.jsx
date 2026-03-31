import {
  AppBar,
  Box,
  CssBaseline,
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
  Stack,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 286;

const menu = [
  { label: 'Dashboard', path: '/app/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Bookings', path: '/app/bookings', icon: <AssignmentOutlinedIcon /> },
  { label: 'Availability', path: '/app/availability', icon: <ScheduleOutlinedIcon /> },
  { label: 'Services', path: '/app/skills', icon: <BuildOutlinedIcon /> },
  { label: 'Profile', path: '/app/profile', icon: <PersonOutlineOutlinedIcon /> },
];

export default function ProviderLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, logout } = useAuth();

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#cbd5e1',
        background:
          'linear-gradient(180deg, #111a2e 0%, #111d34 42%, #111a2f 100%)',
      }}
    >
      <Box>
        <Toolbar sx={{ minHeight: '92px !important', borderBottom: '1px solid rgba(148, 163, 184, 0.12)' }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: '#11b9a3',
              }}
            >
              <HandymanOutlinedIcon sx={{ color: '#e8fffb' }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                FixItPro
              </Typography>
              <Typography sx={{ color: '#6f819f', fontSize: 14.5, mt: 0.2 }}>
                Service Provider
              </Typography>
            </Box>
          </Stack>
        </Toolbar>

        <List sx={{ p: 1.6, pt: 2.2 }}>
          {menu.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.8,
                  px: 1.8,
                  py: 1.4,
                  color: active ? '#12d3b5' : '#97a7c1',
                  '& .MuiListItemIcon-root': {
                    color: active ? '#12d3b5' : '#5d6f90',
                    minWidth: 42,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: active ? 700 : 600,
                    fontSize: 18.5,
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(18, 211, 181, 0.18)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(18, 211, 181, 0.22)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
                {active ? (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#12d3b5',
                      boxShadow: '0 0 8px rgba(18, 211, 181, 0.45)',
                    }}
                  />
                ) : null}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 1.6, borderTop: '1px solid rgba(148, 163, 184, 0.12)' }}>
        <List sx={{ p: 0 }}>
          {[{ label: 'Settings', icon: <SettingsOutlinedIcon /> }, { label: 'Help', icon: <HelpOutlineOutlinedIcon /> }].map((item) => (
            <ListItemButton
              key={item.label}
              sx={{
                borderRadius: 2.2,
                mb: 0.6,
                px: 1.8,
                py: 1.1,
                color: '#97a7c1',
                '& .MuiListItemIcon-root': {
                  color: '#7b89a1',
                  minWidth: 42,
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 500,
                  fontSize: 18,
                },
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.1)',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
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
