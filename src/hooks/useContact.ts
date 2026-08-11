import { useSettings } from './useSettings'

const FALLBACK_CONTACT = {
  email: 'delphinngarambe@gmail.com',
  phone: '0782680268',
  address: 'Gisenyi, Rwanda',
  workingHours: 'Mon - Fri: 8:00 AM - 6:00 PM',
}

export function useContact() {
  const { settings } = useSettings()

  return {
    email: settings.support_email || FALLBACK_CONTACT.email,
    phone: settings.phone_number || FALLBACK_CONTACT.phone,
    address: settings.address || FALLBACK_CONTACT.address,
    workingHours: settings.working_hours || FALLBACK_CONTACT.workingHours,
  }
}
