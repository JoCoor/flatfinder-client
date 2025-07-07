import axios from 'axios';

// Criar instância personalizada do Axios
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

// Intercetar respostas com erro
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Token expirado ou inválido. A redirecionar para login...');

      // Limpar dados do user
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirecionar para login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
