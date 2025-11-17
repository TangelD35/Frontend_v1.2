import { motion } from 'framer-motion';

const GaugeChart = ({ value, max = 100, label, color = '#CE1126', size = 200 }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                />
                <motion.circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke={color}
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-4xl font-black fill-gray-900 dark:fill-white"
                    transform="rotate(90 100 100)"
                >
                    {value.toFixed(1)}
                </text>
                <text
                    x="100"
                    y="130"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-semibold fill-gray-500"
                    transform="rotate(90 100 100)"
                >
                    {label}
                </text>
            </svg>
        </div>
    );
};

export default GaugeChart;
