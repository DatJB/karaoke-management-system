import api from "./axios";

export const getProfile = async () => {
    const response = await api.get("/profile");
    return response.data;
};

export const updatePassword = async (passwordData) => {
    const response = await api.put("/profile/password", passwordData);
    return response.data;
};
