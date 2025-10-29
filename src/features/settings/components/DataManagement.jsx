import { useState, useEffect, useCallback } from 'react';
import {
    Upload,
    Download,
    Database,
    FileText,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Settings,
    Trash2,
    Eye,
    Filter,
    Search,
    BarChart3,
    Shield,
    Clock,
    HardDrive,
    Zap
} from 'lucide-react';
import dataManagementService from '../../../shared/api/services/dataManagementService';

const DataManagement = () => {
    const [activeTab, setActiveTab] = useState('import');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [importHistory, setImportHistory] = useState([]);
    const [databaseStats, setDatabaseStats] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const [qualityAnalysis, setQualityAnalysis] = useState(null);

    const tabs = [
        {
            id: 'import',
            label: 'Importar Datos',
            icon: Upload,
            description: 'Cargar datos desde archivos externos'
        },
        {
            id: 'export',
            label: 'Exportar Datos',
            icon: Download,
            description: 'Descargar datos en diferentes formatos'
        },
        {
            id: 'validation',
            label: 'Validación',
            icon: CheckCircle,
            description: 'Validar calidad e integridad de datos'
        },
        {
            id: 'backup',
            label: 'Respaldo',
            icon: Shield,
            description: 'Crear y restaurar copias de seguridad'
        },
        {
            id: 'analytics',
            label: 'Análisis',
            icon: BarChart3,
            description: 'Estadísticas y análisis de datos'
        },
        {
            id: 'maintenance',
            label: 'Mantenimiento',
            icon: Settings,
            description: 'Optimización y limpieza de base de datos'
        }
    ];

    const dataTypes = [
        { value: 'players', label: 'Jugadores', icon: '👤' },
        { value: 'games', label: 'Juegos', icon: '🏀' },
        { value: 'stats', label: 'Estadísticas', icon: '📊' },
        { value: 'teams', label: 'Equipos', icon: '🏆' },
        { value: 'seasons', label: 'Temporadas', icon: '📅' }
    ];

    const exportFormats = [
        { value: 'csv', label: 'CSV', description: 'Valores separados por comas' },
        { value: 'excel', label: 'Excel', description: 'Hoja de cálculo de Microsoft Excel' },
        { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
        { value: 'xml', label: 'XML', description: 'Extensible Markup Language' },
        { value: 'sql', label: 'SQL', description: 'Structured Query Language' }
    ];

    useEffect(() => {
        loadImportHistory();
        loadDatabaseStats();
    }, []);

    const loadImportHistory = async () => {
        const result = await dataManagementService.getImportHistory();
        if (result.success) {
            setImportHistory(result.imports);
        }
    };

    const loadDatabaseStats = async () => {
        const result = await dataManagementService.getDatabaseStats();
        if (result.success) {
            setDatabaseStats(result);
        }
    };

    const handleFileUpload = async (file, dataType, options = {}) => {
        setIsLoading(true);

        const uploadOptions = {
            ...options,
            onProgress: (progress, uploadId) => {
                setUploadProgress(prev => ({
                    ...prev,
                    [uploadId]: progress
                }));
            }
        };

        try {
            const result = await dataManagementService.importData(file, dataType, uploadOptions);

            if (result.success) {
                await loadImportHistory();
                await loadDatabaseStats();
            }

            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDataValidation = async (data, dataType) => {
        setIsLoading(true);
        try {
            const result = await dataManagementService.validateData(data, dataType);
            setValidationResults(result);
            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const handleQualityAnalysis = async (tableName) => {
        setIsLoading(true);
        try {
            const result = await dataManagementService.analyzeDataQuality(tableName);
            setQualityAnalysis(result);
            return result;
        } finally {
            setIsLoading(false);
        }
    };

    const renderImportTab = () => {
        return (
            <div className="space-y-6">
                {/* Upload Area */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Cargar Archivo
                    </h3>

                    <FileUploadArea
                        onFileUpload={handleFileUpload}
                        dataTypes={dataTypes}
                        isLoading={isLoading}
                    />
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Progreso de Carga
                        </h3>
                        {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                            <div key={uploadId} className="mb-3">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    <span>Archivo {uploadId}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Import History */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Historial de Importaciones
                        </h3>
                        <button
                            onClick={loadImportHistory}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                    </div>

                    <ImportHistoryTable imports={importHistory} />
                </div>
            </div>
        );
    };

    const renderExportTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Exportar Datos
                    </h3>

                    <ExportForm
                        dataTypes={dataTypes}
                        exportFormats={exportFormats}
                        onExport={async (query, format, options) => {
                            setIsLoading(true);
                            try {
                                const result = await dataManagementService.exportData(query, format, options);
                                if (result.success) {
                                    // Descargar archivo
                                    const link = document.createElement('a');
                                    link.href = result.downloadUrl;
                                    link.download = result.filename;
                                    link.click();
                                    window.URL.revokeObjectURL(result.downloadUrl);
                                }
                                return result;
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        );
    };

    const renderValidationTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Validación de Datos
                    </h3>

                    <ValidationPanel
                        onValidate={handleDataValidation}
                        results={validationResults}
                        isLoading={isLoading}
                    />
                </div>

                {validationResults && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Resultados de Validación
                        </h3>
                        <ValidationResults results={validationResults} />
                    </div>
                )}
            </div>
        );
    };

    const renderBackupTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Gestión de Respaldos
                    </h3>

                    <BackupPanel
                        onCreateBackup={async (options) => {
                            setIsLoading(true);
                            try {
                                return await dataManagementService.createBackup(options);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        onRestoreBackup={async (backupId, options) => {
                            setIsLoading(true);
                            try {
                                return await dataManagementService.restoreBackup(backupId, options);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        );
    };

    const renderAnalyticsTab = () => {
        return (
            <div className="space-y-6">
                {/* Database Stats */}
                {databaseStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Registros</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {databaseStats.totalRecords?.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Tamaño BD</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {(databaseStats.databaseSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Tablas</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {databaseStats.tables?.length || 0}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Última Actualización</span>
                            </div>
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                                {databaseStats.lastUpdated ? new Date(databaseStats.lastUpdated).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quality Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Análisis de Calidad de Datos
                    </h3>

                    <QualityAnalysisPanel
                        onAnalyze={handleQualityAnalysis}
                        results={qualityAnalysis}
                        isLoading={isLoading}
                        tables={databaseStats?.tables || []}
                    />
                </div>
            </div>
        );
    };

    const renderMaintenanceTab = () => {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Mantenimiento de Base de Datos
                    </h3>

                    <MaintenancePanel
                        onOptimize={async (options) => {
                            setIsLoading(true);
                            try {
                                const result = await dataManagementService.optimizeDatabase(options);
                                if (result.success) {
                                    await loadDatabaseStats();
                                }
                                return result;
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        isLoading={isLoading}
                        databaseStats={databaseStats}
                    />
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'import':
                return renderImportTab();
            case 'export':
                return renderExportTab();
            case 'validation':
                return renderValidationTab();
            case 'backup':
                return renderBackupTab();
            case 'analytics':
                return renderAnalyticsTab();
            case 'maintenance':
                return renderMaintenanceTab();
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Gestión de Datos
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Importar, exportar, validar y mantener datos del sistema
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {databaseStats && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {databaseStats.totalRecords?.toLocaleString()} registros totales
                        </div>
                    )}
                    <button
                        onClick={loadDatabaseStats}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

// Componentes auxiliares (simplificados para el ejemplo)
const FileUploadArea = ({ onFileUpload, dataTypes, isLoading }) => {
    const [selectedDataType, setSelectedDataType] = useState('players');
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFileUpload(files[0], selectedDataType);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {dataTypes.map(type => (
                    <button
                        key={type.value}
                        onClick={() => setSelectedDataType(type.value)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${selectedDataType === type.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                    >
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                    </button>
                ))}
            </div>

            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Formatos soportados: CSV, Excel, JSON
                </p>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={(e) => {
                        if (e.target.files[0]) {
                            onFileUpload(e.target.files[0], selectedDataType);
                        }
                    }}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Seleccionar Archivo
                </label>
            </div>
        </div>
    );
};

const ImportHistoryTable = ({ imports }) => {
    if (imports.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay importaciones recientes
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Fecha</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Tipo</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Archivo</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Registros</th>
                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {imports.map((imp, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 text-gray-800 dark:text-white">
                                {new Date(imp.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 text-gray-800 dark:text-white capitalize">
                                {imp.data_type}
                            </td>
                            <td className="py-2 text-gray-800 dark:text-white">
                                {imp.filename}
                            </td>
                            <td className="py-2 text-gray-800 dark:text-white">
                                {imp.records_processed}
                            </td>
                            <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${imp.status === 'completed'
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : imp.status === 'failed'
                                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                    }`}>
                                    {imp.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Componentes auxiliares simplificados
const ExportForm = ({ dataTypes, exportFormats, onExport, isLoading }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Formulario de exportación - Por implementar
        </div>
    );
};

const ValidationPanel = ({ onValidate, results, isLoading }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Panel de validación - Por implementar
        </div>
    );
};

const ValidationResults = ({ results }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Resultados de validación - Por implementar
        </div>
    );
};

const BackupPanel = ({ onCreateBackup, onRestoreBackup, isLoading }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Panel de respaldos - Por implementar
        </div>
    );
};

const QualityAnalysisPanel = ({ onAnalyze, results, isLoading, tables }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Panel de análisis de calidad - Por implementar
        </div>
    );
};

const MaintenancePanel = ({ onOptimize, isLoading, databaseStats }) => {
    return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Panel de mantenimiento - Por implementar
        </div>
    );
};

export default DataManagement;