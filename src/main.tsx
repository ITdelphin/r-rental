import { createRoot } from 'react-dom/client'
import App from './App'
import './style.css'
import './i18n'

createRoot(document.getElementById('app')!).render(<App />)
