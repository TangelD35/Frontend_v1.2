import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Edit, Star, Share } from 'lucide-react';

const SwipeableCard = ({
    children,
    leftActions = [],
    rightActions = [],
    onSwipe,
    threshold = 80,
    className = '',
    disabled = false
}) => {
    const [isRevealed, setIsRevealed] = useState(null);
    const cardRef = useRef(null);
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-200, -threshold, 0, threshold, 200], [0.8, 1, 1, 1, 0.8]);
    const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);

    // Colores de fondo para las acciones
    const leftBg = useTransform(x, [0, threshold], ['rgba(0,0,0,0)', 'rgba(34, 197, 94, 0.1)']);
    const rightBg = useTransform(x, [-threshold, 0], ['rgba(239, 68, 68, 0.1)', 'rgba(0,0,0,0)']);

    const handleDragEnd = (event, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Determinar si se debe activar una acción
        if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
            if (offset > 0 && leftActions.length > 0) {
                // Swipe derecha (mostrar acciones izquierdas)
                setIsRevealed('left');
                onSwipe?.('right');
            } else if (offset < 0 && rightActions.length > 0) {
                // Swipe izquierda (mostrar acciones derechas)
                setIsRevealed('right');
                onSwipe?.('left');
            } else {
                // Volver a la posición original
                x.set(0);
                setIsRevealed(null);
            }
        } else {
            // Volver a la posición original
            x.set(0);
            setIsRevealed(null);
        }
    };

    const executeAction = (action) => {
        action.action();
        // Volver a la posición original después de ejecutar la acción
        x.set(0);
        setIsRevealed(null);
        onSwipe?.(isRevealed === 'left' ? 'right' : 'left', action.id);
    };

    const resetPosition = () => {
        x.set(0);
        setIsRevealed(null);
    };

    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Acciones izquierdas (se muestran al hacer swipe derecha) */}
            {leftActions.length > 0 && (
                <motion.div
                    className="absolute left-0 top-0 bottom-0 flex items-center"
                    style={{ backgroundColor: leftBg }}
                >
                    <div className="flex items-center gap-2 px-4">
                        {leftActions.map((action) => {
                            const IconComponent = action.icon;
                            return (
                                <motion.button
                                    key={action.id}
                                    onClick={() => executeAction(action)}
                                    className={`p-3 rounded-full ${action.bgColor} ${action.color} shadow-lg`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: isRevealed === 'left' ? 1 : 0,
                                        opacity: isRevealed === 'left' ? 1 : 0
                                    }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Acciones derechas (se muestran al hacer swipe izquierda) */}
            {rightActions.length > 0 && (
                <motion.div
                    className="absolute right-0 top-0 bottom-0 flex items-center"
                    style={{ backgroundColor: rightBg }}
                >
                    <div className="flex items-center gap-2 px-4">
                        {rightActions.map((action) => {
                            const IconComponent = action.icon;
                            return (
                                <motion.button
                                    key={action.id}
                                    onClick={() => executeAction(action)}
                                    className={`p-3 rounded-full ${action.bgColor} ${action.color} shadow-lg`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: isRevealed === 'right' ? 1 : 0,
                                        opacity: isRevealed === 'right' ? 1 : 0
                                    }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <IconComponent className="w-5 h-5" />
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Tarjeta principal */}
            <motion.div
                ref={cardRef}
                drag="x"
                dragConstraints={{ left: -200, right: 200 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{
                    x,
                    opacity,
                    scale
                }}
                className="relative z-10 bg-white dark:bg-gray-800 cursor-grab active:cursor-grabbing"
                whileTap={{ cursor: 'grabbing' }}
            >
                {children}

                {/* Overlay para cerrar acciones */}
                {isRevealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-transparent z-20"
                        onClick={resetPosition}
                    />
                )}
            </motion.div>

            {/* Indicadores de swipe */}
            <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                style={{
                    opacity: useTransform(x, [0, threshold / 2], [0, 1])
                }}
            >
                <div className="flex items-center gap-1 text-green-500">
                    {leftActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <IconComponent key={index} className="w-4 h-4" />
                        );
                    })}
                </div>
            </motion.div>

            <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                style={{
                    opacity: useTransform(x, [-threshold / 2, 0], [1, 0])
                }}
            >
                <div className="flex items-center gap-1 text-red-500">
                    {rightActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <IconComponent key={index} className="w-4 h-4" />
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

// Componente de ejemplo de uso
export const SwipeablePlayerCard = ({ player, onEdit, onDelete, onFavorite, onShare }) => {
    const leftActions = [
        {
            id: 'favorite',
            label: 'Favorito',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            action: () => onFavorite(player.id)
        },
        {
            id: 'share',
            label: 'Compartir',
            icon: Share,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            action: () => onShare(player)
        }
    ];

    const rightActions = [
        {
            id: 'edit',
            label: 'Editar',
            icon: Edit,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
            action: () => onEdit(player.id)
        },
        {
            id: 'delete',
            label: 'Eliminar',
            icon: Trash2,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            action: () => onDelete(player.id)
        }
    ];

    return (
        <SwipeableCard
            leftActions={leftActions}
            rightActions={rightActions}
            className="mb-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {player.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {player.position} • #{player.number}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.points}
                        </p>
                        <p className="text-xs text-gray-500">PPG</p>
                    </div>
                </div>
            </div>
        </SwipeableCard>
    );
};

export default SwipeableCard;