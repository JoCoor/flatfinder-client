import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../api/axios';
import type { Flat } from '../types/Flat';
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
import { io } from 'socket.io-client';

type Message = {
  _id: string;
  content: string;
  createdAt: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isRead: boolean;
};

const socket = io('http://localhost:5000');

const InboxPage = () => {
  const { user } = useUser();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [messagesByFlat, setMessagesByFlat] = useState<Record<string, Message[]>>({});
  const [replyByFlat, setReplyByFlat] = useState<Record<string, string>>({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const res = await api.get('/flats');
        setFlats(res.data);
      } catch (err) {
        console.error('Erro ao carregar flats:', err);
      }
    };

    fetchFlats();
  }, []);

  useEffect(() => {
    if (!user || flats.length === 0) return;

    flats.forEach(async (flat) => {
      try {
        const res = await api.get(`/users/${flat._id}/conversation`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessagesByFlat((prev) => ({
          ...prev,
          [flat._id]: res.data,
        }));
      } catch (err) {
        // apenas ignora se o user não tiver acesso à conversa
      }
    });
  }, [user, flats]);

  useEffect(() => {
    socket.on('nova-mensagem', (data) => {
      if (data?.flatId) {
        loadConversation(data.flatId);
      }
    });

    return () => {
      socket.off('nova-mensagem');
    };
  }, []);

  const loadConversation = async (flatId: string) => {
    try {
      const res = await api.get(`/users/${flatId}/conversation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessagesByFlat((prev) => ({
        ...prev,
        [flatId]: res.data,
      }));
    } catch (err) {
      console.error('Erro ao carregar conversa:', err);
    }
  };

  const handleReplyChange = (flatId: string, text: string) => {
    setReplyByFlat((prev) => ({ ...prev, [flatId]: text }));
  };

  const handleSendReply = async (flatId: string) => {
    const msg = replyByFlat[flatId]?.trim();
    if (!msg) return;

    try {
      await api.post(
        `/flats/${flatId}/messages`,
        { content: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyByFlat((prev) => ({ ...prev, [flatId]: '' }));
      loadConversation(flatId);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h5" align="center" gutterBottom color={theme.colors.text}>
        💬 Conversas
      </Typography>

      {flats.length === 0 ? (
        <Typography align="center" color={theme.colors.subtext} fontStyle="italic">
          Não há conversas disponíveis.
        </Typography>
      ) : (
        flats.map((flat) => {
          const messages = messagesByFlat[flat._id];
          if (!messages) return null;

          return (
            <Accordion
              key={flat._id}
              sx={{ marginBottom: 2, background: theme.colors.card }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" color={theme.colors.text}>
                  {flat.city} – {flat.streetName} {flat.streetNumber}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <Box
                      key={msg._id}
                      sx={{
                        backgroundColor:
                          msg.senderId._id === user?._id ? '#e0f7fa' : '#f0f0f0',
                        borderRadius: 2,
                        padding: 2,
                        marginBottom: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {msg.senderId.firstName} {msg.senderId.lastName} ({msg.senderId.email})
                      </Typography>
                      <Typography sx={{ marginTop: 1 }}>{msg.content}</Typography>
                      <Typography variant="caption" color={theme.colors.subtext} sx={{ marginTop: 1 }}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography color={theme.colors.subtext} fontStyle="italic">
                    Sem mensagens ainda.
                  </Typography>
                )}

                <Divider sx={{ marginY: 2 }} />

                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                  <TextField
                    label="Escrever resposta"
                    multiline
                    minRows={2}
                    fullWidth
                    value={replyByFlat[flat._id] || ''}
                    onChange={(e) => handleReplyChange(flat._id, e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ alignSelf: 'flex-end' }}
                    onClick={() => handleSendReply(flat._id)}
                    disabled={!replyByFlat[flat._id]?.trim()}
                  >
                    Enviar
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Container>
  );
};

export default InboxPage;
