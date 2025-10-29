import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

const AnimatedStatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    change,
    description,
    color = 'blue',
    delay = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [animatedValue, setAnimatedValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);

            // Animar el valor numérico si es un número
            const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, ''));
            if (!isNaN(numericValue)) {
                let current = 0;
                const increment = numericValue / 30;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        current = numericValue;
                        clearInterval(interval);
                    }
                    setAnimatedValue(current);
                }, 50);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            case 'down':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
        }
    };

    const getColorClasses = () => {
        const colors = {
            blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
            red: 'from-red-500 to-red-600 shadow-red-500/20',
            green: 'from-green-500 to-green-600 shadow-green-500/20',
            purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
            orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
            dominican: 'from-red-600 to-blue-600 shadow-red-500/20'
        };
        return colors[color] || colors.blue;
    };

    const displayValue = () => {
        const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, ''));
        if (!isNaN(numericValue) && isVisible) {
            const suffix = value.toString().replace(/[\d.]/g, '');
            return Math.round(animatedValue) + suffix;
        }
        return value;
    };

    return (
        <div className={`
            bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/40 
            border border-gray-100 dark:border-gray-700 p-6 
            hover:shadow-xl hover:-translate-y-1 
            transition-all duration-300 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {title}
                </h3>
                {Icon && (
                    <div className={`p-3 bg-gradient-to-br ${getColorClasses()} rounded-xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>

            <div className="flex items-baseline justify-between mb-3">
                <p className="text-4xl font-black text-gray-800 dark:text-white">
                    {displayValue()}
                </p>

                {change && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}

            {/* Barra de progreso decorativa */}
            <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${getColorClasses()} transition-all duration-1000 ease-out`}
                    style={{
                        width: isVisible ? '100%' : '0%',
                        transitionDelay: `${delay + 500}ms`
                    }}
                />
            </div>
        </div>
    );
};

export default AnimatedStatsCard;