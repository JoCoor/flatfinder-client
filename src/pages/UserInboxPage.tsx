import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
  Typography,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import theme from '../styles/theme';
import { useUser } from '../context/UserContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

type Message = {
  _id: string;
  content: string;
  createdAt: string;
  senderId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  flatId: {
    _id: string;
    city: string;
    streetName: string;
    streetNumber: string;
  };
};

const UserInboxPage = () => {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const [messagesByFlat, setMessagesByFlat] = useState<Record<string, Message[]>>({});
  const [replyByFlat, setReplyByFlat] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get('/users/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const grouped: Record<string, Message[]> = {};

        res.data.forEach((msg: Message) => {
          const flatId = msg.flatId._id;
          if (!grouped[flatId]) {
            grouped[flatId] = [];
          }
          grouped[flatId].push(msg);
        });

        setMessagesByFlat(grouped);
      } catch (err) {
        console.error('Erro ao carregar mensagens do utilizador:', err);
      }
    };

    if (!token || !user) {
      navigate('/login');
    } else {
      fetchMessages();
    }
  }, [token, user]);

  const handleReplyChange = (flatId: string, text: string) => {
    setReplyByFlat((prev) => ({ ...prev, [flatId]: text }));
  };

  const handleSendReply = async (flatId: string) => {
    const msg = replyByFlat[flatId]?.trim();
    if (!msg) return;

    try {
      await api.post(`/flats/${flatId}/messages`, { content: msg }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplyByFlat((prev) => ({ ...prev, [flatId]: '' }));

      // reload conversation
      const res = await api.get('/users/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const grouped: Record<string, Message[]> = {};
      res.data.forEach((msg: Message) => {
        const flatId = msg.flatId._id;
        if (!grouped[flatId]) grouped[flatId] = [];
        grouped[flatId].push(msg);
      });

      setMessagesByFlat(grouped);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom align="center" color={theme.colors.text}>
        📨 As Minhas Conversas
      </Typography>

      {Object.keys(messagesByFlat).length === 0 ? (
        <Typography align="center" fontStyle="italic" color={theme.colors.subtext}>
          Ainda não enviaste nenhuma mensagem.
        </Typography>
      ) : (
        Object.entries(messagesByFlat).map(([flatId, msgs]) => {
          const flat = msgs[0]?.flatId;

          return (
            <Accordion key={flatId} sx={{ mb: 2, background: theme.colors.card }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {flat.city} – {flat.streetName} {flat.streetNumber}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                {msgs.map((msg) => (
                  <Box
                    key={msg._id}
                    sx={{
                      backgroundColor: msg.senderId._id === user?._id ? '#e0f7fa' : '#f4f4f4',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <Typography fontWeight="bold">
                      {msg.senderId.firstName} {msg.senderId.lastName} ({msg.senderId.email})
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{msg.content}</Typography>
                    <Typography variant="caption" color={theme.colors.subtext}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                <TextField
                  label="Responder"
                  fullWidth
                  multiline
                  minRows={2}
                  value={replyByFlat[flatId] || ''}
                  onChange={(e) => handleReplyChange(flatId, e.target.value)}
                />
                <Button
                  variant="contained"
                  sx={{ mt: 1, float: 'right' }}
                  onClick={() => handleSendReply(flatId)}
                  disabled={!replyByFlat[flatId]?.trim()}
                >
                  Enviar
                </Button>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Container>
  );
};

export default UserInboxPage;
