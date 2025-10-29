import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const StatsWidget = ({ title, value, change, trend, description, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600'
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
        if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
        return <BarChart3 className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600 dark:text-green-400';
        if (trend === 'down') return 'text-red-600 dark:text-red-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-between">
                <div className="flex-1">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
                    >
                        {value}
                    </motion.div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {description}
                    </div>
                    {change && (
                        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-full flex items-center justify-center shadow-lg`}>
                    <BarChart3 className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
    );
};

export default StatsWidget;