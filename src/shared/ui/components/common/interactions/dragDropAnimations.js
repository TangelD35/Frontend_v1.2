/**
 * Configuraciones de animaciones para DragDropList
 */

// Variantes de animación para elementos draggables
export const dragItemVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
            duration: 0.2,
        },
    },
    drag: {
        scale: 1.05,
        rotate: 2,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        zIndex: 1000,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    dragEnd: {
        scale: 1,
        rotate: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 40,
        },
    },
};

// Variantes para elementos sobre los que se está arrastrando
export const dropZoneVariants = {
    initial: {
        scale: 1,
        backgroundColor: 'transparent',
    },
    hover: {
        scale: 1.02,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30,
        },
    },
    active: {
        scale: 1.05,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30,
        },
    },
};

// Variantes para indicadores de drop
export const dropIndicatorVariants = {
    initial: {
        opacity: 0,
        scale: 0.8,
        y: -10,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: -10,
        transition: {
            duration: 0.15,
        },
    },
};

// Variantes para el contenedor de la lista
export const listContainerVariants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
        },
    },
};

// Variantes para el handle de arrastre
export const dragHandleVariants = {
    initial: {
        opacity: 0.6,
        scale: 1,
    },
    hover: {
        opacity: 1,
        scale: 1.1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 30,
        },
    },
    active: {
        opacity: 1,
        scale: 0.95,
        transition: {
            duration: 0.1,
        },
    },
};

// Configuraciones de transición personalizadas
export const transitions = {
    smooth: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
    },
    quick: {
        type: 'spring',
        stiffness: 500,
        damping: 40,
    },
    gentle: {
        type: 'spring',
        stiffness: 200,
        damping: 25,
    },
    bounce: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
    },
};

// Configuraciones de layout animation
export const layoutTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
};

// Configuraciones específicas para diferentes direcciones
export const directionalAnimations = {
    vertical: {
        drag: {
            y: [0, -5, 0],
            transition: {
                y: {
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                },
            },
        },
        drop: {
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
    },
    horizontal: {
        drag: {
            x: [0, -5, 0],
            transition: {
                x: {
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                },
            },
        },
        drop: {
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
    },
};

// Utilidades para generar animaciones dinámicas
export const createStaggerAnimation = (itemCount, delay = 0.1) => ({
    animate: {
        transition: {
            staggerChildren: delay,
            delayChildren: delay * 0.5,
        },
    },
});

export const createBounceAnimation = (intensity = 1) => ({
    animate: {
        y: [0, -10 * intensity, 0],
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 20,
            repeat: 1,
        },
    },
});

export const createPulseAnimation = (scale = 1.05) => ({
    animate: {
        scale: [1, scale, 1],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
});