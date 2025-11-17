import { motion } from 'framer-motion';

const ProgressBar = ({ value, max = 100, label, color = '#CE1126', showPercentage = true }) => {
    const percentage = (value / max) * 100;

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                {showPercentage && (
                    <span className="text-xs font-bold" style={{ color }}>
                        {percentage.toFixed(1)}%
                    </span>
                )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
