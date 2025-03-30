// Import the axios library for making HTTP requests
import axios from "axios";

// Create an instance of the axios client with a base URL set to the API_BASE_URL environment variable
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001" 
});

// Request interceptor to add authentication token to headers
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 (Unauthorized) errors globally
    if (error.response && error.response.status === 401) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userId');
      localStorage.removeItem('userJoindate');
      
      // Redirect to login page
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Authentication endpoints

// Sign in endpoint: sends a POST request to /user/signin with email and password in the request body
export const signIn = async ({ email, password }) =>
  await API.post("/user/signin", { email, password });

// Admin sign in endpoint: sends a POST request to /admin/signin with email and password in the request body
export const adminSignIn = async ({ email, password }) =>
  await API.post("/admin/signin", { email, password });

// Sign up endpoint: sends a POST request to /user/signup with name, email, and password in the request body
export const signUp = async ({ name, email, password }) =>
  await API.post("/user/signup", {
    name,
    email,
    password,
  });

// Find user by email endpoint: sends a GET request to /auth/findbyemail with email as a query parameter
export const findUserByEmail = async (email) =>
  await API.get(`/auth/findbyemail?email=${email}`);

// Generate OTP endpoint: sends a GET request to /auth/generateotp with email, name, and reason as query parameters
export const generateOtp = async (email, name, reason) =>
  await API.get(
    `/auth/generateotp?email=${email}&name=${name}&reason=${reason}`
  );

// Verify OTP endpoint: sends a GET request to /auth/verifyotp with OTP code as a query parameter
export const verifyOtp = async (otp) =>
  await API.get(`/auth/verifyotp?code=${otp}`);

// Reset password endpoint: sends a PUT request to /auth/forgetpassword with email and new password in the request body
export const resetPassword = async (email, password) =>
  await API.put(`/auth/forgetpassword`, { email, password });

// Export the API instance for other custom requests
export default API;
