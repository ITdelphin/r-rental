import { useState, useCallback } from 'react'

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  return { sidebarOpen, toggleSidebar, setSidebarOpen }
}
