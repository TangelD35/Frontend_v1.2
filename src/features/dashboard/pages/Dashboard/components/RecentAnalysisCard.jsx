import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GradientBadge } from '../../../../../shared/ui/components/modern';

const RecentAnalysisCard = ({
    analysis,
    index,
    onNavigate,
    getConfidenceBadge,
    getStatusBadge,
    prefersReducedMotion
}) => {
    const confidenceConfig = useMemo(
        () => getConfidenceBadge(analysis.confidence),
        [analysis.confidence, getConfidenceBadge]
    );

    const statusConfig = useMemo(
        () => getStatusBadge(analysis.status),
        [analysis.status, getStatusBadge]
    );

    const motionProps = prefersReducedMotion
        ? {
              initial: false,
              animate: { opacity: 1 },
              transition: { duration: 0.2 }
          }
        : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: index * 0.1, duration: 0.4 }
          };

    return (
        <motion.div
            {...motionProps}
            className="group p-5 lg:p-6 bg-gradient-to-br from-orange-50/50 via-yellow-50/30 to-red-50/20 dark:from-orange-900/20 dark:via-yellow-900/10 dark:to-red-900/10 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] border border-orange-200/30 dark:border-orange-700/30"
            role="button"
            tabIndex={0}
            aria-label={`Ver análisis ${analysis.title}`}
            onClick={() => onNavigate('/analytics')}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onNavigate('/analytics');
                }
            }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <GradientBadge variant={analysis.type === 'offensive' ? 'success' : 'primary'} size="small">
                    {analysis.type === 'offensive' ? 'Ofensiva' : 'Defensiva'}
                </GradientBadge>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <GradientBadge variant={confidenceConfig.variant} size="small">
                        {confidenceConfig.label}
                    </GradientBadge>
                    <span>{new Date(analysis.date).toLocaleDateString('es-ES')}</span>
                </div>
            </div>

            <h3 className="font-bold text-gray-800 dark:text-white mb-2 leading-tight">
                {analysis.title}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {analysis.result || 'Sin resultados registrados'}
                </span>
                <GradientBadge variant={statusConfig.variant} size="small">
                    {statusConfig.label}
                </GradientBadge>
            </div>
        </motion.div>
    );
};

export default memo(RecentAnalysisCard);
