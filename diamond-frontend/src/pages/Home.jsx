// src/pages/Home.jsx
import { useEffect } from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import EducationSection from '../components/home/EducationSection';
import { interactionAPI } from '../services/api';

const Home = () => {
  useEffect(() => {
    // Track page view
    trackPageView();
  }, []);

  const trackPageView = async () => {
    try {
      await interactionAPI.create({
        interaction_type: 'view_page',
        page_url: window.location.pathname,
        device_type: getDeviceType(),
        interaction_data: { page: 'home' },
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedProducts />
      <EducationSection />
    </div>
  );
};

export default Home;