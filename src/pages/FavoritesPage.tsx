import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Flat } from '../types/Flat';
import FlatCard from '../components/FlatCard';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Flat[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get('http://localhost:5000/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data);
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      }
    };

    fetchFavorites();
  }, [token]);

  return (
    <div>
      <h2 style={{ padding: '20px 20px 0' }}>Meus Favoritos</h2>
      {favorites.length === 0 ? (
        <p style={{ padding: '20px' }}>Não tens flats favoritos ainda.</p>
      ) : (
        <div style={styles.grid}>
          {favorites.map(flat => (
            <FlatCard key={flat._id} flat={flat} />
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    padding: '20px',
  },
} as const;

export default FavoritesPage;
