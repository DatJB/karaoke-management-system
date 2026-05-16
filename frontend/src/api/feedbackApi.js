import api from './axios';

export const submitFeedback = async (data) => {
    const response = await api.post('/feedbacks', data);
    return response.data;
};
