import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { HTMLAttributes, ImgHTMLAttributes } from 'react'

export const Avatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
))
Avatar.displayName = 'Avatar'

export const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ className, ...props }, ref) => {
  if (!props.src) return null
  return <img ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
})
AvatarImage.displayName = 'AvatarImage'

export const AvatarFallback = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium dark:bg-gray-700', className)} {...props}>
    {children}
  </div>
))
AvatarFallback.displayName = 'AvatarFallback'
