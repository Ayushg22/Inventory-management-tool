import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AccountCircle, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Hide navbar completely on dashboard
  if (location.pathname.startsWith('/dashboard')) {
    return null;
  }

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <AppBar position="static" sx={{ bgcolor: '#ffb74d' }}>
      <Toolbar>
        {/* Home Icon - only show if user is logged in and not on auth page */}
        {!isAuthPage && user && (
          <IconButton
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => navigate('/')}
          >
            <Home />
          </IconButton>
        )}

        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: user ? 'pointer' : 'default' }}
          // onClick={() => user && navigate('/')}
        >
          Inventory Management Tool
        </Typography>

        {!isAuthPage && user ? (
          isSmallScreen ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
              {anchorEl && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>
                    {user.username} ({user.email})
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              )}
            </>
          ) : (
            <Box display="flex" alignItems="center">
              <Typography
                variant="body1"
                sx={{ mr: 2, cursor: 'pointer' }}
                onClick={() => navigate('/profile')}
              >
                {user.username} ({user.email})
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )
        ) : (
          !isAuthPage && (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;