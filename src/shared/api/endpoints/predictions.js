import axiosInstance from './axiosConfig';

export const predictionsService = {
    // Obtener todas las predicciones
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/predictions', { params });
        return response.data;
    },

    // Obtener una predicción por ID
    getById: async (id) => {
        const response = await axiosInstance.get(`/predictions/${id}`);
        return response.data;
    },

    // Crear una predicción
    create: async (predictionData) => {
        const response = await axiosInstance.post('/predictions', predictionData);
        return response.data;
    },

    // Actualizar una predicción
    update: async (id, predictionData) => {
        const response = await axiosInstance.put(`/predictions/${id}`, predictionData);
        return response.data;
    },

    // Eliminar una predicción
    delete: async (id) => {
        const response = await axiosInstance.delete(`/predictions/${id}`);
        return response.data;
    },

    // Obtener predicciones por partido
    getByGame: async (gameId) => {
        const response = await axiosInstance.get(`/predictions/game/${gameId}`);
        return response.data;
    },

    // Obtener precisión de predicciones
    getAccuracy: async () => {
        const response = await axiosInstance.get('/predictions/accuracy');
        return response.data;
    },
};

export default predictionsService;