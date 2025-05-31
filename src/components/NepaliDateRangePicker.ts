import { NepaliDate } from "../utils/NepaliDate"
import type { DateRange, DateRangePickerOptions, PresetRange } from "../types/range-types"
import type { NepaliDateObject } from "../types/types"

export class NepaliDateRangePicker {
    private element: HTMLElement
    private options: DateRangePickerOptions
    private selectedRange: DateRange
    private currentViewDate: NepaliDate
    private nextViewDate: NepaliDate
    private isOpen = false
    private pickerElement: HTMLElement | null = null
    private inputElement!: HTMLInputElement
    private tempSelectedRange: DateRange | null = null
    private selectionState: "start" | "end" | "complete" = "start"

    // Default options
    private static readonly DEFAULT_OPTIONS: DateRangePickerOptions = {
        theme: "light",
        primaryColor: "#4F46E5", // Indigo color
        language: "ne",
        showTodayButton: true,
        closeOnSelect: false,
        disableFutureDates: false,
        disablePastDates: false,
        dateFormat: "YYYY-MM-DD",
        showPresets: true,
        onRangeSelect: () => { },
        onChange: () => { },
        onOpen: () => { },
        onClose: () => { },
    }

    // Preset date ranges
    private presets: PresetRange[] = [
        {
            label: "Today",
            labelNe: "आज",
            range: () => {
                const today = NepaliDate.today()
                return {
                    start: today.toObject(),
                    end: today.toObject(),
                }
            },
        },
        {
            label: "Yesterday",
            labelNe: "हिजो",
            range: () => {
                const today = NepaliDate.today()
                const yesterday = today.addDays(-1)
                return {
                    start: yesterday.toObject(),
                    end: yesterday.toObject(),
                }
            },
        },
        {
            label: "Last 7 Days",
            labelNe: "पछिल्लो ७ दिन",
            range: () => {
                const today = NepaliDate.today()
                const last7Days = today.addDays(-6)
                return {
                    start: last7Days.toObject(),
                    end: today.toObject(),
                }
            },
        },
        {
            label: "Last 30 Days",
            labelNe: "पछिल्लो ३० दिन",
            range: () => {
                const today = NepaliDate.today()
                const last30Days = today.addDays(-29)
                return {
                    start: last30Days.toObject(),
                    end: today.toObject(),
                }
            },
        },
        {
            label: "This Month",
            labelNe: "यो महिना",
            range: () => {
                const today = NepaliDate.today()
                const firstDayOfMonth = new NepaliDate(today.year, today.month, 1)
                return {
                    start: firstDayOfMonth.toObject(),
                    end: today.toObject(),
                }
            },
        },
        {
            label: "Last Month",
            labelNe: "गत महिना",
            range: () => {
                const today = NepaliDate.today()

                // Calculate previous month and year
                const prevMonth = today.month === 0 ? 11 : today.month - 1
                const prevYear = today.month === 0 ? today.year - 1 : today.year

                // Get first day of previous month
                const firstDayOfLastMonth = new NepaliDate(prevYear, prevMonth, 1)

                // Get the number of days in the previous month
                const daysInPrevMonth = NepaliDate.getDaysInMonth(prevYear, prevMonth)

                // Get last day of previous month
                const lastDayOfLastMonth = new NepaliDate(prevYear, prevMonth, daysInPrevMonth)

                return {
                    start: firstDayOfLastMonth.toObject(),
                    end: lastDayOfLastMonth.toObject(),
                }
            },
        },
        {
            label: "Custom Range",
            labelNe: "कस्टम रेन्ज",
            range: () => {
                const today = NepaliDate.today()
                return {
                    start: today.toObject(),
                    end: today.toObject(),
                }
            },
        },
    ]

    constructor(selector: string | HTMLElement, options: DateRangePickerOptions = {}) {
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
        this.options = { ...NepaliDateRangePicker.DEFAULT_OPTIONS }

        // Only override the default primaryColor if explicitly provided
        if (options.primaryColor) {
            this.options.primaryColor = options.primaryColor
        }

        // Merge the rest of the options
        this.options = { ...this.options, ...options }

        // Set initial dates
        let initialStartDate, initialEndDate
        if (options.initialDateRange) {
            // Use provided initial date range, ensuring it's within valid range
            initialStartDate = new NepaliDate(
                options.initialDateRange.start.year,
                options.initialDateRange.start.month,
                options.initialDateRange.start.day,
            )
            initialEndDate = new NepaliDate(
                options.initialDateRange.end.year,
                options.initialDateRange.end.month,
                options.initialDateRange.end.day,
            )
        } else {
            // Use today's date for both start and end
            const today = NepaliDate.today()
            initialStartDate = today
            initialEndDate = today
        }

        this.selectedRange = {
            start: initialStartDate.toObject(),
            end: initialEndDate.toObject(),
        }

        this.currentViewDate = initialStartDate
        this.nextViewDate = this.getNextMonthDate(initialStartDate)
        this.tempSelectedRange = null

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
        this.inputElement.value = this.formatSelectedDateRange()

        // Add event listeners
        this.inputElement.addEventListener("click", this.toggle.bind(this))
        document.addEventListener("click", this.handleOutsideClick.bind(this))

        // Always apply the color (either default or custom)
        const colorToApply = this.options.primaryColor || NepaliDateRangePicker.DEFAULT_OPTIONS.primaryColor
        this.applyCustomColor(colorToApply || "#4F46E5")

        // Create picker element
        this.createPickerElement()
    }

    // Apply custom primary color
    private applyCustomColor(color: string): void {
        // Ensure color is a valid string
        const safeColor = color || NepaliDateRangePicker.DEFAULT_OPTIONS.primaryColor || "#4F46E5"

        const style = document.createElement("style")
        style.textContent = `
      .nepali-date-range-picker-input:focus {
        border-color: ${safeColor};
        box-shadow: 0 0 0 3px ${this.hexToRgba(safeColor, 0.1)};
      }
      .day.today {
        border-color: ${safeColor};
        color: ${safeColor};
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
      }
      .day.in-range {
        background-color: ${this.hexToRgba(safeColor, 0.2)};
      }
      .day.highlighted {
        background-color: ${this.hexToRgba(safeColor, 0.1)};
      }
      .today-button {
        border-color: ${safeColor};
        color: ${safeColor};
      }
      .today-button:hover {
        background-color: ${safeColor};
        color: white;
      }
      .apply-button {
        background-color: ${safeColor};
        border-color: ${safeColor};
        color: white;
      }
      .apply-button:hover {
        background-color: ${this.adjustColor(safeColor, -10)};
      }
      .preset-option.active {
        background-color: ${this.hexToRgba(safeColor, 0.1)};
        border-left: 3px solid ${safeColor};
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
      .nepali-date-range-picker {
    min-width: min-content;
      font-family: Arial, sans-serif;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: absolute;
        z-index: 1000;
        display: none;
      }
      .nepali-date-range-picker.open {
        display: flex;
      }
      .nepali-date-range-picker.light {
        background-color: white;
        color: #333;
      }
      .nepali-date-range-picker.dark {
        background-color: #333;
        color: white;
      }
      .presets-container {
        width: 200px;
        border-right: 1px solid #eee;
        overflow-y: auto;
      }
      .preset-option {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      .preset-option:hover {
        background-color: #f5f5f5;
      }
      .calendars-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .calendars-wrapper {
        display: flex;
        flex-direction: row;
      }
      .calendar {
        flex: 1;
        padding: 10px;
      }
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        font-weight: bold;
      }
      .month-year-display {
        font-size: 16px;
      }
      .nav-buttons {
        display: flex;
        gap: 10px;
      }
      .nav-button {
        background: none;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 5px 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: bold;
        padding: 10px 0;
      }
      .weekday {
        padding: 5px 0;
        font-size: 14px;
      }
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
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
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-top: 1px solid #eee;
      }
      .date-range-display {
        font-size: 14px;
        color: #666;
      }
      .action-buttons {
        display: flex;
        gap: 10px;
      }
      .action-button {
        padding: 8px 16px;
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
    `
        document.head.appendChild(style)
    }

    // Helper to convert hex to rgba
    private hexToRgba(hex: string, alpha: number): string {
        const r = Number.parseInt(hex.slice(1, 3), 16)
        const g = Number.parseInt(hex.slice(3, 5), 16)
        const b = Number.parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

    // Format the selected date range based on language option
    private formatSelectedDateRange(): string {
        const format = this.options.dateFormat || "YYYY-MM-DD"
        const startDate = new NepaliDate(
            this.selectedRange.start.year,
            this.selectedRange.start.month,
            this.selectedRange.start.day,
        )
        const endDate = new NepaliDate(
            this.selectedRange.end.year,
            this.selectedRange.end.month,
            this.selectedRange.end.day,
        )

        const startFormatted = this.options.language === "ne" ? startDate.formatNepali(format) : startDate.format(format)

        const endFormatted = this.options.language === "ne" ? endDate.formatNepali(format) : endDate.format(format)

        return `${startFormatted} - ${endFormatted}`
    }

    // Get the next month date
    private getNextMonthDate(date: NepaliDate): NepaliDate {
        return date.addMonths(1)
    }

    // Create the date picker element
    private createPickerElement(): void {
        if (this.pickerElement) {
            document.body.removeChild(this.pickerElement)
        }

        this.pickerElement = document.createElement("div")
        this.pickerElement.className = `nepali-date-range-picker ${this.options.theme}`

        // Add picker content
        this.updatePickerContent()

        // Append to body
        document.body.appendChild(this.pickerElement)
    }

    // Update the calendar header to include month and year dropdowns
    private updatePickerContent(): void {
        if (!this.pickerElement) return

        const tempRange = this.tempSelectedRange || this.selectedRange

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

        // English month names for dual display
        const englishMonthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ]

        // Day names based on language
        const dayNames =
            this.options.language === "ne"
                ? ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"]
                : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

        // Get English dates for dual display
        const currentGregorian = this.currentViewDate.toGregorian()
        const nextGregorian = this.nextViewDate.toGregorian()

        // Format the date range for display in footer
        const format = "YYYY-MM-DD"
        const startDate = new NepaliDate(tempRange.start.year, tempRange.start.month, tempRange.start.day)
        const endDate = new NepaliDate(tempRange.end.year, tempRange.end.month, tempRange.end.day)

        const formattedRange = `${startDate.format(format)} - ${endDate.format(format)}`

        // Generate month and year dropdown options
        const generateMonthOptions = (selectedMonth: number) => {
            return monthNames
                .map(
                    (month, index) => `<option value="${index}" ${index === selectedMonth ? "selected" : ""}>${month}</option>`,
                )
                .join("")
        }

        const generateYearOptions = (selectedYear: number) => {
            // Generate options for years 2070-2090
            return Array.from({ length: 21 }, (_, i) => 2070 + i)
                .map(
                    (year) =>
                        `<option value="${year}" ${year === selectedYear ? "selected" : ""}>${this.options.language === "ne" ? this.convertToNepaliNumeral(year) : year
                        }</option>`,
                )
                .join("")
        }

        // Generate HTML content
        const html = `
      <div class="presets-container">
        ${this.options.showPresets ? this.generatePresetOptions() : ""}
      </div>
      <div class="calendars-container">
        <div class="calendars-wrapper">
          <div class="calendar left-calendar">
            <div class="calendar-header">
              <button class="nav-button prev-month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div class="month-year-display">
                <div class="dropdown-container">
                  <select class="left-month-select">
                    ${generateMonthOptions(this.currentViewDate.month)}
                  </select>
                  <select class="left-year-select">
                    ${generateYearOptions(this.currentViewDate.year)}
                  </select>
                </div>
                <div class="gregorian-display" style="font-size: 12px; color: #666;">
                  ${englishMonthNames[currentGregorian.getMonth()]} ${currentGregorian.getFullYear()}
                </div>
              </div>
            </div>
            <div class="weekdays">
              ${dayNames.map((name) => `<div class="weekday">${name}</div>`).join("")}
            </div>
            <div class="days">
              ${this.generateDaysGrid(this.currentViewDate, tempRange)}
            </div>
          </div>
          <div class="calendar right-calendar">
            <div class="calendar-header">
              <div class="month-year-display">
                <div class="dropdown-container">
                  <select class="right-month-select">
                    ${generateMonthOptions(this.nextViewDate.month)}
                  </select>
                  <select class="right-year-select">
                    ${generateYearOptions(this.nextViewDate.year)}
                  </select>
                </div>
                <div class="gregorian-display" style="font-size: 12px; color: #666;">
                  ${englishMonthNames[nextGregorian.getMonth()]} ${nextGregorian.getFullYear()}
                </div>
              </div>
              <button class="nav-button next-month">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <div class="weekdays">
              ${dayNames.map((name) => `<div class="weekday">${name}</div>`).join("")}
            </div>
            <div class="days">
              ${this.generateDaysGrid(this.nextViewDate, tempRange)}
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="date-range-display">${formattedRange}</div>
          <div class="action-buttons">
            <button class="action-button cancel-button">${this.options.language === "ne" ? "रद्द" : "Cancel"}</button>
            <button class="action-button apply-button">${this.options.language === "ne" ? "लागू गर्नुहोस्" : "Apply"}</button>
          </div>
        </div>
      </div>
    `

        this.pickerElement.innerHTML = html

        // Add event listeners
        this.addPickerEventListeners()

        // Position the picker
        this.positionPicker()
    }

    // Generate preset options
    private generatePresetOptions(): string {
        const activePresetIndex = this.getActivePresetIndex()

        return `
      ${this.presets
                .map(
                    (preset, index) => `
        <div class="preset-option ${index === activePresetIndex ? "active" : ""}" data-index="${index}">
          ${this.options.language === "ne" ? preset.labelNe : preset.label}
        </div>
      `,
                )
                .join("")}
    `
    }

    // Get the active preset index based on current selection
    private getActivePresetIndex(): number {
        // Default to custom range (last option)
        let activeIndex = this.presets.length - 1

        const range = this.tempSelectedRange || this.selectedRange

        // Check if the current range matches any preset
        for (let i = 0; i < this.presets.length - 1; i++) {
            const presetRange = this.presets[i].range()

            if (
                range.start.year === presetRange.start.year &&
                range.start.month === presetRange.start.month &&
                range.start.day === presetRange.start.day &&
                range.end.year === presetRange.end.year &&
                range.end.month === presetRange.end.month &&
                range.end.day === presetRange.end.day
            ) {
                activeIndex = i
                break
            }
        }

        return activeIndex
    }

    // Generate days grid for a specific month
    private generateDaysGrid(viewDate: NepaliDate, selectedRange: DateRange): string {
        const year = viewDate.year
        const month = viewDate.month
        const today = NepaliDate.today()
        const daysInMonth = NepaliDate.getDaysInMonth(year, month)

        // Get first day of month
        const firstDayDate = new NepaliDate(year, month, 1)
        // Calculate the day of the week (0=Sunday, 6=Saturday)
        const firstDayOfWeek = firstDayDate.toGregorian().getDay()

        // Get previous month's days that appear in this month's view
        const prevMonth = month === 0 ? 11 : month - 1
        const prevYear = month === 0 ? year - 1 : year
        const daysInPrevMonth = NepaliDate.getDaysInMonth(prevYear, prevMonth)

        let html = ""

        // Empty cells for days before the first day of month (previous month's days)
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevMonthDay = daysInPrevMonth - firstDayOfWeek + i + 1
            const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(prevMonthDay) : prevMonthDay
            html += `<div class="day empty">${dayText}</div>`
        }

        // Generate day cells for current month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new NepaliDate(year, month, day)
            const currentDateObj = currentDate.toObject()

            const isStart = this.isSameDate(currentDateObj, selectedRange.start)
            const isEnd = this.isSameDate(currentDateObj, selectedRange.end)
            const isInRange = this.isDateInRange(currentDateObj, selectedRange)

            const isToday = today.year === year && today.month === month && today.day === day
            const isDisabled = this.isDateDisabled(year, month, day)

            // Calculate day of week (0 = Sunday, 6 = Saturday)
            const dayOfWeek = currentDate.toGregorian().getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

            let dayClass = `day ${isToday ? "today" : ""} ${isDisabled ? "disabled" : ""} ${isWeekend ? "weekend" : ""}`

            if (isStart) dayClass += " range-start"
            if (isEnd) dayClass += " range-end"
            if (isInRange && !isStart && !isEnd) dayClass += " in-range"

            const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(day) : day

            html += `<div class="${dayClass}" data-year="${year}" data-month="${month}" data-day="${day}">${dayText}</div>`
        }

        // Calculate remaining cells to fill the grid
        const totalCells = 42 // Always show 6 rows of 7 days
        const daysFromCurrentMonth = daysInMonth + firstDayOfWeek
        const remainingCells = totalCells - daysFromCurrentMonth

        // Add cells for days from next month
        for (let i = 1; i <= remainingCells; i++) {
            const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(i) : i
            html += `<div class="day empty">${dayText}</div>`
        }

        return html
    }

    // Check if two dates are the same
    private isSameDate(date1: NepaliDateObject, date2: NepaliDateObject): boolean {
        return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day
    }

    // Check if a date is within a range
    private isDateInRange(date: NepaliDateObject, range: DateRange): boolean {
        const dateObj = new NepaliDate(date.year, date.month, date.day)
        const startObj = new NepaliDate(range.start.year, range.start.month, range.start.day)
        const endObj = new NepaliDate(range.end.year, range.end.month, range.end.day)

        const dateGregorian = dateObj.toGregorian()
        const startGregorian = startObj.toGregorian()
        const endGregorian = endObj.toGregorian()

        return dateGregorian >= startGregorian && dateGregorian <= endGregorian
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

    // Check if a date is disabled
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

    // Parse date string
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

    // Position the picker relative to the input
    private positionPicker(): void {
        if (!this.pickerElement) return

        const inputRect = this.inputElement.getBoundingClientRect()
        const pickerHeight = this.pickerElement.offsetHeight
        const windowHeight = window.innerHeight

        // Check if there's enough space below the input
        const spaceBelow = windowHeight - inputRect.bottom
        const showBelow = spaceBelow >= pickerHeight || spaceBelow > inputRect.top

        if (showBelow) {
            this.pickerElement.style.top = `${inputRect.bottom + window.scrollY}px`
        } else {
            this.pickerElement.style.top = `${inputRect.top + window.scrollY - pickerHeight}px`
        }

        this.pickerElement.style.left = `${inputRect.left + window.scrollX}px`

        // Ensure the picker doesn't go off-screen horizontally
        const pickerWidth = this.pickerElement.offsetWidth
        const windowWidth = window.innerWidth

        if (inputRect.left + pickerWidth > windowWidth) {
            this.pickerElement.style.left = `${windowWidth - pickerWidth - 10 + window.scrollX}px`
        }
    }

    // Add event listeners to the picker elements
    private addPickerEventListeners(): void {
        if (!this.pickerElement) return

        // Preset options
        const presetOptions = this.pickerElement.querySelectorAll(".preset-option")
        presetOptions.forEach((option) => {
            option.addEventListener("click", (e) => {
                const index = Number.parseInt((e.currentTarget as HTMLElement).dataset.index || "0")
                this.applyPreset(index)
            })
        })

        // Previous month button
        const prevButton = this.pickerElement.querySelector(".prev-month")
        if (prevButton) {
            prevButton.addEventListener("click", (e) => {
                e.stopPropagation()
                this.currentViewDate = this.currentViewDate.addMonths(-1)
                this.nextViewDate = this.nextViewDate.addMonths(-1)
                this.updatePickerContent()
            })
        }

        // Next month button
        const nextButton = this.pickerElement.querySelector(".next-month")
        if (nextButton) {
            nextButton.addEventListener("click", (e) => {
                e.stopPropagation()
                this.currentViewDate = this.currentViewDate.addMonths(1)
                this.nextViewDate = this.nextViewDate.addMonths(1)
                this.updatePickerContent()
            })
        }

        // Month and year dropdowns for left calendar
        const leftMonthSelect = this.pickerElement.querySelector(".left-month-select") as HTMLSelectElement
        if (leftMonthSelect) {
            leftMonthSelect.addEventListener("change", (e) => {
                const month = Number.parseInt((e.target as HTMLSelectElement).value)
                this.currentViewDate = new NepaliDate(this.currentViewDate.year, month, 1)
                this.updatePickerContent()
            })
        }

        const leftYearSelect = this.pickerElement.querySelector(".left-year-select") as HTMLSelectElement
        if (leftYearSelect) {
            leftYearSelect.addEventListener("change", (e) => {
                const year = Number.parseInt((e.target as HTMLSelectElement).value)
                this.currentViewDate = new NepaliDate(year, this.currentViewDate.month, 1)
                this.updatePickerContent()
            })
        }

        // Month and year dropdowns for right calendar
        const rightMonthSelect = this.pickerElement.querySelector(".right-month-select") as HTMLSelectElement
        if (rightMonthSelect) {
            rightMonthSelect.addEventListener("change", (e) => {
                const month = Number.parseInt((e.target as HTMLSelectElement).value)
                this.nextViewDate = new NepaliDate(this.nextViewDate.year, month, 1)
                this.updatePickerContent()
            })
        }

        const rightYearSelect = this.pickerElement.querySelector(".right-year-select") as HTMLSelectElement
        if (rightYearSelect) {
            rightYearSelect.addEventListener("change", (e) => {
                const year = Number.parseInt((e.target as HTMLSelectElement).value)
                this.nextViewDate = new NepaliDate(year, this.nextViewDate.month, 1)
                this.updatePickerContent()
            })
        }

        // Day cells
        const dayCells = this.pickerElement.querySelectorAll(".day:not(.disabled):not(.empty)")
        dayCells.forEach((cell) => {
            cell.addEventListener("click", (e) => {
                e.stopPropagation()
                const target = e.currentTarget as HTMLElement
                const year = Number.parseInt(target.dataset.year || "0")
                const month = Number.parseInt(target.dataset.month || "0")
                const day = Number.parseInt(target.dataset.day || "1")

                this.handleDayClick(year, month, day)
            })
        })

        // Cancel button
        const cancelButton = this.pickerElement.querySelector(".cancel-button")
        if (cancelButton) {
            cancelButton.addEventListener("click", (e) => {
                e.stopPropagation()
                this.tempSelectedRange = null
                this.close()
            })
        }

        // Apply button
        const applyButton = this.pickerElement.querySelector(".apply-button")
        if (applyButton) {
            applyButton.addEventListener("click", (e) => {
                e.stopPropagation()
                if (this.tempSelectedRange) {
                    this.selectedRange = this.tempSelectedRange
                    this.inputElement.value = this.formatSelectedDateRange()

                    // Call onRangeSelect callback
                    if (this.options.onRangeSelect) {
                        this.options.onRangeSelect(this.selectedRange)
                    }
                }
                this.close()
            })
        }
    }

    // Apply a preset date range
    private applyPreset(index: number): void {
        if (index < 0 || index >= this.presets.length) return

        const preset = this.presets[index]
        const range = preset.range()

        this.tempSelectedRange = range

        // Update view dates to show the range
        const startDate = new NepaliDate(range.start.year, range.start.month, range.start.day)
        this.currentViewDate = startDate
        this.nextViewDate = this.getNextMonthDate(startDate)

        this.updatePickerContent()
    }

    // Handle day click
    private handleDayClick(year: number, month: number, day: number): void {
        const clickedDate = new NepaliDate(year, month, day).toObject()

        if (this.selectionState === "start" || this.selectionState === "complete") {
            // Start a new selection
            this.tempSelectedRange = {
                start: clickedDate,
                end: clickedDate,
            }
            this.selectionState = "end"
        } else if (this.selectionState === "end") {
            // Complete the selection
            if (!this.tempSelectedRange) {
                this.tempSelectedRange = {
                    start: clickedDate,
                    end: clickedDate,
                }
            } else {
                const startDate = new NepaliDate(
                    this.tempSelectedRange.start.year,
                    this.tempSelectedRange.start.month,
                    this.tempSelectedRange.start.day,
                )
                const clickedNepaliDate = new NepaliDate(year, month, day)

                // Convert to Gregorian for comparison
                const startGregorian = startDate.toGregorian()
                const clickedGregorian = clickedNepaliDate.toGregorian()

                if (clickedGregorian < startGregorian) {
                    // If clicked date is before start date, swap them
                    this.tempSelectedRange = {
                        start: clickedDate,
                        end: this.tempSelectedRange.start,
                    }
                } else {
                    // Normal case: end date is after start date
                    this.tempSelectedRange.end = clickedDate
                }
            }
            this.selectionState = "complete"
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
        this.tempSelectedRange = null
        this.selectionState = "start"

        // Set current view to show the selected start date
        const startDate = new NepaliDate(
            this.selectedRange.start.year,
            this.selectedRange.start.month,
            this.selectedRange.start.day,
        )
        this.currentViewDate = startDate
        this.nextViewDate = this.getNextMonthDate(startDate)

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

    // Get the selected date range
    getDateRange(): DateRange {
        return this.selectedRange
    }

    // Set the date range
    setDateRange(range: DateRange): void {
        this.selectedRange = range

        // Update input value
        this.inputElement.value = this.formatSelectedDateRange()

        // Update picker if open
        if (this.isOpen) {
            this.updatePickerContent()
        }
    }

    // Set options
    setOptions(options: Partial<DateRangePickerOptions>): void {
        const oldPrimaryColor = this.options.primaryColor

        // Update options
        this.options = { ...this.options, ...options }

        // Apply color if it changed or was explicitly set
        if (options.primaryColor !== undefined && options.primaryColor !== oldPrimaryColor) {
            const colorToApply = this.options.primaryColor || NepaliDateRangePicker.DEFAULT_OPTIONS.primaryColor
            this.applyCustomColor(colorToApply || "#4F46E5")
        }

        // Update input value if format or language changed
        if (options.dateFormat || options.language) {
            this.inputElement.value = this.formatSelectedDateRange()
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
        document.removeEventListener("click", this.handleOutsideClick.bind(this))

        // Close and remove picker
        this.close()
        if (this.pickerElement && this.pickerElement.parentNode) {
            document.body.removeChild(this.pickerElement)
        }

        // Remove data attributes
        this.inputElement.removeAttribute("data-nepali-date-range-picker-initialized")

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
