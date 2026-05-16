import api from "./axios";

export const getRevenueStats = async (year) => {
    const response = await api.get("/statistics/revenue", {
        params: { year }
    });
    return response.data;
};
