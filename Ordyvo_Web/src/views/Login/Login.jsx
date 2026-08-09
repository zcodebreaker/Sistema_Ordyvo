import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Link,
  Snackbar,
  TextField,
  Typography
} from '@/styles/materialUiCompat';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';

import { authStorage, ordyvoApi } from '../../services/ordyvoApi';

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
  loginButton: {
    margin: theme.spacing(2, 0)
  }
}));

const Login = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const savedLogin = authStorage.getSavedLogin();
  const [values, setValues] = useState({
    username: savedLogin.username,
    password: savedLogin.password,
    remember: Boolean(savedLogin.password)
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]:
        event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!values.username.trim() || !values.password) {
      setMessage('Por favor, informe o usuário e a senha.');
      return;
    }

    setLoading(true);
    try {
      const session = await ordyvoApi.login(values.username.trim(), values.password);
      authStorage.setSession(session);

      if (values.remember) {
        authStorage.setSavedLogin({
          username: values.username.trim(),
          password: values.password
        });
      } else {
        authStorage.clearSavedLogin();
      }

      navigate('/dashboard');
    } catch (error) {
      setMessage(error.message || 'Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Grid className={classes.grid} container>
        <Grid className={classes.banner} item md={5} xs={12}>
          <Typography className={classes.bannerText} gutterBottom variant="h1">
            Ordyvo
          </Typography>
          <Typography className={classes.bannerText} variant="h4">
            Atendimento, clientes e aparelhos conectados à sua API local.
          </Typography>
        </Grid>
        <Grid className={classes.content} item md={7} xs={12}>
          <form className={classes.form} onSubmit={handleSubmit}>
            <Typography gutterBottom variant="h2">
              Entrar
            </Typography>
            <Typography color="textSecondary">
              Use o mesmo usuário cadastrado na Ordyvo_API.
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
                    <PersonIcon color="action" />
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
            <FormControlLabel
              control={<Checkbox checked={values.remember} color="primary" name="remember" onChange={handleChange} />}
              label="Salvar senha"
            />
            <Button
              className={classes.loginButton}
              color="primary"
              disabled={loading}
              fullWidth
              size="large"
              type="submit"
              variant="contained"
            >
              Login
            </Button>
            <Typography color="textSecondary" variant="body1">
              Precisa criar um usuário?{' '}
              <Link component={RouterLink} to="/register" variant="h6">
                Cadastrar usuário
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

export default Login;
