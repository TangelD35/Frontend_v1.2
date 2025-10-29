import apiClient from '../client';

class DataManagementService {
    constructor() {
        this.baseURL = '/api/data-management';
        this.uploadProgress = new Map();
        this.validationRules = {
            players: {
                required: ['name', 'position', 'team_id'],
                optional: ['height', 'weight', 'birth_date', 'nationality'],
                formats: {
                    height: /^\d{1,3}$/,
                    weight: /^\d{1,3}$/,
                    birth_date: /^\d{4}-\d{2}-\d{2}$/
                }
            },
            games: {
                required: ['date', 'home_team_id', 'away_team_id'],
                optional: ['venue', 'season', 'game_type'],
                formats: {
                    date: /^\d{4}-\d{2}-\d{2}$/,
                    score: /^\d{1,3}-\d{1,3}$/
                }
            },
            stats: {
                required: ['player_id', 'game_id'],
                optional: ['points', 'rebounds', 'assists', 'steals', 'blocks'],
                formats: {
                    points: /^\d{1,3}$/,
                    rebounds: /^\d{1,2}$/,
                    assists: /^\d{1,2}$/
                }
            }
        };
    }

    // Importación de datos
    async importData(file, dataType, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('data_type', dataType);
            formData.append('options', JSON.stringify(options));

            const uploadId = Date.now().toString();
            this.uploadProgress.set(uploadId, { progress: 0, status: 'uploading' });

            const response = await apiClient.post(`${this.baseURL}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.uploadProgress.set(uploadId, { progress, status: 'uploading' });

                    // Notificar progreso si hay callback
                    if (options.onProgress) {
                        options.onProgress(progress, uploadId);
                    }
                }
            });

            this.uploadProgress.set(uploadId, { progress: 100, status: 'completed' });

            return {
                success: true,
                uploadId,
                importId: response.data.import_id,
                recordsProcessed: response.data.records_processed,
                recordsValid: response.data.records_valid,
                recordsInvalid: response.data.records_invalid,
                validationErrors: response.data.validation_errors,
                summary: response.data.summary
            };
        } catch (error) {
            console.error('Error importing data:', error);
            return {
                success: false,
                error: error.message,
                uploadId: null
            };
        }
    }

    // Validación de datos
    async validateData(data, dataType) {
        try {
            const response = await apiClient.post(`${this.baseURL}/validate`, {
                data,
                data_type: dataType,
                validation_rules: this.validationRules[dataType]
            });

            return {
                success: true,
                isValid: response.data.is_valid,
                validRecords: response.data.valid_records,
                invalidRecords: response.data.invalid_records,
                errors: response.data.errors,
                warnings: response.data.warnings,
                suggestions: response.data.suggestions
            };
        } catch (error) {
            console.error('Error validating data:', error);
            return {
                success: false,
                error: error.message,
                isValid: false
            };
        }
    }

    // Limpieza de datos
    async cleanData(data, cleaningRules = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/clean`, {
                data,
                rules: {
                    removeDuplicates: cleaningRules.removeDuplicates || true,
                    normalizeNames: cleaningRules.normalizeNames || true,
                    fillMissingValues: cleaningRules.fillMissingValues || false,
                    standardizeFormats: cleaningRules.standardizeFormats || true,
                    removeOutliers: cleaningRules.removeOutliers || false,
                    ...cleaningRules
                }
            });

            return {
                success: true,
                cleanedData: response.data.cleaned_data,
                changesApplied: response.data.changes_applied,
                duplicatesRemoved: response.data.duplicates_removed,
                outliers: response.data.outliers_detected,
                summary: response.data.cleaning_summary
            };
        } catch (error) {
            console.error('Error cleaning data:', error);
            return {
                success: false,
                error: error.message,
                cleanedData: null
            };
        }
    }

    // Transformación de datos
    async transformData(data, transformationRules) {
        try {
            const response = await apiClient.post(`${this.baseURL}/transform`, {
                data,
                transformations: transformationRules
            });

            return {
                success: true,
                transformedData: response.data.transformed_data,
                transformationsApplied: response.data.transformations_applied,
                newColumns: response.data.new_columns,
                removedColumns: response.data.removed_columns
            };
        } catch (error) {
            console.error('Error transforming data:', error);
            return {
                success: false,
                error: error.message,
                transformedData: null
            };
        }
    }

    // Exportación de datos
    async exportData(query, format = 'csv', options = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/export`, {
                query,
                format,
                options: {
                    includeHeaders: options.includeHeaders !== false,
                    dateFormat: options.dateFormat || 'YYYY-MM-DD',
                    encoding: options.encoding || 'utf-8',
                    delimiter: options.delimiter || ',',
                    ...options
                }
            }, {
                responseType: 'blob'
            });

            // Crear URL para descarga
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const filename = options.filename || `export_${Date.now()}.${format}`;

            return {
                success: true,
                downloadUrl: url,
                filename,
                size: blob.size
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return {
                success: false,
                error: error.message,
                downloadUrl: null
            };
        }
    }

    // Backup de datos
    async createBackup(options = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/backup`, {
                include_tables: options.includeTables || ['all'],
                compression: options.compression || 'gzip',
                encryption: options.encryption || false,
                metadata: {
                    created_by: options.createdBy || 'system',
                    description: options.description || 'Automated backup',
                    tags: options.tags || []
                }
            });

            return {
                success: true,
                backupId: response.data.backup_id,
                filename: response.data.filename,
                size: response.data.size,
                checksum: response.data.checksum,
                createdAt: response.data.created_at
            };
        } catch (error) {
            console.error('Error creating backup:', error);
            return {
                success: false,
                error: error.message,
                backupId: null
            };
        }
    }

    // Restaurar desde backup
    async restoreBackup(backupId, options = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/restore/${backupId}`, {
                overwrite_existing: options.overwriteExisting || false,
                verify_integrity: options.verifyIntegrity !== false,
                restore_tables: options.restoreTables || ['all']
            });

            return {
                success: true,
                restoreId: response.data.restore_id,
                tablesRestored: response.data.tables_restored,
                recordsRestored: response.data.records_restored,
                warnings: response.data.warnings
            };
        } catch (error) {
            console.error('Error restoring backup:', error);
            return {
                success: false,
                error: error.message,
                restoreId: null
            };
        }
    }

    // Sincronización de datos
    async syncData(sourceConfig, targetConfig, options = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/sync`, {
                source: sourceConfig,
                target: targetConfig,
                sync_mode: options.syncMode || 'incremental', // full, incremental, differential
                conflict_resolution: options.conflictResolution || 'source_wins',
                batch_size: options.batchSize || 1000,
                schedule: options.schedule // para sincronización programada
            });

            return {
                success: true,
                syncId: response.data.sync_id,
                recordsSynced: response.data.records_synced,
                conflicts: response.data.conflicts,
                errors: response.data.errors,
                duration: response.data.duration
            };
        } catch (error) {
            console.error('Error syncing data:', error);
            return {
                success: false,
                error: error.message,
                syncId: null
            };
        }
    }

    // Análisis de calidad de datos
    async analyzeDataQuality(tableName, columns = []) {
        try {
            const response = await apiClient.post(`${this.baseURL}/quality-analysis`, {
                table_name: tableName,
                columns: columns.length > 0 ? columns : 'all',
                checks: [
                    'completeness',
                    'uniqueness',
                    'validity',
                    'consistency',
                    'accuracy',
                    'timeliness'
                ]
            });

            return {
                success: true,
                overallScore: response.data.overall_score,
                dimensionScores: response.data.dimension_scores,
                issues: response.data.issues,
                recommendations: response.data.recommendations,
                columnProfiles: response.data.column_profiles,
                statistics: response.data.statistics
            };
        } catch (error) {
            console.error('Error analyzing data quality:', error);
            return {
                success: false,
                error: error.message,
                overallScore: null
            };
        }
    }

    // Detección de anomalías
    async detectAnomalies(data, detectionConfig = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/anomaly-detection`, {
                data,
                config: {
                    method: detectionConfig.method || 'isolation_forest',
                    sensitivity: detectionConfig.sensitivity || 0.1,
                    features: detectionConfig.features || 'auto',
                    time_series: detectionConfig.timeSeries || false,
                    ...detectionConfig
                }
            });

            return {
                success: true,
                anomalies: response.data.anomalies,
                anomalyScore: response.data.anomaly_scores,
                threshold: response.data.threshold,
                explanation: response.data.explanation,
                visualizations: response.data.visualizations
            };
        } catch (error) {
            console.error('Error detecting anomalies:', error);
            return {
                success: false,
                error: error.message,
                anomalies: []
            };
        }
    }

    // Obtener progreso de importación
    getUploadProgress(uploadId) {
        return this.uploadProgress.get(uploadId) || { progress: 0, status: 'unknown' };
    }

    // Limpiar progreso de importación
    clearUploadProgress(uploadId) {
        this.uploadProgress.delete(uploadId);
    }

    // Obtener historial de importaciones
    async getImportHistory(limit = 50) {
        try {
            const response = await apiClient.get(`${this.baseURL}/import-history`, {
                params: { limit }
            });

            return {
                success: true,
                imports: response.data.imports,
                totalCount: response.data.total_count
            };
        } catch (error) {
            console.error('Error fetching import history:', error);
            return {
                success: false,
                error: error.message,
                imports: []
            };
        }
    }

    // Obtener estadísticas de la base de datos
    async getDatabaseStats() {
        try {
            const response = await apiClient.get(`${this.baseURL}/database-stats`);

            return {
                success: true,
                tables: response.data.tables,
                totalRecords: response.data.total_records,
                databaseSize: response.data.database_size,
                lastUpdated: response.data.last_updated,
                indexStats: response.data.index_stats,
                performanceMetrics: response.data.performance_metrics
            };
        } catch (error) {
            console.error('Error fetching database stats:', error);
            return {
                success: false,
                error: error.message,
                tables: []
            };
        }
    }

    // Optimizar base de datos
    async optimizeDatabase(options = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/optimize`, {
                operations: options.operations || ['analyze', 'vacuum', 'reindex'],
                tables: options.tables || 'all',
                maintenance_window: options.maintenanceWindow || false
            });

            return {
                success: true,
                operationsCompleted: response.data.operations_completed,
                performanceImprovement: response.data.performance_improvement,
                spaceReclaimed: response.data.space_reclaimed,
                duration: response.data.duration
            };
        } catch (error) {
            console.error('Error optimizing database:', error);
            return {
                success: false,
                error: error.message,
                operationsCompleted: []
            };
        }
    }
}

const dataManagementService = new DataManagementService();
export default dataManagementService;