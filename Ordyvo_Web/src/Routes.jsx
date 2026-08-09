import React from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Minimal as MinimalLayout } from './layouts';

import {
  ClienteCadastro as ClienteCadastroView,
  Clientes as ClientesView,
  Comprovantes as ComprovantesView,
  Dashboard as DashboardView,
  Funcionarios as FuncionariosView,
  ItensValores as ItensValoresView,
  Register as RegisterView,
  Login as LoginView,
  NotFound as NotFoundView,
  Orcamentos as OrcamentosView,
  OrdensServico as OrdensServicoView,
  Servicos as ServicosView
} from './views';

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/sign-in" element={<Navigate replace to="/login" />} />
      <Route path="/sign-up" element={<Navigate replace to="/register" />} />
      <Route path="/dashboard" element={<RouteWithLayout component={DashboardView} layout={MainLayout} />} />
      <Route path="/clientes/novo" element={<RouteWithLayout component={ClienteCadastroView} layout={MainLayout} />} />
      <Route path="/clientes" element={<RouteWithLayout component={ClientesView} layout={MainLayout} />} />
      <Route path="/funcionarios" element={<RouteWithLayout component={FuncionariosView} layout={MainLayout} />} />
      <Route path="/servicos" element={<RouteWithLayout component={ServicosView} layout={MainLayout} />} />
      <Route path="/ordens-servico" element={<RouteWithLayout component={OrdensServicoView} layout={MainLayout} />} />
      <Route path="/orcamentos" element={<RouteWithLayout component={OrcamentosView} layout={MainLayout} />} />
      <Route path="/execucao" element={<RouteWithLayout component={OrdensServicoView} layout={MainLayout} />} />
      <Route path="/pagamento-itens-valores" element={<RouteWithLayout component={ItensValoresView} layout={MainLayout} />} />
      <Route path="/comprovantes-conclusao" element={<RouteWithLayout component={ComprovantesView} layout={MainLayout} />} />
      <Route path="/register" element={<RouteWithLayout component={RegisterView} layout={MinimalLayout} />} />
      <Route path="/login" element={<RouteWithLayout component={LoginView} layout={MinimalLayout} />} />
      <Route path="/not-found" element={<RouteWithLayout component={NotFoundView} layout={MinimalLayout} />} />
      <Route path="*" element={<Navigate replace to="/not-found" />} />
    </RouterRoutes>
  );
};

export default Routes;
