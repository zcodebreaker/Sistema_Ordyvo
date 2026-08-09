import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Grid,
  InputAdornment,
  Link,
  Snackbar,
  TextField,
  Typography
} from '@/styles/materialUiCompat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';

import { ordyvoApi } from '../../services/ordyvoApi';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    height: '100%'
  },
  grid: {
    height: '100%'
  },
  banner: {
    background: 'linear-gradient(135deg, #1f2a44 0%, #1565c0 100%)',
    color: theme.palette.common.white,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(8)
  },
  bannerText: {
    color: theme.palette.common.white
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  form: {
    maxWidth: 480,
    padding: theme.spacing(4),
    width: '100%'
  },
  textField: {
    marginTop: theme.spacing(2)
  },
  button: {
    margin: theme.spacing(2, 0)
  }
}));

const Register = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: '',
    nome: '',
    sobrenome: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (
      !values.username.trim() ||
      !values.nome.trim() ||
      !values.sobrenome.trim() ||
      !values.password ||
      !values.confirmPassword
    ) {
      setMessage('Preencha usuário, nome, sobrenome, senha e confirmação.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      setMessage('A confirmação de senha não confere.');
      return;
    }

    setLoading(true);
    try {
      await ordyvoApi.register({
        username: values.username.trim(),
        nome: values.nome.trim(),
        sobrenome: values.sobrenome.trim(),
        password: values.password
      });
      setMessage('Usuário cadastrado com sucesso.');
      setTimeout(() => navigate('/login'), 700);
    } catch (error) {
      setMessage(error.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Grid className={classes.grid} container>
        <Grid className={classes.banner} item md={5} xs={12}>
          <Typography className={classes.bannerText} gutterBottom variant="h1">
            Novo usuário
          </Typography>
          <Typography className={classes.bannerText} variant="h4">
            Crie um acesso para usar o painel web da Ordyvo.
          </Typography>
        </Grid>
        <Grid className={classes.content} item md={7} xs={12}>
          <form className={classes.form} onSubmit={handleSubmit}>
            <Typography gutterBottom variant="h2">
              Cadastrar usuário
            </Typography>
            <Typography color="textSecondary">
              O usuário será criado diretamente em `/api/auth/register`.
            </Typography>
            <TextField
              className={classes.textField}
              fullWidth
              label="Usuário"
              name="username"
              onChange={handleChange}
              value={values.username}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              className={classes.textField}
              fullWidth
              label="Nome"
              name="nome"
              onChange={handleChange}
              value={values.nome}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              className={classes.textField}
              fullWidth
              label="Sobrenome"
              name="sobrenome"
              onChange={handleChange}
              value={values.sobrenome}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PermIdentityIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              className={classes.textField}
              fullWidth
              label="Senha"
              name="password"
              onChange={handleChange}
              type="password"
              value={values.password}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              className={classes.textField}
              fullWidth
              label="Confirmar senha"
              name="confirmPassword"
              onChange={handleChange}
              type="password"
              value={values.confirmPassword}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <Button
              className={classes.button}
              color="primary"
              disabled={loading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              Cadastrar
            </Button>
            <Typography color="textSecondary" variant="body1">
              Já tem acesso?{' '}
              <Link component={RouterLink} to="/login" variant="h6">
                Entrar
              </Link>
            </Typography>
          </form>
        </Grid>
      </Grid>
      <Snackbar
        autoHideDuration={4000}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </div>
  );
};

export default Register;
