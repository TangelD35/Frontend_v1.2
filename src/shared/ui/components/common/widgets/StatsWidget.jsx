import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, Trophy, Target, Activity } from 'lucide-react';

const StatsWidget = ({
    type = 'bar',
    data = [],
    title = 'Estadísticas',
    config = {},
    realTime = false,
    refreshInterval = 5000
}) => {
    const [chartData, setChartData] = useState(data);
    const [isRealTime, setIsRealTime] = useState(realTime);

    // Simulación de datos en tiempo real
    useEffect(() => {
        if (!isRealTime) return;

        const interval = setInterval(() => {
            setChartData(prevData => {
                return prevData.map(item => ({
                    ...item,
                    value: Math.max(0, item.value + (Math.random() - 0.5) * 10)
                }));
            });
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [isRealTime, refreshInterval]);

    // Actualizar datos cuando cambian las props
    useEffect(() => {
        setChartData(data);
    }, [data]);

    const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

    const renderChart = () => {
        if (!chartData || chartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    No hay datos disponibles
                </div>
            );
        }

        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                                className="hover:opacity-80 transition-opacity"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="name"
                                className="text-xs"
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'kpi':
                return (
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {chartData.slice(0, 4).map((item, index) => {
                            const Icon = [Users, Trophy, Target, Activity][index] || Activity;
                            const trend = item.trend || 0;
                            const TrendIcon = trend > 0 ? TrendingUp : TrendingDown;
                            const trendColor = trend > 0 ? 'text-green-500' : 'text-red-500';

                            return (
                                <div key={item.name} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        {trend !== 0 && (
                                            <div className={`flex items-center gap-1 ${trendColor}`}>
                                                <TrendIcon className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    {Math.abs(trend)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                        {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );

            default:
                return (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Tipo de gráfico no soportado
                    </div>
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                            type="checkbox"
                            checked={isRealTime}
                            onChange={(e) => setIsRealTime(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Tiempo Real
                    </label>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1">
                {renderChart()}
            </div>
        </div>
    );
};

export default StatsWidget;