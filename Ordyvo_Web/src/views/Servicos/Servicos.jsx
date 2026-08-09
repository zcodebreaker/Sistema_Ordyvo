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

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'stretch',
      flexDirection: 'column'
    }
  },
  search: {
    maxWidth: 360,
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%'
    }
  },
  empty: {
    padding: theme.spacing(4),
    textAlign: 'center'
  },
  owner: {
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3)
  },
  catalogTable: {
    marginTop: theme.spacing(2)
  }
}));

const serviceCategories = [
  'Diagnóstico',
  'Manutenção',
  'Troca de peça',
  'Software',
  'Limpeza',
  'Garantia'
];

const emptyCatalogForm = {
  nome: '',
  categoria: serviceCategories[0],
  descricao: '',
  precoBase: '',
  duracao: ''
};

const getClienteNome = aparelho => {
  if (!aparelho || !aparelho.clientes) return 'Sem cliente';
  return aparelho.clientes.cliente || 'Sem cliente';
};

const Servicos = () => {
  const classes = useStyles();
  const [aparelhos, setAparelhos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [catalogForm, setCatalogForm] = useState(emptyCatalogForm);
  const [catalog, setCatalog] = useState([]);

  const loadAparelhos = useCallback(async () => {
    setLoading(true);
    try {
      const [aparelhosData, catalogData] = await Promise.all([
        ordyvoApi.listAparelhos(),
        ordyvoApi.listServicosCatalogo()
      ]);
      setAparelhos(aparelhosData || []);
      setCatalog(catalogData || []);
    } catch (error) {
      setMessage(error.message || 'Erro ao carregar serviços.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAparelhos();
  }, [loadAparelhos]);

  const filteredAparelhos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return aparelhos;

    return aparelhos.filter(aparelho => {
      const fields = [
        getClienteNome(aparelho),
        aparelho.marca,
        aparelho.aparelho,
        aparelho.defeito
      ];

      return fields.some(value => String(value || '').toLowerCase().includes(term));
    });
  }, [aparelhos, search]);

  const handleCatalogChange = event => {
    setCatalogForm({
      ...catalogForm,
      [event.target.name]: event.target.value
    });
  };

  const handleCatalogSubmit = async event => {
    event.preventDefault();

    if (
      !catalogForm.nome.trim() ||
      !catalogForm.descricao.trim() ||
      !catalogForm.precoBase.trim() ||
      !catalogForm.duracao.trim()
    ) {
      setMessage('Preencha catálogo, descrição, preço-base e duração estimada.');
      return;
    }

    const precoBase = Number(catalogForm.precoBase.replace(',', '.'));
    if (Number.isNaN(precoBase) || precoBase < 0) {
      setMessage('Informe um preço-base válido.');
      return;
    }

    try {
      const novoServico = await ordyvoApi.createServicoCatalogo({
        nome: catalogForm.nome.trim(),
        categoria: catalogForm.categoria,
        descricao: catalogForm.descricao.trim(),
        precoBase,
        duracaoEstimada: catalogForm.duracao.trim()
      });
      setCatalog([...catalog, novoServico]);
      setCatalogForm(emptyCatalogForm);
      setMessage('Serviço adicionado ao catálogo.');
    } catch (error) {
      setMessage(error.message || 'Erro ao salvar serviço no catálogo.');
    }
  };

  const handleCatalogDelete = async service => {
    if (!window.confirm(`Deseja excluir "${service.nome}" do catálogo?`)) {
      return;
    }

    try {
      await ordyvoApi.deleteServicoCatalogo(service.id);
      setCatalog(catalog.filter(item => item.id !== service.id));
      setMessage('Serviço removido do catálogo.');
    } catch (error) {
      setMessage(error.message || 'Erro ao excluir serviço do catálogo.');
    }
  };

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        Serviços
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        Acompanhe os aparelhos cadastrados com dono, marca, modelo e defeito.
      </Typography>

      <Card className={classes.content}>
        <CardHeader title="Catálogo de serviços" />
        <CardContent>
          <form onSubmit={handleCatalogSubmit}>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <TextField
                  fullWidth
                  label="Catálogo / serviço"
                  name="nome"
                  onChange={handleCatalogChange}
                  value={catalogForm.nome}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={4} xs={12}>
                <TextField
                  fullWidth
                  label="Categoria de serviço"
                  name="categoria"
                  onChange={handleCatalogChange}
                  select
                  value={catalogForm.categoria}
                  variant="outlined"
                >
                  {serviceCategories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField
                  fullWidth
                  label="Preço-base"
                  name="precoBase"
                  onChange={handleCatalogChange}
                  placeholder="0,00"
                  value={catalogForm.precoBase}
                  variant="outlined"
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField
                  fullWidth
                  label="Duração estimada"
                  name="duracao"
                  onChange={handleCatalogChange}
                  placeholder="1 h"
                  value={catalogForm.duracao}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  name="descricao"
                  onChange={handleCatalogChange}
                  rows={3}
                  value={catalogForm.descricao}
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <div className={classes.actions}>
              <Button color="primary" type="submit" variant="contained">
                Adicionar ao catálogo
              </Button>
            </div>
          </form>

          <Table className={classes.catalogTable}>
            <TableHead>
              <TableRow>
                <TableCell>Catálogo</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Preço-base</TableCell>
                <TableCell>Duração estimada</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalog.map(service => (
                <TableRow hover key={service.id}>
                  <TableCell>{service.nome}</TableCell>
                  <TableCell>{service.categoria}</TableCell>
                  <TableCell>{service.descricao}</TableCell>
                  <TableCell>
                    {Number(service.precoBase).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell>{service.duracaoEstimada}</TableCell>
                  <TableCell align="right">
                    <Button color="secondary" onClick={() => handleCatalogDelete(service)}>
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className={classes.content}>
        <CardHeader title="Aparelhos cadastrados para serviço" />
        <CardContent>
          <div className={classes.toolbar}>
            <TextField
              className={classes.search}
              fullWidth
              label="Buscar por dono, marca, modelo ou defeito"
              onChange={event => setSearch(event.target.value)}
              value={search}
              variant="outlined"
            />
            <Button onClick={loadAparelhos} variant="outlined">
              Atualizar
            </Button>
          </div>

          {loading ? (
            <CircularProgress />
          ) : filteredAparelhos.length === 0 ? (
            <Typography className={classes.empty} color="textSecondary">
              Nenhum aparelho cadastrado para serviço.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Dono do aparelho</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Modelo / aparelho</TableCell>
                  <TableCell>Defeito</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAparelhos.map(aparelho => (
                  <TableRow hover key={aparelho.id}>
                    <TableCell className={classes.owner}>{getClienteNome(aparelho)}</TableCell>
                    <TableCell>{aparelho.marca}</TableCell>
                    <TableCell>{aparelho.aparelho}</TableCell>
                    <TableCell>{aparelho.defeito}</TableCell>
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

export default Servicos;
