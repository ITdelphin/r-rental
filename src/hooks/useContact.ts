export const CONTACT = {
  email: 'delphinngarambe@gmail.com',
  phone: '0782680268',
  address: 'Gisenyi, Rwanda',
  workingHours: 'Mon - Fri: 8:00 AM - 6:00 PM',
} as const

export function useContact() {
  return CONTACT
}
