import {
  Box,
  TextField,
  Typography,
  Button,
  Container,
  Alert,
  Divider,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/axios';
import type { Flat } from '../types/Flat';
import theme from '../styles/theme';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [userFlats, setUserFlats] = useState<Flat[]>([]);
  const [totalFavorites, setTotalFavorites] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setBirthDate(user.birthDate?.substring(0, 10) || '');
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/flats');
        const ownedFlats = res.data.filter((flat: Flat) => flat.ownerId._id === user?._id);
        setUserFlats(ownedFlats);

        // Contar favoritos
        const favRes = await api.get('/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalFavorites(favRes.data.length);

        // Contar mensagens
        let msgCount = 0;
        for (const flat of ownedFlats) {
          const msgRes = await api.get(`/flats/${flat._id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          msgCount += msgRes.data.length;
        }
        setTotalMessages(msgCount);

        // Contar visualizações
        const totalViewsCount = ownedFlats.reduce((sum, flat) => sum + (flat.views || 0), 0);
        setTotalViews(totalViewsCount);
      } catch (err) {
        console.error('Erro ao buscar dados do perfil:', err);
      }
    };

    if (user && token) fetchStats();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      return setMessage('❌ As passwords não coincidem.');
    }

    if (birthDateError) {
      return setMessage('❌ Corrige os erros antes de continuar.');
    }

    try {
      const res = await api.patch(
        `/users/${user?._id}`,
        {
          firstName,
          lastName,
          birthDate,
          ...(password && { password }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setMessage('✅ Perfil atualizado com sucesso!');
        const updatedUser = { ...user, firstName, lastName, birthDate };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Erro ao atualizar o perfil.');
    }
  };

  const handleDeleteFlat = async (flatId: string) => {
    const confirmed = confirm('Tens a certeza que queres remover este flat?');
    if (!confirmed) return;

    try {
      await api.delete(`/flats/${flatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserFlats((prev) => prev.filter((f) => f._id !== flatId));
    } catch (err) {
      alert('Erro ao remover flat.');
    }
  };

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
      return 'A data de nascimento deve estar entre 18 e 100 anos atrás.';
    }

    return '';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Meu Perfil
      </Typography>

      {message && (
        <Alert severity={message.startsWith('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2} mb={4}>
        <TextField label="Primeiro Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <TextField label="Último Nome" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <TextField
          label="Data de Nascimento"
          type="date"
          value={birthDate}
          onChange={(e) => {
            const value = e.target.value;
            setBirthDate(value);
            setBirthDateError(validateBirthDate(value));
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: getMinDate(), max: getMaxDate() }}
          error={!!birthDateError}
          helperText={birthDateError}
        />
        <TextField
          label="Nova Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirmar Nova Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" variant="contained">
          Atualizar Perfil
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        📊 Estatísticas
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={4} mb={4}>
        <Typography>🏠 Apartamentos: <strong>{userFlats.length}</strong></Typography>
        <Typography>❤️ Favoritos: <strong>{totalFavorites}</strong></Typography>
        <Typography>📬 Mensagens Recebidas: <strong>{totalMessages}</strong></Typography>
        <Typography>👀 Visualizações: <strong>{totalViews}</strong></Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        🏠 Meus Apartamentos
      </Typography>

      {userFlats.length === 0 ? (
        <Typography fontStyle="italic" color={theme.colors.subtext}>
          Ainda não adicionaste nenhum apartamento.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {userFlats.map((flat) => (
            <Grid item xs={12} sm={6} md={4} key={flat._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={flat.photos?.[0] || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt="Flat image"
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {flat.city} – {flat.streetName} {flat.streetNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flat.areaSize} m² • {flat.rentPrice} € • {flat.hasAc ? 'AC' : 'Sem AC'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Disponível desde {new Date(flat.dateAvailable).toLocaleDateString()}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/flats/${flat._id}/edit`}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteFlat(flat._id)}
                    >
                      Remover
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ProfilePage;
