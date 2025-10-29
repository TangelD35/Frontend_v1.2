import { Bell, X, Check, AlertCircle, Info, Calendar } from 'lucide-react';

const NotificationPanel = ({
    notifications = [],
    isOpen,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead
}) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return Check;
            case 'warning': return AlertCircle;
            case 'info': return Info;
            case 'event': return Calendar;
            default: return Bell;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'text-green-600 bg-green-100';
            case 'warning': return 'text-yellow-600 bg-yellow-100';
            case 'info': return 'text-blue-600 bg-blue-100';
            case 'event': return 'text-purple-600 bg-purple-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            Notificaciones
                        </h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No tienes notificaciones
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const IconComponent = getNotificationIcon(notif.type);
                        const colorClasses = getNotificationColor(notif.type);

                        return (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${!notif.read ? 'bg-red-50 dark:bg-red-900/20' : ''
                                    }`}
                                onClick={() => onMarkAsRead?.(notif.id)}
                            >
                                <div className="flex gap-3">
                                    <div className={`p-2 rounded-lg ${colorClasses} flex-shrink-0`}>
                                        <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-gray-500">{notif.time}</p>
                                            {notif.action && (
                                                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                                    {notif.action}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        Ver todas las notificaciones
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationPanel;