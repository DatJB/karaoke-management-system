import api from "./axios";

export const getServingRooms = async () => {
    const response = await api.get("/me/serving-rooms");
    return response.data;
};

// Assuming there's a general get rooms for admin/manager, though user didn't explicitly list it, they listed me/serving-rooms
export const getRooms = async () => {
    const response = await api.get("/rooms");
    return response.data;
};

export const getWeeklyPricing = async () => {
    const response = await api.get("/rooms/prices/weekly");
    return response.data;
};

export const updateWeeklyPrices = async (roomId, requests) => {
    const response = await api.put(`/rooms/${roomId}/prices/weekly`, requests);
    return response.data;
};

export const updateTimeSlot = async (payload) => {
    const response = await api.put("/rooms/prices/time-slots", payload);
    return response.data;
};
