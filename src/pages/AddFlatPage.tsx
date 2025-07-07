import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Box,
} from '@mui/material';
import axios from 'axios';
import theme from '../styles/theme';

const AddFlatPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: '',
    streetName: '',
    streetNumber: '',
    areaSize: '',
    hasAc: false,
    yearBuilt: '',
    rentPrice: '',
    dateAvailable: '',
    photos: [] as string[],
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await axios.post('http://localhost:5000/flats/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = res.data.imageUrl;
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, imageUrl],
      }));
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Erro no upload da imagem.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://localhost:5000/flats', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Flat criado com sucesso!');
      navigate('/flats');
    } catch (err) {
      console.error('Erro ao criar flat:', err);
      alert('Erro ao criar flat');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: theme.colors.text }}>
        🏠 Adicionar Novo Apartamento
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          background: theme.colors.card,
          padding: 3,
          borderRadius: theme.radius,
          boxShadow: theme.shadow,
        }}
      >
        <TextField label="Cidade" name="city" required value={formData.city} onChange={handleChange} />
        <TextField label="Rua" name="streetName" required value={formData.streetName} onChange={handleChange} />
        <TextField label="Número" name="streetNumber" required value={formData.streetNumber} onChange={handleChange} />
        <TextField label="Área (m²)" name="areaSize" type="number" required value={formData.areaSize} onChange={handleChange} />
        <FormControlLabel
          control={<Checkbox name="hasAc" checked={formData.hasAc} onChange={handleChange} />}
          label="Tem ar condicionado?"
        />
        <TextField label="Ano de construção" name="yearBuilt" type="number" required value={formData.yearBuilt} onChange={handleChange} />
        <TextField label="Preço da Renda (€)" name="rentPrice" type="number" required value={formData.rentPrice} onChange={handleChange} />
        <TextField
          label="Disponível a partir de"
          name="dateAvailable"
          type="date"
          required
          value={formData.dateAvailable}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />

        <Divider />

        <Typography variant="subtitle1">Fotos</Typography>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <Box display="flex" flexWrap="wrap" gap={2}>
          {formData.photos.map((url, idx) => (
            <img key={idx} src={url} alt={`Foto ${idx + 1}`} width={100} style={{ borderRadius: 8 }} />
          ))}
        </Box>

        <Button type="submit" variant="contained" color="primary">
          Criar Apartamento
        </Button>
      </Box>
    </Container>
  );
};

export default AddFlatPage;
