import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  colors
} from '@/styles/materialUiCompat';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';

import { ordyvoApi } from '../../services/ordyvoApi';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  hero: {
    marginBottom: theme.spacing(3)
  },
  metric: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  icon: {
    alignItems: 'center',
    borderRadius: 8,
    color: colors.common.white,
    display: 'flex',
    height: 48,
    justifyContent: 'center',
    width: 48
  },
  primaryIcon: {
    backgroundColor: theme.palette.primary.main
  },
  successIcon: {
    backgroundColor: theme.palette.success.main
  },
  warningIcon: {
    backgroundColor: theme.palette.warning.main
  },
  infoIcon: {
    backgroundColor: theme.palette.info.main
  },
  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: theme.spacing(-1),
    '& > *': {
      margin: theme.spacing(1)
    }
  }
}));

const Dashboard = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    dbOnline: false,
    clientes: 0,
    funcionarios: 0,
    aparelhos: 0
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const [dbOnline, clientes, funcionarios] = await Promise.all([
        ordyvoApi.checkDatabase(),
        ordyvoApi.listClientes().catch(() => []),
        ordyvoApi.listFuncionarios().catch(() => [])
      ]);

      if (!active) return;

      setStatus({
        dbOnline,
        clientes: clientes.length,
        funcionarios: funcionarios.length,
        aparelhos: 0
      });
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = [
    {
      title: 'Banco de dados',
      value: status.dbOnline ? 'Online' : 'Offline',
      icon: <StorageIcon />,
      className: status.dbOnline ? classes.successIcon : classes.warningIcon
    },
    {
      title: 'Clientes ativos',
      value: status.clientes,
      icon: <PeopleIcon />,
      className: classes.primaryIcon
    },
    {
      title: 'Funcionários',
      value: status.funcionarios,
      icon: <GroupIcon />,
      className: classes.infoIcon
    },
    {
      title: 'Aparelhos',
      value: 'Por cliente',
      icon: <BuildIcon />,
      className: classes.warningIcon
    }
  ];

  return (
    <div className={classes.root}>
      <Card className={classes.hero}>
        <CardContent>
          <Typography gutterBottom variant="h2">
            Ordyvo
          </Typography>
          <Typography color="textSecondary" variant="body1">
            Painel web integrado à Ordyvo_API, espelhando os fluxos do aplicativo desktop.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {metrics.map(metric => (
          <Grid item key={metric.title} lg={3} sm={6} xs={12}>
            <Card>
              <CardContent className={classes.metric}>
                <div>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {metric.title}
                  </Typography>
                  <Typography variant="h3">{metric.value}</Typography>
                </div>
                <div className={`${classes.icon} ${metric.className}`}>
                  {metric.icon}
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Ações rápidas" />
            <CardContent className={classes.quickActions}>
              <Button color="primary" onClick={() => navigate('/clientes/novo')} variant="contained">
                Cadastrar cliente
              </Button>
              <Button onClick={() => navigate('/clientes')} variant="outlined">
                Clientes ativos
              </Button>
              <Button onClick={() => navigate('/funcionarios')} variant="outlined">
                Funcionários
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
