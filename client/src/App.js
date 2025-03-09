import React, { useState } from "react";
import "./index.css"; // Import Tailwind directives first
import "./App.css"; // Import custom styles second
import Home from "./pages/Home/Home";
import { ThemeProvider } from "styled-components";
import Navbar from "./pages/Home/components/Navbar";
import { darkTheme, lightTheme } from "./utils/Theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { closeSnackbar } from "./redux/snackbarSlice";
import ProjectDashboard from "./pages/Dashboard/project-dashboard/ProjectDashboard";
import AdminDashboard from "./pages/Dashboard/admin-dashboard/AdminDashboard";
import { RecoilRoot } from "recoil";

import VideoCallJoin from "./components/VideoCallJoin"; // New Component for joining a call
import VideoConference from './components/VideoConference'; // Import from the components folder


// Main application component
function App() {
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
    <RecoilRoot>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <div className="app-container">
            <Navbar />
            <DndProvider backend={HTML5Backend}>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/dashboard/user" element={<ProjectDashboard />} />
                <Route exact path="/dashboard/admin" element={<AdminDashboard />} />
                <Route exact path="/video-call" element={<VideoCallJoin />} />
                <Route exact path="/video-call/:roomId" element={<VideoConference />} />
              
               
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
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
