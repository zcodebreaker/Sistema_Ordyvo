import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  tableRow: {
    cursor: 'pointer'
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: 'center'
  },
  detailsGrid: {
    marginTop: theme.spacing(1)
  },
  dialogActions: {
    margin: theme.spacing(0, 1, 1),
    '& > *': {
      margin: theme.spacing(1)
    }
  }
}));

const Clientes = () => {
  const classes = useStyles();
  const [clientes, setClientes] = useState([]);
  const [aparelhos, setAparelhos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadClientes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordyvoApi.listClientes();
      setClientes(data || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar clientes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  const handleOpen = async cliente => {
    setSelected(cliente);
    setAparelhos([]);
    try {
      const data = await ordyvoApi.listAparelhosByCliente(cliente.id);
      setAparelhos(data || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar aparelhos.');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    if (!window.confirm(`Tem certeza que deseja deletar o cliente ${selected.cliente}?`)) {
      return;
    }

    try {
      await ordyvoApi.deleteCliente(selected.id);
      setMessage('Cliente deletado com sucesso.');
      setSelected(null);
      await loadClientes();
    } catch (error) {
      setMessage(error.message || 'Erro ao deletar cliente.');
    }
  };

  const aparelho = aparelhos[0] || {};

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Clientes ativos
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Clique em um cliente para ver os detalhes e o aparelho vinculado.
      </Typography>
      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadClientes}>Atualizar</Button>} title="Clientes" />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : clientes.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum cliente cadastrado.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Bairro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map(cliente => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={cliente.id}
                    onDoubleClick={() => handleOpen(cliente)}
                    onClick={() => handleOpen(cliente)}
                  >
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>{cliente.cliente}</TableCell>
                    <TableCell>{cliente.endereço}</TableCell>
                    <TableCell>{cliente.numero}</TableCell>
                    <TableCell>{cliente.bairro}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog fullWidth maxWidth="md" onClose={() => setSelected(null)} open={Boolean(selected)}>
        <DialogTitle>Detalhes do cliente</DialogTitle>
        <DialogContent>
          {selected && (
            <Grid className={classes.detailsGrid} container spacing={2}>
              <Grid item md={6} xs={12}>
                <TextField fullWidth label="Cliente" value={selected.cliente || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField fullWidth label="Endereço" value={selected.endereço || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField fullWidth label="Número" value={selected.numero || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={9} xs={12}>
                <TextField fullWidth label="Bairro" value={selected.bairro || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Marca" value={aparelho.marca || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Aparelho" value={aparelho.aparelho || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField fullWidth label="Defeito" value={aparelho.defeito || ''} variant="outlined" InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={() => setSelected(null)}>Voltar</Button>
          <Button color="secondary" onClick={handleDelete} variant="contained">
            Deletar cliente
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        autoHideDuration={4000}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </div>
  );
};

export default Clientes;
