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
  disabledDates?: NepaliDateObject[]
  disabledDays?: number[] // 0 = Sunday, 6 = Saturday
  maxDaysCount?: number
  triggerButtonText?: string
  showTriggerButton?: boolean
  onChange?: (date: NepaliDateObject) => void
  onDateSelect?: (date: NepaliDateObject) => void
  onMonthChange?: (year: number, month: number) => void
  onOpen?: () => void
  onClose?: () => void
}
