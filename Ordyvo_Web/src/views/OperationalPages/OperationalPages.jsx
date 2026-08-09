import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography
} from '@/styles/materialUiCompat';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  emptyState: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column'
    }
  },
  actionGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    flexWrap: 'wrap'
  }
}));

const OperationalPage = ({ title, description, primaryAction, secondaryAction }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography gutterBottom variant="h2">
        {title}
      </Typography>
      <Typography color="textSecondary" gutterBottom variant="body1">
        {description}
      </Typography>

      <Grid className={classes.content} container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={title} />
            <CardContent className={classes.emptyState}>
              <div>
                <Typography gutterBottom variant="h4">
                  Módulo preparado
                </Typography>
                <Typography color="textSecondary" variant="body1">
                  Esta área já está no menu e pronta para receber formulários,
                  tabelas e integração com a Ordyvo_API.
                </Typography>
              </div>
              <div className={classes.actionGroup}>
                <Button color="primary" variant="contained">
                  {primaryAction}
                </Button>
                <Button variant="outlined">
                  {secondaryAction}
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

OperationalPage.propTypes = {
  description: PropTypes.string.isRequired,
  primaryAction: PropTypes.string.isRequired,
  secondaryAction: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

export const Servicos = () => (
  <OperationalPage
    description="Cadastre e acompanhe os serviços oferecidos pela assistência."
    primaryAction="Novo serviço"
    secondaryAction="Ver serviços"
    title="Serviços"
  />
);

export const OrdensServico = () => (
  <OperationalPage
    description="Organize as ordens de serviço vinculadas aos clientes e aparelhos."
    primaryAction="Nova ordem"
    secondaryAction="Ver ordens"
    title="Ordens de serviço"
  />
);

export const ItensValores = () => (
  <OperationalPage
    description="Controle itens, peças, mão de obra e valores usados nos atendimentos."
    primaryAction="Novo item"
    secondaryAction="Ver itens"
    title="Itens e valores"
  />
);

export const Orcamentos = () => (
  <OperationalPage
    description="Monte orçamentos para aprovação antes da execução dos serviços."
    primaryAction="Novo orçamento"
    secondaryAction="Ver orçamentos"
    title="Orçamentos"
  />
);

export const Comprovantes = () => (
  <OperationalPage
    description="Consulte e organize comprovantes de pagamento e entrega."
    primaryAction="Novo comprovante"
    secondaryAction="Ver comprovantes"
    title="Comprovantes"
  />
);
