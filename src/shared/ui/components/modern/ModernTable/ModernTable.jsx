import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const ModernTable = ({
    columns,
    data,
    onRowClick,
    className = '',
    ...props
}) => {
    return (
        <div className={clsx(
            'overflow-hidden rounded-2xl',
            'bg-white/70 dark:bg-gray-900/70',
            'backdrop-blur-xl border border-white/20',
            className
        )}>
            <div className="overflow-x-auto">
                <table className="w-full" {...props}>
                    <thead className="sticky top-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-xl">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <motion.tr
                                key={idx}
                                className="border-t border-gray-200/50 dark:border-gray-700/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"
                                    >
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ModernTable;