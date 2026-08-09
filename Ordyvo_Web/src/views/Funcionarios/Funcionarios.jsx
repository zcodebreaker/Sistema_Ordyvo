import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@/styles/materialUiCompat';

import { ordyvoApi } from '../../services/ordyvoApi';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3)
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: 'center'
  }
}));

const today = new Date().toISOString().slice(0, 10);

const Funcionarios = () => {
  const classes = useStyles();
  const [funcionarios, setFuncionarios] = useState([]);
  const [form, setForm] = useState({ nome: '', funcao: '', dataEntrada: today });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadFuncionarios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordyvoApi.listFuncionarios();
      setFuncionarios(data || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar funcionários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFuncionarios();
  }, [loadFuncionarios]);

  const handleChange = event => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.nome.trim() || !form.funcao.trim()) {
      setMessage('Nome e função são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      await ordyvoApi.createFuncionario({
        nome: form.nome.trim(),
        funcao: form.funcao.trim(),
        dataEntrada: form.dataEntrada
      });
      setForm({ nome: '', funcao: '', dataEntrada: today });
      setMessage('Funcionário cadastrado com sucesso.');
      await loadFuncionarios();
    } catch (error) {
      setMessage(error.message || 'Erro ao cadastrar funcionário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async funcionario => {
    if (!window.confirm(`Deseja excluir ${funcionario.nome}?`)) {
      return;
    }

    try {
      await ordyvoApi.deleteFuncionario(funcionario.id);
      setMessage('Funcionário excluído com sucesso.');
      await loadFuncionarios();
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir funcionário.');
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Funcionários
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Cadastre e acompanhe a equipe da Ordyvo.
      </Typography>

      <Card>
        <CardHeader title="Novo funcionário" />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={5} xs={12}>
                <TextField fullWidth label="Nome" name="nome" onChange={handleChange} value={form.nome} variant="outlined" />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Função" name="funcao" onChange={handleChange} value={form.funcao} variant="outlined" />
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField fullWidth label="Data de entrada" name="dataEntrada" onChange={handleChange} type="date" value={form.dataEntrada} variant="outlined" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button color="primary" disabled={saving} type="submit" variant="contained">
                Cadastrar funcionário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadFuncionarios}>Atualizar</Button>} title="Equipe" />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : funcionarios.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum funcionário cadastrado.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Data de entrada</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funcionarios.map(funcionario => (
                  <TableRow hover key={funcionario.id}>
                    <TableCell>{funcionario.id}</TableCell>
                    <TableCell>{funcionario.nome}</TableCell>
                    <TableCell>{funcionario.função}</TableCell>
                    <TableCell>{new Date(funcionario.data_Entrada).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell align="right">
                      <Button color="secondary" onClick={() => handleDelete(funcionario)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

export default Funcionarios;
