import { Link } from 'react-router-dom';
import type { Flat } from '../types/Flat';
import FavoriteIcon from '@mui/icons-material/Favorite';

type FlatCardProps = {
  flat: Flat;
  isFavorite?: boolean;
  onToggleFavorite?: (flatId: string) => void;
  showFavorite?: boolean;
};

const FlatCard = ({ flat, isFavorite, onToggleFavorite, showFavorite = false }: FlatCardProps) => {
  return (
    <div style={styles.card}>
      <div style={styles.imageWrapper}>
        <img
          src={flat.photos?.[0] || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
          alt="Flat"
          style={styles.image}
        />

        {showFavorite && (
          <button
            onClick={() => onToggleFavorite?.(flat._id)}
            style={styles.heartButton}
            aria-label="Marcar como favorito"
          >
            <FavoriteIcon
              sx={{
                color: isFavorite ? '#e53935' : 'white',
                filter: 'drop-shadow(0 0 2px black)',
                fontSize: 28,
                transition: 'transform 0.2s ease, color 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.2)',
                  color: isFavorite ? '#d32f2f' : '#f44336',
                },
              }}
            />
          </button>
        )}
      </div>

      <div style={styles.info}>
        <Link to={`/flats/${flat._id}`} style={styles.title}>
          {flat.city} – {flat.streetName} {flat.streetNumber}
        </Link>
        <p style={styles.details}>
          {flat.areaSize} m² • {flat.rentPrice} € • {flat.hasAc ? 'AC' : 'Sem AC'}
        </p>
        <p style={styles.available}>
          Disponível: {new Date(flat.dateAvailable).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  info: {
    padding: '15px',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333',
    textDecoration: 'none',
  },
  details: {
    margin: '5px 0',
    color: '#555',
  },
  available: {
    fontSize: '13px',
    color: '#777',
  },
} as const;

export default FlatCard;
