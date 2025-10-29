import { useState } from 'react';
import {
    Download,
    FileText,
    FileSpreadsheet,
    Image,
    Mail,
    Calendar,
    Settings,
    CheckCircle,
    AlertCircle,
    Loader
} from 'lucide-react';

const ExportWidget = ({
    data = [],
    dashboardRef,
    onExport,
    availableFormats = ['pdf', 'excel', 'csv', 'png', 'email']
}) => {
    const [selectedFormat, setSelectedFormat] = useState('pdf');
    const [exportOptions, setExportOptions] = useState({
        includeCharts: true,
        includeData: true,
        dateRange: true,
        customTitle: '',
        orientation: 'portrait',
        pageSize: 'A4',
        quality: 'high'
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState(null);
    const [scheduledExports, setScheduledExports] = useState([]);

    const exportFormats = {
        pdf: {
            icon: FileText,
            label: 'PDF Report',
            description: 'Documento completo con gráficos',
            color: 'text-red-500'
        },
        excel: {
            icon: FileSpreadsheet,
            label: 'Excel Workbook',
            description: 'Datos en hojas de cálculo',
            color: 'text-green-500'
        },
        csv: {
            icon: FileSpreadsheet,
            label: 'CSV Data',
            description: 'Datos en formato CSV',
            color: 'text-blue-500'
        },
        png: {
            icon: Image,
            label: 'PNG Image',
            description: 'Captura del dashboard',
            color: 'text-purple-500'
        },
        email: {
            icon: Mail,
            label: 'Email Report',
            description: 'Enviar por correo electrónico',
            color: 'text-orange-500'
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setExportStatus({ type: 'loading', message: 'Preparando exportación...' });

        try {
            // Simular proceso de exportación
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (onExport) {
                await onExport(selectedFormat, exportOptions);
            }

            setExportStatus({ type: 'success', message: 'Exportación completada exitosamente' });
        } catch (error) {
            console.error('Error during export:', error);
            setExportStatus({ type: 'error', message: 'Error durante la exportación' });
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportStatus(null), 3000);
        }
    };

    const scheduleExport = () => {
        const newSchedule = {
            id: Date.now(),
            format: selectedFormat,
            options: { ...exportOptions },
            frequency: 'weekly',
            nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
        setScheduledExports(prev => [...prev, newSchedule]);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-semibold text-gray-800 dark:text-white">
                    Exportar Reportes
                </h4>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Formato de exportación
                </label>
                <div className="grid grid-cols-1 gap-2">
                    {availableFormats.map(format => {
                        const formatInfo = exportFormats[format];
                        if (!formatInfo) return null;

                        const Icon = formatInfo.icon;
                        return (
                            <label
                                key={format}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedFormat === format
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="exportFormat"
                                    value={format}
                                    checked={selectedFormat === format}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="sr-only"
                                />
                                <Icon className={`w-5 h-5 ${formatInfo.color}`} />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800 dark:text-white">
                                        {formatInfo.label}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatInfo.description}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Settings className="w-4 h-4" />
                    Opciones de exportación
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={exportOptions.includeCharts}
                            onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Incluir gráficos</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={exportOptions.includeData}
                            onChange={(e) => setExportOptions(prev => ({ ...prev, includeData: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Incluir datos detallados</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={exportOptions.dateRange}
                            onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Incluir rango de fechas</span>
                    </label>
                </div>

                <input
                    type="text"
                    placeholder="Título personalizado (opcional)"
                    value={exportOptions.customTitle}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, customTitle: e.target.value }))}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Status */}
            {exportStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${exportStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                        exportStatus.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}>
                    {exportStatus.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    {exportStatus.type === 'error' && <AlertCircle className="w-4 h-4" />}
                    {exportStatus.type === 'loading' && <Loader className="w-4 h-4 animate-spin" />}
                    <span className="text-sm">{exportStatus.message}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                    {isExporting ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {isExporting ? 'Exportando...' : 'Exportar'}
                </button>

                <button
                    onClick={scheduleExport}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <Calendar className="w-4 h-4" />
                    Programar
                </button>
            </div>

            {/* Scheduled Exports */}
            {scheduledExports.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exportaciones programadas
                    </h5>
                    <div className="space-y-1">
                        {scheduledExports.map(schedule => (
                            <div key={schedule.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                                <span className="text-gray-700 dark:text-gray-300">
                                    {exportFormats[schedule.format]?.label} - {schedule.frequency}
                                </span>
                                <button
                                    onClick={() => setScheduledExports(prev => prev.filter(s => s.id !== schedule.id))}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportWidget;