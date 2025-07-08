import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
  Typography,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import theme from '../styles/theme';
import api from '../api/axios';
import { useUser } from '../context/UserContext';
import type { Flat } from '../types/Flat';

type Message = {
  _id: string;
  content: string;
  createdAt: string;
  flatId: Flat;
  response?: string;
};

const MyMessagesPage = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMyMessages = async () => {
      try {
        const res = await api.get('/users/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Erro ao buscar mensagens do utilizador:', err);
      }
    };

    if (user) fetchMyMessages();
  }, [user, token]);

  const grouped = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const flatId = msg.flatId._id;
    acc[flatId] = acc[flatId] || [];
    acc[flatId].push(msg);
    return acc;
  }, {});

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        ✉️ Minhas Mensagens Enviadas
      </Typography>

      {Object.keys(grouped).length === 0 ? (
        <Typography fontStyle="italic" color={theme.colors.subtext}>
          Ainda não enviaste mensagens.
        </Typography>
      ) : (
        Object.entries(grouped).map(([flatId, msgs]) => (
          <Accordion key={flatId} sx={{ mb: 2, background: theme.colors.card }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Flat: {msgs[0].flatId.city} – {msgs[0].flatId.streetName}{' '}
                {msgs[0].flatId.streetNumber}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {msgs.map((msg) => (
                <Box
                  key={msg._id}
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    padding: 2,
                    mb: 2,
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <Typography>{msg.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enviada: {new Date(msg.createdAt).toLocaleString()}
                  </Typography>
                  {msg.response && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography fontWeight="bold">Resposta:</Typography>
                      <Typography>{msg.response}</Typography>
                    </>
                  )}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Container>
  );
};

export default MyMessagesPage;
