import axios from 'axios';

// Create an Axios instance with the base URL from the environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

export default api;
