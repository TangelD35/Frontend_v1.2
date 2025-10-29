import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({
    title,
    subtitle,
    icon: Icon,
    actions,
    showBackButton = false,
    gradient = 'from-red-600 to-blue-600',
    className = ''
}) => {
    const navigate = useNavigate();

    return (
        <div className={`relative overflow-hidden rounded-2xl mb-8 ${className}`}>
            {/* Fondo con gradiente y efectos */}
            <div className={`bg-gradient-to-r ${gradient} p-8 relative`}>
                {/* Efectos de fondo */}
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

                {/* Contenido */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            {showBackButton && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-white" />
                                </button>
                            )}

                            <div className="flex items-center gap-4">
                                {Icon && (
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                )}

                                <div>
                                    <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                                        {title}
                                    </h1>
                                    {subtitle && (
                                        <p className="text-xl text-white/90 drop-shadow">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {actions && (
                            <div className="flex items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Borde inferior con efecto */}
            <div className="h-1 bg-gradient-to-r from-red-500 via-white to-blue-500"></div>
        </div>
    );
};

export default PageHeader;