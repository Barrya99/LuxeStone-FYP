// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
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

// Features
// import Chatbot from './features/chatbot/Chatbot';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/diamonds" element={<BrowseDiamonds />} />
          <Route path="/diamonds/:id" element={<DiamondDetail />} />
          <Route path="/settings" element={<BrowseSettings />} />
          <Route path="/settings/:id" element={<SettingDetail />} />
          <Route path="/configurator" element={<Configurator />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
        </Routes>
        
        {/* Global Components */}
        <Chatbot />
        <Toaster position="top-right" />
      </Layout>
    </Router>
  );
}

export default App;