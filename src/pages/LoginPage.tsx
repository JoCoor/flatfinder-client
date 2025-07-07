import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useUser } from '../context/UserContext';
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Alert,
} from '@mui/material';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/users/login', formData);
      const { token, user } = res.data;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user); // <- MUITO importante!


      console.log('🔐 Login bem-sucedido:', user);
      navigate('/');
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Iniciar Sessão
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained">
          Entrar
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
