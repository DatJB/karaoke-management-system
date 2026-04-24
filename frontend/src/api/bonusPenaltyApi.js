import axiosClient from './axiosClient';

const bonusPenaltyApi = {
    getAllCombined(page = 0, size = 10) {
        return axiosClient.get('/bonuses-penalties', {
            params: { page, size }
        });
    },
    
    getMyCombined(page = 0, size = 10) {
        return axiosClient.get('/bonuses-penalties/me', {
            params: { page, size }
        });
    },

    createBonus(data) {
        return axiosClient.post('/bonuses', data);
    },

    updateBonus(id, data) {
        return axiosClient.put(`/bonuses/${id}`, data);
    },

    deleteBonus(id) {
        return axiosClient.delete(`/bonuses/${id}`);
    },

    createPenalty(data) {
        return axiosClient.post('/penalties', data);
    },

    updatePenalty(id, data) {
        return axiosClient.put(`/penalties/${id}`, data);
    },

    deletePenalty(id) {
        return axiosClient.delete(`/penalties/${id}`);
    }
};

export default bonusPenaltyApi;
