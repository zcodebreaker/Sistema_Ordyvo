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

const emptyForm = {
  ordemServicoId: '',
  servicosExecutados: '',
  produtosPecas: '',
  quantidade: '1',
  valorServicos: '',
  valorProdutos: '',
  maoDeObra: '',
  desconto: '0',
  impostos: '0'
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
  totalPreview: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  dangerButton: {
    color: theme.palette.error.main
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

const getOrderLabel = ordem => {
  const cliente = ordem.cliente?.cliente || 'Cliente não encontrado';
  return `${ordem.numeroSequencial} - ${cliente}`;
};

const ItensValores = () => {
  const classes = useStyles();
  const [ordens, setOrdens] = useState([]);
  const [itens, setItens] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const totalPreview = useMemo(() => {
    const quantidade = Number(form.quantidade || 0);
    const valorServicos = parseMoney(form.valorServicos);
    const valorProdutos = parseMoney(form.valorProdutos);
    const maoDeObra = parseMoney(form.maoDeObra);
    const desconto = parseMoney(form.desconto);
    const impostos = parseMoney(form.impostos);

    return valorServicos + (valorProdutos * quantidade) + maoDeObra + impostos - desconto;
  }, [form]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordensData, itensData] = await Promise.all([
        ordyvoApi.listOrdensServico(),
        ordyvoApi.listItensValores()
      ]);

      setOrdens(ordensData || []);
      setItens(itensData || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar itens e valores.');
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
      !form.ordemServicoId ||
      !form.servicosExecutados.trim() ||
      !form.produtosPecas.trim()
    ) {
      setMessage('Preencha ordem, serviços executados e produtos/peças.');
      return;
    }

    if (Number(form.quantidade) <= 0 || totalPreview < 0) {
      setMessage('Quantidade deve ser maior que zero e total não pode ser negativo.');
      return;
    }

    setSaving(true);
    try {
      const itemCriado = await ordyvoApi.createItemValor({
        ordemServicoId: Number(form.ordemServicoId),
        servicosExecutados: form.servicosExecutados.trim(),
        produtosPecas: form.produtosPecas.trim(),
        quantidade: Number(form.quantidade),
        valorServicos: parseMoney(form.valorServicos),
        valorProdutos: parseMoney(form.valorProdutos),
        maoDeObra: parseMoney(form.maoDeObra),
        desconto: parseMoney(form.desconto),
        impostos: parseMoney(form.impostos)
      });

      setItens([itemCriado, ...itens]);
      setForm(emptyForm);
      setMessage('Itens e valores salvos no banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar itens e valores.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    try {
      await ordyvoApi.deleteItemValor(id);
      setItens(itens.filter(item => item.id !== id));
      setMessage('Item removido do banco de dados.');
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir item.');
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Itens e valores
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Registre serviços executados, produtos ou peças utilizadas, quantidade,
        mão de obra, descontos, impostos e total por ordem de serviço.
      </Typography>

      <Card className={classes.content}>
        <CardHeader title="Novo item de cobrança" />
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
                  <div className={classes.totalPreview}>
                    <Typography color="textSecondary" variant="caption">
                      Total calculado
                    </Typography>
                    <Typography variant="h4">
                      {formatMoney(totalPreview)}
                    </Typography>
                  </div>
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Serviços executados"
                    multiline
                    name="servicosExecutados"
                    onChange={handleChange}
                    rows={3}
                    value={form.servicosExecutados}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Produtos ou peças utilizadas"
                    multiline
                    name="produtosPecas"
                    onChange={handleChange}
                    rows={3}
                    value={form.produtosPecas}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Quantidade"
                    name="quantidade"
                    onChange={handleChange}
                    type="number"
                    value={form.quantidade}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Valor serviços"
                    name="valorServicos"
                    onChange={handleChange}
                    value={form.valorServicos}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Valor peças"
                    name="valorProdutos"
                    onChange={handleChange}
                    value={form.valorProdutos}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Mão de obra"
                    name="maoDeObra"
                    onChange={handleChange}
                    value={form.maoDeObra}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Desconto"
                    name="desconto"
                    onChange={handleChange}
                    value={form.desconto}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={2} xs={12}>
                  <TextField
                    fullWidth
                    label="Impostos"
                    name="impostos"
                    onChange={handleChange}
                    value={form.impostos}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <div className={classes.actions}>
                <Button color="primary" disabled={saving} type="submit" variant="contained">
                  Salvar item
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader action={<Button onClick={loadData}>Atualizar</Button>} title="Itens cadastrados" />
        <CardContent>
          {itens.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum item ou valor cadastrado.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ordem</TableCell>
                  <TableCell>Serviços executados</TableCell>
                  <TableCell>Produtos/peças</TableCell>
                  <TableCell>Qtd.</TableCell>
                  <TableCell>Mão de obra</TableCell>
                  <TableCell>Desconto</TableCell>
                  <TableCell>Impostos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itens.map(item => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.ordemServico?.numeroSequencial}</TableCell>
                    <TableCell>{item.servicosExecutados}</TableCell>
                    <TableCell>{item.produtosPecas}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{formatMoney(item.maoDeObra)}</TableCell>
                    <TableCell>{formatMoney(item.desconto)}</TableCell>
                    <TableCell>{formatMoney(item.impostos)}</TableCell>
                    <TableCell>{formatMoney(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        className={classes.dangerButton}
                        onClick={() => handleDelete(item.id)}
                        size="small"
                      >
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

export default ItensValores;
