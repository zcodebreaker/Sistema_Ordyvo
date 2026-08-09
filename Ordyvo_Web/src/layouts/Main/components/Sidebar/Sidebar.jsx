import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Divider, Drawer } from '@/styles/materialUiCompat';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { Profile, SidebarNav, UpgradePlan } from './components';

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up('lg')]: {
      marginTop: 64,
      height: 'calc(100% - 64px)'
    }
  },
  root: {
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  nav: {
    marginBottom: theme.spacing(2)
  }
}));

const Sidebar = props => {
  const { open, variant, onClose, className, ...rest } = props;

  const classes = useStyles();

  const pages = [
    {
      title: 'Início',
      href: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      title: 'Clientes',
      href: '/clientes',
      icon: <PeopleIcon />
    },
    {
      title: 'Orçamentos',
      href: '/orcamentos',
      icon: <AttachMoneyIcon />
    },
    {
      title: 'Ordens de serviço',
      href: '/ordens-servico',
      icon: <AssignmentIcon />
    },
    {
      title: 'Execução',
      href: '/execucao',
      icon: <SettingsIcon />
    },
    {
      title: 'Itens e valores',
      href: '/pagamento-itens-valores',
      icon: <FormatListBulletedIcon />
    },
    {
      title: 'Comprovantes',
      href: '/comprovantes-conclusao',
      icon: <ReceiptIcon />
    },
    {
      title: 'Serviços',
      href: '/servicos',
      icon: <BuildIcon />
    },
    {
      title: 'Funcionários',
      href: '/funcionarios',
      icon: <GroupIcon />
    }
  ];

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      slotProps={{ paper: { className: classes.drawer } }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 240
        }
      }}
      variant={variant}
    >
      <div
        {...rest}
        className={clsx(classes.root, className)}
      >
        <Profile />
        <Divider className={classes.divider} />
        <SidebarNav
          className={classes.nav}
          pages={pages}
        />
        <UpgradePlan />
      </div>
    </Drawer>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired
};

export default Sidebar;
