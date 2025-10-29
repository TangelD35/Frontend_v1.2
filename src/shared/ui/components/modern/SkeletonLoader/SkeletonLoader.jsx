import { clsx } from 'clsx';

const SkeletonLoader = ({
    className = '',
    lines = 1,
    ...props
}) => {
    if (lines === 1) {
        return (
            <div
                className={clsx(
                    'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
                    'h-4 w-full',
                    className
                )}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-2" {...props}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className={clsx(
                        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
                        'h-4',
                        index === lines - 1 ? 'w-3/4' : 'w-full',
                        className
                    )}
                />
            ))}
        </div>
    );
};

export default SkeletonLoader;