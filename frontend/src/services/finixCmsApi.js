import { api } from './api';

export const finixCmsApi = {
  login: async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  session: async () => {
    const { data } = await api.get('/auth/session');
    return data;
  },
  hasRole: async (role = 'admin') => {
    const { data } = await api.get(`/auth/has-role?role=${encodeURIComponent(role)}`);
    return data;
  },
  listSiteContent: async () => {
    const { data } = await api.get('/site-content');
    return data;
  },
  updateSiteContent: async (id, payload) => {
    const { data } = await api.put(`/site-content/${id}`, payload);
    return data;
  },
  listMembershipCodes: async () => {
    const { data } = await api.get('/membership-codes');
    return data;
  },
  createMembershipCode: async () => {
    const { data } = await api.post('/membership-codes');
    return data;
  },
  validateMembershipCode: async (code) => {
    const { data } = await api.get(`/membership-codes/validate/${encodeURIComponent(code)}`);
    return data;
  },
  calculateSimulator: async (payload) => {
    const { data } = await api.post('/simulador', payload);
    return data;
  },
};
