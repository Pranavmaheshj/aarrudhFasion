import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import api from '../../api/axios';

const RootLayout = () => {
  const [landingContent, setLandingContent] = useState(null);

  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await api.get('/landing');
        setLandingContent(res.data.content);
      } catch (err) {
        console.error('Failed to load landing content:', err.message);
      }
    };
    fetchLanding();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-dark">
      <Navbar festivalOffer={landingContent?.festivalOffer} />
      <main className="flex-1">
        <Outlet context={{ landingContent, setLandingContent }} />
      </main>
      <Footer content={landingContent} />
    </div>
  );
};

export default RootLayout;
