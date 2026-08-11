import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface PriceRangeSliderProps {
  min: number
  max: number
  step?: number
  value: readonly [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

export function PriceRangeSlider({
  min,
  max,
  step = 10000,
  value,
  onChange,
  className,
}: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = (e.clientX - rect.left) / rect.width
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step

      const distToMin = Math.abs(steppedValue - value[0])
      const distToMax = Math.abs(steppedValue - value[1])

      if (distToMin < distToMax) {
        onChange([Math.min(steppedValue, value[1] - step), value[1]])
      } else {
        onChange([value[0], Math.max(steppedValue, value[0] + step)])
      }
    },
    [min, max, step, value, onChange]
  )

  const handleMouseDown = useCallback((thumb: 'min' | 'max') => {
    setDragging(thumb)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step

      if (dragging === 'min') {
        onChange([Math.min(steppedValue, value[1] - step), value[1]])
      } else {
        onChange([value[0], Math.max(steppedValue, value[0] + step)])
      }
    }

    const handleMouseUp = () => setDragging(null)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, min, max, step, value, onChange])

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Min</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatPrice(value[0])}
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative h-2 cursor-pointer rounded-full bg-gray-200 dark:bg-gray-700"
        onClick={handleTrackClick}
      >
        <div
          className="absolute h-full rounded-full bg-primary-500"
          style={{
            left: `${getPercentage(value[0])}%`,
            width: `${getPercentage(value[1]) - getPercentage(value[0])}%`,
          }}
        />
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-white shadow transition-transform hover:scale-110',
            dragging === 'min' && 'scale-110'
          )}
          style={{ left: `${getPercentage(value[0])}%` }}
          onMouseDown={() => handleMouseDown('min')}
        />
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary-500 bg-white shadow transition-transform hover:scale-110',
            dragging === 'max' && 'scale-110'
          )}
          style={{ left: `${getPercentage(value[1])}%` }}
          onMouseDown={() => handleMouseDown('max')}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Max</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatPrice(value[1])}
        </span>
      </div>
    </div>
  )
}
