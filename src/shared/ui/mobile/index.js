/**
 * Exportaciones de componentes móviles y PWA
 */

// Componentes principales
export { default as MobileApp } from './MobileApp';
export { default as MobileNavigation } from './MobileNavigation';

// Componentes de interacción
export { default as PullToRefresh } from './PullToRefresh';
export { default as SwipeableCard, SwipeablePlayerCard } from './SwipeableCard';

// Componentes de notificaciones y estado
export { default as NotificationCenter } from './NotificationCenter';
export { default as OfflineIndicator } from './OfflineIndicator';

// Componentes PWA
export { default as PWAInstallPrompt } from './PWAInstallPrompt';

// Re-exportar hooks relacionados
export { usePWA } from '../../shared/hooks/usePWA';
export { useNotifications } from '../../shared/hooks/useNotifications';
export { useGestures, useSwipeNavigation, usePullToRefresh } from '../../shared/hooks/useGestures';
export { useOffline, useOfflineData } from '../../shared/hooks/useOffline';