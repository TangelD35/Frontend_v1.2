import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const ChartWidget = ({
    type = 'line',
    data = [],
    xKey = 'name',
    yKey = 'value',
    title,
    color = '#3B82F6',
    height = 300
}) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (type) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis
                            dataKey={xKey}
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey={yKey}
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={yKey}
                            stroke={color}
                            fill={`${color}20`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} tickLine={false} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                            }}
                        />
                        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey={yKey}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1F2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#F9FAFB'
                            }}
                        />
                    </PieChart>
                );

            default:
                return <div>Tipo de gráfico no soportado</div>;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full flex flex-col"
        >
            {title && (
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {title}
                </h4>
            )}
            <div className="flex-1" style={{ minHeight: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ChartWidget;