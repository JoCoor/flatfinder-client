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
  const [pageByFlat, setPageByFlat] = useState<Record<string, number>>({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFlatsAndMessages = async () => {
      const res = await api.get('/flats');
      const userFlats = user?.isAdmin
        ? res.data
        : res.data.filter((f: Flat) => f.ownerId._id === user?._id);
      setFlats(userFlats);

      for (const flat of userFlats) {
        await loadMessages(flat._id, 1);
      }
    };

    fetchFlatsAndMessages();

    socket.on('nova-mensagem', (data) => {
      if (data && flats.find(f => f._id === data.flatId)) {
        loadMessages(data.flatId, 1, true); // refresh page 1
      }
    });

    return () => {
      socket.off('nova-mensagem');
    };
  }, [user]);

  const loadMessages = async (flatId: string, page: number, reset = false) => {
    const res = await api.get(`/flats/${flatId}/messages?page=${page}&limit=5`);
    const newMessages = res.data;

    setMessagesByFlat((prev) => ({
      ...prev,
      [flatId]: reset ? newMessages : [...(prev[flatId] || []), ...newMessages],
    }));

    setPageByFlat((prev) => ({
      ...prev,
      [flatId]: page,
    }));
  };

  const handleReplyChange = (flatId: string, text: string) => {
    setReplyByFlat((prev) => ({ ...prev, [flatId]: text }));
  };

  const handleSendReply = async (flatId: string) => {
    const msg = replyByFlat[flatId]?.trim();
    if (!msg) return;

    await api.post(`/flats/${flatId}/messages`, { content: msg }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setReplyByFlat((prev) => ({ ...prev, [flatId]: '' }));
    loadMessages(flatId, 1, true); // recarrega
  };

  const handleLoadMore = (flatId: string) => {
    const nextPage = (pageByFlat[flatId] || 1) + 1;
    loadMessages(flatId, nextPage);
  };

  const markAsRead = async (flatId: string) => {
    await api.patch(`/flats/${flatId}/messages/read`);
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h5" align="center" gutterBottom color={theme.colors.text}>
        📬 Inbox de Mensagens
      </Typography>

      {flats.length === 0 ? (
        <Typography align="center" color={theme.colors.subtext} fontStyle="italic">
          Não tens flats registados ou ainda não recebeste mensagens.
        </Typography>
      ) : (
        flats.map((flat) => (
          <Accordion
            key={flat._id}
            onChange={(_, expanded) => {
              if (expanded) markAsRead(flat._id);
            }}
            sx={{ marginBottom: 2, background: theme.colors.card }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" color={theme.colors.text}>
                {flat.city} – {flat.streetName} {flat.streetNumber}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              {messagesByFlat[flat._id]?.length > 0 ? (
                <>
                  {messagesByFlat[flat._id].map((msg) => (
                    <Box
                      key={msg._id}
                      sx={{
                        backgroundColor: msg.isRead ? '#f4f4f4' : '#d2eaf2',
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
                  ))}

                  <Button
                    variant="outlined"
                    onClick={() => handleLoadMore(flat._id)}
                    sx={{ marginY: 1 }}
                  >
                    Ver mais
                  </Button>
                </>
              ) : (
                <Typography color={theme.colors.subtext} fontStyle="italic">
                  Nenhuma mensagem para este flat.
                </Typography>
              )}

              <Divider sx={{ marginY: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <TextField
                  label="Responder mensagem"
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
        ))
      )}
    </Container>
  );
};

export default InboxPage;
