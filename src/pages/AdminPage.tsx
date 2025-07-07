import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  Box,
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';
import theme from '../styles/theme';
import { Link } from 'react-router-dom';

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  isAdmin: boolean;
};

type Flat = {
  _id: string;
  city: string;
  streetName: string;
  streetNumber: string;
  rentPrice: number;
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredFlats, setFilteredFlats] = useState<Flat[]>([]);
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [emailFilter, setEmailFilter] = useState('');


  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, flatRes] = await Promise.all([
          api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/flats'),
        ]);
        setUsers(userRes.data);
        setFilteredUsers(userRes.data);
        setFlats(flatRes.data);
        setFilteredFlats(flatRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do admin:', err);
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let filtered = [...users];
    if (userTypeFilter === 'admins') {
      filtered = filtered.filter((u) => u.isAdmin);
    } else if (userTypeFilter === 'users') {
      filtered = filtered.filter((u) => !u.isAdmin);
    }
    setFilteredUsers(filtered);
  }, [userTypeFilter, users]);

  useEffect(() => {
    const flatsFiltered = flats.filter((f) => {
      const matchCity = cityFilter === '' || f.city.toLowerCase().includes(cityFilter.toLowerCase());
      const matchOwner =
        ownerFilter === '' ||
        `${f.ownerId.firstName} ${f.ownerId.lastName}`.toLowerCase().includes(ownerFilter.toLowerCase());
      const matchEmail =
        emailFilter === '' || f.ownerId.email.toLowerCase().includes(emailFilter.toLowerCase());

      return matchCity && matchOwner && matchEmail;
    });
    setFilteredFlats(flatsFiltered);
  }, [cityFilter, ownerFilter, emailFilter, flats]);


  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar este utilizador?')) return;

    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert('Erro ao apagar utilizador');
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  const handleDialogSave = async () => {
    if (!editUser) return;
    try {
      await api.patch(`/users/${editUser._id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === editUser._id ? editUser : u))
      );
      setEditDialogOpen(false);
    } catch (err) {
      alert('Erro ao editar utilizador');
    }
  };

  const handleDeleteFlat = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar este apartamento?')) return;

    try {
      await api.delete(`/flats/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlats((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert('Erro ao apagar apartamento');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Painel de Administração
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          {/* UTILIZADORES */}
          <Box mt={4} mb={2}>
            <FormControl size="small">
              <InputLabel>Tipo de Utilizador</InputLabel>
              <Select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                label="Tipo de Utilizador"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="admins">Admins</MenuItem>
                <MenuItem value="users">Normais</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="h6" gutterBottom>
            Utilizadores Registados
          </Typography>

          <Paper sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.colors.primary }}>
                  <TableCell sx={{ color: 'white' }}>Nome</TableCell>
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }}>Nascimento</TableCell>
                  <TableCell sx={{ color: 'white' }}>Admin</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.birthDate?.substring(0, 10) || '—'}</TableCell>
                    <TableCell>{user.isAdmin ? '✅' : '❌'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditUser(user)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Remover
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* APARTAMENTOS */}
          <Box mt={6} display="flex" gap={2}>
            <TextField
              label="Filtrar por Cidade"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              size="small"
            />
            <TextField
              label="Filtrar por Proprietário"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              size="small"
            />
            <TextField
              label="Filtrar por Email do Proprietário"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              size="small"
            />

          </Box>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Apartamentos Listados
          </Typography>

          <Paper sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.colors.primary }}>
                  <TableCell sx={{ color: 'white' }}>Localização</TableCell>
                  <TableCell sx={{ color: 'white' }}>Preço</TableCell>
                  <TableCell sx={{ color: 'white' }}>Proprietário</TableCell>
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Ações</TableCell>
                </TableRow>

              </TableHead>
              <TableBody>
                {filteredFlats.map((flat) => (
                  <TableRow key={flat._id}>
                    <TableCell>
                      {flat.city} – {flat.streetName} {flat.streetNumber}
                    </TableCell>
                    <TableCell>{flat.rentPrice} €</TableCell>
                    <TableCell>
                      {flat.ownerId.firstName} {flat.ownerId.lastName}
                    </TableCell>
                    <TableCell>{flat.ownerId.email}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          component={Link}
                          to={`/flats/${flat._id}/edit`}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteFlat(flat._id)}
                        >
                          Remover
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>

                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Diálogo de edição */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Utilizador</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Primeiro Nome"
            value={editUser?.firstName || ''}
            onChange={(e) => setEditUser((u) => u && { ...u, firstName: e.target.value })}
          />
          <TextField
            label="Último Nome"
            value={editUser?.lastName || ''}
            onChange={(e) => setEditUser((u) => u && { ...u, lastName: e.target.value })}
          />
          <TextField
            label="Email"
            value={editUser?.email || ''}
            onChange={(e) => setEditUser((u) => u && { ...u, email: e.target.value })}
          />
          <TextField
            label="Nascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={editUser?.birthDate?.substring(0, 10) || ''}
            onChange={(e) => setEditUser((u) => u && { ...u, birthDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDialogSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
