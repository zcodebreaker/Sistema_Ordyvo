import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Avatar, Typography } from '@/styles/materialUiCompat';
import PersonIcon from '@mui/icons-material/Person';

import { authStorage } from '../../../../../../services/ordyvoApi';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 'fit-content'
  },
  avatar: {
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.icon,
    width: 72,
    height: 72
  },
  avatarIcon: {
    fontSize: 38
  },
  name: {
    marginTop: theme.spacing(1)
  }
}));

const Profile = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const session = authStorage.getSession();
  const fullName = [session?.nome, session?.sobrenome]
    .filter(Boolean)
    .join(' ')
    .trim();

  const user = {
    name: fullName || session?.username || 'Ordyvo',
    bio: 'Usuário conectado'
  };

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Avatar
        alt="Person"
        className={classes.avatar}
        component={RouterLink}
        to="/dashboard"
      >
        <PersonIcon className={classes.avatarIcon} />
      </Avatar>
      <Typography
        className={classes.name}
        variant="h4"
      >
        {user.name}
      </Typography>
      <Typography variant="body2">{user.bio}</Typography>
    </div>
  );
};

Profile.propTypes = {
  className: PropTypes.string
};

export default Profile;
