import { motion } from 'framer-motion';

/**
 * Componente para mostrar métricas avanzadas en cards compactos
 * Diseño con colores dominicanos alternados (rojo/azul)
 */
const MetricsCard = ({
    label,
    value,
    description,
    color = 'red',
    index = 0,
    icon: Icon
}) => {
    const isRed = color === 'red';
    const colorClasses = {
        gradient: isRed
            ? 'from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20'
            : 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
        border: isRed
            ? 'border-[#CE1126]/30 dark:border-[#CE1126]/20'
            : 'border-[#002D62]/30 dark:border-[#002D62]/20',
        text: isRed
            ? 'text-[#CE1126] dark:text-[#CE1126]'
            : 'text-[#002D62] dark:text-[#002D62]',
        iconBg: isRed
            ? 'bg-[#CE1126]/10'
            : 'bg-[#002D62]/10'
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} shadow-sm hover:shadow-md transition-shadow`}
        >
            {/* Header con icono opcional */}
            <div className="flex items-center justify-between mb-1">
                <p className={`text-[10px] font-bold uppercase ${colorClasses.text}`}>
                    {label}
                </p>
                {Icon && (
                    <div className={`p-1 rounded ${colorClasses.iconBg}`}>
                        <Icon className={`w-3 h-3 ${colorClasses.text}`} />
                    </div>
                )}
            </div>

            {/* Valor principal */}
            <p className={`text-2xl font-black ${colorClasses.text} leading-none mb-1`}>
                {typeof value === 'number' ? value.toFixed(1) : value}
            </p>

            {/* Descripción */}
            {description && (
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                    {description}
                </p>
            )}
        </motion.div>
    );
};

/**
 * Grid de métricas avanzadas
 * Organiza múltiples MetricsCard en un grid responsive
 */
export const MetricsGrid = ({ metrics, columns = 3 }) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-3`}>
            {metrics.map((metric, index) => (
                <MetricsCard
                    key={metric.label || index}
                    {...metric}
                    index={index}
                />
            ))}
        </div>
    );
};

export default MetricsCard;
