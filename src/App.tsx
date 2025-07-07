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




function App() {
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
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
