import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPostHog } from './utils/posthog.js'

// Initialize PostHog analytics at app startup
// Falls back gracefully to localStorage mode if no API key is configured
initPostHog()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
