import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({
    type = 'info',
    message,
    title = '',
    isVisible,
    onClose,
    duration = 5000,
    position = 'top-right',
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
            iconColor: 'text-green-600 dark:text-green-400',
            titleColor: 'text-green-900 dark:text-green-200',
            textColor: 'text-green-700 dark:text-green-300',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-200 dark:border-red-800',
            iconColor: 'text-red-600 dark:text-red-400',
            titleColor: 'text-red-900 dark:text-red-200',
            textColor: 'text-red-700 dark:text-red-300',
        },
        warning: {
            icon: AlertCircle,
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            borderColor: 'border-yellow-200 dark:border-yellow-800',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            titleColor: 'text-yellow-900 dark:text-yellow-200',
            textColor: 'text-yellow-700 dark:text-yellow-300',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
            iconColor: 'text-blue-600 dark:text-blue-400',
            titleColor: 'text-blue-900 dark:text-blue-200',
            textColor: 'text-blue-700 dark:text-blue-300',
        },
    };

    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    const { icon: Icon, bgColor, borderColor, iconColor, titleColor, textColor } = config[type];

    return (
        <div className={`fixed ${positions[position]} z-50 animate-in slide-in-from-top duration-300`}>
            <div
                className={`${bgColor} ${borderColor} border rounded-xl shadow-lg dark:shadow-gray-900/50 p-4 max-w-md flex items-start gap-3 transition-colors`}
            >
                <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />

                <div className="flex-1">
                    {title && <h4 className={`font-semibold ${titleColor} mb-1`}>{title}</h4>}
                    <p className={`text-sm ${textColor}`}>{message}</p>
                </div>

                <button
                    onClick={onClose}
                    className={`${iconColor} hover:opacity-70 transition-opacity`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default Toast;