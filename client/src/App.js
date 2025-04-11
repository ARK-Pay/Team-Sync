import React, { useState } from "react";
import "./index.css"; // Import Tailwind directives first
import "./App.css"; // Import custom styles second
import Home from "./pages/Home/Home";
import EditorPage from "./pages/Editor/EditorPage";
import { ThemeProvider } from "styled-components";
import Navbar from "./pages/Home/components/Navbar";
import { darkTheme, lightTheme } from "./utils/Theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { closeSnackbar } from "./redux/snackbarSlice";
import ProjectDashboard from "./pages/Dashboard/project-dashboard/ProjectDashboard";
import AdminDashboard from "./pages/Dashboard/admin-dashboard/AdminDashboard";
import { RecoilRoot } from "recoil";
import { AuthProvider, useAuth } from "./context/AuthContext";

import VideoCallJoin from "./components/VideoCallJoin"; // New Component for joining a call
import VideoConference from './components/VideoConference'; // Import from the components folder
import { FigmaDashboard, FigmaEditor, FigmaViewer } from './components/Figma'; // Import Figma components

// Protected route component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard/user" replace />;
  }
  
  return children;
};

// Main application component
function AppContent() {
  const [isLightMode, setIsLightMode] = useState(true);
  const theme = isLightMode ? lightTheme : darkTheme;

  // Function to toggle the theme
  const toggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.style.backgroundColor = isLightMode ? "#222" : "#f5f5f5";
  };

  const snackbarState = useSelector((state) => state.snackbar);
  const dispatch = useDispatch();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    dispatch(closeSnackbar());
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <Navbar />
        <DndProvider backend={HTML5Backend}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route 
              path="/dashboard/user" 
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-call" 
              element={
                <ProtectedRoute>
                  <VideoCallJoin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-call/:roomId" 
              element={
                <ProtectedRoute>
                  <VideoConference />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/figma" 
              element={
                <ProtectedRoute>
                  <FigmaDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/figma/editor/:projectId" 
              element={
                <ProtectedRoute>
                  <FigmaEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/figma/viewer/:projectId" 
              element={
                <ProtectedRoute>
                  <FigmaViewer />
                </ProtectedRoute>
              } 
            />
          </Routes>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarState.open}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity={snackbarState.severity}>
              {snackbarState.message}
            </Alert>
          </Snackbar>
        </DndProvider>
      </div>
    </ThemeProvider>
  );
}

// App wrapper with providers
function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
