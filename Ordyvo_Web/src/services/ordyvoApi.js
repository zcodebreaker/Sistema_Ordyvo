const API_BASE_URL =
  import.meta.env.VITE_ORDYVO_API_URL || 'http://localhost:5032';

const SESSION_KEY = 'ordyvo.session';
const SAVED_LOGIN_KEY = 'ordyvo.savedLogin';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? parseJson(text) : null;

  if (!response.ok) {
    const message =
      (data && data.message) ||
      (typeof data === 'string' ? data : null) ||
      `Erro ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const authStorage = {
  getSession() {
    const value = localStorage.getItem(SESSION_KEY);
    return value ? JSON.parse(value) : null;
  },
  setSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },
  getSavedLogin() {
    const value = localStorage.getItem(SAVED_LOGIN_KEY);
    return value ? JSON.parse(value) : { username: '', password: '' };
  },
  setSavedLogin(credentials) {
    localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify(credentials));
  },
  clearSavedLogin() {
    localStorage.removeItem(SAVED_LOGIN_KEY);
  }
};

export const ordyvoApi = {
  baseUrl: API_BASE_URL,
  checkDatabase() {
    return request('/api/db').then(() => true).catch(() => false);
  },
  login(username, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  register(user) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },
  listClientes() {
    return request('/api/client');
  },
  createCliente(cliente) {
    return request('/api/client', {
      method: 'POST',
      body: JSON.stringify(cliente)
    });
  },
  deleteCliente(id) {
    return request(`/api/client/${id}`, {
      method: 'DELETE'
    });
  },
  createAparelho(aparelho) {
    return request('/api/aparelho', {
      method: 'POST',
      body: JSON.stringify(aparelho)
    });
  },
  listAparelhos() {
    return request('/api/aparelho');
  },
  listAparelhosByCliente(clienteId) {
    return request(`/api/aparelho/client/${clienteId}`).catch(error => {
      if (error.message.includes('404')) {
        return [];
      }
      throw error;
    });
  },
  listServicosCatalogo() {
    return request('/api/servicos');
  },
  createServicoCatalogo(servico) {
    return request('/api/servicos', {
      method: 'POST',
      body: JSON.stringify(servico)
    });
  },
  deleteServicoCatalogo(id) {
    return request(`/api/servicos/${id}`, {
      method: 'DELETE'
    });
  },
  listOrdensServico() {
    return request('/api/ordens-servico');
  },
  createOrdemServico(ordem) {
    return request('/api/ordens-servico', {
      method: 'POST',
      body: JSON.stringify(ordem)
    });
  },
  updateOrdemServicoStatus(id, status) {
    return request(`/api/ordens-servico/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  deleteOrdemServico(id) {
    return request(`/api/ordens-servico/${id}`, {
      method: 'DELETE'
    });
  },
  listItensValores() {
    return request('/api/itens-valores');
  },
  createItemValor(item) {
    return request('/api/itens-valores', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },
  deleteItemValor(id) {
    return request(`/api/itens-valores/${id}`, {
      method: 'DELETE'
    });
  },
  listOrcamentos() {
    return request('/api/orcamentos');
  },
  createOrcamento(orcamento) {
    return request('/api/orcamentos', {
      method: 'POST',
      body: JSON.stringify(orcamento)
    });
  },
  updateOrcamentoStatus(id, status) {
    return request(`/api/orcamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  convertOrcamento(id) {
    return request(`/api/orcamentos/${id}/converter`, {
      method: 'POST'
    });
  },
  deleteOrcamento(id) {
    return request(`/api/orcamentos/${id}`, {
      method: 'DELETE'
    });
  },
  listComprovantes() {
    return request('/api/comprovantes');
  },
  createComprovante(comprovante) {
    return request('/api/comprovantes', {
      method: 'POST',
      body: JSON.stringify(comprovante)
    });
  },
  deleteComprovante(id) {
    return request(`/api/comprovantes/${id}`, {
      method: 'DELETE'
    });
  },
  listFuncionarios() {
    return request('/api/funcionario');
  },
  createFuncionario(funcionario) {
    return request('/api/funcionario', {
      method: 'POST',
      body: JSON.stringify(funcionario)
    });
  },
  deleteFuncionario(id) {
    return request(`/api/funcionario/${id}`, {
      method: 'DELETE'
    });
  }
};
