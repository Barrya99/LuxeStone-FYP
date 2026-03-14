// diamond-frontend/src/App.jsx - UPDATED

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseDiamonds from './pages/BrowseDiamonds';
import BrowseSettings from './pages/BrowseSettings';
import DiamondDetail from './pages/DiamondDetail';
import SettingDetail from './pages/SettingDetail';
import Configurator from './pages/Configurator';
import Comparison from './pages/Comparison';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Chatbot from './features/chatbot/Chatbot';

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize auth on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/diamonds" element={<BrowseDiamonds />} />
          <Route path="/diamonds/:id" element={<DiamondDetail />} />
          <Route path="/settings" element={<BrowseSettings />} />
          <Route path="/settings/:id" element={<SettingDetail />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Protected Routes */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Components */}
        <Chatbot />
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;