import api from './axios';

export const getAllEmployees = async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
};
