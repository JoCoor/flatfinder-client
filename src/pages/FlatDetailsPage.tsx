import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Flat } from '../types/Flat';
import { useUser } from '../context/UserContext';
import api from '../api/axios';
import theme from '../styles/theme';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Button, IconButton } from '@mui/material';

const FlatDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const [flat, setFlat] = useState<Flat | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const res = await api.get(`/flats/${id}`);
        setFlat(res.data);
      } catch (err) {
        console.error('Erro ao buscar flat:', err);
      }
    };

    const fetchFavorites = async () => {
      if (user) {
        const res = await api.get('/users/favorites', {
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
      await api.delete(`/flats/${flat._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/flats');
    } catch (err) {
      alert('Erro ao remover flat.');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await api.post(
        `/flats/${flat._id}/messages`,
        { content: message },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setFeedback('Mensagem enviada com sucesso!');
      setMessage('');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Erro ao enviar mensagem.');
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.patch(`/users/favorites/${flat!._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setUserFavorites((prev) =>
        prev.includes(flat!._id)
          ? prev.filter((id) => id !== flat!._id)
          : [...prev, flat!._id]
      );
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err);
    }
  };

  if (!flat) return <p style={{ padding: 20 }}>A carregar...</p>;

  const isOwner = user?._id === flat.ownerId?._id;
  const isAdmin = user?.isAdmin;
  const isFav = userFavorites.includes(flat._id);

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

        {user && (
          <IconButton
            onClick={toggleFavorite}
            sx={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            {isFav ? (
              <FavoriteIcon sx={{ color: 'red', fontSize: 28 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'white', fontSize: 28 }} />
            )}
          </IconButton>
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
        <h2>{flat.city} – {flat.streetName} {flat.streetNumber}</h2>
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

        {user && !isOwner && !isAdmin && (
          <div style={styles.messageBox}>
            <h4>Enviar mensagem ao dono</h4>
            <textarea
              placeholder="Escreve aqui a tua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.textarea}
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>
              Enviar
            </button>
            {feedback && <p style={styles.feedback}>{feedback}</p>}
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
    fontFamily: theme.font,
    background: theme.colors.background,
  },
  imageBox: {
    position: 'relative',
    width: '100%',
    height: '60vw',
    maxHeight: '400px',
    minHeight: '200px',
    overflow: 'hidden',
    borderRadius: theme.radius,
    marginBottom: '20px',
    background: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    padding: '10px',
    background: theme.colors.card,
    borderRadius: theme.radius,
    boxShadow: theme.shadow,
    color: theme.colors.text,
  },
  actions: {
    marginTop: '20px',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  messageBox: {
    marginTop: '30px',
    padding: '15px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    background: '#f9f9f9',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    resize: 'vertical',
    fontFamily: theme.font,
  },
  sendButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  feedback: {
    marginTop: '10px',
    color: 'green',
    fontStyle: 'italic',
  },
} as const;

export default FlatDetailsPage;
