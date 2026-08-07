import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './style.css'
import './i18n'

createRoot(document.getElementById('app')!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
)
