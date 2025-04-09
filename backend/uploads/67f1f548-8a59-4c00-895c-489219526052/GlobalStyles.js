import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary: #B38BFC;
    --secondary: #5C27FE;
    --dark: #0f0f0f;
    --light: #ffffff;
    --gray: #333333;
    --text-primary: #ffffff;
    --text-secondary: #aaaaaa;
    --transition: 0.3s ease;
    --radius: 4px;
    --max-width: 1600px;
  }

  html, body {
    font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--dark);
    color: var(--text-primary);
    font-size: 16px;
    line-height: 1.5;
    overflow-x: hidden;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    cursor: none; /* Hide default cursor when using custom cursor */
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color var(--transition);
  }

  button, .button {
    background-color: var(--primary);
    color: var(--dark);
    border: none;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: var(--radius);
    cursor: none;
    transition: all var(--transition);
    position: relative;
    overflow: hidden;
  }

  button:hover, .button:hover {
    background-color: var(--secondary);
    transform: translateY(-2px);
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: clamp(2.5rem, 5vw, 5rem);
    letter-spacing: -1px;
  }

  h2 {
    font-size: clamp(2rem, 4vw, 3.5rem);
  }

  p {
    margin-bottom: 1.5rem;
    font-size: clamp(1rem, 1.2vw, 1.2rem);
  }

  section {
    padding: 100px 0;
    position: relative;
  }

  .container {
    width: 90%;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 20px;
  }

  /* Animation utility classes */
  .reveal {
    opacity: 0;
    transform: translateY(50px);
  }

  .fade-in {
    opacity: 0;
  }

  .delay-1 {
    transition-delay: 0.1s;
  }

  .delay-2 {
    transition-delay: 0.2s;
  }

  .delay-3 {
    transition-delay: 0.3s;
  }

  /* Hide default scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: var(--dark);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 6px;
  }

  ::selection {
    background-color: var(--primary);
    color: var(--dark);
  }

  @media (max-width: 768px) {
    section {
      padding: 60px 0;
    }
  }
`; 