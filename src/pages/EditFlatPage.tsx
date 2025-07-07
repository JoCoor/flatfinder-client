import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  Grid,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';
import type { Flat } from '../types/Flat';
import theme from '../styles/theme';

const EditFlatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flatData, setFlatData] = useState<Flat | null>(null);

  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const res = await api.get(`/flats/${id}`);
        setFlatData(res.data);
      } catch (err) {
        console.error('Erro ao carregar flat:', err);
      }
    };

    fetchFlat();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFlatData((prev) => prev && ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await api.post('/flats/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = res.data.imageUrl;
      setFlatData((prev) => prev && ({
        ...prev,
        photos: [...(prev.photos || []), imageUrl],
      }));
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Erro no upload da imagem.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFlatData((prev) => prev && ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await api.patch(`/flats/${id}`, flatData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Flat atualizado com sucesso!');
      navigate(`/flats/${id}`);
    } catch (err) {
      console.error('Erro ao atualizar flat:', err);
      alert('Erro ao atualizar flat');
    }
  };

  if (!flatData) return <p>A carregar...</p>;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Editar Flat
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Cidade"
          name="city"
          value={flatData.city}
          onChange={handleChange}
          required
        />
        <TextField
          label="Rua"
          name="streetName"
          value={flatData.streetName}
          onChange={handleChange}
          required
        />
        <TextField
          label="Número da Porta"
          name="streetNumber"
          value={flatData.streetNumber}
          onChange={handleChange}
          required
        />
        <TextField
          label="Área (m²)"
          name="areaSize"
          type="number"
          value={flatData.areaSize}
          onChange={handleChange}
          required
        />
        <FormControlLabel
          control={
            <Switch
              checked={flatData.hasAc}
              onChange={handleChange}
              name="hasAc"
            />
          }
          label="Tem Ar Condicionado?"
        />
        <TextField
          label="Ano de Construção"
          name="yearBuilt"
          type="number"
          value={flatData.yearBuilt}
          onChange={handleChange}
          required
        />
        <TextField
          label="Preço da Renda (€)"
          name="rentPrice"
          type="number"
          value={flatData.rentPrice}
          onChange={handleChange}
          required
        />
        <TextField
          label="Data Disponível"
          name="dateAvailable"
          type="date"
          value={flatData.dateAvailable?.substring(0, 10)}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          required
        />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Fotos
        </Typography>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <Grid container spacing={1}>
          {flatData.photos?.map((url, index) => (
            <Grid item xs={4} key={index}>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  style={{ width: '100%', borderRadius: '8px' }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemovePhoto(index)}
                  sx={{ position: 'absolute', top: 0, right: 0 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Atualizar Flat
        </Button>
      </Box>
    </Container>
  );
};

export default EditFlatPage;
