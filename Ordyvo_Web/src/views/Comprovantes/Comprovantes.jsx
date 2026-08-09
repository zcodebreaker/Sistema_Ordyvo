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

const defaultTerms =
  'Declaro que recebi as informações do atendimento, conferi os serviços descritos e estou ciente das condições, prazos e observações registrados neste comprovante.';

const emptyForm = {
  ordemServicoId: '',
  termos: defaultTerms,
  observacoes: '',
  assinaturaCliente: ''
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
  },
  printArea: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(4),
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.common.white
  },
  printHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  signature: {
    marginTop: theme.spacing(5),
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.text.primary}`,
    maxWidth: 360,
    width: '100%',
    textAlign: 'center'
  },
  dangerButton: {
    color: theme.palette.error.main
  }
}));

const formatDate = value => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
};

const formatMoney = value =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

const getOrderLabel = ordem => {
  const cliente = ordem.cliente?.cliente || 'Cliente não encontrado';
  return `${ordem.numeroSequencial} - ${cliente}`;
};

const getTotalOrdem = ordem =>
  (ordem?.itensValores || []).reduce((total, item) => total + Number(item.total || 0), 0);

const Comprovantes = () => {
  const classes = useStyles();
  const [ordens, setOrdens] = useState([]);
  const [comprovantes, setComprovantes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const selectedOrdem = useMemo(
    () => ordens.find(ordem => ordem.id === Number(form.ordemServicoId)),
    [form.ordemServicoId, ordens]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordensData, comprovantesData] = await Promise.all([
        ordyvoApi.listOrdensServico(),
        ordyvoApi.listComprovantes()
      ]);

      setOrdens(ordensData || []);
      setComprovantes(comprovantesData || []);
      setSelected(current => {
        if (!current) return (comprovantesData || [])[0] || null;
        return (comprovantesData || []).find(item => item.id === current.id) || current;
      });
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar comprovantes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = event => {
    const nextForm = {
      ...form,
      [event.target.name]: event.target.value
    };

    if (event.target.name === 'ordemServicoId') {
      const ordem = ordens.find(item => item.id === Number(event.target.value));
      nextForm.assinaturaCliente = ordem?.cliente?.cliente || '';
    }

    setForm(nextForm);
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!form.ordemServicoId || !form.termos.trim() || !form.assinaturaCliente.trim()) {
      setMessage('Preencha ordem de serviço, termos e assinatura do cliente.');
      return;
    }

    setSaving(true);
    try {
      const comprovante = await ordyvoApi.createComprovante({
        ordemServicoId: Number(form.ordemServicoId),
        termos: form.termos.trim(),
        observacoes: form.observacoes.trim(),
        assinaturaCliente: form.assinaturaCliente.trim()
      });

      setComprovantes([comprovante, ...comprovantes]);
      setSelected(comprovante);
      setForm(emptyForm);
      setMessage('Comprovante salvo no banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar comprovante.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async comprovante => {
    if (!window.confirm(`Deseja excluir o comprovante ${comprovante.numero}?`)) {
      return;
    }

    setDeletingId(comprovante.id);
    try {
      await ordyvoApi.deleteComprovante(comprovante.id);
      const nextComprovantes = await ordyvoApi.listComprovantes();
      setComprovantes(nextComprovantes);
      setSelected(current => {
        if (!current || current.id === comprovante.id) {
          return nextComprovantes[0] || null;
        }

        return nextComprovantes.find(item => item.id === current.id) || null;
      });
      setMessage('Comprovante removido do banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir comprovante.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = comprovante => {
    setSelected(comprovante);
    setTimeout(() => window.print(), 100);
  };

  const renderPrintable = () => {
    if (!selected) return null;

    const ordem = selected.ordemServico || {};
    const itens = ordem.itensValores || [];

    return (
      <Card className={classes.content}>
        <CardHeader
          action={<Button color="primary" onClick={() => handlePrint(selected)} variant="contained">Imprimir / PDF</Button>}
          title="Prévia do comprovante"
        />
        <CardContent>
          <div className={classes.printArea} id="printable-comprovante">
            <div className={classes.printHeader}>
              <div>
                <Typography variant="h3">Comprovante</Typography>
                <Typography color="textSecondary" variant="body2">
                  {selected.numero}
                </Typography>
              </div>
              <div>
                <Typography align="right" variant="body2">
                  Emitido em {formatDate(selected.criadoEm)}
                </Typography>
                <Typography align="right" variant="body2">
                  Ordem {ordem.numeroSequencial}
                </Typography>
              </div>
            </div>

            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <Typography color="textSecondary" variant="caption">Cliente</Typography>
                <Typography variant="body1">{ordem.cliente?.cliente}</Typography>
              </Grid>
              <Grid item sm={6} xs={12}>
                <Typography color="textSecondary" variant="caption">Técnico</Typography>
                <Typography variant="body1">{ordem.tecnico?.nome}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="caption">Serviços</Typography>
                <Typography variant="body1">{ordem.servicos}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="caption">Diagnóstico</Typography>
                <Typography variant="body1">{ordem.diagnostico}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="caption">Termos</Typography>
                <Typography variant="body1">{selected.termos}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary" variant="caption">Observações</Typography>
                <Typography variant="body1">{selected.observacoes || '-'}</Typography>
              </Grid>
            </Grid>

            {itens.length > 0 && (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Serviços executados</TableCell>
                    <TableCell>Peças/produtos</TableCell>
                    <TableCell>Qtd.</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itens.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.servicosExecutados}</TableCell>
                      <TableCell>{item.produtosPecas}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatMoney(item.total)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>Total da ordem</TableCell>
                    <TableCell>{formatMoney(getTotalOrdem(ordem))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}

            <div className={classes.signature}>
              <Typography variant="body1">{selected.assinaturaCliente}</Typography>
              <Typography color="textSecondary" variant="caption">
                Assinatura do cliente
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={classes.root}>
      <style>
        {`@media print {
          body * { visibility: hidden; }
          #printable-comprovante, #printable-comprovante * { visibility: visible; }
          #printable-comprovante {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 0 !important;
            padding: 24px !important;
          }
        }`}
      </style>

      <Typography gutterBottom variant="h2">
        Comprovantes
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Gere comprovantes com termos, observações e assinatura do cliente, prontos
        para impressão ou salvamento em PDF.
      </Typography>

      <Card className={classes.content}>
        <CardHeader title="Novo comprovante" />
        <CardContent>
          {loading ? (
            <CircularProgress />
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Ordem de serviço"
                    name="ordemServicoId"
                    onChange={handleChange}
                    select
                    value={form.ordemServicoId}
                    variant="outlined"
                  >
                    {ordens.map(ordem => (
                      <MenuItem key={ordem.id} value={ordem.id}>
                        {getOrderLabel(ordem)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Assinatura do cliente"
                    name="assinaturaCliente"
                    onChange={handleChange}
                    value={form.assinaturaCliente}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Termos"
                    multiline
                    name="termos"
                    onChange={handleChange}
                    rows={4}
                    value={form.termos}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    name="observacoes"
                    onChange={handleChange}
                    rows={3}
                    value={form.observacoes}
                    variant="outlined"
                  />
                </Grid>
                {selectedOrdem && (
                  <Grid item xs={12}>
                    <Typography color="textSecondary" variant="body2">
                      Pré-vinculado à ordem {selectedOrdem.numeroSequencial} de {selectedOrdem.cliente?.cliente}.
                    </Typography>
                  </Grid>
                )}
              </Grid>
              <div className={classes.actions}>
                <Button color="primary" disabled={saving} type="submit" variant="contained">
                  Salvar comprovante
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadData}>Atualizar</Button>} title="Comprovantes cadastrados" />
        <CardContent>
          {comprovantes.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum comprovante cadastrado.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Ordem</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Emissão</TableCell>
                  <TableCell>Assinatura</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comprovantes.map(comprovante => (
                  <TableRow hover key={comprovante.id}>
                    <TableCell>{comprovante.numero}</TableCell>
                    <TableCell>{comprovante.ordemServico?.numeroSequencial}</TableCell>
                    <TableCell>{comprovante.ordemServico?.cliente?.cliente}</TableCell>
                    <TableCell>{formatDate(comprovante.criadoEm)}</TableCell>
                    <TableCell>{comprovante.assinaturaCliente}</TableCell>
                    <TableCell>
                      <div className={classes.tableActions}>
                        <Button onClick={() => setSelected(comprovante)} size="small" variant="outlined">
                          Ver
                        </Button>
                        <Button color="primary" onClick={() => handlePrint(comprovante)} size="small" variant="outlined">
                          Imprimir / PDF
                        </Button>
                        <Button
                          className={classes.dangerButton}
                          disabled={deletingId === comprovante.id}
                          onClick={() => handleDelete(comprovante)}
                          size="small"
                          variant="outlined"
                        >
                          {deletingId === comprovante.id ? 'Excluindo...' : 'Excluir'}
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

      {renderPrintable()}

      <Snackbar
        autoHideDuration={4000}
        message={message}
        onClose={() => setMessage('')}
        open={Boolean(message)}
      />
    </div>
  );
};

export default Comprovantes;
