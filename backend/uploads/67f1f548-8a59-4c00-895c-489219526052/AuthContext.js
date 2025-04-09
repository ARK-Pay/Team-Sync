import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/userSlice';
import { openSnackbar } from '../redux/snackbarSlice';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkLoggedIn = () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          // Verify token and set user data
          const decoded = jwtDecode(token);
          
          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            // Token expired, log out user
            handleLogout();
            dispatch(
              openSnackbar({
                message: 'Your session has expired. Please log in again.',
                severity: 'warning',
              })
            );
            return;
          }

          // Token is valid, set user data
          const userData = {
            email: decoded.email,
            name: localStorage.getItem('userName'),
            isAdmin: decoded.admin_id ? true : false,
            userId: decoded.admin_id || decoded.user_id,
          };

          setUser(userData);
          dispatch(loginSuccess(userData));
        } catch (error) {
          console.error("Token validation error:", error);
          handleLogout();
        }
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, [dispatch]);

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('userJoindate');
    
    setUser(null);
    dispatch(logout());
    navigate('/');
  };

  // Login handler
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Return the context provider with values
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin,
        login: handleLogin,
        logout: handleLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext; 