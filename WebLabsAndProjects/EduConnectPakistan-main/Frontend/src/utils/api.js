import axios from 'axios';

// Create a new instance of axios with default config
const api = axios.create({
  baseURL: 'http://localhost:3000', // Adjust to match your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Extract the actual data from the response
    // If your backend returns { success: true, data: {...} },
    // you might want to return response.data.data
    console.log('API Response:', response.data);
    return response.data;
  },
  (error) => {
    // Handle common errors like 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;