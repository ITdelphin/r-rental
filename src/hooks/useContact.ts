import { useSettings } from './useSettings'

export const DEFAULT_CONTACT = {
  email: 'delphinngarambe@gmail.com',
  phone: '0782680268',
  address: 'Gisenyi, Rwanda',
  workingHours: 'Mon - Fri: 8:00 AM - 6:00 PM',
} as const

export function useContact() {
  const { settings } = useSettings()
  return {
    email: settings.support_email || DEFAULT_CONTACT.email,
    phone: settings.phone_number || DEFAULT_CONTACT.phone,
    address: settings.address || DEFAULT_CONTACT.address,
    workingHours: DEFAULT_CONTACT.workingHours,
  }
}
