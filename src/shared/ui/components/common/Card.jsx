import { forwardRef } from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Modern Card Component
 * 
 * @param {Object} props
 * @param {boolean} props.hover - Enable hover effects
 * @param {boolean} props.elevated - Use elevated shadow
 * @param {boolean} props.bordered - Show border
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
export const Card = forwardRef(({
    className,
    hover = false,
    elevated = false,
    bordered = true,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                // Base styles
                'bg-white dark:bg-gray-800',
                'rounded-2xl',
                'transition-all duration-300',
                // Border
                bordered && 'border border-gray-200 dark:border-gray-700',
                // Shadow
                elevated ? 'shadow-lg' : 'shadow-sm',
                // Hover effects
                hover && 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer',
                // Custom classes
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'p-6 border-b border-gray-200 dark:border-gray-700',
            className
        )}
        {...props}
    >
        {children}
    </div>
));

CardHeader.displayName = 'CardHeader';

/**
 * Card Body Component
 */
export const CardBody = forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('p-6', className)}
        {...props}
    >
        {children}
    </div>
));

CardBody.displayName = 'CardBody';

/**
 * Card Footer Component
 */
export const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'p-6 border-t border-gray-200 dark:border-gray-700',
            className
        )}
        {...props}
    >
        {children}
    </div>
));

CardFooter.displayName = 'CardFooter';

/**
 * Card Title Component
 */
export const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-xl font-semibold text-gray-900 dark:text-gray-100',
            className
        )}
        {...props}
    >
        {children}
    </h3>
));

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
export const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            'text-sm text-gray-600 dark:text-gray-400 mt-1',
            className
        )}
        {...props}
    >
        {children}
    </p>
));

CardDescription.displayName = 'CardDescription';
