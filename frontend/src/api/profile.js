import api from "./axios";

export const getProfile = async () => {
    const response = await api.get("/profile");
    return response.data;
};

export const updatePassword = async (passwordData) => {
    const response = await api.put("/profile/password", passwordData);
    return response.data;
};

export const getServingRooms = async () => {
    const response = await api.get("/me/serving-rooms");
    return response.data;
};

export const updateAvatar = async (formData) => {
    const response = await api.post("/profile/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const setupTwoFactor = async () => {
    const response = await api.post("/auth/2fa/setup");
    return response.data;
};

export const enableTwoFactor = async (code) => {
    const response = await api.post("/auth/2fa/enable", { code });
    return response.data;
};
