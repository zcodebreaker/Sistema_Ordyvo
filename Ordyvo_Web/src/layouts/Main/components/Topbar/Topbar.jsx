import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { AppBar, Toolbar, Badge, IconButton, Typography } from '@/styles/materialUiCompat';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import InputIcon from '@mui/icons-material/Input';

import { authStorage } from '../../../../services/ordyvoApi';

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none'
  },
  flexGrow: {
    flexGrow: 1
  },
  brandLink: {
    color: theme.palette.common.white,
    textDecoration: 'none'
  },
  brandText: {
    color: theme.palette.common.white
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  },
  desktopActions: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  mobileAction: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'block'
    }
  }
}));

const Topbar = props => {
  const { className, onSidebarOpen, ...rest } = props;

  const classes = useStyles();
  const navigate = useNavigate();

  const [notifications] = useState([]);

  const handleLogout = () => {
    if (!window.confirm('Deseja encerrar a sessão?')) return;
    authStorage.clearSession();
    authStorage.clearSavedLogin();
    navigate('/login');
  };

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Toolbar>
        <RouterLink className={classes.brandLink} to="/">
          <Typography className={classes.brandText} variant="h3">Ordyvo</Typography>
        </RouterLink>
        <div className={classes.flexGrow} />
        <div className={classes.desktopActions}>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            className={classes.signOutButton}
            color="inherit"
            onClick={handleLogout}
          >
            <InputIcon />
          </IconButton>
        </div>
        <div className={classes.mobileAction}>
          <IconButton
            color="inherit"
            onClick={onSidebarOpen}
          >
            <MenuIcon />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func
};

export default Topbar;
