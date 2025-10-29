import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsGrid = ({ stats, className = '' }) => {
    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return 'text-green-600 dark:text-green-400';
            case 'down':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {stats.map((stat, index) => {
                const IconComponent = stat.icon;

                return (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.title}
                            </h3>
                            {IconComponent && (
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-baseline justify-between">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stat.value}
                            </p>

                            {stat.change && (
                                <div className={`flex items-center text-sm ${getTrendColor(stat.trend)}`}>
                                    {getTrendIcon(stat.trend)}
                                    <span className="ml-1">{stat.change}</span>
                                </div>
                            )}
                        </div>

                        {stat.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {stat.description}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatsGrid;