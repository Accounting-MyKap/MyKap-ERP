import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// The root element to mount the React application to.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root and render the main App component.
// The AuthProvider within the App component is now solely responsible for
// handling the entire authentication lifecycle, ensuring a single, clean
// initialization path.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);