import { forwardRef } from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Badge variants
 */
const badgeVariants = {
    success: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    error: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    default: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    primary: 'bg-blue-600 text-white border-blue-700 dark:bg-blue-500 dark:border-blue-600',
};

/**
 * Badge sizes
 */
const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

/**
 * Modern Badge Component
 * 
 * @param {Object} props
 * @param {'success'|'warning'|'error'|'info'|'default'|'primary'} props.variant - Badge color variant
 * @param {'sm'|'md'|'lg'} props.size - Badge size
 * @param {boolean} props.dot - Show dot indicator
 * @param {boolean} props.removable - Show remove button
 * @param {Function} props.onRemove - Remove button click handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Badge content
 */
export const Badge = forwardRef(({
    variant = 'default',
    size = 'md',
    dot = false,
    removable = false,
    onRemove,
    className,
    children,
    ...props
}, ref) => {
    return (
        <span
            ref={ref}
            className={cn(
                // Base styles
                'inline-flex items-center gap-1.5 font-medium',
                'rounded-full border',
                'transition-all duration-200',
                // Variant styles
                badgeVariants[variant],
                // Size styles
                badgeSizes[size],
                // Custom classes
                className
            )}
            {...props}
        >
            {dot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    variant === 'success' && 'bg-green-600 dark:bg-green-400',
                    variant === 'warning' && 'bg-yellow-600 dark:bg-yellow-400',
                    variant === 'error' && 'bg-red-600 dark:bg-red-400',
                    variant === 'info' && 'bg-blue-600 dark:bg-blue-400',
                    variant === 'default' && 'bg-gray-600 dark:bg-gray-400',
                    variant === 'primary' && 'bg-white',
                )} />
            )}
            <span>{children}</span>
            {removable && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </span>
    );
});

Badge.displayName = 'Badge';

/**
 * Badge Group Component - for displaying multiple badges
 */
export const BadgeGroup = forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
        {...props}
    >
        {children}
    </div>
));

BadgeGroup.displayName = 'BadgeGroup';
