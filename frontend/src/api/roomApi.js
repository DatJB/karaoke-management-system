import api from './axios';

export const getAllRooms = async (params) => {
    const response = await api.get('/rooms', { params });
    return response.data;
};

export const getRoomDetail = async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
};

export const createRoom = async (data) => {
    const response = await api.post('/rooms', data);
    return response.data;
};

export const updateRoom = async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data;
};

export const deleteRoom = async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
};
