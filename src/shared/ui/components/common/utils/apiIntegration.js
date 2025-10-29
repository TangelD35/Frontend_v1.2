import { api } from '../../../../api/client';
import websocketService from '../../../../api/services/websocketService';
import useAuthStore from '../../../../store/authStore';

/**
 * Utilidades para integración de componentes avanzados con APIs y servicios existentes
 */

// Configuración de endpoints para componentes
export const API_ENDPOINTS = {
    // AdvancedDataTable endpoints
    table: {
        getData: '/api/data/table',
        export: '/api/data/export',
        bulkActions: '/api/data/bulk',
    },
    // MultiStepForm endpoints
    form: {
        save: '/api/forms/save',
        submit: '/api/forms/submit',
        validate: '/api/forms/validate',
    },
    // DragDropList endpoints
    list: {
        reorder: '/api/lists/reorder',
        update: '/api/lists/update',
    },
    // Tooltip endpoints (para contenido dinámico)
    tooltip: {
        getContent: '/api/help/content',
    }
};

/**
 * Integración para AdvancedDataTable
 */
export class TableApiIntegration {
    constructor(endpoint = API_ENDPOINTS.table.getData) {
        this.endpoint = endpoint;
        this.wsSubscriptions = new Map();
    }

    // Obtener datos con paginación, filtros y ordenamiento
    async fetchData(params = {}) {
        try {
            const {
                page = 0,
                pageSize = 25,
                sortBy = [],
                filters = {},
                globalFilter = '',
                ...otherParams
            } = params;

            const response = await api.get(this.endpoint, {
                params: {
                    page,
                    page_size: pageSize,
                    sort_by: sortBy.map(sort => `${sort.id}:${sort.desc ? 'desc' : 'asc'}`).join(','),
                    filters: JSON.stringify(filters),
                    search: globalFilter,
                    ...otherParams
                }
            });

            return {
                data: response.data.items || response.data.data || [],
                totalCount: response.data.total || response.data.count || 0,
                pageCount: response.data.pages || Math.ceil((response.data.total || 0) / pageSize),
                hasNextPage: response.data.has_next || false,
                hasPreviousPage: response.data.has_previous || false,
            };
        } catch (error) {
            console.error('Error fetching table data:', error);
            throw error;
        }
    }

    // Exportar datos
    async exportData(data, format = 'csv', filename = 'export') {
        try {
            const response = await api.post(API_ENDPOINTS.table.export, {
                data,
                format,
                filename
            }, {
                responseType: 'blob'
            });

            // Crear y descargar archivo
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    // Acciones en lote
    async performBulkAction(action, selectedRows) {
        try {
            const response = await api.post(API_ENDPOINTS.table.bulkActions, {
                action,
                items: selectedRows.map(row => row.id || row),
                data: selectedRows
            });

            return response.data;
        } catch (error) {
            console.error('Error performing bulk action:', error);
            throw error;
        }
    }

    // Suscribirse a actualizaciones en tiempo real
    subscribeToUpdates(tableId, onUpdate) {
        if (this.wsSubscriptions.has(tableId)) {
            this.unsubscribeFromUpdates(tableId);
        }

        const unsubscribe = websocketService.on('table_update', (data) => {
            if (data.tableId === tableId) {
                onUpdate(data);
            }
        });

        this.wsSubscriptions.set(tableId, unsubscribe);

        // Suscribirse al WebSocket
        websocketService.send('subscribe_table', { tableId });

        return () => this.unsubscribeFromUpdates(tableId);
    }

    // Desuscribirse de actualizaciones
    unsubscribeFromUpdates(tableId) {
        const unsubscribe = this.wsSubscriptions.get(tableId);
        if (unsubscribe) {
            unsubscribe();
            this.wsSubscriptions.delete(tableId);
            websocketService.send('unsubscribe_table', { tableId });
        }
    }

    // Limpiar todas las suscripciones
    cleanup() {
        this.wsSubscriptions.forEach((unsubscribe, tableId) => {
            unsubscribe();
            websocketService.send('unsubscribe_table', { tableId });
        });
        this.wsSubscriptions.clear();
    }
}

/**
 * Integración para MultiStepForm
 */
export class FormApiIntegration {
    constructor(formId) {
        this.formId = formId;
        this.autoSaveTimeout = null;
    }

    // Guardar progreso del formulario
    async saveProgress(data, stepIndex) {
        try {
            const response = await api.post(API_ENDPOINTS.form.save, {
                form_id: this.formId,
                step_index: stepIndex,
                data,
                timestamp: new Date().toISOString()
            });

            return response.data;
        } catch (error) {
            console.error('Error saving form progress:', error);
            throw error;
        }
    }

    // Auto-guardado con debounce
    autoSave(data, stepIndex, delay = 2000) {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveProgress(data, stepIndex).catch(error => {
                console.warn('Auto-save failed:', error);
            });
        }, delay);
    }

    // Validar paso en el servidor
    async validateStep(stepData, stepIndex) {
        try {
            const response = await api.post(API_ENDPOINTS.form.validate, {
                form_id: this.formId,
                step_index: stepIndex,
                data: stepData
            });

            return {
                isValid: response.data.valid || false,
                errors: response.data.errors || {},
                warnings: response.data.warnings || {}
            };
        } catch (error) {
            console.error('Error validating step:', error);
            return {
                isValid: false,
                errors: { general: 'Error de validación en el servidor' },
                warnings: {}
            };
        }
    }

    // Enviar formulario completo
    async submitForm(data) {
        try {
            const response = await api.post(API_ENDPOINTS.form.submit, {
                form_id: this.formId,
                data,
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                data: response.data,
                message: response.data.message || 'Formulario enviado exitosamente'
            };
        } catch (error) {
            console.error('Error submitting form:', error);
            return {
                success: false,
                error: error.message || 'Error al enviar el formulario',
                details: error.errors || {}
            };
        }
    }

    // Cargar datos guardados
    async loadSavedData() {
        try {
            const response = await api.get(`${API_ENDPOINTS.form.save}/${this.formId}`);
            return response.data;
        } catch (error) {
            console.error('Error loading saved form data:', error);
            return null;
        }
    }

    // Limpiar auto-save timeout
    cleanup() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = null;
        }
    }
}

/**
 * Integración para DragDropList
 */
export class ListApiIntegration {
    constructor(listId) {
        this.listId = listId;
    }

    // Actualizar orden de elementos
    async updateOrder(items, newOrder) {
        try {
            const response = await api.post(API_ENDPOINTS.list.reorder, {
                list_id: this.listId,
                items: newOrder.map((item, index) => ({
                    id: item.id,
                    position: index,
                    data: item
                }))
            });

            return response.data;
        } catch (error) {
            console.error('Error updating list order:', error);
            throw error;
        }
    }

    // Actualizar elemento individual
    async updateItem(itemId, data) {
        try {
            const response = await api.put(`${API_ENDPOINTS.list.update}/${itemId}`, {
                list_id: this.listId,
                data
            });

            return response.data;
        } catch (error) {
            console.error('Error updating list item:', error);
            throw error;
        }
    }
}

/**
 * Integración para Tooltip con contenido dinámico
 */
export class TooltipApiIntegration {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    }

    // Obtener contenido dinámico para tooltip
    async getContent(contentId, context = {}) {
        const cacheKey = `${contentId}_${JSON.stringify(context)}`;

        // Verificar cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.content;
            }
        }

        try {
            const response = await api.get(API_ENDPOINTS.tooltip.getContent, {
                params: {
                    content_id: contentId,
                    context: JSON.stringify(context)
                }
            });

            const content = response.data;

            // Guardar en cache
            this.cache.set(cacheKey, {
                content,
                timestamp: Date.now()
            });

            return content;
        } catch (error) {
            console.error('Error fetching tooltip content:', error);
            return null;
        }
    }

    // Limpiar cache
    clearCache() {
        this.cache.clear();
    }
}

/**
 * Hook para autenticación en componentes
 */
export const useComponentAuth = () => {
    const { user, isAuthenticated, token } = useAuthStore();

    const checkPermission = (permission) => {
        if (!isAuthenticated || !user) return false;

        // Lógica básica de permisos - expandir según necesidades
        if (user.role === 'admin') return true;
        if (user.permissions && user.permissions.includes(permission)) return true;

        return false;
    };

    const getAuthHeaders = () => {
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    return {
        user,
        isAuthenticated,
        token,
        checkPermission,
        getAuthHeaders
    };
};

/**
 * Utilidades de error handling para componentes
 */
export const handleApiError = (error, defaultMessage = 'Ha ocurrido un error') => {
    if (error.status === 401) {
        // Token expirado - redirigir a login
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }

    if (error.status === 403) {
        return 'No tienes permisos para realizar esta acción.';
    }

    if (error.status === 404) {
        return 'El recurso solicitado no fue encontrado.';
    }

    if (error.status === 422) {
        return error.errors ?
            Object.values(error.errors).flat().join(', ') :
            'Error de validación de datos.';
    }

    if (error.status === 500) {
        return 'Error interno del servidor. Por favor, intenta más tarde.';
    }

    return error.message || defaultMessage;
};

/**
 * Configuración de WebSocket para componentes
 */
export const setupWebSocketForComponent = (componentId, eventHandlers = {}) => {
    const subscriptions = [];

    // Configurar manejadores de eventos
    Object.entries(eventHandlers).forEach(([event, handler]) => {
        const unsubscribe = websocketService.on(event, handler);
        subscriptions.push(unsubscribe);
    });

    // Función de limpieza
    const cleanup = () => {
        subscriptions.forEach(unsubscribe => unsubscribe());
    };

    return cleanup;
};

export default {
    TableApiIntegration,
    FormApiIntegration,
    ListApiIntegration,
    TooltipApiIntegration,
    useComponentAuth,
    handleApiError,
    setupWebSocketForComponent,
    API_ENDPOINTS
};