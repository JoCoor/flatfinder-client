import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/users/register', formData);
      console.log('Registration successful:', res.data);
      navigate('/login'); // redirecionar para login
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <input type="email" name="email" placeholder="Email" required value={formData.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" required value={formData.password} onChange={handleChange} />
        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
        <input type="date" name="birthDate" placeholder="Birth Date" value={formData.birthDate} onChange={handleChange} />
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
