import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { it } from 'date-fns/locale'
import { cn } from '../../lib/utils'
import './Calendar.css'

export function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      locale={it}
      showOutsideDays={showOutsideDays}
      className={cn('calendar-picker', className)}
      classNames={{
        months: 'calendar-months',
        month: 'calendar-month',
        caption: 'calendar-caption',
        caption_label: 'calendar-caption-label',
        nav: 'calendar-nav',
        nav_button: cn('calendar-nav-button'),
        nav_button_previous: 'calendar-nav-button-previous',
        nav_button_next: 'calendar-nav-button-next',
        table: 'calendar-table',
        head_row: 'calendar-head-row',
        head_cell: 'calendar-head-cell',
        row: 'calendar-row',
        cell: 'calendar-cell',
        day: cn('calendar-day'),
        day_range_end: 'calendar-day-range-end',
        day_selected: 'calendar-day-selected',
        day_today: 'calendar-day-today',
        day_outside: 'calendar-day-outside',
        day_disabled: 'calendar-day-disabled',
        day_range_middle: 'calendar-day-range-middle',
        day_hidden: 'calendar-day-hidden',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...iconProps }) => <ChevronLeft className="calendar-icon" {...iconProps} />,
        IconRight: ({ ...iconProps }) => <ChevronRight className="calendar-icon" {...iconProps} />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'
