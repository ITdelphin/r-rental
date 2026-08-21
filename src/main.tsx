import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './style.css'
import { i18nReady } from './i18n'

// Wait for i18n to fully initialise (reads saved language from localStorage)
// before mounting React so the correct language is active from the first render.
i18nReady.then(() => {
  createRoot(document.getElementById('app')!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  )
})
