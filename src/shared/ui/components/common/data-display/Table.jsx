const Table = ({ columns, data, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;