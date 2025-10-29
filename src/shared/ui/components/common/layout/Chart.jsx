import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
// import { useTheme } from "../../contexts/ThemeContext";

// Hook mock temporal
const useTheme = () => ({
    isDark: false,
    theme: 'light',
    toggleTheme: () => { }
});

const Chart = ({
    type = 'line',
    data = [],
    xKey = 'name',
    yKey = 'value',
    title = '',
    height = 300,
    colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    showGrid = true,
    showLegend = true,
    showTooltip = true,
}) => {
    const { isDark } = useTheme();

    // Colores adaptativos para dark mode
    const gridColor = isDark ? '#374151' : '#E5E7EB';
    const axisColor = isDark ? '#9CA3AF' : '#6B7280';
    const tooltipBg = isDark ? '#1F2937' : '#FFFFFF';
    const tooltipBorder = isDark ? '#374151' : '#E5E7EB';
    const tooltipText = isDark ? '#F3F4F6' : '#111827';

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart data={data}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                        <XAxis
                            dataKey={xKey}
                            stroke={axisColor}
                            tick={{ fill: axisColor }}
                        />
                        <YAxis
                            stroke={axisColor}
                            tick={{ fill: axisColor }}
                        />
                        {showTooltip && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: '8px',
                                    color: tooltipText
                                }}
                            />
                        )}
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ color: axisColor }}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey={yKey}
                            stroke={colors[0]}
                            strokeWidth={2}
                            dot={{ fill: colors[0], r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart data={data}>
                        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
                        <XAxis
                            dataKey={xKey}
                            stroke={axisColor}
                            tick={{ fill: axisColor }}
                        />
                        <YAxis
                            stroke={axisColor}
                            tick={{ fill: axisColor }}
                        />
                        {showTooltip && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: '8px',
                                    color: tooltipText
                                }}
                            />
                        )}
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ color: axisColor }}
                            />
                        )}
                        <Bar dataKey={yKey} fill={colors[0]} radius={[8, 8, 0, 0]} />
                    </BarChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey={yKey}
                            nameKey={xKey}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        {showTooltip && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: '8px',
                                    color: tooltipText
                                }}
                            />
                        )}
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ color: axisColor }}
                            />
                        )}
                    </PieChart>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            {title && (
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
                    {title}
                </h3>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;