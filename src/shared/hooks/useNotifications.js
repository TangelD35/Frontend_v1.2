import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

/**
 * Hook para manejar notificaciones push
 */
export const useNotifications = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Verificar soporte
    useEffect(() => {
        const checkSupport = () => {
            const supported = 'Notification' in window &&
                'serviceWorker' in navigator &&
                'PushManager' in window;
            setIsSupported(supported);
        };

        checkSupport();
    }, []);

    // Verificar suscripción existente
    const checkExistingSubscription = useCallback(async () => {
        if (!isSupported) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                setSubscription(existingSubscription);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error checking existing subscription:', error);
        }
    }, [isSupported]);

    useEffect(() => {
        checkExistingSubscription();
    }, [checkExistingSubscription]);

    // Solicitar permiso
    const requestPermission = useCallback(async () => {
        if (!isSupported) {
            throw new Error('Las notificaciones no están soportadas en este navegador');
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
    }, [isSupported]);

    // Suscribirse a notificaciones push
    const subscribe = useCallback(async () => {
        if (!isSupported || permission !== 'granted') {
            throw new Error('Permisos de notificación no concedidos');
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Clave pública VAPID (debe ser generada en el servidor)
            const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY ||
                'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkNpQHC7WgXr1gYKQ0i5_-kCBhqsFS8qXH0I2JGOo';

            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            // Enviar suscripción al servidor
            await api.post('/api/notifications/subscribe', {
                subscription: pushSubscription.toJSON(),
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });

            setSubscription(pushSubscription);
            setIsSubscribed(true);

            return pushSubscription;
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
            throw error;
        }
    }, [isSupported, permission]);

    // Desuscribirse de notificaciones push
    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        try {
            // Desuscribirse del navegador
            await subscription.unsubscribe();

            // Notificar al servidor
            await api.post('/api/notifications/unsubscribe', {
                subscription: subscription.toJSON()
            });

            setSubscription(null);
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
            throw error;
        }
    }, [subscription]);

    // Mostrar notificación local
    const showLocalNotification = useCallback((title, options = {}) => {
        if (!isSupported || permission !== 'granted') {
            console.warn('Cannot show notification: permission not granted');
            return;
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'febadom-local',
            requireInteraction: false,
            ...options
        };

        return new Notification(title, defaultOptions);
    }, [isSupported, permission]);

    // Enviar notificación push a través del servidor
    const sendPushNotification = useCallback(async (notificationData) => {
        try {
            await api.post('/api/notifications/send', notificationData);
            return true;
        } catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }, []);

    // Configurar preferencias de notificaciones
    const updateNotificationPreferences = useCallback(async (preferences) => {
        try {
            await api.put('/api/notifications/preferences', preferences);
            return true;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }, []);

    // Obtener historial de notificaciones
    const getNotificationHistory = useCallback(async (limit = 50) => {
        try {
            const response = await api.get('/api/notifications/history', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting notification history:', error);
            throw error;
        }
    }, []);

    return {
        // Estados
        permission,
        isSupported,
        subscription,
        isSubscribed,

        // Funciones
        requestPermission,
        subscribe,
        unsubscribe,
        showLocalNotification,
        sendPushNotification,
        updateNotificationPreferences,
        getNotificationHistory,
    };
};

// Función auxiliar para convertir clave VAPID
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default useNotifications;