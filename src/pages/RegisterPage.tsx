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
import theme from '../styles/theme';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  });

  const [birthDateError, setBirthDateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');

  const getMinDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 100);
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  };

  const validateBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const minDate = new Date();
    const maxDate = new Date();

    minDate.setFullYear(today.getFullYear() - 100);
    maxDate.setFullYear(today.getFullYear() - 18);

    if (date < minDate || date > maxDate) {
      return 'Tens de ter entre 18 e 100 anos.';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'A password deve ter pelo menos 8 caracteres.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });

    if (name === 'birthDate') {
      setBirthDateError(validateBirthDate(value));
    }

    if (name === 'password') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bdError = validateBirthDate(formData.birthDate);
    const pwError = validatePassword(formData.password);

    setBirthDateError(bdError);
    setPasswordError(pwError);

    if (bdError || pwError) {
      setError('Corrige os erros antes de continuar.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/users/register', formData);
      console.log('Registration successful:', res.data);
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao registar');
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
          Criar Conta
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
          error={!!passwordError}
          helperText={passwordError}
        />

        <TextField
          label="Nome próprio"
          name="firstName"
          fullWidth
          value={formData.firstName}
          onChange={handleChange}
        />

        <TextField
          label="Apelido"
          name="lastName"
          fullWidth
          value={formData.lastName}
          onChange={handleChange}
        />

        <TextField
          label="Data de Nascimento"
          name="birthDate"
          type="date"
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: getMinDate(),
            max: getMaxDate(),
          }}
          value={formData.birthDate}
          onChange={handleChange}
          error={!!birthDateError}
          helperText={birthDateError}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
        >
          Registar
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

export default RegisterPage;
