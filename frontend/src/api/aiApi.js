import api from './axios';

export const getAiDashboard = async (params) => {
    const response = await api.get('/ai-insights/dashboard', { params });
    return response.data;
};

export const getWeeklyReport = async (week, year) => {
    const response = await api.get('/ai-insights/weekly', { params: { week, year } });
    return response.data;
};

export const generateAiReport = async (type, date) => {
    const response = await api.post('/ai-insights/generate', null, { params: { type, date } });
    return response.data;
};
