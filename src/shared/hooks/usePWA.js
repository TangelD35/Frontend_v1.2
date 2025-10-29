import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para manejar funcionalidades PWA
 */
export const usePWA = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    // Registrar Service Worker
    const registerServiceWorker = useCallback(async () => {
        if ('serviceWorker' in navigator) {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                setRegistration(reg);

                // Verificar actualizaciones
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });

                // Escuchar mensajes del Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    const { type, data } = event.data;

                    switch (type) {
                        case 'NOTIFICATION_CLICK':
                            // Manejar click en notificación
                            if (data?.url) {
                                window.location.href = data.url;
                            }
                            break;
                        default:
                            break;
                    }
                });

                console.log('Service Worker registered successfully');
                return reg;
            } catch (error) {
                console.error('Service Worker registration failed:', error);
                return null;
            }
        }
        return null;
    }, []);

    // Manejar evento beforeinstallprompt
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Manejar estado de conexión
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Verificar si ya está instalado
    useEffect(() => {
        const checkIfInstalled = () => {
            // Verificar si se ejecuta como PWA
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone ||
                document.referrer.includes('android-app://');

            setIsInstalled(isStandalone);
        };

        checkIfInstalled();
    }, []);

    // Instalar PWA
    const installPWA = useCallback(async () => {
        if (!deferredPrompt) return false;

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setIsInstallable(false);
            }

            setDeferredPrompt(null);
            return outcome === 'accepted';
        } catch (error) {
            console.error('Error installing PWA:', error);
            return false;
        }
    }, [deferredPrompt]);

    // Actualizar Service Worker
    const updateServiceWorker = useCallback(async () => {
        if (!registration || !updateAvailable) return false;

        try {
            const newWorker = registration.waiting;
            if (newWorker) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });

                // Recargar página después de la actualización
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating Service Worker:', error);
            return false;
        }
    }, [registration, updateAvailable]);

    // Limpiar cache
    const clearCache = useCallback(async () => {
        if (!registration) return false;

        try {
            const messageChannel = new MessageChannel();

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.success);
                };

                registration.active?.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }, [registration]);

    // Obtener versión del Service Worker
    const getServiceWorkerVersion = useCallback(async () => {
        if (!registration) return null;

        try {
            const messageChannel = new MessageChannel();

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };

                registration.active?.postMessage(
                    { type: 'GET_VERSION' },
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.error('Error getting Service Worker version:', error);
            return null;
        }
    }, [registration]);

    return {
        // Estados
        isInstallable,
        isInstalled,
        isOnline,
        updateAvailable,
        registration,

        // Funciones
        registerServiceWorker,
        installPWA,
        updateServiceWorker,
        clearCache,
        getServiceWorkerVersion,
    };
};

export default usePWA;