import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Scandic Flats</h2>
      <ul style={styles.menu}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
        <li><Link to="/flats" style={styles.link}>Flats</Link></li>

        {!user ? (
          <>
            <li><Link to="/login" style={styles.link}>Login</Link></li>
            <li><Link to="/register" style={styles.link}>Register</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/profile" style={styles.link}>Profile</Link></li>
            <li><Link to="/add-flat" style={styles.link}>Adicionar Flat</Link></li>
            <li><Link to="/favorites" style={styles.heart}>❤️</Link></li>
            {user.isAdmin && (
              <li><Link to="/admin" style={styles.link}>Admin Panel</Link></li>
            )}
            <li style={styles.welcome}>Hello, {user.firstName}</li>
            <li>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#282c34',
    padding: '10px 20px',
    color: 'white',
  },
  logo: {
    margin: 0,
  },
  menu: {
    listStyle: 'none',
    display: 'flex',
    gap: '15px',
    margin: 0,
    padding: 0,
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
  },
  heart: {
    color: 'red',
    fontSize: '20px',
    textDecoration: 'none',
  },
  welcome: {
    color: '#ccc',
    fontStyle: 'italic',
  },
  logoutButton: {
    background: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
} as const;

export default Navbar;
