import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@nimbus-ds/styles/dist/index.css'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
