import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Flat } from '../types/Flat';
import { useUser } from '../context/UserContext';

import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';

const FlatDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [flat, setFlat] = useState<Flat | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/flats/${id}`);
        setFlat(res.data);
      } catch (err) {
        console.error('Erro ao buscar flat:', err);
      }
    };

    const fetchFavorites = async () => {
      if (user && localStorage.getItem('token')) {
        const res = await axios.get('http://localhost:5000/users/favorites', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserFavorites(res.data.map((f: Flat) => f._id));
      }
    };

    fetchFlat();
    fetchFavorites();
  }, [id, user]);

  const handlePrev = () => {
    if (!flat?.photos?.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? flat.photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!flat?.photos?.length) return;
    setCurrentImageIndex((prev) => (prev === flat.photos.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = async () => {
    const confirmed = confirm('Tens a certeza que queres remover este flat?');
    if (!confirmed || !flat) return;

    try {
      await axios.delete(`http://localhost:5000/flats/${flat._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/flats');
    } catch (err) {
      alert('Erro ao remover flat.');
    }
  };

  if (!flat) return <p>A carregar...</p>;

  const isOwner = user?._id === flat.ownerId?._id;
  const isAdmin = user?.isAdmin;

  return (
    <div style={styles.container}>
      <div style={styles.imageBox}>
        {flat.photos?.length > 0 && (
          <img
            src={flat.photos[currentImageIndex]}
            alt={`Foto ${currentImageIndex + 1}`}
            style={styles.image}
          />
        )}

        {user && userFavorites.includes(flat._id) && (
          <FavoriteIcon
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              color: '#e53935',
              filter: 'drop-shadow(0 0 2px black)',
              fontSize: 30,
            }}
          />
        )}

        {flat.photos && flat.photos.length > 1 && (
          <>
            <button onClick={handlePrev} style={styles.arrowLeft}>
              <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
            </button>
            <button onClick={handleNext} style={styles.arrowRight}>
              <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
            </button>
          </>
        )}
      </div>

      <div style={styles.info}>
        <h2>
          {flat.city} – {flat.streetName} {flat.streetNumber}
        </h2>
        <p>{flat.areaSize} m² • {flat.rentPrice} € • {flat.hasAc ? 'AC' : 'Sem AC'}</p>
        <p>Construído em: {flat.yearBuilt}</p>
        <p>Disponível a partir de: {new Date(flat.dateAvailable).toLocaleDateString()}</p>
        <p>Publicado por: {flat.ownerId?.firstName} {flat.ownerId?.lastName}</p>

        {(isOwner || isAdmin) && (
          <div style={styles.actions}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/flats/${flat._id}/edit`)}
            >
              Editar
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Remover
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  arrowLeft: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: '6px',
  },
  arrowRight: {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: '6px',
  },
  info: {
    lineHeight: 1.6,
  },
  actions: {
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
  },
} as const;

export default FlatDetailsPage;
