import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import type { Flat } from '../types/Flat';

const EditFlatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Flat>>({
    photos: [], // ✅ garante que começa com array
  });

  // Carrega os dados do flat
  useEffect(() => {
    const fetchFlat = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/flats/${id}`);
        setFormData({
          ...res.data,
          photos: res.data.photos || [],
        });
      } catch (err) {
        console.error('Erro ao carregar flat:', err);
      }
    };
    fetchFlat();
  }, [id]);

  // Atualização de campos normais
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Upload real da imagem para Cloudinary
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
        photos: [...(prev.photos || []), imageUrl],
      }));
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro no upload da imagem.');
    }
  };

  // Enviar alterações para o backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    console.log('A enviar dados para atualização:', formData); // debug útil

    try {
      await axios.patch(`http://localhost:5000/flats/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(`/flats/${id}`);
    } catch (err) {
      console.error('Erro ao guardar alterações:', err);
      alert('Erro ao guardar alterações.');
    }
  };

  if (!formData.city) return <p>A carregar...</p>;

  return (
    <div>
      <h2>Editar Apartamento</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Cidade" />
        <input type="text" name="streetName" value={formData.streetName} onChange={handleChange} placeholder="Rua" />
        <input type="text" name="streetNumber" value={formData.streetNumber} onChange={handleChange} placeholder="Nº" />
        <input type="number" name="areaSize" value={formData.areaSize} onChange={handleChange} placeholder="Área m²" />
        <label>
          <input type="checkbox" name="hasAc" checked={formData.hasAc || false} onChange={handleChange} />
          Tem ar condicionado
        </label>
        <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} placeholder="Ano" />
        <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleChange} placeholder="Renda €" />
        <input type="date" name="dateAvailable" value={formData.dateAvailable?.slice(0, 10)} onChange={handleChange} />

        <hr />
        <h4>Fotos</h4>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {formData.photos?.map((url, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              <img src={url} alt={`Foto ${index + 1}`} width={100} style={{ borderRadius: 8 }} />
              <button
                type="button"
                onClick={() => {
                  const updatedPhotos = [...(formData.photos || [])];
                  updatedPhotos.splice(index, 1);
                  setFormData((prev) => ({ ...prev, photos: updatedPhotos }));
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>

        <button type="submit" style={{ marginTop: '10px' }}>Guardar Alterações</button>
      </form>
    </div>
  );
};

export default EditFlatPage;
