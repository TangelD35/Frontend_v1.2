/**
 * Cliente API unificado
 * 
 * Este archivo re-exporta el cliente API principal (apiClient) de client.js
 * para mantener compatibilidad con código existente que importa axiosInstance.
 * 
 * Todos los endpoints ahora usan la misma instancia de axios con interceptores
 * y manejo de errores centralizado.
 */
import apiClient from '../client';

// Re-exportar el cliente principal como axiosInstance para compatibilidad
// Esto asegura que todos los endpoints usen la misma instancia con interceptores
const axiosInstance = apiClient;

export default axiosInstance;