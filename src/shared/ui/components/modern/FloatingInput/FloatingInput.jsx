import { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const FloatingInput = ({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    return (
        <div className="relative">
            <div className={clsx(
                'relative rounded-xl border-2 transition-all duration-300',
                focused ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-300',
                error ? 'border-red-500' : '',
                className
            )}>
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                <input
                    className={clsx(
                        'w-full px-4 py-3 bg-transparent outline-none',
                        Icon ? 'pl-12' : '',
                        focused || hasValue ? 'pt-6 pb-2' : ''
                    )}
                    onFocus={() => setFocused(true)}
                    onBlur={(e) => {
                        setFocused(false);
                        setHasValue(!!e.target.value);
                    }}
                    {...props}
                />

                <label className={clsx(
                    'absolute left-4 transition-all duration-300 pointer-events-none',
                    Icon ? 'left-12' : '',
                    focused || hasValue
                        ? 'top-2 text-xs text-purple-600'
                        : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
                )}>
                    {label}
                </label>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default FloatingInput;