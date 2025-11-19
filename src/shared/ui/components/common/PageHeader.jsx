import { motion } from 'framer-motion';
import BanderaDominicana from '../../../../assets/icons/do.svg';

/**
 * Header reutilizable para todas las páginas del sistema
 * Diseño con gradiente dominicano y bandera
 */
const PageHeader = ({
    title = 'Título',
    subtitle = 'Selección Nacional • República Dominicana',
    action = null,
    className = ''
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-2xl shadow-xl bg-gradient-to-r from-[#CE1126] from-0% via-white via-50% to-[#002D62] to-100% p-4 mb-6 ${className}`}
        >
            <div className="flex items-center justify-between gap-4">
                {/* Lado izquierdo: título compacto */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/60 overflow-hidden">
                        <img
                            src={BanderaDominicana}
                            alt="Bandera Dominicana"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white">
                            {title}
                        </h1>
                        <p className="text-[10px] font-bold text-white">
                            {subtitle}
                        </p>
                    </div>
                </div>

                {/* Lado derecho: acción opcional */}
                {action && (
                    <div className="flex items-center gap-2">
                        {action}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PageHeader;
