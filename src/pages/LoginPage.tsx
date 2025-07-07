import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  Container,
} from '@mui/material';
import { useUser } from '../context/UserContext';
import theme from '../styles/theme';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      return setError('Preenche todos os campos.');
    }

    try {
      const res = await axios.post('http://localhost:5000/users/login', formData);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao iniciar sessão');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          background: theme.colors.card,
          padding: '30px',
          borderRadius: theme.radius,
          boxShadow: theme.shadow,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginTop: 4,
          fontFamily: theme.font,
        }}
      >
        <Typography variant="h5" align="center" color={theme.colors.text}>
          Iniciar Sessão
        </Typography>

        <TextField
          label="Email"
          name="email"
          type="email"
          required
          fullWidth
          value={formData.email}
          onChange={handleChange}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          required
          fullWidth
          value={formData.password}
          onChange={handleChange}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
        >
          Entrar
        </Button>

        {error && (
          <Alert severity="error" sx={{ marginTop: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
