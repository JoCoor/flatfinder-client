import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import FlatsPage from './pages/FlatsPage';
import FlatDetailsPage from './pages/FlatDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AddFlatPage from './pages/AddFlatPage';
import EditFlatPage from './pages/EditFlatPage';
import FavoritesPage from './pages/FavoritesPage';
import InboxPage from './pages/InboxPage';
import { useEffect } from 'react';
import { useUser } from './context/UserContext';
import Footer from './components/Footer';
import MyMessagesPage from './pages/MyMessagesPage';
import UserInboxPage from './pages/UserInboxPage';




function App() {
  const { setUser } = useUser();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log('🔁 Restaurando utilizador via App.tsx:', parsed);
        setUser(parsed);
      } catch (err) {
        console.error('❌ Erro ao parsear user do localStorage:', err);
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/flats" element={<FlatsPage />} />
        <Route path="/flats/:id" element={<FlatDetailsPage />} />
        <Route path="/inbox" element={<InboxPage />} />


        {/* Rotas protegidas */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <PrivateRoute>
              <InboxPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-messages"
          element={
            <PrivateRoute>
              <UserInboxPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-messages"
          element={
            <PrivateRoute>
              <MyMessagesPage />
            </PrivateRoute>
          }
        />


        <Route
          path="/add-flat"
          element={
            <PrivateRoute>
              <AddFlatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/flats/:id/edit"
          element={
            <PrivateRoute>
              <EditFlatPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={<>{console.log("⚙️ Rota /admin iniciada")}
            <PrivateRoute requireAdmin={true}>
              <AdminPage />
            </PrivateRoute>
          </>
          }
        />

      </Routes>
      <Footer />
    </>
  );
}



export default App;
