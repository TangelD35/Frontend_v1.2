import { forwardRef } from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Modern Input Component
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text below input
 * @param {React.ReactNode} props.leftIcon - Icon on the left side
 * @param {React.ReactNode} props.rightIcon - Icon on the right side
 * @param {boolean} props.fullWidth - Full width input
 * @param {'sm'|'md'|'lg'} props.size - Input size
 * @param {string} props.className - Additional CSS classes
 */
export const Input = forwardRef(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    size = 'md',
    className,
    ...props
}, ref) => {
    const sizeClasses = {
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-4 py-2.5 text-base rounded-xl',
        lg: 'px-5 py-3 text-lg rounded-xl',
    };

    return (
        <div className={cn(fullWidth && 'w-full')}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        // Base styles
                        'w-full',
                        'bg-white dark:bg-gray-800',
                        'border border-gray-300 dark:border-gray-600',
                        'text-gray-900 dark:text-gray-100',
                        'placeholder-gray-400 dark:placeholder-gray-500',
                        'transition-all duration-200',
                        // Focus styles
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'dark:focus:ring-blue-400',
                        // Disabled styles
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900',
                        // Error styles
                        error && 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400',
                        // Size
                        sizeClasses[size],
                        // Icon padding
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        // Custom classes
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

/**
 * Textarea Component
 */
export const Textarea = forwardRef(({
    label,
    error,
    helperText,
    fullWidth = true,
    rows = 4,
    className,
    ...props
}, ref) => {
    return (
        <div className={cn(fullWidth && 'w-full')}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={cn(
                    // Base styles
                    'w-full px-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-600',
                    'text-gray-900 dark:text-gray-100',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'transition-all duration-200',
                    'resize-vertical',
                    // Focus styles
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'dark:focus:ring-blue-400',
                    // Disabled styles
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-900',
                    // Error styles
                    error && 'border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400',
                    // Custom classes
                    className
                )}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {helperText}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';
