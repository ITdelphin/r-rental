import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import rw from './locales/rw.json'
import fr from './locales/fr.json'
import sw from './locales/sw.json'

// Read persisted language ONCE synchronously before init
const savedLang = localStorage.getItem('i18nextLng') || 'en'

export const i18nReady = i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    rw: { translation: rw },
    fr: { translation: fr },
    sw: { translation: sw },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  // Don't show keys when translation is missing — use fallback to 'en'
  saveMissing: false,
})

export default i18n
