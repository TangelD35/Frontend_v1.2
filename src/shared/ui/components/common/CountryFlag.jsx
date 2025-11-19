import { useState } from 'react';

const CountryFlag = ({ country, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    // Mapeo de códigos de país a emojis (fallback)
    const countryEmojis = {
        'USA': '🇺🇸', 'ESP': '🇪🇸', 'DOM': '🇩🇴', 'ARG': '🇦🇷', 'BRA': '🇧🇷',
        'CAN': '🇨🇦', 'FRA': '🇫🇷', 'GER': '🇩🇪', 'ITA': '🇮🇹', 'AUS': '🇦🇺',
        'MEX': '🇲🇽', 'PUR': '🇵🇷', 'VEN': '🇻🇪', 'COL': '🇨🇴', 'CHI': '🇨🇱',
        'URU': '🇺🇾', 'PAN': '🇵🇦', 'CUB': '🇨🇺', 'JAM': '🇯🇲', 'BAH': '🇧🇸',
        'REPUBLICA DOMINICANA': '🇩🇴', 'ESTADOS UNIDOS': '🇺🇸', 'PUERTO RICO': '🇵🇷'
    };

    const countryCode = country?.toUpperCase() || 'DOM';
    const flagEmoji = countryEmojis[countryCode] || '🏀';

    // Intentar cargar SVG de bandera
    const flagPath = `/icons/${countryCode.toLowerCase()}.svg`;

    if (imageError) {
        // Fallback a emoji
        return (
            <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl border-2 border-white dark:border-gray-600 shadow-md ${className}`}>
                {flagEmoji}
            </div>
        );
    }

    return (
        <div className={`${sizes[size]} rounded-lg overflow-hidden border-2 border-white dark:border-gray-600 shadow-md ${className}`}>
            <img
                src={flagPath}
                alt={`Bandera de ${country}`}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

export default CountryFlag;
