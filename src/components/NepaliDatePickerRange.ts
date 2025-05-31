import { NepaliDate } from "../utils/NepaliDate"
import type { DatePickerOptions, NepaliDateObject, DateRange, PredefinedRange } from "../types/typesrange"

export class NepaliDatePicker {
  private element: HTMLElement
  private options: DatePickerOptions
  private selectedDate: NepaliDate
  private currentViewDate: NepaliDate
  private secondViewDate: NepaliDate | null = null
  private isOpen = false
  private pickerElement: HTMLElement | null = null
  private inputElement!: HTMLInputElement
  private startDateInput: HTMLInputElement | null = null
  private endDateInput: HTMLInputElement | null = null
  private tempSelectedDate: NepaliDate | null = null
  private clickCounter = 0
  private styleElement: HTMLStyleElement | null = null

  // Range picker properties
  private rangeStart: NepaliDate | null = null
  private rangeEnd: NepaliDate | null = null
  private tempRangeStart: NepaliDate | null = null
  private tempRangeEnd: NepaliDate | null = null
  private hoverDate: NepaliDate | null = null
  private isSelectingEndDate = false
  private selectedPredefinedRange: string | null = null

  // Default options
  private static readonly DEFAULT_OPTIONS: DatePickerOptions = {
    theme: "light",
    primaryColor: "#4F46E5", // Indigo color
    language: "ne",
    showTodayButton: true,
    closeOnSelect: false,
    disableFutureDates: false,
    disablePastDates: false,
    dateFormat: "YYYY-MM-DD",
    isRangePicker: false, // Default to single date picker
    showRangeInputs: true,
    alwaysShowCalendars: true,
    autoApply: false,
    linkedCalendars: true,
    showDropdowns: true,
    showWeekNumbers: false,
    showISOWeekNumbers: false,
    showCustomRangeLabel: true,
    timePicker: false,
    timePickerIncrement: 1,
    timePicker24Hour: true,
    timePickerSeconds: false,
    opens: "right",
    drops: "down",
    singleDatePicker: false,
    showCalendarOnFocus: true,
    onDateSelect: () => { },
    onMonthChange: () => { },
    onOpen: () => { },
    onClose: () => { },
  }

  constructor(selector: string | HTMLElement, options: DatePickerOptions = {}) {
    // Get the target element
    if (typeof selector === "string") {
      const el = document.querySelector(selector)
      if (!el) {
        throw new Error(`Element with selector "${selector}" not found`)
      }
      this.element = el as HTMLElement
    } else {
      this.element = selector
    }

    // Merge default options with user options
    this.options = { ...NepaliDatePicker.DEFAULT_OPTIONS }

    // Only override the default primaryColor if explicitly provided
    if (options.primaryColor) {
      this.options.primaryColor = options.primaryColor
    }

    // Merge the rest of the options
    this.options = { ...this.options, ...options }

    // Set initial dates
    let initialDate
    if (options.initialDate) {
      // Use provided initial date, ensuring it's within valid range
      initialDate = new NepaliDate(options.initialDate.year, options.initialDate.month, options.initialDate.day)
    } else {
      // Use today's date, which will be adjusted to a valid year if needed
      initialDate = NepaliDate.today()
    }

    this.selectedDate = initialDate
    this.currentViewDate = this.selectedDate
    this.tempSelectedDate = null

    // Initialize second view date for dual calendar
    if (this.options.isRangePicker && !this.options.singleDatePicker) {
      this.secondViewDate = this.currentViewDate.addMonths(1)
    }

    // Initialize range picker if enabled
    if (this.options.isRangePicker && this.options.initialDateRange) {
      const { start, end } = this.options.initialDateRange
      this.rangeStart = new NepaliDate(start.year, start.month, start.day)
      this.rangeEnd = new NepaliDate(end.year, end.month, end.day)
    } else if (this.options.isRangePicker) {
      // Default range: today to 7 days from now
      this.rangeStart = NepaliDate.today()
      this.rangeEnd = NepaliDate.today().addDays(6)
    }

    // Initialize the date picker
    this.init()
  }

  // Initialize the date picker
  private init(): void {
    // Create container element
    const container = document.createElement("div")
    container.className = "nepali-date-picker-container"

    // Create input element if the target is not an input
    if (this.element.tagName !== "INPUT") {
      const input = document.createElement("input")
      input.type = "text"
      input.readOnly = true
      input.className = "nepali-date-picker-input"
      container.appendChild(input)
      this.element.appendChild(container)
      this.inputElement = input
    } else {
      this.inputElement = this.element as HTMLInputElement
      this.inputElement.className += " nepali-date-picker-input"
      this.inputElement.readOnly = true

      // Wrap input in container
      this.element.parentNode?.insertBefore(container, this.element)
      container.appendChild(this.element)
    }

    // Set initial value
    this.updateInputValue()

    // Add event listeners
    this.inputElement.addEventListener("click", this.toggle.bind(this))
    if (this.options.showCalendarOnFocus) {
      this.inputElement.addEventListener("focus", this.open.bind(this))
    }
    document.addEventListener("click", this.handleOutsideClick.bind(this))

    // Always apply the color (either default or custom)
    const colorToApply = this.options.primaryColor || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor
    this.applyCustomColor(colorToApply || "#4F46E5")

    // Create picker element
    this.createPickerElement()
  }

  // Update input value based on single date or range
  private updateInputValue(): void {
    if (this.options.isRangePicker) {
      if (this.rangeStart && this.rangeEnd) {
        const startStr = this.formatDate(this.rangeStart)
        const endStr = this.formatDate(this.rangeEnd)
        this.inputElement.value = `${startStr} - ${endStr}`
      } else if (this.rangeStart) {
        this.inputElement.value = this.formatDate(this.rangeStart)
      } else {
        this.inputElement.value = ""
      }
    } else {
      this.inputElement.value = this.formatSelectedDate()
    }
  }

  // Format a date using the configured format
  private formatDate(date: NepaliDate): string {
    const format = this.options.dateFormat || "YYYY-MM-DD"
    return this.options.language === "ne" ? date.formatNepali(format) : date.format(format)
  }

  // Apply custom primary color
  private applyCustomColor(color: string): void {
    // Ensure color is a valid string
    const safeColor = color || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor || "#4F46E5"

    // Remove existing style element if it exists
    if (this.styleElement) {
      document.head.removeChild(this.styleElement)
    }

    // Create new style element
    this.styleElement = document.createElement("style")
    this.styleElement.textContent = `
      .nepali-date-picker-input {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 14px;
        width: 100%;
        cursor: pointer;
        background-color: white;
      }
      .nepali-date-picker-input:focus {
        outline: none;
        border-color: ${safeColor};
        box-shadow: 0 0 0 3px ${this.hexToRgba(safeColor, 0.1)};
      }
      .nepali-date-picker {
        max-width: 1200px;
        width: auto;
        font-family: Arial, sans-serif;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: absolute;
        z-index: 1000;
        display: none;
      }
      .nepali-date-picker.open {
        display: flex;
      }
      .nepali-date-picker.light {
        background-color: white;
        color: #333;
      }
      .nepali-date-picker.dark {
        background-color: #333;
        color: white;
      }
      .date-picker-container {
        display: flex;
        flex-direction: row;
      }
      .ranges-container {
        min-width: 180px;
        border-right: 1px solid #eee;
        padding: 15px;
      }
      .range-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .range-list li {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        margin-bottom: 5px;
        transition: all 0.2s;
      }
      .range-list li:hover {
        background-color: #f5f5f5;
      }
      .range-list li.active {
        background-color: ${this.hexToRgba(safeColor, 0.2)};
        color: ${safeColor};
        font-weight: 500;
      }
      .calendars-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .calendars-row {
        display: flex;
        flex-direction: row;
      }
      .calendar {
        margin: 10px;
        flex: 1;
      }
      .calendar-header {
        text-align: center;
        margin-bottom: 10px;
        font-weight: bold;
      }
      .range-inputs {
        display: flex;
        padding: 10px 15px;
        border-bottom: 1px solid #eee;
        gap: 10px;
      }
      .range-input-group {
        flex: 1;
      }
      .range-input-label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }
      .range-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .range-input:focus {
        outline: none;
        border-color: ${safeColor};
        box-shadow: 0 0 0 2px ${this.hexToRgba(safeColor, 0.1)};
      }
      .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #eee;
      }
      .month-year-selector {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
      }
      .nav-button {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: all 0.2s;
      }
      .nav-button:hover {
        background-color: #f5f5f5;
        color: #333;
      }
      .nav-button svg {
        width: 16px;
        height: 16px;
      }
      .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: bold;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .weekday {
        padding: 5px 0;
        font-size: 14px;
      }
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 10px;
        gap: 5px;
      }
      .day {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .day:hover:not(.empty):not(.disabled) {
        background-color: #f5f5f5;
      }
      .day.empty {
        cursor: default;
      }
      .day.disabled {
        color: #ccc;
        cursor: not-allowed;
      }
      .day.today {
        border-color: ${safeColor};
        color: ${safeColor};
        border: 1px solid;
      }
      .day.selected {
        background-color: ${safeColor};
        color: white;
        font-weight: 500;
      }
      .day.range-start, .day.range-end {
        background-color: ${safeColor};
        color: white;
        font-weight: 500;
        position: relative;
        z-index: 2;
      }
      .day.in-range {
        background-color: ${this.hexToRgba(safeColor, 0.2)};
        border-radius: 0;
      }
      .day.hovering {
        background-color: ${this.hexToRgba(safeColor, 0.15)};
      }
      .day.range-start {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      .day.range-end {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .day.highlighted {
        background-color: ${this.hexToRgba(safeColor, 0.1)};
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        border-top: 1px solid #eee;
      }
      .action-buttons {
        display: flex;
        gap: 10px;
      }
      .action-button {
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        border: 1px solid #ddd;
        background-color: white;
        transition: all 0.2s;
      }
      .action-button:hover {
        background-color: #f5f5f5;
      }
      .cancel-button {
        color: #666;
      }
      .apply-button {
        background-color: ${safeColor};
        border-color: ${safeColor};
        color: white;
      }
      .apply-button:hover {
        background-color: ${this.adjustColor(safeColor, -10)};
      }
      .today-button {
        border: 1px solid ${safeColor};
        color: ${safeColor};
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        background-color: white;
      }
      .today-button:hover {
        background-color: ${safeColor};
        color: white;
      }
      .clear-button {
        background-color: transparent;
        border: 1px solid #e5e7eb;
        color: #6b7280;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .clear-button:hover {
        background-color: #f3f4f6;
      }
      .month-dropdown, .year-dropdown {
        display: inline-block;
        margin: 0 5px;
      }
      .dropdown-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
        text-align: center;
      }
      .month-select, .year-select {
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: white;
        font-size: 14px;
        min-width: 100px;
      }
      .date-edit-input {
        width: 100%;
        padding: 4px;
        border: 1px solid ${safeColor};
        border-radius: 4px;
        font-size: inherit;
      }
      .other-month {
        color: #aaa;
      }
      .year-range-notice {
        font-size: 12px;
        color: #666;
        text-align: center;
        padding: 5px 0;
        background-color: #f8f8f8;
      }
      .range-info {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        background-color: #f8f8f8;
        font-size: 14px;
        border-bottom: 1px solid #eee;
      }
      .range-start-display, .range-end-display {
        font-weight: 500;
      }
      .range-separator {
        color: #666;
      }
      .range-selection-phase {
        font-size: 12px;
        color: #666;
        text-align: center;
        padding: 5px 0;
        background-color: #f0f0f0;
      }
      .date-inputs {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        border-bottom: 1px solid #eee;
      }
      .date-input-group {
        display: flex;
        align-items: center;
      }
      .date-input-label {
        margin-right: 5px;
        font-size: 14px;
        color: #666;
      }
      .date-input {
        width: 30px;
        text-align: center;
        padding: 4px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    `
    document.head.appendChild(this.styleElement)
  }

  // Helper to convert hex to rgba
  private hexToRgba(hex: string, alpha: number): string {
    // Ensure hex is a valid string
    if (!hex || typeof hex !== "string") {
      hex = "#4F46E5" // Default color if invalid
    }

    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Add this helper method to parse date strings after the hexToRgba method
  private parseDateString(dateString: string): NepaliDateObject | null {
    // Check if the string matches the YYYY-MM-DD format
    const dateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    const match = dateString.match(dateRegex)

    if (!match) {
      console.warn(`Invalid date format: ${dateString}. Expected format: YYYY-MM-DD`)
      return null
    }

    const year = Number.parseInt(match[1], 10)
    const month = Number.parseInt(match[2], 10) - 1 // Convert to 0-indexed month
    const day = Number.parseInt(match[3], 10)

    // Validate the date
    if (month < 0 || month > 11) {
      console.warn(`Invalid month in date: ${dateString}. Month should be between 1 and 12`)
      return null
    }

    // Check if the day is valid for the given month and year
    try {
      const daysInMonth = NepaliDate.getDaysInMonth(year, month)
      if (day < 1 || day > daysInMonth) {
        console.warn(
          `Invalid day in date: ${dateString}. Day should be between 1 and ${daysInMonth} for month ${month + 1}`,
        )
        return null
      }
    } catch (e) {
      console.warn(`Error validating date: ${dateString}. ${e}`)
      return null
    }

    return { year, month, day }
  }

  // Helper to adjust color brightness
  private adjustColor(hex: string, percent: number): string {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)

    const adjustValue = (value: number) => {
      return Math.max(0, Math.min(255, value + percent))
    }

    const rr = adjustValue(r).toString(16).padStart(2, "0")
    const gg = adjustValue(g).toString(16).padStart(2, "0")
    const bb = adjustValue(b).toString(16).padStart(2, "0")

    return `#${rr}${gg}${bb}`
  }

  // Format the selected date based on language option
  private formatSelectedDate(): string {
    const format = this.options.dateFormat || "YYYY-MM-DD"
    return this.options.language === "ne" ? this.selectedDate.formatNepali(format) : this.selectedDate.format(format)
  }

  // Create the date picker element
  private createPickerElement(): void {
    if (this.pickerElement) {
      document.body.removeChild(this.pickerElement)
    }

    this.pickerElement = document.createElement("div")
    this.pickerElement.className = `nepali-date-picker ${this.options.theme}`

    // Add picker content
    this.updatePickerContent()

    // Append to body
    document.body.appendChild(this.pickerElement)
  }

  // Get predefined ranges
  private getPredefinedRanges(): PredefinedRange[] {
    const today = NepaliDate.today()

    // Default predefined ranges
    const defaultRanges: PredefinedRange[] = [
      {
        label: this.options.language === "ne" ? "आज" : "Today",
        range: () => ({
          start: today.toObject(),
          end: today.toObject(),
          label: this.options.language === "ne" ? "आज" : "Today",
        }),
      },
      {
        label: this.options.language === "ne" ? "हिजो" : "Yesterday",
        range: () => {
          const yesterday = today.addDays(-1)
          return {
            start: yesterday.toObject(),
            end: yesterday.toObject(),
            label: this.options.language === "ne" ? "हिजो" : "Yesterday",
          }
        },
      },
      {
        label: this.options.language === "ne" ? "पछिल्लो ७ दिन" : "Last 7 Days",
        range: () => ({
          start: today.addDays(-6).toObject(),
          end: today.toObject(),
          label: this.options.language === "ne" ? "पछिल्लो ७ दिन" : "Last 7 Days",
        }),
      },
      {
        label: this.options.language === "ne" ? "पछिल्लो ३० दिन" : "Last 30 Days",
        range: () => ({
          start: today.addDays(-29).toObject(),
          end: today.toObject(),
          label: this.options.language === "ne" ? "पछिल्लो ३० दिन" : "Last 30 Days",
        }),
      },
      {
        label: this.options.language === "ne" ? "यो महिना" : "This Month",
        range: () => {
          const startOfMonth = new NepaliDate(today.year, today.month, 1)
          const endOfMonth = new NepaliDate(today.year, today.month, NepaliDate.getDaysInMonth(today.year, today.month))
          return {
            start: startOfMonth.toObject(),
            end: endOfMonth.toObject(),
            label: this.options.language === "ne" ? "यो महिना" : "This Month",
          }
        },
      },
      {
        label: this.options.language === "ne" ? "गत महिना" : "Last Month",
        range: () => {
          let lastMonth = today.month - 1
          let year = today.year
          if (lastMonth < 0) {
            lastMonth = 11
            year -= 1
          }
          const startOfMonth = new NepaliDate(year, lastMonth, 1)
          const endOfMonth = new NepaliDate(year, lastMonth, NepaliDate.getDaysInMonth(year, lastMonth))
          return {
            start: startOfMonth.toObject(),
            end: endOfMonth.toObject(),
            label: this.options.language === "ne" ? "गत महिना" : "Last Month",
          }
        },
      },
      {
        label: this.options.language === "ne" ? "कस्टम दायरा" : "Custom Range",
        range: () => ({
          start: this.rangeStart ? this.rangeStart.toObject() : today.toObject(),
          end: this.rangeEnd ? this.rangeEnd.toObject() : today.toObject(),
          label: this.options.language === "ne" ? "कस्टम दायरा" : "Custom Range",
        }),
      },
    ]

    // Use custom ranges if provided, otherwise use default
    return this.options.ranges || defaultRanges
  }

  // Update the picker content
  private updatePickerContent(): void {
    if (!this.pickerElement) return

    const displayDate = this.tempSelectedDate || this.selectedDate

    // Month names based on language
    const monthNames =
      this.options.language === "ne"
        ? ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"]
        : [
          "Baisakh",
          "Jestha",
          "Asar",
          "Shrawan",
          "Bhadra",
          "Ashwin",
          "Kartik",
          "Mangsir",
          "Poush",
          "Magh",
          "Falgun",
          "Chaitra",
        ]

    // Day names based on language
    const dayNames =
      this.options.language === "ne"
        ? ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"]
        : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

    // Get predefined ranges
    const predefinedRanges = this.getPredefinedRanges()

    // Generate HTML content for the picker
    let pickerContent = `<div class="date-picker-container">`

    // Add ranges section if in range picker mode
    if (this.options.isRangePicker && predefinedRanges.length > 0) {
      pickerContent += `
        <div class="ranges-container">
          <ul class="range-list">
            ${predefinedRanges
          .map((range) => {
            const isActive = this.selectedPredefinedRange === range.label
            return `<li class="${isActive ? "active" : ""}" data-range="${range.label}">${range.label}</li>`
          })
          .join("")}
          </ul>
        </div>
      `
    }

    // Add calendars container
    pickerContent += `<div class="calendars-container">`

    // Add range inputs if enabled
    if (this.options.isRangePicker && this.options.showRangeInputs) {
      const startDateValue = this.tempRangeStart
        ? this.formatDate(this.tempRangeStart)
        : this.rangeStart
          ? this.formatDate(this.rangeStart)
          : ""

      const endDateValue = this.tempRangeEnd
        ? this.formatDate(this.tempRangeEnd)
        : this.rangeEnd
          ? this.formatDate(this.rangeEnd)
          : ""

      pickerContent += `
        <div class="range-inputs">
          <div class="range-input-group">
            <label class="range-input-label">${this.options.language === "ne" ? "सुरु मिति" : "Start Date"}</label>
            <input type="text" class="range-input start-date" value="${startDateValue}" placeholder="${this.options.language === "ne" ? "सुरु मिति" : "Start Date"}">
          </div>
          <div class="range-input-group">
            <label class="range-input-label">${this.options.language === "ne" ? "अन्तिम मिति" : "End Date"}</label>
            <input type="text" class="range-input end-date" value="${endDateValue}" placeholder="${this.options.language === "ne" ? "अन्तिम मिति" : "End Date"}">
          </div>
        </div>
      `

      // Add date inputs (day numbers) as shown in the screenshot
      pickerContent += `
        <div class="date-inputs">
          <div class="date-input-group">
            <label class="date-input-label">${this.options.language === "ne" ? "सुरु मिति" : "Start Date"}</label>
            <input type="text" class="date-input start-day" value="${this.tempRangeStart?.day || this.rangeStart?.day || ""}" maxlength="2">
          </div>
          <div class="date-input-group">
            <label class="date-input-label">${this.options.language === "ne" ? "अन्तिम मिति" : "End Date"}</label>
            <input type="text" class="date-input end-day" value="${this.tempRangeEnd?.day || this.rangeEnd?.day || ""}" maxlength="2">
          </div>
        </div>
      `
    }

    // Add calendars row
    pickerContent += `<div class="calendars-row">`

    // First calendar
    pickerContent += `
      <div class="calendar first-calendar">
        <div class="calendar-header">
          <div class="picker-header">
            <button class="nav-button prev-month">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div class="month-year-selector">
              ${this.generateMonthYearOptions(this.currentViewDate)}
            </div>
            ${!this.options.linkedCalendars
        ? `
            <button class="nav-button next-month">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            `
        : ""
      }
          </div>
        </div>
        <div class="weekdays">
          ${dayNames.map((name) => `<div class="weekday">${name}</div>`).join("")}
        </div>
        <div class="days first-calendar-days">
          ${this.generateDaysGrid(this.currentViewDate)}
        </div>
      </div>
    `

    // Second calendar (if in range mode and not single calendar)
    if (this.options.isRangePicker && !this.options.singleDatePicker && this.secondViewDate) {
      pickerContent += `
        <div class="calendar second-calendar">
          <div class="calendar-header">
            <div class="picker-header">
              ${!this.options.linkedCalendars
          ? `
              <button class="nav-button prev-month second-prev">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              `
          : ""
        }
              <div class="month-year-selector">
                ${this.generateMonthYearOptions(this.secondViewDate)}
              </div>
              <button class="nav-button next-month second-next">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div class="weekdays">
            ${dayNames.map((name) => `<div class="weekday">${name}</div>`).join("")}
          </div>
          <div class="days second-calendar-days">
            ${this.generateDaysGrid(this.secondViewDate)}
          </div>
        </div>
      `
    }

    pickerContent += `</div>` // Close calendars-row

    pickerContent += `</div>` // Close calendars-container

    // Add footer with buttons
    pickerContent += `
      <div class="footer">
        <div>
          ${this.options.showTodayButton
        ? `<button class="today-button">${this.options.language === "ne" ? "आज" : "Today"}</button>`
        : ""
      }
        </div>
        <div class="action-buttons">
          <button class="action-button cancel-button">${this.options.language === "ne" ? "रद्द" : "Cancel"}</button>
          <button class="action-button apply-button">${this.options.language === "ne" ? "लागू गर्नुहोस्" : "Apply"}</button>
        </div>
      </div>
    `

    pickerContent += `</div>` // Close date-picker-container

    this.pickerElement.innerHTML = pickerContent

    // Add event listeners
    this.addPickerEventListeners()

    // Position the picker
    this.positionPicker()
  }

  // Generate month and year options for dropdown
  private generateMonthYearOptions(viewDate: NepaliDate): string {
    const monthNames =
      this.options.language === "ne"
        ? ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"]
        : [
          "Baisakh",
          "Jestha",
          "Asar",
          "Shrawan",
          "Bhadra",
          "Ashwin",
          "Kartik",
          "Mangsir",
          "Poush",
          "Magh",
          "Falgun",
          "Chaitra",
        ]

    // If dropdowns are enabled, show select boxes
    if (this.options.showDropdowns) {
      return `
        <div class="month-dropdown">
          <select class="month-select">
            ${monthNames
          .map(
            (month, index) =>
              `<option value="${index}" ${index === viewDate.month ? "selected" : ""}>${month}</option>`,
          )
          .join("")}
          </select>
        </div>
        <div class="year-dropdown">
          <select class="year-select">
            ${Array.from({ length: 21 }, (_, i) => 2070 + i)
          .map(
            (year) =>
              `<option value="${year}" ${year === viewDate.year ? "selected" : ""}>${this.options.language === "ne" ? this.convertToNepaliNumeral(year) : year}</option>`,
          )
          .join("")}
          </select>
        </div>
      `
    } else {
      // Otherwise just show text
      return `
        <div class="month-year-text">
          ${monthNames[viewDate.month]} ${this.options.language === "ne" ? this.convertToNepaliNumeral(viewDate.year) : viewDate.year}
        </div>
      `
    }
  }

  // Generate days grid for the current month
  private generateDaysGrid(viewDate: NepaliDate): string {
    const year = viewDate.year
    const month = viewDate.month
    const today = NepaliDate.today()
    const daysInMonth = NepaliDate.getDaysInMonth(year, month)

    // Get first day of month and total days
    const firstDayDate = new NepaliDate(year, month, 1)
    // Calculate the day of the week (0=Sunday, 6=Saturday)
    const firstDayOfWeek = firstDayDate.toGregorian().getDay()

    // Get previous month's days that appear in this month's view
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = NepaliDate.getDaysInMonth(prevYear, prevMonth)

    // Get next month's days that appear in this month's view
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year

    let html = ""

    // Empty cells for days before the first day of month (previous month's days)
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = daysInPrevMonth - firstDayOfWeek + i + 1
      const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(prevMonthDay) : prevMonthDay
      html += `<div class="day other-month">${dayText}</div>`
    }

    // Generate day cells for current month
    for (let day = 1; day <= daysInMonth; day++) {
      // For single date picker
      const isSelected =
        !this.options.isRangePicker &&
        (this.tempSelectedDate
          ? this.tempSelectedDate.year === year &&
          this.tempSelectedDate.month === month &&
          this.tempSelectedDate.day === day
          : this.selectedDate.year === year && this.selectedDate.month === month && this.selectedDate.day === day)

      // For range picker
      let isRangeStart = false
      let isRangeEnd = false
      let isInRange = false
      let isHovering = false

      if (this.options.isRangePicker) {
        // Check if this day is the start of the range
        if (this.tempRangeStart) {
          isRangeStart =
            this.tempRangeStart.year === year && this.tempRangeStart.month === month && this.tempRangeStart.day === day
        } else if (this.rangeStart) {
          isRangeStart = this.rangeStart.year === year && this.rangeStart.month === month && this.rangeStart.day === day
        }

        // Check if this day is the end of the range
        if (this.tempRangeEnd) {
          isRangeEnd =
            this.tempRangeEnd.year === year && this.tempRangeEnd.month === month && this.tempRangeEnd.day === day
        } else if (this.rangeEnd) {
          isRangeEnd = this.rangeEnd.year === year && this.rangeEnd.month === month && this.rangeEnd.day === day
        }

        // Check if this day is within the range
        const currentDate = new NepaliDate(year, month, day)
        const startDate = this.tempRangeStart || this.rangeStart
        const endDate = this.tempRangeEnd || this.rangeEnd

        if (startDate && endDate) {
          const startGreg = startDate.toGregorian()
          const endGreg = endDate.toGregorian()
          const currentGreg = currentDate.toGregorian()

          isInRange = currentGreg > startGreg && currentGreg < endGreg
        }

        // Check if this day is being hovered over during range selection
        if (this.isSelectingEndDate && startDate && this.hoverDate) {
          const hoverGreg = this.hoverDate.toGregorian()
          const currentGreg = currentDate.toGregorian()
          const startGreg = startDate.toGregorian()

          if (hoverGreg > startGreg && currentGreg > startGreg && currentGreg <= hoverGreg) {
            isHovering = true
          } else if (hoverGreg < startGreg && currentGreg < startGreg && currentGreg >= hoverGreg) {
            isHovering = true
          }
        }
      }

      const isToday = today.year === year && today.month === month && today.day === day

      // Check if date is disabled
      let isDisabled = this.isDateDisabled(year, month, day)

      // If selecting end date, disable dates before start date
      if (this.options.isRangePicker && this.isSelectingEndDate && this.tempRangeStart) {
        const currentDate = new NepaliDate(year, month, day)
        const startGreg = this.tempRangeStart.toGregorian()
        const currentGreg = currentDate.toGregorian()

        if (currentGreg < startGreg) {
          isDisabled = true
        }
      }

      // Calculate day of week (0 = Sunday, 6 = Saturday)
      const date = new NepaliDate(year, month, day)
      const dayOfWeek = date.toGregorian().getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      // Build class string
      let dayClass = "day"
      if (isSelected) dayClass += " selected"
      if (isRangeStart) dayClass += " range-start"
      if (isRangeEnd) dayClass += " range-end"
      if (isInRange) dayClass += " in-range"
      if (isHovering) dayClass += " hovering"
      if (isToday) dayClass += " today"
      if (isDisabled) dayClass += " disabled"
      if (isWeekend) dayClass += " weekend"

      const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(day) : day

      html += `<div class="${dayClass}" data-year="${year}" data-month="${month}" data-day="${day}">${dayText}</div>`
    }

    // Calculate remaining cells to complete the grid
    const totalCells = 42 // Always show 6 rows of 7 days
    const daysFromCurrentMonth = daysInMonth + firstDayOfWeek
    const remainingCells = totalCells - daysFromCurrentMonth

    // Add cells for days from next month
    for (let i = 1; i <= remainingCells; i++) {
      const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(i) : i
      html += `<div class="day other-month">${dayText}</div>`
    }

    return html
  }

  // Convert number to Nepali numeral
  private convertToNepaliNumeral(num: number): string {
    const nepaliNumerals = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]
    return num
      .toString()
      .split("")
      .map((digit) => nepaliNumerals[Number.parseInt(digit)])
      .join("")
  }

  // Update the isDateDisabled method to handle string format dates
  private isDateDisabled(year: number, month: number, day: number): boolean {
    if (
      !this.options.disableFutureDates &&
      !this.options.disablePastDates &&
      !this.options.disabledDates &&
      !this.options.disabledDays
    ) {
      return false
    }

    const date = new NepaliDate(year, month, day)
    const today = NepaliDate.today()
    const gregorianDate = date.toGregorian()
    const gregorianToday = today.toGregorian()

    // Check for future dates
    if (this.options.disableFutureDates && gregorianDate > gregorianToday) {
      return true
    }

    // Check for past dates
    if (this.options.disablePastDates && gregorianDate < gregorianToday) {
      return true
    }

    // Check for specific disabled dates
    if (this.options.disabledDates && this.options.disabledDates.length > 0) {
      // Check if disabledDates contains string dates
      if (typeof this.options.disabledDates[0] === "string") {
        // Handle string format dates
        for (const dateString of this.options.disabledDates as string[]) {
          const parsedDate = this.parseDateString(dateString)
          if (parsedDate && parsedDate.year === year && parsedDate.month === month && parsedDate.day === day) {
            return true
          }
        }
      } else {
        // Handle object format dates
        for (const disabledDate of this.options.disabledDates as NepaliDateObject[]) {
          if (disabledDate.year === year && disabledDate.month === month && disabledDate.day === day) {
            return true
          }
        }
      }
    }

    // Check for disabled days of week
    if (this.options.disabledDays && this.options.disabledDays.length > 0) {
      const dayOfWeek = date.toGregorian().getDay()
      if (this.options.disabledDays.includes(dayOfWeek)) {
        return true
      }
    }

    return false
  }

  // Position the picker relative to the input
  private positionPicker(): void {
    if (!this.pickerElement) return

    const inputRect = this.inputElement.getBoundingClientRect()
    const pickerHeight = this.pickerElement.offsetHeight
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth

    // Determine if the picker should open up or down
    const drops = this.options.drops || "down"

    // Determine if the picker should open left, right, or center
    const opens = this.options.opens || "right"

    // Set vertical position
    if (
      drops === "up" ||
      (drops === "down" && inputRect.bottom + pickerHeight > windowHeight && inputRect.top > pickerHeight)
    ) {
      this.pickerElement.style.top = `${inputRect.top - pickerHeight + window.scrollY}px`
    } else {
      this.pickerElement.style.top = `${inputRect.bottom + window.scrollY}px`
    }

    // Set horizontal position
    const pickerWidth = this.pickerElement.offsetWidth

    if (opens === "center") {
      const left = inputRect.left + inputRect.width / 2 - pickerWidth / 2
      this.pickerElement.style.left = `${Math.max(0, left) + window.scrollX}px`
    } else if (opens === "left" || (opens === "right" && inputRect.right + pickerWidth > windowWidth)) {
      this.pickerElement.style.left = `${Math.max(0, inputRect.left - pickerWidth + inputRect.width) + window.scrollX}px`
    } else {
      this.pickerElement.style.left = `${inputRect.left + window.scrollX}px`
    }
  }

  // Add event listeners to the picker elements
  private addPickerEventListeners(): void {
    if (!this.pickerElement) return

    // Predefined ranges
    const rangeItems = this.pickerElement.querySelectorAll(".range-list li")
    rangeItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        const rangeName = (e.currentTarget as HTMLElement).getAttribute("data-range")
        if (rangeName) {
          this.selectPredefinedRange(rangeName)
        }
      })
    })

    // Range inputs
    const startDateInput = this.pickerElement.querySelector(".range-input.start-date") as HTMLInputElement
    const endDateInput = this.pickerElement.querySelector(".range-input.end-date") as HTMLInputElement

    if (startDateInput && endDateInput) {
      this.startDateInput = startDateInput
      this.endDateInput = endDateInput

      startDateInput.addEventListener("change", () => {
        this.handleRangeInputChange(startDateInput, true)
      })

      endDateInput.addEventListener("change", () => {
        this.handleRangeInputChange(endDateInput, false)
      })
    }

    // Day number inputs
    const startDayInput = this.pickerElement.querySelector(".date-input.start-day") as HTMLInputElement
    const endDayInput = this.pickerElement.querySelector(".date-input.end-day") as HTMLInputElement

    if (startDayInput && endDayInput) {
      startDayInput.addEventListener("change", () => {
        this.handleDayInputChange(startDayInput, true)
      })

      endDayInput.addEventListener("change", () => {
        this.handleDayInputChange(endDayInput, false)
      })
    }

    // Month select dropdowns
    const monthSelects = this.pickerElement.querySelectorAll(".month-select")
    monthSelects.forEach((select, index) => {
      select.addEventListener("change", (e) => {
        const month = Number.parseInt((e.target as HTMLSelectElement).value)
        if (index === 0) {
          this.setMonth(month)
        } else {
          this.setSecondMonth(month)
        }
      })
    })

    // Year select dropdowns
    const yearSelects = this.pickerElement.querySelectorAll(".year-select")
    yearSelects.forEach((select, index) => {
      select.addEventListener("change", (e) => {
        const year = Number.parseInt((e.target as HTMLSelectElement).value)
        if (index === 0) {
          this.setYear(year)
        } else {
          this.setSecondYear(year)
        }
      })
    })

    // Previous month buttons
    const prevButtons = this.pickerElement.querySelectorAll(".prev-month")
    prevButtons.forEach((button, index) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        if (index === 0 || button.classList.contains("second-prev")) {
          if (button.classList.contains("second-prev")) {
            this.goToPrevSecondMonth()
          } else {
            this.goToPrevMonth()
          }
        }
      })
    })

    // Next month buttons
    const nextButtons = this.pickerElement.querySelectorAll(".next-month")
    nextButtons.forEach((button, index) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation()
        if (index === 0 || button.classList.contains("second-next")) {
          if (button.classList.contains("second-next")) {
            this.goToNextSecondMonth()
          } else {
            this.goToNextMonth()
          }
        }
      })
    })

    // Day cells in first calendar
    const firstCalendarDays = this.pickerElement.querySelectorAll(".first-calendar-days .day:not(.disabled)")
    firstCalendarDays.forEach((cell) => {
      if (!cell.classList.contains("other-month")) {
        cell.addEventListener("click", (e) => this.handleDayClick(e, false))

        // Add hover event for range selection
        if (this.options.isRangePicker) {
          cell.addEventListener("mouseenter", this.handleDayHover.bind(this))
        }
      }
    })

    // Day cells in second calendar
    const secondCalendarDays = this.pickerElement.querySelectorAll(".second-calendar-days .day:not(.disabled)")
    secondCalendarDays.forEach((cell) => {
      if (!cell.classList.contains("other-month")) {
        cell.addEventListener("click", (e) => this.handleDayClick(e, true))

        // Add hover event for range selection
        if (this.options.isRangePicker) {
          cell.addEventListener("mouseenter", this.handleDayHover.bind(this))
        }
      }
    })

    // Today button
    if (this.options.showTodayButton) {
      const todayButton = this.pickerElement.querySelector(".today-button")
      if (todayButton) {
        todayButton.addEventListener("click", this.goToToday.bind(this))
      }
    }

    // Cancel button
    const cancelButton = this.pickerElement.querySelector(".cancel-button")
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        this.tempSelectedDate = null
        this.tempRangeStart = null
        this.tempRangeEnd = null
        this.isSelectingEndDate = false
        this.clickCounter = 0

        if (this.options.onCancel) {
          this.options.onCancel()
        }

        this.close()
      })
    }

    // Apply button
    const applyButton = this.pickerElement.querySelector(".apply-button")
    if (applyButton) {
      applyButton.addEventListener("click", () => {
        if (this.options.isRangePicker) {
          // For range picker
          if (this.tempRangeStart) {
            this.rangeStart = this.tempRangeStart

            if (this.tempRangeEnd) {
              this.rangeEnd = this.tempRangeEnd
            } else if (this.isSelectingEndDate) {
              // If user only selected start date, use it for both start and end
              this.rangeEnd = this.tempRangeStart
            }

            this.updateInputValue()

            // Call onRangeSelect callback
            if (this.options.onRangeSelect && this.rangeStart && this.rangeEnd) {
              this.options.onRangeSelect({
                start: this.rangeStart.toObject(),
                end: this.rangeEnd.toObject(),
              })
            }

            // Call onApply callback
            if (this.options.onApply && this.rangeStart && this.rangeEnd) {
              this.options.onApply({
                start: this.rangeStart.toObject(),
                end: this.rangeEnd.toObject(),
              })
            }
          }
        } else {
          // For single date picker
          if (this.tempSelectedDate) {
            this.selectedDate = this.tempSelectedDate
            this.inputElement.value = this.formatSelectedDate()

            // Call onDateSelect callback
            if (this.options.onDateSelect) {
              this.options.onDateSelect(this.selectedDate.toObject())
            }
          }
        }
        this.close()
      })
    }
  }

  // Handle day number input change
  private handleDayInputChange(input: HTMLInputElement, isStartDate: boolean): void {
    const dayValue = Number.parseInt(input.value)

    if (isNaN(dayValue) || dayValue < 1 || dayValue > 32) {
      // Invalid day, reset to previous value
      input.value = isStartDate
        ? (this.tempRangeStart?.day || this.rangeStart?.day || "").toString()
        : (this.tempRangeEnd?.day || this.rangeEnd?.day || "").toString()
      return
    }

    if (isStartDate) {
      if (this.tempRangeStart) {
        const daysInMonth = NepaliDate.getDaysInMonth(this.tempRangeStart.year, this.tempRangeStart.month)
        const validDay = Math.min(dayValue, daysInMonth)
        this.tempRangeStart = new NepaliDate(this.tempRangeStart.year, this.tempRangeStart.month, validDay)

        // Update the start date input
        if (this.startDateInput) {
          this.startDateInput.value = this.formatDate(this.tempRangeStart)
        }
      }
    } else {
      if (this.tempRangeEnd) {
        const daysInMonth = NepaliDate.getDaysInMonth(this.tempRangeEnd.year, this.tempRangeEnd.month)
        const validDay = Math.min(dayValue, daysInMonth)
        this.tempRangeEnd = new NepaliDate(this.tempRangeEnd.year, this.tempRangeEnd.month, validDay)

        // Update the end date input
        if (this.endDateInput) {
          this.endDateInput.value = this.formatDate(this.tempRangeEnd)
        }
      }
    }

    this.updatePickerContent()
  }

  // Handle range input change
  private handleRangeInputChange(input: HTMLInputElement, isStartDate: boolean): void {
    const dateString = input.value
    const parsedDate = this.parseDateString(dateString)

    if (parsedDate) {
      const date = new NepaliDate(parsedDate.year, parsedDate.month, parsedDate.day)

      if (isStartDate) {
        this.tempRangeStart = date
        this.isSelectingEndDate = true

        // If end date is before start date, clear it
        if (this.tempRangeEnd) {
          const endGreg = this.tempRangeEnd.toGregorian()
          const startGreg = date.toGregorian()

          if (startGreg > endGreg) {
            this.tempRangeEnd = null
            if (this.endDateInput) {
              this.endDateInput.value = ""
            }
          }
        }

        // Update view to show the selected month
        this.currentViewDate = date
        if (this.options.linkedCalendars && this.secondViewDate) {
          this.secondViewDate = date.addMonths(1)
        }
      } else {
        this.tempRangeEnd = date
        this.isSelectingEndDate = false

        // If start date is after end date, update it
        if (this.tempRangeStart) {
          const startGreg = this.tempRangeStart.toGregorian()
          const endGreg = date.toGregorian()

          if (endGreg < startGreg) {
            this.tempRangeStart = date
            if (this.startDateInput) {
              this.startDateInput.value = this.formatDate(date)
            }
          }
        } else {
          // If no start date, set it to the same as end date
          this.tempRangeStart = date
          if (this.startDateInput) {
            this.startDateInput.value = this.formatDate(date)
          }
        }
      }

      this.updatePickerContent()
    } else {
      // Invalid date format, revert to previous value
      if (isStartDate) {
        input.value = this.tempRangeStart ? this.formatDate(this.tempRangeStart) : ""
      } else {
        input.value = this.tempRangeEnd ? this.formatDate(this.tempRangeEnd) : ""
      }
    }
  }

  // Select a predefined range
  private selectPredefinedRange(rangeName: string): void {
    const predefinedRanges = this.getPredefinedRanges()
    const selectedRange = predefinedRanges.find((r) => r.label === rangeName)

    if (selectedRange) {
      this.selectedPredefinedRange = rangeName

      // If it's custom range, just update the UI
      if (rangeName === (this.options.language === "ne" ? "कस्टम दायरा" : "Custom Range")) {
        this.updatePickerContent()
        return
      }

      // Get the range
      const range = selectedRange.range()

      // Set the range
      this.tempRangeStart = new NepaliDate(range.start.year, range.start.month, range.start.day)
      this.tempRangeEnd = new NepaliDate(range.end.year, range.end.month, range.end.day)
      this.isSelectingEndDate = false

      // Update the inputs if they exist
      if (this.startDateInput) {
        this.startDateInput.value = this.formatDate(this.tempRangeStart)
      }

      if (this.endDateInput) {
        this.endDateInput.value = this.formatDate(this.tempRangeEnd)
      }

      // Update the view to show the selected month
      this.currentViewDate = this.tempRangeStart
      if (this.options.linkedCalendars && this.secondViewDate) {
        this.secondViewDate = this.tempRangeStart.addMonths(1)
      }

      this.updatePickerContent()

      // Auto apply if enabled
      if (this.options.autoApply) {
        this.rangeStart = this.tempRangeStart
        this.rangeEnd = this.tempRangeEnd
        this.updateInputValue()

        if (this.options.onRangeSelect && this.rangeStart && this.rangeEnd) {
          this.options.onRangeSelect({
            start: this.rangeStart.toObject(),
            end: this.rangeEnd.toObject(),
            label: rangeName,
          })
        }

        this.close()
      }
    }
  }

  // Handle day hover for range selection
  private handleDayHover(event: Event): void {
    if (!this.options.isRangePicker || !this.isSelectingEndDate) return

    const cell = event.target as HTMLElement
    const year = Number.parseInt(cell.dataset.year || "0")
    const month = Number.parseInt(cell.dataset.month || "0")
    const day = Number.parseInt(cell.dataset.day || "0")

    if (year && month !== undefined && day) {
      this.hoverDate = new NepaliDate(year, month, day)
      this.updatePickerContent()
    }
  }

  // Handle day click
  private handleDayClick(event: Event, isSecondCalendar: boolean): void {
    const cell = event.target as HTMLElement
    const year = Number.parseInt(cell.dataset.year || "0")
    const month = Number.parseInt(cell.dataset.month || "0")
    const day = Number.parseInt(cell.dataset.day || "1")

    if (!year || month === undefined || !day) return

    const clickedDate = new NepaliDate(year, month, day)

    if (this.options.isRangePicker) {
      // Range picker mode
      this.clickCounter++

      if (this.clickCounter === 1 || !this.isSelectingEndDate) {
        // Selecting start date
        this.tempRangeStart = clickedDate
        this.tempRangeEnd = null
        this.isSelectingEndDate = true
        this.selectedPredefinedRange = this.options.language === "ne" ? "कस्टम दायरा" : "Custom Range"

        // Update input if it exists
        if (this.startDateInput) {
          this.startDateInput.value = this.formatDate(clickedDate)
        }

        if (this.endDateInput) {
          this.endDateInput.value = ""
        }
      } else {
        // Selecting end date
        const startGreg = this.tempRangeStart!.toGregorian()
        const clickedGreg = clickedDate.toGregorian()

        if (clickedGreg < startGreg) {
          // If end date is before start date, swap them
          this.tempRangeEnd = this.tempRangeStart
          this.tempRangeStart = clickedDate

          // Update inputs if they exist
          if (this.startDateInput) {
            this.startDateInput.value = this.formatDate(clickedDate)
          }

          if (this.endDateInput) {
            this.endDateInput.value = this.formatDate(this.tempRangeEnd || clickedDate)
          }
        } else {
          this.tempRangeEnd = clickedDate

          // Update input if it exists
          if (this.endDateInput) {
            this.endDateInput.value = this.formatDate(clickedDate)
          }
        }

        // Reset selection phase for next time
        this.isSelectingEndDate = false
        this.clickCounter = 0

        // Auto apply if enabled
        if (this.options.autoApply && this.tempRangeStart && this.tempRangeEnd) {
          this.rangeStart = this.tempRangeStart
          this.rangeEnd = this.tempRangeEnd
          this.updateInputValue()

          // Call onRangeSelect callback
          if (this.options.onRangeSelect) {
            this.options.onRangeSelect({
              start: this.rangeStart.toObject(),
              end: this.rangeEnd.toObject(),
            })
          }

          this.close()
          return
        }
      }
    } else {
      // Single date picker mode
      this.tempSelectedDate = clickedDate

      // Update the input value immediately when a day is clicked
      this.inputElement.value =
        this.options.language === "ne"
          ? this.tempSelectedDate.formatNepali(this.options.dateFormat || "YYYY-MM-DD")
          : this.tempSelectedDate.format(this.options.dateFormat || "YYYY-MM-DD")

      if (this.options.closeOnSelect) {
        this.selectedDate = this.tempSelectedDate

        // Call onDateSelect callback
        if (this.options.onDateSelect) {
          this.options.onDateSelect(this.selectedDate.toObject())
        }

        this.close()
        return
      }
    }

    this.updatePickerContent()
  }

  // Go to today
  private goToToday(): void {
    const today = NepaliDate.today()
    this.currentViewDate = today

    if (this.options.linkedCalendars && this.secondViewDate) {
      this.secondViewDate = today.addMonths(1)
    }

    if (this.options.isRangePicker) {
      // For range picker, set today as start date
      this.tempRangeStart = today
      this.tempRangeEnd = today
      this.isSelectingEndDate = false
      this.clickCounter = 0

      // Update inputs if they exist
      if (this.startDateInput) {
        this.startDateInput.value = this.formatDate(today)
      }

      if (this.endDateInput) {
        this.endDateInput.value = this.formatDate(today)
      }

      // Auto apply if enabled
      if (this.options.autoApply) {
        this.rangeStart = today
        this.rangeEnd = today
        this.updateInputValue()

        if (this.options.onRangeSelect) {
          this.options.onRangeSelect({
            start: today.toObject(),
            end: today.toObject(),
          })
        }

        this.close()
        return
      }
    } else {
      // For single date picker
      this.tempSelectedDate = today
      this.inputElement.value =
        this.options.language === "ne"
          ? this.tempSelectedDate.formatNepali(this.options.dateFormat || "YYYY-MM-DD")
          : this.tempSelectedDate.format(this.options.dateFormat || "YYYY-MM-DD")

      if (this.options.closeOnSelect) {
        this.selectedDate = today

        if (this.options.onDateSelect) {
          this.options.onDateSelect(today.toObject())
        }

        this.close()
        return
      }
    }

    this.updatePickerContent()
  }

  // Go to previous month for first calendar
  private goToPrevMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(-1)

    if (this.options.linkedCalendars && this.secondViewDate) {
      this.secondViewDate = this.currentViewDate.addMonths(1)
    }

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Go to next month for first calendar
  private goToNextMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(1)

    if (this.options.linkedCalendars && this.secondViewDate) {
      this.secondViewDate = this.currentViewDate.addMonths(1)
    }

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Go to previous month for second calendar
  private goToPrevSecondMonth(): void {
    if (!this.secondViewDate) return

    this.secondViewDate = this.secondViewDate.addMonths(-1)

    // Ensure second calendar is always after first if linked
    if (this.options.linkedCalendars) {
      const firstGreg = this.currentViewDate.toGregorian()
      const secondGreg = this.secondViewDate.toGregorian()

      if (secondGreg <= firstGreg) {
        this.currentViewDate = this.secondViewDate.addMonths(-1)
      }
    }

    this.updatePickerContent()
  }

  // Go to next month for second calendar
  private goToNextSecondMonth(): void {
    if (!this.secondViewDate) return

    this.secondViewDate = this.secondViewDate.addMonths(1)
    this.updatePickerContent()
  }

  // Set month for first calendar
  private setMonth(month: number): void {
    if (month < 0 || month > 11) return

    const daysInMonth = NepaliDate.getDaysInMonth(this.currentViewDate.year, month)
    const day = Math.min(this.currentViewDate.day, daysInMonth)

    this.currentViewDate = new NepaliDate(this.currentViewDate.year, month, day)

    if (this.options.linkedCalendars && this.secondViewDate) {
      this.secondViewDate = this.currentViewDate.addMonths(1)
    }

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Set year for first calendar
  private setYear(year: number): void {
    // Ensure year is within valid range
    if (year < 2000 || year > 2090) return

    const daysInMonth = NepaliDate.getDaysInMonth(year, this.currentViewDate.month)
    const day = Math.min(this.currentViewDate.day, daysInMonth)

    this.currentViewDate = new NepaliDate(year, this.currentViewDate.month, day)

    if (this.options.linkedCalendars && this.secondViewDate) {
      this.secondViewDate = this.currentViewDate.addMonths(1)
    }

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Set month for second calendar
  private setSecondMonth(month: number): void {
    if (!this.secondViewDate || month < 0 || month > 11) return

    const daysInMonth = NepaliDate.getDaysInMonth(this.secondViewDate.year, month)
    const day = Math.min(this.secondViewDate.day, daysInMonth)

    this.secondViewDate = new NepaliDate(this.secondViewDate.year, month, day)

    // Ensure second calendar is always after first if linked
    if (this.options.linkedCalendars) {
      const firstGreg = this.currentViewDate.toGregorian()
      const secondGreg = this.secondViewDate.toGregorian()

      if (secondGreg <= firstGreg) {
        this.currentViewDate = this.secondViewDate.addMonths(-1)
      }
    }

    this.updatePickerContent()
  }

  // Set year for second calendar
  private setSecondYear(year: number): void {
    if (!this.secondViewDate || year < 2000 || year > 2090) return

    const daysInMonth = NepaliDate.getDaysInMonth(year, this.secondViewDate.month)
    const day = Math.min(this.secondViewDate.day, daysInMonth)

    this.secondViewDate = new NepaliDate(year, this.secondViewDate.month, day)

    // Ensure second calendar is always after first if linked
    if (this.options.linkedCalendars) {
      const firstGreg = this.currentViewDate.toGregorian()
      const secondGreg = this.secondViewDate.toGregorian()

      if (secondGreg <= firstGreg) {
        this.currentViewDate = this.secondViewDate.addMonths(-1)
      }
    }

    this.updatePickerContent()
  }

  // Toggle the date picker
  private toggle(event: Event): void {
    event.stopPropagation()

    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  // Open the date picker
  private open(): void {
    if (this.isOpen) return

    this.isOpen = true
    this.clickCounter = 0

    if (!this.options.isRangePicker) {
      this.tempSelectedDate = null
    } else {
      // For range picker, initialize temp variables with current values
      this.tempRangeStart = this.rangeStart
      this.tempRangeEnd = this.rangeEnd
      this.isSelectingEndDate = false

      // Update inputs if they exist
      if (this.startDateInput && this.tempRangeStart) {
        this.startDateInput.value = this.formatDate(this.tempRangeStart)
      }

      if (this.endDateInput && this.tempRangeEnd) {
        this.endDateInput.value = this.formatDate(this.tempRangeEnd)
      }
    }

    this.updatePickerContent()

    if (this.pickerElement) {
      this.pickerElement.classList.add("open")
    }

    if (this.options.onOpen) {
      this.options.onOpen()
    }
  }

  // Close the date picker
  private close(): void {
    if (!this.isOpen) return

    this.isOpen = false

    if (this.pickerElement) {
      this.pickerElement.classList.remove("open")
    }

    if (this.options.onClose) {
      this.options.onClose()
    }
  }

  // Handle clicks outside the date picker
  private handleOutsideClick(event: Event): void {
    if (
      this.isOpen &&
      this.pickerElement &&
      !this.pickerElement.contains(event.target as Node) &&
      !this.inputElement.contains(event.target as Node)
    ) {
      this.close()
    }
  }

  // Public methods

  // Get the selected date
  getDate(): NepaliDateObject {
    return this.selectedDate.toObject()
  }

  // Get the selected date range
  getDateRange(): DateRange | null {
    if (!this.rangeStart || !this.rangeEnd) return null

    return {
      start: this.rangeStart.toObject(),
      end: this.rangeEnd.toObject(),
    }
  }

  // Set the date
  setDate(date: NepaliDateObject): void {
    this.selectedDate = new NepaliDate(date.year, date.month, date.day)
    this.currentViewDate = this.selectedDate

    // Update input value
    this.updateInputValue()

    // Update picker if open
    if (this.isOpen) {
      this.updatePickerContent()
    }
  }

  // Set the date range
  setDateRange(range: DateRange): void {
    if (!this.options.isRangePicker) {
      console.warn("setDateRange can only be used when isRangePicker is true")
      return
    }

    this.rangeStart = new NepaliDate(range.start.year, range.start.month, range.start.day)
    this.rangeEnd = new NepaliDate(range.end.year, range.end.month, range.end.day)

    // Make sure start date is before end date
    const startGreg = this.rangeStart.toGregorian()
    const endGreg = this.rangeEnd.toGregorian()

    if (startGreg > endGreg) {
      // Swap dates if start is after end
      const temp = this.rangeStart
      this.rangeStart = this.rangeEnd
      this.rangeEnd = temp
    }

    this.currentViewDate = this.rangeStart

    if (this.options.linkedCalendars && !this.options.singleDatePicker) {
      this.secondViewDate = this.rangeStart.addMonths(1)
    }

    // Update input value
    this.updateInputValue()

    // Update picker if open
    if (this.isOpen) {
      this.updatePickerContent()
    }
  }

  // Set options
  setOptions(options: Partial<DatePickerOptions>): void {
    const oldPrimaryColor = this.options.primaryColor
    const wasRangePicker = this.options.isRangePicker
    const wasSingleDatePicker = this.options.singleDatePicker

    // Update options
    this.options = { ...this.options, ...options }

    // Apply color if it changed or was explicitly set
    if (options.primaryColor !== undefined && options.primaryColor !== oldPrimaryColor) {
      const colorToApply = this.options.primaryColor || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor
      this.applyCustomColor(colorToApply || "#4F46E5")
    }

    // Handle switching between single and range picker modes
    if (options.isRangePicker !== undefined && options.isRangePicker !== wasRangePicker) {
      if (options.isRangePicker) {
        // Switching to range picker
        this.rangeStart = this.selectedDate
        this.rangeEnd = this.selectedDate.addDays(6)
        this.isSelectingEndDate = false
      } else {
        // Switching to single date picker
        if (this.rangeStart) {
          this.selectedDate = this.rangeStart
        }
      }

      this.updateInputValue()
    }

    // Handle switching between single and dual calendars
    if (options.singleDatePicker !== undefined && options.singleDatePicker !== wasSingleDatePicker) {
      if (options.singleDatePicker) {
        // Switching to single calendar
        this.secondViewDate = null
      } else {
        // Switching to dual calendars
        this.secondViewDate = this.currentViewDate.addMonths(1)
      }
    }

    // Update input value if format or language changed
    if (options.dateFormat || options.language) {
      this.updateInputValue()
    }

    // Update picker if open
    if (this.isOpen) {
      this.updatePickerContent()
    }
  }

  // Show the date picker
  show(): void {
    this.open()
  }

  // Hide the date picker
  hide(): void {
    this.close()
  }

  // Destroy the date picker
  destroy(): void {
    // Remove event listeners
    this.inputElement.removeEventListener("click", this.toggle.bind(this))
    if (this.options.showCalendarOnFocus) {
      this.inputElement.removeEventListener("focus", this.open.bind(this))
    }
    document.removeEventListener("click", this.handleOutsideClick.bind(this))

    // Close and remove picker
    this.close()
    if (this.pickerElement && this.pickerElement.parentNode) {
      document.body.removeChild(this.pickerElement)
    }

    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      document.head.removeChild(this.styleElement)
    }

    // Remove data attributes
    this.inputElement.removeAttribute("data-nepali-date-picker-initialized")

    // Unwrap input if we created the container
    if (this.element.tagName === "INPUT") {
      const container = this.element.parentElement
      if (container && container.classList.contains("nepali-date-picker-container")) {
        container.parentNode?.insertBefore(this.element, container)
        container.parentNode?.removeChild(container)
      }
    }
  }
}
