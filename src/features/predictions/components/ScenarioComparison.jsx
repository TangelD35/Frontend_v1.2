import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente para comparar múltiples escenarios de predicción
 * Permite guardar y comparar hasta 4 escenarios diferentes
 */
const ScenarioComparison = ({
    scenarios = [],
    onRemoveScenario,
    maxScenarios = 4,
    type = 'points' // 'points', 'game', 'forecast'
}) => {
    const [expandedScenario, setExpandedScenario] = useState(null);

    const getScenarioLabel = (scenario, index) => {
        switch (type) {
            case 'points':
                return `${scenario.predicted_points?.toFixed(1) || '0.0'} pts`;
            case 'game':
                return scenario.predicted_winner === 'home' ? 'Victoria RD' : 'Victoria Rival';
            case 'forecast':
                return `${scenario.forecasted_ppg?.toFixed(1) || '0.0'} ppg`;
            default:
                return `Escenario ${index + 1}`;
        }
    };

    const getScenarioColor = (scenario, index) => {
        const colors = ['#CE1126', '#002D62', '#8B0D1A', '#6b7280'];
        return colors[index % colors.length];
    };

    const getTrendIcon = (scenario) => {
        if (type === 'forecast' && scenario.trend) {
            if (scenario.trend === 'improving') return <TrendingUp className="w-3 h-3" />;
            if (scenario.trend === 'declining') return <TrendingDown className="w-3 h-3" />;
            return <Minus className="w-3 h-3" />;
        }
        return null;
    };

    if (scenarios.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Comparar Escenarios
                    </h3>
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                        (0/{maxScenarios})
                    </span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Plus className="w-12 h-12 mb-2" />
                    <p className="text-xs font-bold text-center">
                        Guarda predicciones para compararlas
                    </p>
                    <p className="text-[10px] text-center mt-1">
                        Máximo {maxScenarios} escenarios
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Comparar Escenarios
                </h3>
                <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                    ({scenarios.length}/{maxScenarios})
                </span>
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                    {scenarios.map((scenario, index) => {
                        const color = getScenarioColor(scenario, index);
                        const isExpanded = expandedScenario === index;

                        return (
                            <motion.div
                                key={scenario.id || index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="relative"
                            >
                                {/* Card */}
                                <div
                                    className="p-3 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer"
                                    style={{ borderColor: color }}
                                    onClick={() => setExpandedScenario(isExpanded ? null : index)}
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveScenario(scenario.id || index);
                                        }}
                                        className="absolute -top-2 -right-2 p-1 rounded-full bg-white dark:bg-gray-800 border-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-md"
                                        style={{ borderColor: color }}
                                    >
                                        <X className="w-3 h-3" style={{ color }} />
                                    </button>

                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="text-[10px] font-bold uppercase"
                                            style={{ color }}
                                        >
                                            Escenario {index + 1}
                                        </span>
                                        {getTrendIcon(scenario)}
                                    </div>

                                    {/* Main Value */}
                                    <p
                                        className="text-2xl font-black mb-1"
                                        style={{ color }}
                                    >
                                        {getScenarioLabel(scenario, index)}
                                    </p>

                                    {/* Timestamp */}
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400">
                                        {new Date(scenario.timestamp || Date.now()).toLocaleTimeString('es-DO', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="space-y-1">
                                                {type === 'game' && (
                                                    <>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">Confianza:</span>
                                                            <span className="font-bold">{(scenario.confidence * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">Precisión:</span>
                                                            <span className="font-bold">{(scenario.model_accuracy * 100).toFixed(1)}%</span>
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'points' && (
                                                    <>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">R²:</span>
                                                            <span className="font-bold">{scenario.confidence_score?.toFixed(4)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">Minutos:</span>
                                                            <span className="font-bold">{scenario.input_features?.minutes_played}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'forecast' && (
                                                    <>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">Cambio:</span>
                                                            <span className="font-bold">{scenario.change > 0 ? '+' : ''}{scenario.change?.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-[10px]">
                                                            <span className="text-gray-600 dark:text-gray-400">Confianza:</span>
                                                            <span className="font-bold capitalize">{scenario.confidence}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Footer */}
            {scenarios.length < maxScenarios && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                        Puedes agregar {maxScenarios - scenarios.length} escenario(s) más
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default ScenarioComparison;
