// Import the axios library for making HTTP requests
import axios from "axios";

// Create an instance of the axios client with a base URL set to the API_BASE_URL environment variable
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001" 
});

// Function to check if a token is valid
const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    // Basic validation - check if it's a properly formatted JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode and check expiration
    const decoded = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if expiration exists and is in the future
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Request interceptor to add authentication token to headers
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Only add token if it exists (we'll validate on the backend)
    if (token) {
      // Add the token as a Bearer token in the authorization header
      config.headers.authorization = `Bearer ${token}`;
      
      // For debugging only
      if (process.env.NODE_ENV !== 'production') {
        const sanitizedToken = token.substring(0, 15) + '...';
        console.log(`Request to ${config.url} with token: ${sanitizedToken}`);
      }
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
      console.log('401 Unauthorized response received, clearing auth data');
      
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
