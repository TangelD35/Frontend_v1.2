import { forwardRef } from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Button variants with modern styling
 */
const buttonVariants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-primary',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-success',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-error',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-warning',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
    link: 'text-blue-600 dark:text-blue-400 hover:underline',
    dominican: 'bg-gradient-to-r from-dominican-red to-dominican-blue text-white shadow-md hover:shadow-lg',
};

/**
 * Button sizes
 */
const buttonSizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-2xl',
};

/**
 * Modern Button Component
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'success'|'danger'|'warning'|'ghost'|'link'|'dominican'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'|'xl'} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state with spinner
 * @param {boolean} props.fullWidth - Full width button
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
export const Button = forwardRef(({
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    loading,
    fullWidth,
    leftIcon,
    rightIcon,
    children,
    ...props
}, ref) => {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={cn(
                // Base styles
                'inline-flex items-center justify-center gap-2 font-medium',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                'active:scale-95',
                // Variant styles
                buttonVariants[variant],
                // Size styles
                buttonSizes[size],
                // Full width
                fullWidth && 'w-full',
                // Custom classes
                className
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            <span>{children}</span>
            {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';
