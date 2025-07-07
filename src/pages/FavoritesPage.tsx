import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Flat } from '../types/Flat';
import api from '../api/axios';
import theme from '../styles/theme';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { IconButton } from '@mui/material';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Flat[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data);
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      }
    };

    if (token) {
      fetchFavorites();
    }
  }, [token]);

  const toggleFavorite = async (flatId: string) => {
    try {
      await api.patch(`/users/favorites/${flatId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites((prev) => prev.filter((flat) => flat._id !== flatId));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>❤️ Meus Favoritos</h2>

      {favorites.length === 0 ? (
        <p style={styles.empty}>Não tens flats favoritos ainda.</p>
      ) : (
        <div style={styles.grid}>
          {favorites.map((flat) => (
            <div key={flat._id} style={styles.card}>
              <div style={styles.imageWrapper}>
                <img
                  src={flat.photos?.[0] || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt="Flat"
                  style={styles.image}
                />
                <IconButton
                  onClick={() => toggleFavorite(flat._id)}
                  sx={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    '&:hover': { backgroundColor: 'transparent' },
                  }}
                >
                  <FavoriteIcon sx={{ color: 'red', fontSize: 26 }} />
                </IconButton>
              </div>
              <div style={styles.info}>
                <Link to={`/flats/${flat._id}`} style={styles.title}>
                  {flat.city} – {flat.streetName} {flat.streetNumber}
                </Link>
                <p style={styles.details}>
                  {flat.areaSize} m² • {flat.rentPrice} € • {flat.hasAc ? 'AC' : 'Sem AC'}
                </p>
                <p style={styles.available}>
                  Disponível a partir de: {new Date(flat.dateAvailable).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    background: theme.colors.background,
    fontFamily: theme.font,
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: theme.colors.text,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.subtext,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: theme.colors.card,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius,
    boxShadow: theme.shadow,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrapper: {
    height: '200px',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    padding: '15px',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: theme.colors.text,
    textDecoration: 'none',
  },
  details: {
    margin: '5px 0',
    color: theme.colors.subtext,
  },
  available: {
    fontSize: '13px',
    color: theme.colors.subtext,
  },
} as const;

export default FavoritesPage;
