import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../../../shared/providers/ThemeContext';
import useAuthStore from '../../../../shared/store/authStore';
import {
    SectionHeader,
    ActionButton,
    Input,
    Select,
    Checkbox,
    Toast,
    Modal
} from '../../../../shared/ui/components/common';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuthStore();
    const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [settings, setSettings] = useState({
        // Perfil
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        organization: '',

        // Notificaciones
        emailNotifications: true,
        pushNotifications: true,
        analysisAlerts: true,
        gameReminders: true,

        // Preferencias
        language: 'es',
        timezone: 'America/Santo_Domingo',
        dateFormat: 'DD/MM/YYYY',

        // Privacidad
        profileVisibility: 'team',
        dataSharing: false,
        analyticsTracking: true
    });

    const tabs = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'preferences', label: 'Preferencias', icon: Palette },
        { id: 'privacy', label: 'Privacidad', icon: Shield },
        { id: 'data', label: 'Datos', icon: Database }
    ];

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        // Aquí iría la lógica para guardar en la API
        setToast({
            isVisible: true,
            type: 'success',
            message: 'Configuración guardada correctamente'
        });
    };

    const handleExportData = () => {
        // Simular exportación de datos
        const userData = {
            profile: {
                name: settings.name,
                email: settings.email,
                phone: settings.phone,
                organization: settings.organization
            },
            preferences: {
                theme,
                language: settings.language,
                timezone: settings.timezone,
                dateFormat: settings.dateFormat
            },
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mi-configuracion.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setToast({
            isVisible: true,
            type: 'success',
            message: 'Datos exportados correctamente'
        });
        setIsExportModalOpen(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Información Personal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nombre Completo"
                                value={settings.name}
                                onChange={(e) => handleSettingChange('name', e.target.value)}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={settings.email}
                                onChange={(e) => handleSettingChange('email', e.target.value)}
                            />
                            <Input
                                label="Teléfono"
                                value={settings.phone}
                                onChange={(e) => handleSettingChange('phone', e.target.value)}
                            />
                            <Input
                                label="Organización"
                                value={settings.organization}
                                onChange={(e) => handleSettingChange('organization', e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Preferencias de Notificaciones</h3>
                        <div className="space-y-4">
                            <Checkbox
                                label="Notificaciones por Email"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                description="Recibir notificaciones importantes por correo electrónico"
                            />
                            <Checkbox
                                label="Notificaciones Push"
                                checked={settings.pushNotifications}
                                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                description="Notificaciones en tiempo real en el navegador"
                            />
                            <Checkbox
                                label="Alertas de Análisis"
                                checked={settings.analysisAlerts}
                                onChange={(e) => handleSettingChange('analysisAlerts', e.target.checked)}
                                description="Notificar cuando se completen análisis tácticos"
                            />
                            <Checkbox
                                label="Recordatorios de Partidos"
                                checked={settings.gameReminders}
                                onChange={(e) => handleSettingChange('gameReminders', e.target.checked)}
                                description="Recordatorios antes de partidos importantes"
                            />
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Preferencias de la Aplicación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tema
                                </label>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {theme === 'dark' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
                                </button>
                            </div>
                            <Select
                                label="Idioma"
                                value={settings.language}
                                onChange={(e) => handleSettingChange('language', e.target.value)}
                                options={[
                                    { value: 'es', label: 'Español' },
                                    { value: 'en', label: 'English' },
                                    { value: 'fr', label: 'Français' }
                                ]}
                            />
                            <Select
                                label="Zona Horaria"
                                value={settings.timezone}
                                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                                options={[
                                    { value: 'America/Santo_Domingo', label: 'Santo Domingo (GMT-4)' },
                                    { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
                                    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' }
                                ]}
                            />
                            <Select
                                label="Formato de Fecha"
                                value={settings.dateFormat}
                                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                                options={[
                                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                                ]}
                            />
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Configuración de Privacidad</h3>
                        <div className="space-y-6">
                            <Select
                                label="Visibilidad del Perfil"
                                value={settings.profileVisibility}
                                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                options={[
                                    { value: 'public', label: 'Público' },
                                    { value: 'team', label: 'Solo Equipo' },
                                    { value: 'private', label: 'Privado' }
                                ]}
                            />
                            <Checkbox
                                label="Compartir Datos Analíticos"
                                checked={settings.dataSharing}
                                onChange={(e) => handleSettingChange('dataSharing', e.target.checked)}
                                description="Permitir que los datos se usen para mejorar el sistema"
                            />
                            <Checkbox
                                label="Seguimiento de Análisis"
                                checked={settings.analyticsTracking}
                                onChange={(e) => handleSettingChange('analyticsTracking', e.target.checked)}
                                description="Recopilar datos de uso para mejorar la experiencia"
                            />
                        </div>
                    </div>
                );

            case 'data':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Gestión de Datos</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Exportar Datos</h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    Descarga una copia de tu información personal y configuraciones.
                                </p>
                                <ActionButton
                                    variant="primary"
                                    icon={Download}
                                    onClick={() => setIsExportModalOpen(true)}
                                >
                                    Exportar Mis Datos
                                </ActionButton>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Importar Configuración</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                    Restaura tu configuración desde un archivo de respaldo.
                                </p>
                                <ActionButton
                                    variant="secondary"
                                    icon={Upload}
                                    onClick={() => {
                                        setToast({
                                            isVisible: true,
                                            type: 'info',
                                            message: 'Función de importación próximamente'
                                        });
                                    }}
                                >
                                    Importar Configuración
                                </ActionButton>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            <SectionHeader
                title="Configuración"
                description="Personaliza tu experiencia en el sistema"
                icon={SettingsIcon}
                action={
                    <ActionButton
                        variant="primary"
                        onClick={handleSave}
                    >
                        Guardar Cambios
                    </ActionButton>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navegación de pestañas */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4">
                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Contenido de la pestaña */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {/* Modal de exportación */}
            <Modal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                title="Exportar Datos"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                        Se exportarán los siguientes datos:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Información del perfil</li>
                        <li>Preferencias de configuración</li>
                        <li>Configuración de notificaciones</li>
                        <li>Configuración de privacidad</li>
                    </ul>
                    <div className="flex gap-3 justify-end pt-4">
                        <ActionButton
                            variant="secondary"
                            onClick={() => setIsExportModalOpen(false)}
                        >
                            Cancelar
                        </ActionButton>
                        <ActionButton
                            variant="primary"
                            icon={Download}
                            onClick={handleExportData}
                        >
                            Exportar
                        </ActionButton>
                    </div>
                </div>
            </Modal>

            <Toast
                type={toast.type}
                message={toast.message}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    );
};

export default Settings;