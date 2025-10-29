import { TrendingUp, TrendingDown } from 'lucide-react';

const DataCard = ({ title, value, icon: Icon, trend, trendValue }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
                {Icon && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
            </div>
            <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                {trend && (
                    <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                        {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataCard;