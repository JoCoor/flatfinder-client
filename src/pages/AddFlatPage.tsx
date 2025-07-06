import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  // Upload da imagem para o Cloudinary
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

      // Adiciona a imagem ao array de photos
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, imageUrl],
      }));
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Erro no upload da imagem.');
    }
  };

  // Atualiza os campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Envia os dados para o backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    console.log('A enviar flat:', formData);

    try {
      await axios.post('http://localhost:5000/flats', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Flat criado com sucesso!');
      navigate('/flats');
    } catch (err) {
      console.error('Erro ao criar flat:', err);
      alert('Erro ao criar flat');
    }
  };

  return (
    <div>
      <h2>Adicionar Novo Apartamento</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <input type="text" name="city" placeholder="Cidade" value={formData.city} onChange={handleChange} required />
        <input type="text" name="streetName" placeholder="Rua" value={formData.streetName} onChange={handleChange} required />
        <input type="text" name="streetNumber" placeholder="Número da Porta" value={formData.streetNumber} onChange={handleChange} required />
        <input type="number" name="areaSize" placeholder="Área (m²)" value={formData.areaSize} onChange={handleChange} required />
        <label>
          <input type="checkbox" name="hasAc" checked={formData.hasAc} onChange={handleChange} />
          Tem Ar Condicionado?
        </label>
        <input type="number" name="yearBuilt" placeholder="Ano de Construção" value={formData.yearBuilt} onChange={handleChange} required />
        <input type="number" name="rentPrice" placeholder="Preço da Renda (€)" value={formData.rentPrice} onChange={handleChange} required />
        <input type="date" name="dateAvailable" placeholder="Data Disponível" value={formData.dateAvailable} onChange={handleChange} required />

        <hr />
        <h4>Fotos</h4>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {formData.photos.map((url, index) => (
            <li key={index} style={{ marginBottom: 10 }}>
              <img src={url} alt={`Foto ${index + 1}`} width={100} style={{ borderRadius: 8 }} />
            </li>
          ))}
        </ul>

        <button type="submit" style={{ marginTop: '10px' }}>Criar</button>
      </form>
    </div>
  );
};

export default AddFlatPage;
