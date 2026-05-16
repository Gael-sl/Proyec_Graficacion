import { client } from './client.js';

// Create entity wrapper that mimics Base44's interface
// This allows minimal changes to existing pages
const createEntityAPI = (entityName) => ({
  async list(sortBy) {
    // sortBy parameter is ignored for simplicity - returns default order
    return client.get(`/entities/${entityName}`);
  },

  async get(id) {
    return client.get(`/entities/${entityName}/${id}`);
  },

  async create(data) {
    return client.post(`/entities/${entityName}`, data);
  },

  async update(id, data) {
    return client.put(`/entities/${entityName}/${id}`, data);
  },

  async delete(id) {
    return client.delete(`/entities/${entityName}/${id}`);
  },

  async buildPrompt(payload = {}) {
    return client.post(`/entities/${entityName}/build-prompt`, payload);
  }
});

// Export entities object that matches Base44's interface
export const entities = {
  Stakeholder: createEntityAPI('Stakeholder'),
  Funcion: createEntityAPI('Funcion'),
  Modulo: createEntityAPI('Modulo'),
  HistoriaUsuario: createEntityAPI('HistoriaUsuario'),
  AnalisisDocumento: createEntityAPI('AnalisisDocumento'),
  Encuesta: createEntityAPI('Encuesta'),
  Entrevista: createEntityAPI('Entrevista'),
  FocusGroup: createEntityAPI('FocusGroup'),
  SeguimientoTransaccional: createEntityAPI('SeguimientoTransaccional'),
  Role: createEntityAPI('Role'),
  Diagrama: createEntityAPI('Diagrama')
};

// Export a mock auth object for compatibility
export const auth = {
  async me() {
    // No user in public app - return null or empty object
    return null;
  },

  logout() {
    // No-op for public app
  },

  redirectToLogin() {
    // No-op for public app
  }
};
