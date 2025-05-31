export interface GregorianDateObject {
  year: number
  month: number // 0-indexed (0 = January, 11 = December)
  day: number
}

export interface CalendarData {
  [year: number]: number[]
}

export interface NepaliDateObject {
  year: number
  month: number
  day: number
}

export interface DateRange {
  start: NepaliDateObject
  end: NepaliDateObject
  label?: string
}

export interface PredefinedRange {
  label: string
  range: () => DateRange
}

export interface DatePickerOptions {
  theme?: "light" | "dark"
  primaryColor?: string
  language?: "ne" | "en"
  showTodayButton?: boolean
  closeOnSelect?: boolean
  disableFutureDates?: boolean
  disablePastDates?: boolean
  dateFormat?: string
  unicodeDate?: boolean
  readOnly?: boolean
  initialDate?: NepaliDateObject
  minDate?: NepaliDateObject
  maxDate?: NepaliDateObject
  disabledDates?: NepaliDateObject[] | string[] // Updated to accept string[] format
  disabledDays?: number[] // 0 = Sunday, 6 = Saturday
  maxDaysCount?: number
  triggerButtonText?: string
  showTriggerButton?: boolean
  isRangePicker?: boolean // Option to enable range picker mode
  initialDateRange?: DateRange // Initial date range for range picker
  showRangeInputs?: boolean // Show inputs for manually entering dates
  alwaysShowCalendars?: boolean // Always show calendars even when inputs are shown
  autoApply?: boolean // Automatically apply date when selected
  linkedCalendars?: boolean // When enabled, the two calendars will always be in adjacent months
  showDropdowns?: boolean // Show year and month select boxes
  showWeekNumbers?: boolean // Show week numbers
  showISOWeekNumbers?: boolean // Show ISO week numbers
  showCustomRangeLabel?: boolean // Show custom range label
  timePicker?: boolean // Enable time picker
  timePickerIncrement?: number // Time picker increment (in minutes)
  timePicker24Hour?: boolean // Use 24-hour time
  timePickerSeconds?: boolean // Show seconds in time picker
  ranges?: PredefinedRange[] // Predefined date ranges
  opens?: "left" | "right" | "center" // Where the calendar opens
  drops?: "down" | "up" // Whether the calendar drops down or up
  buttonClasses?: string // CSS classes for buttons
  applyButtonClasses?: string // CSS classes for apply button
  cancelButtonClasses?: string // CSS classes for cancel button
  singleDatePicker?: boolean // Show only a single calendar
  showCalendarOnFocus?: boolean // Show calendar when input gets focus
  onRangeSelect?: (range: DateRange) => void // Callback for range selection
  onChange?: (date: NepaliDateObject) => void
  onDateSelect?: (date: NepaliDateObject) => void
  onMonthChange?: (year: number, month: number) => void
  onOpen?: () => void
  onClose?: () => void
  onApply?: (range: DateRange) => void
  onCancel?: () => void
}
