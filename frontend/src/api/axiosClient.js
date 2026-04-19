import axios from 'axios';

// Create an Axios instance with base configuration
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ----------------------------------------------------
// REQUEST INTERCEPTOR
// ----------------------------------------------------
axiosClient.interceptors.request.use(
    (config) => {
        // Retrieve the JWT token from localStorage (support both keys for compatibility)
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');

        if (token) {
            // Attach the token to the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ----------------------------------------------------
// RESPONSE INTERCEPTOR
// ----------------------------------------------------
axiosClient.interceptors.response.use(
    (response) => {
        // Unwrap the standard ApiResponse<T> format if present
        // Depending on your backend, your actual data is inside response.data.data
        if (response.data && response.data.data !== undefined) {
            return response.data; // Returns { message: string, data: T }
        }
        return response.data;
    },
    (error) => {
        // Centralized error handling
        if (error.response) {
            const status = error.response.status;
            const backendMessage = error.response.data?.message;

            switch (status) {
                case 401:
                    console.error('Unauthorized! Token might be expired.');
                    // Example: localStorage.removeItem('access_token'); window.location.href = '/login';
                    break;
                case 403:
                    console.error('Forbidden! You lack permissions.');
                    break;
                case 404:
                    console.error('Resource not found.');
                    break;
                case 409:
                    // Handled specific business errors like DataLockedException or PayrollPeriodAlreadyApprovedException
                    console.warn('Conflict / Business Error:', backendMessage);
                    break;
                default:
                    console.error('Server error:', backendMessage || error.message);
            }

            // Return the custom error message to be caught by the component
            return Promise.reject(new Error(backendMessage || 'An unexpected error occurred.'));
        } else if (error.request) {
            console.error('Network Error: No response received from the server.');
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
