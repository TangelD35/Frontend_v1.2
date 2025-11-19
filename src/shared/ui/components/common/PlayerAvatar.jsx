import { useState } from 'react';

const PlayerAvatar = ({ player, size = 'md', className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(null);

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
        xl: 'text-2xl'
    };

    // Obtener iniciales del nombre
    const getInitials = (name) => {
        if (!name) return 'NA';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // Generar color basado en el nombre (colores dominicanos)
    const getColorFromName = (name) => {
        if (!name) return '#CE1126';
        const colors = ['#CE1126', '#002D62', '#8B0D1A', '#1E40AF', '#DC2626'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const playerName = player?.name || player?.full_name || 'Jugador';
    const initials = getInitials(playerName);
    const backgroundColor = getColorFromName(playerName);

    // Intentar cargar foto del jugador
    const photoExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const playerSlug = playerName.toLowerCase().replace(/\s+/g, '-');

    const handleImageError = () => {
        const currentIndex = photoExtensions.findIndex(ext =>
            currentSrc?.includes(`.${ext}`)
        );

        if (currentIndex < photoExtensions.length - 1) {
            // Intentar siguiente extensión
            const nextExt = photoExtensions[currentIndex + 1];
            setCurrentSrc(`/images/players/${playerSlug}.${nextExt}`);
        } else {
            // No hay más extensiones, mostrar iniciales
            setImageError(true);
        }
    };

    // Inicializar primera imagen
    if (!currentSrc && !imageError) {
        setCurrentSrc(`/images/players/${playerSlug}.${photoExtensions[0]}`);
    }

    if (imageError || !currentSrc) {
        // Mostrar iniciales con color
        return (
            <div
                className={`${sizes[size]} rounded-full flex items-center justify-center ${textSizes[size]} font-bold text-white shadow-lg border-2 border-white dark:border-gray-700 ${className}`}
                style={{ backgroundColor }}
            >
                {initials}
            </div>
        );
    }

    return (
        <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg ${className}`}>
            <img
                src={currentSrc}
                alt={playerName}
                className="w-full h-full object-cover"
                onError={handleImageError}
            />
        </div>
    );
};

export default PlayerAvatar;
