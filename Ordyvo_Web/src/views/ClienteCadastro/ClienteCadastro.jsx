import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Snackbar,
  TextField,
  Typography
} from '@/styles/materialUiCompat';

import { ordyvoApi } from '../../services/ordyvoApi';

const emptyForm = {
  cliente: '',
  endereco: '',
  numero: '',
  bairro: '',
  marca: '',
  aparelho: '',
  defeito: ''
};

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: theme.spacing(2, -1, -1),
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(1)
    }
  }
}));

const ClienteCadastro = () => {
  const classes = useStyles();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = event => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleClear = () => {
    setForm(emptyForm);
    setMessage('Todos os campos foram limpos.');
  };

  const handleSubmit = async event => {
    event.preventDefault();

    const requiredValues = [
      form.cliente,
      form.endereco,
      form.numero,
      form.bairro,
      form.marca,
      form.aparelho,
      form.defeito
    ];

    if (requiredValues.some(value => !String(value).trim())) {
      setMessage('Preencha todos os campos.');
      return;
    }

    const numero = Number(form.numero);
    if (!Number.isInteger(numero)) {
      setMessage('Insira um número válido.');
      return;
    }

    setLoading(true);

    try {
      const clienteCriado = await ordyvoApi.createCliente({
        cliente: form.cliente.trim(),
        endereço: form.endereco.trim(),
        numero,
        bairro: form.bairro.trim()
      });

      await ordyvoApi.createAparelho({
        marca: form.marca.trim(),
        aparelho: form.aparelho.trim(),
        defeito: form.defeito.trim(),
        clientes: {
          id: clienteCriado.id
        }
      });

      setForm(emptyForm);
      setMessage('Dados cadastrados com sucesso.');
    } catch (error) {
      setMessage(error.message || 'Erro ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Cadastrar cliente
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Registre os dados do cliente e do aparelho, como no aplicativo desktop.
      </Typography>
      <Card>
        <CardHeader title="Dados do atendimento" />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField fullWidth label="Cliente" name="cliente" onChange={handleChange} value={form.cliente} variant="outlined" />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField fullWidth label="Endereço" name="endereco" onChange={handleChange} value={form.endereco} variant="outlined" />
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField fullWidth label="Número" name="numero" onChange={handleChange} value={form.numero} variant="outlined" />
              </Grid>
              <Grid item md={9} xs={12}>
                <TextField fullWidth label="Bairro" name="bairro" onChange={handleChange} value={form.bairro} variant="outlined" />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Marca" name="marca" onChange={handleChange} value={form.marca} variant="outlined" />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Aparelho" name="aparelho" onChange={handleChange} value={form.aparelho} variant="outlined" />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Defeito" name="defeito" onChange={handleChange} value={form.defeito} variant="outlined" />
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button disabled={loading} onClick={handleClear} variant="outlined">
                Limpar
              </Button>
              <Button color="primary" disabled={loading} type="submit" variant="contained">
                Salvar dados
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        autoHideDuration={4000}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </div>
  );
};

export default ClienteCadastro;
