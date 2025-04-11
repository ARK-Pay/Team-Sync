import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Templates from './pages/Templates';
import Embed from './pages/Embed';

// Updated color palette and typography for a more professional look
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    /* Primary colors - Figma blue */
    --primary-50: #ebf8ff;
    --primary-100: #bee3f8;
    --primary-200: #90cdf4;
    --primary-300: #63b3ed;
    --primary-400: #4299e1;
    --primary-500: #0d99ff;
    --primary-600: #2b6cb0;
    --primary-700: #2c5282;
    --primary-800: #2a4365;
    --primary-900: #1a365d;
    
    /* Neutrals - refined grays */
    --neutral-50: #f9fafb;
    --neutral-100: #f3f4f6;
    --neutral-200: #e5e7eb;
    --neutral-300: #d1d5db;
    --neutral-400: #9ca3af;
    --neutral-500: #6b7280;
    --neutral-600: #4b5563;
    --neutral-700: #374151;
    --neutral-800: #1f2937;
    --neutral-900: #111827;
    
    /* Accents */
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    --info: #3b82f6;
    
    /* Sizes */
    --header-height: 48px;
    --toolbar-height: 48px;
    --panel-width: 300px;
    
    /* Shadows */
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Border radius */
    --radius-sm: 2px;
    --radius-md: 4px;
    --radius-lg: 8px;
    --radius-xl: 12px;
    --radius-full: 9999px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--neutral-50);
    color: var(--neutral-900);
    font-size: 14px;
    line-height: 1.5;
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
  }
  
  button {
    cursor: pointer;
    border: none;
    background: none;
    
    &:focus {
      outline: 2px solid var(--primary-300);
      outline-offset: 2px;
    }
    
    &:focus:not(:focus-visible) {
      outline: none;
    }
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--neutral-100);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--neutral-400);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--neutral-500);
  }

  /* Focus styles */
  :focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: var(--primary-100);
    color: var(--primary-900);
  }
`;

function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor/:projectId" element={<Editor />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/embed/:projectId" element={<Embed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
