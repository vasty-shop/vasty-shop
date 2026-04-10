import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './features/vendor/styles/vendor-globals.css'
import './i18n' // Initialize i18n
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
