import api from './axios';

export const createBooking = async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
};

export const getBookingDetail = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
};

export const checkInSingleRoom = async (bookingId, roomId) => {
    const response = await api.post(`/bookings/${bookingId}/rooms/${roomId}/check-in`);
    return response.data;
};

export const checkInAllRooms = async (id) => {
    const response = await api.post(`/bookings/${id}/check-in`);
    return response.data;
};

export const checkoutSingleRoom = async (bookingId, roomId) => {
    const response = await api.post(`/bookings/${bookingId}/rooms/${roomId}/checkout`);
    return response.data;
};

export const checkoutAllRooms = async (id) => {
    const response = await api.post(`/bookings/${id}/checkout`);
    return response.data;
};

export const removeRoomFromBooking = async (bookingId, roomId) => {
    const response = await api.delete(`/bookings/${bookingId}/rooms/${roomId}`);
    return response.data;
};

export const deleteBooking = async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
};

export const updateBookingInfo = async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
};

export const addRoomToBooking = async (bookingId, roomId) => {
    const response = await api.post(`/bookings/${bookingId}/rooms/${roomId}`);
    return response.data;
};
