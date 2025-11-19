import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente para visualizar la importancia de features de un modelo ML
 * Muestra las top 5 features más importantes con barras de progreso animadas
 * Colores alternados: rojo/azul dominicano
 */
const FeatureImportance = ({ features, modelName, loading = false }) => {
    const [showTooltip, setShowTooltip] = useState(null);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-1">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!features || features.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                        <TrendingUp className="w-4 h-4 text-[#CE1126]" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Importancia de Features
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Info className="w-12 h-12 mb-2" />
                    <p className="text-xs font-bold">No hay datos de importancia disponibles</p>
                </div>
            </div>
        );
    }

    // Tomar solo top 5
    const topFeatures = features.slice(0, 5);

    // Traducir nombres de features
    const featureLabels = {
        'rival_efg': 'eFG% Rival',
        'rd_efg': 'eFG% RD',
        'rival_ast_to_ratio': 'AST/TO Rival',
        'reb_diff': 'Diferencial Rebotes',
        'rd_ast_to_ratio': 'AST/TO RD',
        'fgm': 'Tiros Anotados',
        'ftm': 'TL Anotados',
        'ts_pct': 'True Shooting %',
        'fg3m': 'Triples Anotados',
        'fg2_pct': '2P%',
        'mpg': 'Minutos/Juego',
        'efficiency': 'Eficiencia',
        'edad': 'Edad',
        'num_torneos': 'Torneos Jugados',
        'apg': 'Asistencias/Juego'
    };

    const getFeatureLabel = (name) => featureLabels[name] || name.replace(/_/g, ' ').toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#CE1126]/10 to-[#002D62]/10">
                        <TrendingUp className="w-4 h-4 text-[#CE1126]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Top 5 Features Más Importantes
                        </h3>
                        {modelName && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                Modelo: {modelName}
                            </p>
                        )}
                    </div>
                </div>
                <div className="relative">
                    <button
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Info className="w-4 h-4 text-gray-400" />
                    </button>
                    {showTooltip && (
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10">
                            Las features con mayor importancia tienen más influencia en las predicciones del modelo.
                        </div>
                    )}
                </div>
            </div>

            {/* Features List */}
            <div className="space-y-3">
                {topFeatures.map((feature, index) => {
                    const isRed = index % 2 === 0;
                    const color = isRed ? '#CE1126' : '#002D62';
                    const bgColor = isRed ? 'bg-[#CE1126]' : 'bg-[#002D62]';

                    return (
                        <motion.div
                            key={feature.name || index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            {/* Label y Porcentaje */}
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                        #{index + 1}
                                    </span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {getFeatureLabel(feature.name)}
                                    </span>
                                </div>
                                <span
                                    className="text-sm font-black"
                                    style={{ color }}
                                >
                                    {(feature.importance * 100).toFixed(1)}%
                                </span>
                            </div>

                            {/* Barra de Progreso */}
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${feature.importance * 100}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                    className={`h-full ${bgColor} rounded-full`}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                    Total de features analizadas: {features.length}
                </p>
            </div>
        </motion.div>
    );
};

export default FeatureImportance;
