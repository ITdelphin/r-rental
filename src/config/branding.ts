/**
 * EasyRent Developer-Controlled Branding Configuration
 *
 * This file contains the core visual identity of the application.
 * These values are DEVELOPER-CONTROLLED and must NOT be editable
 * through the Admin or Super Admin dashboard UI.
 *
 * To change branding, modify this file and redeploy.
 */

export const BRANDING = {
  // Application identity
  appName: 'EasyRent',
  appTagline: 'Smart House Rental Management',

  // Logo paths (relative to public/)
  logo: '/images/easyrentlogo.jpeg',
  favicon: '/favicon.ico',
  icon: '/icons.svg',

  // Authentication page branding
  auth: {
    logo: '/images/easyrentlogo.jpeg',
    background: '/images/auth-background.svg',
    tagline: 'Find Your Perfect Home in Rwanda',
  },

  // Core brand colors (CSS custom property names)
  colors: {
    primary: 'rgb(79, 70, 229)',       // indigo-600
    secondary: 'rgb(99, 102, 241)',     // indigo-500
    accent: 'rgb(139, 92, 246)',        // violet-500
    background: 'rgb(255, 255, 255)',   // white
    surface: 'rgb(249, 250, 251)',      // gray-50
    text: 'rgb(17, 24, 39)',           // gray-900
    textSecondary: 'rgb(107, 114, 128)', // gray-500
  },

  // Typography
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },

  // Layout tokens
  layout: {
    sidebarWidth: '280px',
    headerHeight: '64px',
    maxWidth: '1280px',
  },
} as const

/**
 * SYSTEM_PROTECTED settings keys
 * These keys can ONLY be modified by super_admin via the database.
 * The frontend Admin UI must NOT expose these for editing.
 */
export const SYSTEM_PROTECTED_KEYS = [
  'app_name',
  'app_logo',
  'app_icon',
  'favicon',
  'login_logo',
  'login_background',
  'primary_brand_color',
  'secondary_brand_color',
  'font_family',
  'core_theme',
  'auth_branding',
  'system_identity',
] as const

/**
 * PLATFORM_MANAGED settings keys
 * These keys can be managed by Super Admin through the dashboard.
 */
export const PLATFORM_MANAGED_KEYS = [
  'platform_name',
  'support_email',
  'phone_number',
  'address',
  'working_hours',
  'hero_background',
  'logo_url',
  'favicon_url',
  'maintenance_mode',
  'registration_enabled',
  'booking_enabled',
  'messaging_enabled',
  'review_enabled',
  'notification_enabled',
  'newsletter_enabled',
  'default_currency',
  'default_language',
  'supported_languages',
  'announcement',
] as const

/**
 * Check if a settings key is system-protected
 */
export function isSystemProtected(key: string): boolean {
  return (SYSTEM_PROTECTED_KEYS as readonly string[]).includes(key)
}

/**
 * Check if a settings key is platform-managed
 */
export function isPlatformManaged(key: string): boolean {
  return (PLATFORM_MANAGED_KEYS as readonly string[]).includes(key)
}
