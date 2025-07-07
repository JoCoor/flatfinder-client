import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { Flat } from '../types/Flat';
import api from '../api/axios';

const FlatsPage = () => {
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [flats, setFlats] = useState<Flat[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem('token');

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minArea, setMinArea] = useState(searchParams.get('minArea') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [hasAc, setHasAc] = useState(searchParams.get('hasAc') === 'true');
  const [minYear, setMinYear] = useState(searchParams.get('minYear') || '');

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await api.get(`/flats?${searchParams.toString()}`);
        setFlats(res.data);
      } catch (err) {
        console.error('Erro ao carregar flats:', err);
      }
    };

    fetchFlats();
  }, [searchParams]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (token) {
        const res = await api.get('/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data.map((f: Flat) => f._id));
      }
    };
    fetchFavorites();
  }, [token]);

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (minArea) params.set('minArea', minArea);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (hasAc) params.set('hasAc', 'true');
    if (minYear) params.set('minYear', minYear);
    setSearchParams(params);
  };

  const resetFilters = () => {
    setCity('');
    setMinArea('');
    setMaxPrice('');
    setHasAc(false);
    setMinYear('');
    setSearchParams({});
  };

  const toggleFavorite = async (flatId: string) => {
    try {
      await api.patch(`/users/favorites/${flatId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites((prev) =>
        prev.includes(flatId)
          ? prev.filter((id) => id !== flatId)
          : [...prev, flatId]
      );
    } catch (err) {
      console.error('Erro ao marcar favorito:', err);
    }
  };

  return (
    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} p={2} gap={2}>
      {/* Sidebar de filtros */}
      <Box
        flex={isMobile ? '1 1 auto' : '0 0 260px'}
        p={2}
        bgcolor="white"
        borderRadius={2}
        boxShadow={2}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          updateFilters();
        }}
      >
        <Typography variant="h6" mb={2}>
          Filtros
        </Typography>

        <TextField
          label="Cidade"
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Área mínima (m²)"
          type="number"
          fullWidth
          value={minArea}
          onChange={(e) => setMinArea(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Preço máximo (€)"
          type="number"
          fullWidth
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Ano mínimo"
          type="number"
          fullWidth
          value={minYear}
          onChange={(e) => setMinYear(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={<Checkbox checked={hasAc} onChange={(e) => setHasAc(e.target.checked)} />}
          label="Com ar condicionado"
          sx={{ mb: 2 }}
        />

        <Button variant="contained" fullWidth type="submit">
          Aplicar Filtros
        </Button>
        <Button
          onClick={resetFilters}
          fullWidth
          sx={{ mt: 1 }}
          variant="outlined"
          color="secondary"
        >
          Limpar Filtros
        </Button>
      </Box>

      {/* Lista de flats */}
      <Grid container spacing={2} flex={1}>
        {flats.map((flat) => (
          <Grid item xs={12} sm={6} md={4} key={flat._id}>
            <Box
              bgcolor="white"
              borderRadius={2}
              boxShadow={2}
              overflow="hidden"
              display="flex"
              flexDirection="column"
              position="relative"
            >
              <Box position="relative" height={200}>
                <img
                  src={flat.photos?.[0] || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt="Flat"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {user && (
                  <IconButton
                    onClick={() => toggleFavorite(flat._id)}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'transparent',
                      border: 'none',
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    {favorites.includes(flat._id) ? (
                      <FavoriteIcon sx={{ color: 'red', fontSize: 26 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: '#888', fontSize: 26 }} />
                    )}
                  </IconButton>

                )}
              </Box>
              <Box p={2}>
                <Link to={`/flats/${flat._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                  <Typography fontWeight="bold">
                    {flat.city} – {flat.streetName} {flat.streetNumber}
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary">
                  {flat.areaSize} m² • {flat.rentPrice} € • {flat.hasAc ? 'AC' : 'Sem AC'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Disponível: {new Date(flat.dateAvailable).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FlatsPage;
