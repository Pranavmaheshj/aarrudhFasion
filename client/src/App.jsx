import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadUser } from './store/authSlice';
import AppRoutes from './routes/AppRoutes';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FFF9EC',
            color: '#2B2B2B',
            border: '1px solid #EADDC6',
            boxShadow: '0 4px 14px rgba(184, 134, 11, 0.15)',
            fontSize: '13px',
            fontFamily: 'Montserrat, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#C2185B',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
