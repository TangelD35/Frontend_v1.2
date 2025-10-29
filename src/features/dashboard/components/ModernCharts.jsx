import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { GlassCard } from '../../../shared/ui/components/modern';

// Tooltip personalizado con glassmorphism
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4 shadow-xl">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Gráfico de Línea Moderno
export const ModernLineChart = ({ data, title, dataKeys = [], colors = [] }) => {
    return (
        <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{title}</h3>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <defs>
                            {colors.map((color, index) => (
                                <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.2} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                        />
                        {dataKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index]}
                                strokeWidth={3}
                                dot={{ fill: colors[index], r: 5 }}
                                activeDot={{ r: 8, fill: colors[index] }}
                                animationDuration={1000}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </GlassCard>
    );
};

// Gráfico de Barras Moderno
export const ModernBarChart = ({ data, title, dataKeys = [], colors = [] }) => {
    return (
        <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{title}</h3>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <defs>
                            {colors.map((color, index) => (
                                <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.9} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.6} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                        />
                        {dataKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={`url(#barGradient${index})`}
                                radius={[8, 8, 0, 0]}
                                animationDuration={1000}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </GlassCard>
    );
};

// Gráfico de Área Moderno
export const ModernAreaChart = ({ data, title, dataKeys = [], colors = [] }) => {
    return (
        <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{title}</h3>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            {colors.map((color, index) => (
                                <linearGradient key={index} id={`areaGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px', fontWeight: '500' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                        />
                        {dataKeys.map((key, index) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={colors[index]}
                                strokeWidth={2}
                                fill={`url(#areaGradient${index})`}
                                animationDuration={1000}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
        </GlassCard>
    );
};
