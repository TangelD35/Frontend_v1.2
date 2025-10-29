import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './shared/providers/ThemeContext';
import App from './app/App';
import './assets/styles/index.css';

// Registrar Service Worker para PWA (DESHABILITADO EN DESARROLLO)
// NOTA: El Service Worker cachea React y causa problemas con hot reload
// Habilitar solo en producción
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Desregistrar Service Worker en desarrollo
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('SW unregistered for development');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
