import React, { useCallback, useEffect, useState } from 'react';
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

const prioridadeOptions = ['baixa', 'normal', 'alta', 'urgente'];

const emptyForm = {
  clienteId: '',
  tecnicoId: '',
  servicos: '',
  problema: '',
  diagnostico: '',
  prioridade: 'normal',
  validade: '',
  observacoes: '',
  valorTotal: ''
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
  tableActions: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: theme.spacing(-0.5),
    '& > *': {
      margin: theme.spacing(0.5)
    }
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: 'center'
  }
}));

const parseMoney = value => {
  if (value === '' || value === null || value === undefined) return 0;
  return Number(String(value).replace(',', '.'));
};

const formatMoney = value =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const formatDate = value => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
};

const getClienteNome = orcamento => orcamento.cliente?.cliente || 'Cliente não encontrado';
const getTecnicoNome = orcamento => orcamento.tecnico?.nome || 'Técnico não encontrado';

const Orcamentos = () => {
  const classes = useStyles();
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientesData, funcionariosData, orcamentosData] = await Promise.all([
        ordyvoApi.listClientes(),
        ordyvoApi.listFuncionarios(),
        ordyvoApi.listOrcamentos()
      ]);

      setClientes(clientesData || []);
      setFuncionarios(funcionariosData || []);
      setOrcamentos(orcamentosData || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar orçamentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      !form.validade
    ) {
      setMessage('Preencha cliente, técnico, serviços, problema, diagnóstico e validade.');
      return;
    }

    if (parseMoney(form.valorTotal) < 0) {
      setMessage('Valor total não pode ser negativo.');
      return;
    }

    setSaving(true);
    try {
      const novoOrcamento = await ordyvoApi.createOrcamento({
        clienteId: Number(form.clienteId),
        tecnicoId: Number(form.tecnicoId),
        servicos: form.servicos.trim(),
        problema: form.problema.trim(),
        diagnostico: form.diagnostico.trim(),
        prioridade: form.prioridade,
        validade: form.validade,
        observacoes: form.observacoes.trim(),
        valorTotal: parseMoney(form.valorTotal)
      });

      setOrcamentos([novoOrcamento, ...orcamentos]);
      setForm(emptyForm);
      setMessage('Orçamento salvo no banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar orçamento.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (orcamento, status) => {
    try {
      const atualizado = await ordyvoApi.updateOrcamentoStatus(orcamento.id, status);
      setOrcamentos(orcamentos.map(item => item.id === orcamento.id ? atualizado : item));
      setMessage(status === 'aprovado' ? 'Orçamento aprovado.' : 'Orçamento recusado.');
    } catch (error) {
      setMessage(error.message || 'Erro ao atualizar orçamento.');
    }
  };

  const convertToOrder = async orcamento => {
    try {
      const ordem = await ordyvoApi.convertOrcamento(orcamento.id);
      await loadData();
      setMessage(`Orçamento convertido na ordem ${ordem.numeroSequencial}.`);
    } catch (error) {
      setMessage(error.message || 'Erro ao converter orçamento.');
    }
  };

  const deleteOrcamento = async orcamento => {
    if (!window.confirm(`Deseja excluir o orçamento ${orcamento.numero}?`)) {
      return;
    }

    setDeletingId(orcamento.id);
    try {
      await ordyvoApi.deleteOrcamento(orcamento.id);
      const nextOrcamentos = await ordyvoApi.listOrcamentos();
      setOrcamentos(nextOrcamentos || []);
      setMessage('Orçamento excluído do banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir orçamento.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Orçamentos
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Crie orçamentos, controle a validade, registre aprovação ou recusa do
        cliente e converta propostas aprovadas em ordens de serviço.
      </Typography>

      <Card className={classes.content}>
        <CardHeader title="Novo orçamento" />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
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
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Validade"
                    name="validade"
                    onChange={handleChange}
                    type="date"
                    value={form.validade}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Valor total"
                    name="valorTotal"
                    onChange={handleChange}
                    value={form.valorTotal}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Serviços"
                    name="servicos"
                    onChange={handleChange}
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
                  Criar orçamento
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadData}>Atualizar</Button>} title="Orçamentos cadastrados" />
        <CardContent>
          {orcamentos.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum orçamento cadastrado.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Técnico</TableCell>
                  <TableCell>Serviços</TableCell>
                  <TableCell>Validade</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ordem</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orcamentos.map(orcamento => (
                  <TableRow hover key={orcamento.id}>
                    <TableCell>{orcamento.numero}</TableCell>
                    <TableCell>{getClienteNome(orcamento)}</TableCell>
                    <TableCell>{getTecnicoNome(orcamento)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{orcamento.servicos}</Typography>
                      <Typography color="textSecondary" variant="caption">
                        {orcamento.diagnostico}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(orcamento.validade)}</TableCell>
                    <TableCell>{formatMoney(orcamento.valorTotal)}</TableCell>
                    <TableCell>{orcamento.status}</TableCell>
                    <TableCell>{orcamento.ordemServico?.numeroSequencial || '-'}</TableCell>
                    <TableCell>
                      <div className={classes.tableActions}>
                        {orcamento.status === 'pendente' && (
                          <>
                            <Button
                              color="primary"
                              onClick={() => updateStatus(orcamento, 'aprovado')}
                              size="small"
                              variant="outlined"
                            >
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => updateStatus(orcamento, 'recusado')}
                              size="small"
                              variant="outlined"
                            >
                              Recusar
                            </Button>
                          </>
                        )}
                        {orcamento.status === 'aprovado' && (
                          <Button
                            color="primary"
                            onClick={() => convertToOrder(orcamento)}
                            size="small"
                            variant="contained"
                          >
                            Converter
                          </Button>
                        )}
                        <Button
                          disabled={deletingId === orcamento.id}
                          onClick={() => deleteOrcamento(orcamento)}
                          size="small"
                          variant="outlined"
                        >
                          {deletingId === orcamento.id ? 'Excluindo...' : 'Excluir'}
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

export default Orcamentos;
