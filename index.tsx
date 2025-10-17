import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { supabase } from './services/supabase';

async function main() {
  // CRITICAL FIX: This "warm-up" call prevents a race condition.
  // We explicitly wait for the Supabase client to initialize and establish its
  // connection with the browser's storage before rendering the app. This ensures
  // that `localStorage` is available and session persistence is correctly set up
  // from the very beginning, resolving the issue where the session was lost and
  // data could not be saved.
  await supabase.auth.getSession();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Run the main function to start the application.
main();
