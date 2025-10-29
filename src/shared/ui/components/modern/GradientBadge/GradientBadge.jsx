import { clsx } from 'clsx';

const GradientBadge = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    ...props
}) => {
    const variants = {
        default: 'from-gray-500 to-gray-600',
        success: 'from-green-500 to-emerald-600',
        warning: 'from-yellow-500 to-orange-600',
        danger: 'from-red-500 to-pink-600',
        info: 'from-blue-500 to-cyan-600',
        primary: 'from-purple-500 to-pink-600'
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span className={clsx(
            'inline-flex items-center gap-1 rounded-full',
            'bg-gradient-to-r',
            variants[variant],
            'text-white font-semibold',
            sizes[size],
            'shadow-lg',
            className
        )} {...props}>
            {children}
        </span>
    );
};

export default GradientBadge;