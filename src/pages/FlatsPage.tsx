import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import type { Flat } from '../types/Flat';
import FlatCard from '../components/FlatCard';

const FlatsPage = () => {
  const { user } = useUser();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFlats = async () => {
      const res = await axios.get('http://localhost:5000/flats');
      setFlats(res.data);
    };

    const fetchFavorites = async () => {
      if (token) {
        const res = await axios.get('http://localhost:5000/users/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data.map((f: Flat) => f._id));
      }
    };

    fetchFlats();
    fetchFavorites();
  }, [token]);

  const toggleFavorite = async (flatId: string) => {
    try {
      await axios.patch(`http://localhost:5000/users/favorites/${flatId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFavorites((prev) =>
        prev.includes(flatId) ? prev.filter(id => id !== flatId) : [...prev, flatId]
      );
    } catch (err) {
      console.error('Erro ao marcar favorito:', err);
    }
  };

  return (
    <div style={styles.grid}>
      {flats.map((flat) => (
        <FlatCard
          key={flat._id}
          flat={flat}
          showFavorite={!!user}
          isFavorite={favorites.includes(flat._id)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
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

export default FlatsPage;
