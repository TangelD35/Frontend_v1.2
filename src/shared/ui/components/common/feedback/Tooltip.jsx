import { useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTooltip } from '../../../../../shared/hooks/useTooltip';
import { classNames } from '../../../../../lib/utils/componentUtils';

const Tooltip = ({
    children,
    content,
    placement = 'top',
    trigger = 'hover',
    delay = 300,
    hideDelay = 100,
    className = '',
    contentClassName = '',
    arrow = true,
    maxWidth = 300,
    variant = 'default',
    icon = null,
    disabled = false,
    interactive = false,
    offset = 8,
    portal = true,
    id,
    ariaLabel,
    role = 'tooltip',
}) => {
    const tooltipId = useId();
    const finalId = id || `tooltip-${tooltipId}`;

    const {
        isVisible,
        position,
        actualPlacement,
        targetRef,
        tooltipRef,
        handlers,
    } = useTooltip({
        delay,
        hideDelay,
        placement,
        trigger,
        offset,
    });

    const variants = {
        default: 'bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100',
        info: 'bg-blue-600 text-white',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-white',
        error: 'bg-red-600 text-white',
        light: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-lg'
    };

    const icons = {
        info: Info,
        success: CheckCircle,
        warning: AlertTriangle,
        error: AlertTriangle,
        help: HelpCircle
    };

    const IconComponent = icon ? (typeof icon === 'string' ? icons[icon] : icon) : null;

    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    // Obtener colores de flecha según variante
    const getArrowColor = () => {
        switch (variant) {
            case 'info': return 'border-blue-600';
            case 'success': return 'border-green-600';
            case 'warning': return 'border-yellow-600';
            case 'error': return 'border-red-600';
            case 'light': return 'border-white dark:border-gray-800';
            default: return 'border-gray-900 dark:border-gray-700';
        }
    };

    // Posiciones de la flecha según placement
    const arrowClasses = {
        top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
        left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
        right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
    };

    // Renderizar tooltip
    const renderTooltip = () => (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    ref={tooltipRef}
                    initial={{
                        opacity: 0,
                        scale: 0.95,
                        y: actualPlacement === 'top' ? 10 : actualPlacement === 'bottom' ? -10 : 0,
                        x: actualPlacement === 'left' ? 10 : actualPlacement === 'right' ? -10 : 0
                    }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                    exit={{
                        opacity: 0,
                        scale: 0.95,
                        y: actualPlacement === 'top' ? 10 : actualPlacement === 'bottom' ? -10 : 0,
                        x: actualPlacement === 'left' ? 10 : actualPlacement === 'right' ? -10 : 0
                    }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className={classNames(
                        'fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg',
                        variants[variant],
                        contentClassName
                    )}
                    style={{
                        left: position.x,
                        top: position.y,
                        maxWidth: maxWidth,
                        pointerEvents: interactive ? 'auto' : 'none',
                    }}
                    id={finalId}
                    role={role}
                    aria-hidden={!isVisible}
                    aria-label={ariaLabel}
                >
                    <div className="flex items-start gap-2">
                        {IconComponent && (
                            <IconComponent className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            {typeof content === 'string' ? (
                                <p>{content}</p>
                            ) : (
                                content
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    {arrow && (
                        <div
                            className={classNames(
                                'absolute w-0 h-0 border-4',
                                arrowClasses[actualPlacement],
                                getArrowColor()
                            )}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <div
                ref={targetRef}
                className={classNames('inline-block', className)}
                {...handlers}
                tabIndex={trigger === 'focus' || trigger === 'click' ? 0 : undefined}
                aria-describedby={isVisible ? finalId : undefined}
                aria-expanded={trigger === 'click' ? isVisible : undefined}
                onKeyDown={(e) => {
                    if (trigger === 'click' && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handlers.onClick?.(e);
                    }
                    if (e.key === 'Escape' && isVisible) {
                        handlers.onBlur?.(e);
                    }
                }}
            >
                {children}
            </div>

            {portal ? createPortal(renderTooltip(), document.body) : renderTooltip()}
        </>
    );
};

// Componente de tooltip simple para casos comunes
export const SimpleTooltip = ({ children, text, ...props }) => (
    <Tooltip content={text} {...props}>
        {children}
    </Tooltip>
);

// Componente de tooltip con icono de ayuda
export const HelpTooltip = ({ text, className = '', ...props }) => (
    <Tooltip content={text} icon="help" variant="light" {...props}>
        <HelpCircle className={`w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help ${className}`} />
    </Tooltip>
);

// Componente de tooltip informativo
export const InfoTooltip = ({ text, className = '', ...props }) => (
    <Tooltip content={text} icon="info" variant="info" {...props}>
        <Info className={`w-4 h-4 text-blue-500 hover:text-blue-600 cursor-help ${className}`} />
    </Tooltip>
);

export default Tooltip;