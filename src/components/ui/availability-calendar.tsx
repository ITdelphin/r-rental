import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface BookedDate {
  check_in: string
  check_out: string
}

interface AvailabilityCalendarProps {
  bookedDates: BookedDate[]
  selectedCheckIn?: Date | null
  selectedCheckOut?: Date | null
  onDateSelect?: (checkIn: Date | null, checkOut: Date | null) => void
  readOnly?: boolean
  className?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function AvailabilityCalendar({
  bookedDates,
  selectedCheckIn = null,
  selectedCheckOut = null,
  onDateSelect,
  readOnly = false,
  className,
}: AvailabilityCalendarProps) {
  const { i18n } = useTranslation()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const bookedDateRanges = useMemo(() => {
    return bookedDates.map(bd => ({
      start: new Date(bd.check_in),
      end: new Date(bd.check_out),
    }))
  }, [bookedDates])

  const isDateBooked = (date: Date) => {
    return bookedDateRanges.some(range => date >= range.start && date <= range.end)
  }

  const isDatePast = (date: Date) => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    return date < todayStart
  }

  const isDateSelected = (date: Date) => {
    if (!selectedCheckIn && !selectedCheckOut) return false
    if (selectedCheckIn && date.getTime() === selectedCheckIn.getTime()) return true
    if (selectedCheckOut && date.getTime() === selectedCheckOut.getTime()) return true
    return false
  }

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    return date > selectedCheckIn && date < selectedCheckOut
  }

  const isDateInHoverRange = (date: Date) => {
    if (!selectedCheckIn || selectedCheckOut || !hoverDate) return false
    const start = selectedCheckIn < hoverDate ? selectedCheckIn : hoverDate
    const end = selectedCheckIn < hoverDate ? hoverDate : selectedCheckIn
    return date > start && date < end
  }

  const handleDateClick = (date: Date) => {
    if (readOnly || isDatePast(date) || isDateBooked(date)) return

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      onDateSelect?.(date, null)
    } else {
      if (date < selectedCheckIn) {
        onDateSelect?.(date, selectedCheckIn)
      } else {
        const hasBookedInRange = bookedDateRanges.some(range => {
          return selectedCheckIn <= range.start && date >= range.end
        })
        if (hasBookedInRange) {
          onDateSelect?.(date, null)
        } else {
          onDateSelect?.(selectedCheckIn, date)
        }
      }
    }
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1)
    setCurrentMonth(newDate.getMonth())
    setCurrentYear(newDate.getFullYear())
  }

  const renderDays = () => {
    const days = []

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isPast = isDatePast(date)
      const isBooked = isDateBooked(date)
      const isSelected = isDateSelected(date)
      const isInRange = isDateInRange(date)
      const isHoverRange = isDateInHoverRange(date)
      const isDisabled = isPast || isBooked

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled || readOnly}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          className={cn(
            'relative h-9 w-9 rounded-full text-sm font-medium transition-all',
            !isDisabled && !isSelected && 'hover:bg-primary-100 dark:hover:bg-primary-900/30',
            isDisabled && 'cursor-not-allowed text-gray-300 dark:text-gray-600',
            isSelected && 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-gray-900',
            isInRange && !isSelected && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
            isHoverRange && !isSelected && !isInRange && 'bg-primary-50/50 dark:bg-primary-900/10',
            isBooked && !isSelected && 'line-through text-red-400 dark:text-red-500',
          )}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString(i18n.language, { month: 'long' })

  return (
    <div className={cn('select-none', className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigateMonth(-1)}
          className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {monthName} {currentYear}
        </h3>
        <button
          type="button"
          onClick={() => navigateMonth(1)}
          className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {selectedCheckIn && selectedCheckOut && (
        <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {format(selectedCheckIn, 'MMM d')} - {format(selectedCheckOut, 'MMM d')}
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-400 dark:bg-red-500" />
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-primary-600" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  )
}
