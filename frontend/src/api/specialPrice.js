import api from "./axios";

export const createSpecialPrice = async (roomId, priceData) => {
    // API expects a List<RoomPriceSpecialRequest>
    const response = await api.post(`/rooms/${roomId}/prices/special`, Array.isArray(priceData) ? priceData : [priceData]);
    return response.data;
};

export const getSpecialPricesByRoom = async (roomId) => {
    const response = await api.get(`/rooms/${roomId}/prices/special`);
    return response.data;
};

export const updateSpecialPrice = async (id, priceData) => {
    const response = await api.put(`/prices/special/${id}`, priceData);
    return response.data;
};

export const deleteSpecialPrice = async (id) => {
    const response = await api.delete(`/prices/special/${id}`);
    return response.data;
};
