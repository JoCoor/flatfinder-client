import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import theme from '../styles/theme';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import MailIcon from '@mui/icons-material/Mail';

const Navbar = () => {
  const { user, setUser, unreadCount } = useUser();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const commonLinks = [
    { label: 'Home', to: '/' },
    { label: 'Flats', to: '/flats' },
  ];

  const loggedOutLinks = [
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ];

  const loggedInLinks = [
    { label: 'Profile', to: '/profile' },
    { label: 'Adicionar Flat', to: '/add-flat' },
    { label: '❤️ Favoritos', to: '/favorites' },
    {
      label: (
        <Badge badgeContent={unreadCount} color="secondary">
          <MailIcon sx={{ marginRight: 1 }} />
          Inbox
        </Badge>
      ),
      to: '/inbox',
    },
  ];

  if (user?.isAdmin) {
    loggedInLinks.push({ label: 'Admin Panel', to: '/admin' });
  }

  const renderLinks = () =>
    [...commonLinks, ...(user ? loggedInLinks : loggedOutLinks)].map((link) =>
      typeof link.label === 'string' ? (
        <Button
          key={link.to}
          color="inherit"
          component={Link}
          to={link.to}
          sx={{
            textTransform: 'none',
            color: theme.colors.card,
            fontWeight: 500,
          }}
        >
          {link.label}
        </Button>
      ) : (
        <Box key={link.to}>{/* placeholder, handled in mobile drawer */}</Box>
      )
    );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: theme.colors.primary }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: theme.font }}>
            <Link to="/" style={{ textDecoration: 'none', color: theme.colors.card }}>
              Scandic Flats
            </Link>
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {renderLinks()}
            {user && (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: theme.colors.secondary, alignSelf: 'center' }}
                >
                  Olá, {user.firstName}
                </Typography>
                <Button
                  onClick={handleLogout}
                  sx={{
                    border: `1px solid ${theme.colors.card}`,
                    color: theme.colors.card,
                    ml: 1,
                    textTransform: 'none',
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>

          <IconButton
            edge="end"
            color="inherit"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {[...commonLinks, ...(user ? loggedInLinks : loggedOutLinks)].map((item) =>
              typeof item.label === 'string' ? (
                <ListItem key={item.to} disablePadding>
                  <ListItemButton component={Link} to={item.to}>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ) : (
                <ListItem key={item.to} disablePadding>
                  <ListItemButton component={Link} to={item.to}>
                    {item.label}
                  </ListItemButton>
                </ListItem>
              )
            )}
            {user && (
              <>
                <ListItem>
                  <ListItemText primary={`Olá, ${user.firstName}`} />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
