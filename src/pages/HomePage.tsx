import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import theme from '../styles/theme';

const HomePage = () => {
  const navigate = useNavigate();

  const [city, setCity] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasAc, setHasAc] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (city) params.append('city', city);
    if (minArea) params.append('minArea', minArea);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (hasAc) params.append('hasAc', 'true');

    navigate(`/flats?${params.toString()}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Encontra o teu lar escandinavo ideal 🏡</h1>
        <p style={styles.subtitle}>
          Pesquisa apartamentos em toda a Dinamarca com design moderno e filtros avançados.
        </p>
      </div>

      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Cidade"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Área mínima (m²)"
          value={minArea}
          onChange={(e) => setMinArea(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Preço máximo (€)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={styles.input}
        />
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={hasAc}
            onChange={(e) => setHasAc(e.target.checked)}
          />
          Com ar condicionado
        </label>

        <button type="submit" style={styles.button}>
          🔍 Procurar Flats
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    background: theme.colors.background,
    fontFamily: theme.font,
    minHeight: '100vh',
    textAlign: 'center' as const,
  },
  hero: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.2rem',
    color: theme.colors.text,
    marginBottom: '10px',
  },
  subtitle: {
    color: theme.colors.subtext,
    fontSize: '1rem',
  },
  form: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    background: theme.colors.card,
    padding: '20px',
    borderRadius: theme.radius,
    boxShadow: theme.shadow,
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: `1px solid ${theme.colors.border}`,
    fontSize: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: theme.colors.text,
    justifyContent: 'flex-start',
  },
  button: {
    padding: '12px',
    backgroundColor: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default HomePage;
