import api from "./axios";

export const getProducts = async (params = {}) => {
    const response = await api.get('/products', { params: { page: 0, size: 10, ...params } });
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};
