import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PWAInstallPrompt from './PWAInstallPrompt';
import OfflineIndicator from './OfflineIndicator';
import NotificationCenter from './NotificationCenter';
import MobileNavigation from './MobileNavigation';
import { usePWA } from '../../shared/hooks/usePWA';
import { useNotifications } from '../../shared/hooks/useNotifications';

const MobileApp = ({ children }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    const { registerServiceWorker } = usePWA();
    const { requestPermission } = useNotifications();

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768 ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Registrar Service Worker al montar
    useEffect(() => {
        registerServiceWorker();
    }, [registerServiceWorker]);

    // Solicitar permisos de notificación después de un tiempo
    useEffect(() => {
        const timer = setTimeout(() => {
            if ('Notification' in window && Notification.permission === 'default') {
                // Mostrar prompt de notificaciones después de 30 segundos
                requestPermission().catch(console.error);
            }
        }, 30000);

        return () => clearTimeout(timer);
    }, [requestPermission]);

    // Cerrar notificaciones al cambiar de ruta
    useEffect(() => {
        setShowNotifications(false);
    }, [location.pathname]);

    const handleNotificationClick = () => {
        setShowNotifications(true);
    };

    return (
        <div className="mobile-app-container">
            {/* Contenido principal */}
            <div className={`${isMobile ? 'pb-20 pt-16' : ''}`}>
                {children}
            </div>

            {/* Componentes móviles */}
            {isMobile && (
                <>
                    <MobileNavigation onNotificationClick={handleNotificationClick} />
                    <OfflineIndicator />
                    <PWAInstallPrompt />
                    <NotificationCenter
                        isOpen={showNotifications}
                        onClose={() => setShowNotifications(false)}
                    />
                </>
            )}
        </div>
    );
};

export default MobileApp;