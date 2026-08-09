import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  MenuItem,
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

const statusOptions = [
  'aberta',
  'em análise',
  'aguardando aprovação',
  'em execução',
  'concluída',
  'cancelada'
];

const prioridadeOptions = ['baixa', 'normal', 'alta', 'urgente'];

const emptyForm = {
  clienteId: '',
  tecnicoId: '',
  servicos: '',
  problema: '',
  diagnostico: '',
  prioridade: 'normal',
  prazo: '',
  observacoes: '',
  status: 'aberta'
};

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
  },
  history: {
    margin: 0,
    paddingLeft: theme.spacing(2)
  },
  statusField: {
    minWidth: 190
  },
  tableActions: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: theme.spacing(-0.5),
    '& > *': {
      margin: theme.spacing(0.5)
    }
  }
}));

const formatOrderNumber = sequence => `OS-${String(sequence).padStart(5, '0')}`;

const formatDate = value => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
};

const formatDateTime = value =>
  new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

const getClienteNome = ordem => ordem.cliente?.cliente || 'Cliente não encontrado';
const getTecnicoNome = ordem => ordem.tecnico?.nome || 'Técnico não encontrado';

const OrdensServico = () => {
  const classes = useStyles();
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [ordens, setOrdens] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const nextSequence = useMemo(() => {
    const maxId = ordens.reduce((max, ordem) => Math.max(max, ordem.id || 0), 0);
    return maxId + 1;
  }, [ordens]);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientesData, funcionariosData, ordensData] = await Promise.all([
        ordyvoApi.listClientes(),
        ordyvoApi.listFuncionarios(),
        ordyvoApi.listOrdensServico()
      ]);
      setClientes(clientesData || []);
      setFuncionarios(funcionariosData || []);
      setOrdens(ordensData || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar dados para ordens de serviço.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBaseData();
  }, [loadBaseData]);

  const handleChange = event => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (
      !form.clienteId ||
      !form.tecnicoId ||
      !form.servicos.trim() ||
      !form.problema.trim() ||
      !form.diagnostico.trim() ||
      !form.prazo
    ) {
      setMessage('Preencha cliente, técnico, serviços, problema, diagnóstico e prazo.');
      return;
    }

    setSaving(true);
    try {
      const novaOrdem = await ordyvoApi.createOrdemServico({
        clienteId: Number(form.clienteId),
        tecnicoId: Number(form.tecnicoId),
        servicos: form.servicos.trim(),
        problema: form.problema.trim(),
        diagnostico: form.diagnostico.trim(),
        prioridade: form.prioridade,
        prazo: form.prazo,
        observacoes: form.observacoes.trim(),
        status: form.status
      });

      setOrdens([novaOrdem, ...ordens]);
      setForm(emptyForm);
      setMessage('Ordem de serviço salva no banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar ordem de serviço.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (ordem, status) => {
    if (ordem.status === status) return;

    const statusAnterior = ordem.status;
    const now = new Date().toISOString();

    try {
      await ordyvoApi.updateOrdemServicoStatus(ordem.id, status);
      setOrdens(ordens.map(item => {
        if (item.id !== ordem.id) return item;

        return {
          ...item,
          status,
          historico: [
            ...(item.historico || []),
            {
              data: now,
              descricao: `Status alterado de "${statusAnterior}" para "${status}".`
            }
          ]
        };
      }));
      setMessage('Status atualizado no banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao atualizar status.');
    }
  };

  const handleDelete = async ordem => {
    if (!window.confirm(`Deseja excluir a ordem ${ordem.numeroSequencial}?`)) {
      return;
    }

    setDeletingId(ordem.id);
    try {
      await ordyvoApi.deleteOrdemServico(ordem.id);
      const ordensData = await ordyvoApi.listOrdensServico();
      setOrdens(ordensData || []);
      setMessage('Ordem de serviço excluída do banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir ordem de serviço.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Ordens de serviço
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Controle número sequencial, cliente, técnico, serviços, diagnóstico,
        prioridade, prazo, observações, status e histórico de alterações.
      </Typography>

      <Card className={classes.content}>
        <CardHeader title={`Nova ordem ${formatOrderNumber(nextSequence)}`} />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    label="Número sequencial"
                    value={formatOrderNumber(nextSequence)}
                    variant="outlined"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    label="Cliente"
                    name="clienteId"
                    onChange={handleChange}
                    select
                    value={form.clienteId}
                    variant="outlined"
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.cliente}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    label="Técnico responsável"
                    name="tecnicoId"
                    onChange={handleChange}
                    select
                    value={form.tecnicoId}
                    variant="outlined"
                  >
                    {funcionarios.map(funcionario => (
                      <MenuItem key={funcionario.id} value={funcionario.id}>
                        {funcionario.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Serviços"
                    name="servicos"
                    onChange={handleChange}
                    placeholder="Ex: diagnóstico, troca de tela"
                    value={form.servicos}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    fullWidth
                    label="Prioridade"
                    name="prioridade"
                    onChange={handleChange}
                    select
                    value={form.prioridade}
                    variant="outlined"
                  >
                    {prioridadeOptions.map(prioridade => (
                      <MenuItem key={prioridade} value={prioridade}>
                        {prioridade}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    fullWidth
                    label="Prazo"
                    name="prazo"
                    onChange={handleChange}
                    type="date"
                    value={form.prazo}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    label="Status"
                    name="status"
                    onChange={handleChange}
                    select
                    value={form.status}
                    variant="outlined"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={8} xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    name="observacoes"
                    onChange={handleChange}
                    value={form.observacoes}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição do problema"
                    multiline
                    name="problema"
                    onChange={handleChange}
                    rows={3}
                    value={form.problema}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Diagnóstico"
                    multiline
                    name="diagnostico"
                    onChange={handleChange}
                    rows={3}
                    value={form.diagnostico}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button color="primary" disabled={saving} type="submit" variant="contained">
                  Criar ordem
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadBaseData}>Atualizar</Button>} title="Ordens cadastradas" />
        <CardContent>
          {ordens.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhuma ordem de serviço cadastrada.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Serviços</TableCell>
                  <TableCell>Problema / diagnóstico</TableCell>
                  <TableCell>Prioridade / prazo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Histórico</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordens.map(ordem => (
                  <TableRow hover key={ordem.id}>
                    <TableCell>{ordem.numeroSequencial}</TableCell>
                    <TableCell>{getClienteNome(ordem)}</TableCell>
                    <TableCell>{getTecnicoNome(ordem)}</TableCell>
                    <TableCell>{ordem.servicos}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{ordem.descricaoProblema}</Typography>
                      <Typography color="textSecondary" variant="caption">
                        {ordem.diagnostico}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{ordem.prioridade}</Typography>
                      <Typography color="textSecondary" variant="caption">
                        {formatDate(ordem.prazo)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        className={classes.statusField}
                        onChange={event => handleStatusChange(ordem, event.target.value)}
                        select
                        value={ordem.status}
                        variant="outlined"
                      >
                        {statusOptions.map(status => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <ul className={classes.history}>
                        {(ordem.historico || []).map(item => (
                          <li key={`${ordem.id}-${item.data}-${item.descricao}`}>
                            <Typography variant="caption">
                              {formatDateTime(item.data)} - {item.descricao}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className={classes.tableActions}>
                        <Button
                          disabled={deletingId === ordem.id}
                          onClick={() => handleDelete(ordem)}
                          size="small"
                          variant="outlined"
                        >
                          {deletingId === ordem.id ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      </div>
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

export default OrdensServico;
