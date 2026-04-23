import api from "./axios";

export const getRoomOrders = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/orders`);
    return response.data;
};

export const addOrderToRoom = async (roomId, orderData) => {
    const response = await api.post(`/rooms/${roomId}/orders`, orderData);
    return response.data;
};

export const updateOrderItem = async (roomId, itemId, quantity) => {
    const response = await api.put(`/rooms/${roomId}/orders/${itemId}?quantity=${quantity}`);
    return response.data;
};

export const deleteOrderItem = async (roomId, itemId) => {
    const response = await api.delete(`/rooms/${roomId}/orders/${itemId}`);
    return response.data;
};
