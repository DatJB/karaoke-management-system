import api from './axios';

export const getAiDashboard = async (params) => {
    const response = await api.get('/ai-insights/dashboard', { params });
    return response.data;
};
