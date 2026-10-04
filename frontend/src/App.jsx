import { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

import AuthProvider from './context/AuthProvider';
import AppRouter from './routes/AppRouter';
function ScrollArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollArriba />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
