import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Tablet } from 'lucide-react';
import { usePWA } from '../../shared/hooks/usePWA';

const PWAInstallPrompt = () => {
    const { isInstallable, isInstalled, installPWA } = usePWA();
    const [isVisible, setIsVisible] = useState(true);
    const [isInstalling, setIsInstalling] = useState(false);

    // No mostrar si ya está instalado o no es instalable
    if (isInstalled || !isInstallable || !isVisible) {
        return null;
    }

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            const success = await installPWA();
            if (success) {
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Error installing PWA:', error);
        } finally {
            setIsInstalling(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Recordar que el usuario rechazó la instalación
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-dominican-red to-dominican-blue p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">
                                        Instalar FEBADOM
                                    </h3>
                                    <p className="text-white/80 text-sm">
                                        Acceso rápido desde tu dispositivo
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-white/80 hover:text-white transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                Beneficios de la instalación:
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Acceso rápido desde la pantalla de inicio
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Funciona sin conexión a internet
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Notificaciones push en tiempo real
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Experiencia nativa optimizada
                                </li>
                            </ul>
                        </div>

                        {/* Device Icons */}
                        <div className="flex items-center justify-center gap-4 mb-4 py-2">
                            <div className="text-center">
                                <Smartphone className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Móvil</span>
                            </div>
                            <div className="text-center">
                                <Tablet className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Tablet</span>
                            </div>
                            <div className="text-center">
                                <Monitor className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Desktop</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDismiss}
                                className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
                            >
                                Ahora no
                            </button>
                            <button
                                onClick={handleInstall}
                                disabled={isInstalling}
                                className="flex-1 bg-gradient-to-r from-dominican-red to-dominican-blue text-white px-4 py-2 rounded-lg font-medium text-sm hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isInstalling ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Instalando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Instalar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PWAInstallPrompt;