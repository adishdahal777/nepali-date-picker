import { NepaliDate } from "../utils/NepaliDate"
import type { DatePickerOptions, NepaliDateObject } from "../types/types"

export class NepaliDatePicker {
  private element: HTMLElement
  private options: DatePickerOptions
  private selectedDate: NepaliDate
  private currentViewDate: NepaliDate
  private isOpen = false
  private pickerElement: HTMLElement | null = null
  private inputElement!: HTMLInputElement
  private tempSelectedDate: NepaliDate | null = null

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
    let initialDate;
    if (options.initialDate) {
      // Use provided initial date, ensuring it's within valid range
      initialDate = new NepaliDate(
        options.initialDate.year,
        options.initialDate.month,
        options.initialDate.day
      );
    } else {
      // Use today's date, which will be adjusted to a valid year if needed
      initialDate = NepaliDate.today();
    }

    this.selectedDate = initialDate;
    this.currentViewDate = this.selectedDate;
    this.tempSelectedDate = null;

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
    this.inputElement.value = this.formatSelectedDate()

    // Add event listeners
    this.inputElement.addEventListener("click", this.toggle.bind(this))
    document.addEventListener("click", this.handleOutsideClick.bind(this))

    // Always apply the color (either default or custom)
    const colorToApply = this.options.primaryColor || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor;
    this.applyCustomColor(colorToApply || "#4F46E5");

    // Create picker element
    this.createPickerElement()
  }

  // Apply custom primary color
  private applyCustomColor(color: string): void {
    // Ensure color is a valid string
    const safeColor = color || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor || "#4F46E5";

    const style = document.createElement("style")
    style.textContent = `
      .nepali-date-picker-input:focus {
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
      .ok-button {
        background-color: ${safeColor};
        border-color: ${safeColor};
        color: white;
      }
      .ok-button:hover {
        background-color: ${this.adjustColor(safeColor, -10)};
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
      .nepali-date-picker {
         max-width: 400px;
        width: 350px;
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
        display: block;
      }
      .nepali-date-picker.light {
        background-color: white;
        color: #333;
      }
      .nepali-date-picker.dark {
        background-color: #333;
        color: white;
      }
      .date-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background-color: ${safeColor};
        color: white;
      }
      .selected-date {
        font-size: 16px;
        font-weight: bold;
      }
      .edit-icon {
        width: 16px;
        height: 16px;
        cursor: pointer;
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
      .month-year-header {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 0;
        background-color: ${safeColor};
        color: white;
        font-weight: bold;
        font-size: 16px;
      }
      .weekend {
        color: #e53e3e;
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

  // Update the picker content
  private updatePickerContent(): void {
    if (!this.pickerElement) return

    const displayDate = this.tempSelectedDate || this.selectedDate

    // Fix the date format for display
    const dayName = this.options.language === "ne" ? displayDate.formatNepali("dddd") : displayDate.format("dddd")

    const formattedDay = this.options.language === "ne" ? this.convertToNepaliNumeral(displayDate.day) : displayDate.day

    // Create properly formatted date string
    const formattedDate = `${dayName}, ${formattedDay}`

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
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // Get English month/year for dual display
    const gregorianDate = this.currentViewDate.toGregorian()
    const englishMonthYear = `${gregorianDate.toLocaleString("en-US", { month: "short" })}/${gregorianDate.toLocaleString("en-US", { month: "short", year: "numeric" }).split(" ")[1]}`

    // Generate HTML content
    this.pickerElement.innerHTML = `
      <div class="month-year-header" style="background-color: ${this.options.primaryColor || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor}">
        ${this.options.language === "ne" ? this.convertToNepaliNumeral(this.currentViewDate.year) : this.currentViewDate.year} 
        ${monthNames[this.currentViewDate.month]}
      </div>
      <div class="year-range-notice">
        ${this.options.language === "ne" ?
        `सालहरू: २०७० - २०९०` :
        `Years: 2070 - 2090`}
      </div>
      <div class="picker-header">
        <button class="nav-button prev-month">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="month-year-selector">
          ${this.generateMonthYearOptions()}
        </div>
        <button class="nav-button next-month">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <div class="weekdays">
        ${dayNames.map((name, index) => `<div class="weekday ${index === 0 || index === 6 ? "weekend" : ""}">${name}</div>`).join("")}
      </div>
      <div class="days">
        ${this.generateDaysGrid()}
      </div>
      <div class="footer">
        ${this.options.showTodayButton
        ? `<button class="today-button">${this.options.language === "ne" ? "आज" : "Today"}</button>`
        : "<div></div>"
      }
        <div class="action-buttons">
          <button class="action-button cancel-button">${this.options.language === "ne" ? "रद्द" : "Cancel"}</button>
          <button class="action-button ok-button">OK</button>
        </div>
      </div>
    `

    // Add event listeners
    this.addPickerEventListeners()

    // Position the picker
    this.positionPicker()
  }

  // Generate month and year options for dropdown
  private generateMonthYearOptions(): string {
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

    // Create separate dropdowns for month and year
    return `
      <div class="month-dropdown">
        <select class="month-select">
          ${monthNames
        .map(
          (month, index) =>
            `<option value="${index}" ${index === this.currentViewDate.month ? "selected" : ""}>${month}</option>`,
        )
        .join("")}
        </select>
      </div>
      <div class="year-dropdown">
        <select class="year-select">
          ${Array.from({ length: 21 }, (_, i) => 2070 + i)
        .map(
          (year) =>
            `<option value="${year}" ${year === this.currentViewDate.year ? "selected" : ""}>${this.options.language === "ne" ? this.convertToNepaliNumeral(year) : year}</option>`,
        )
        .join("")}
        </select>
      </div>
    `
  }

  // Generate days grid for the current month
  private generateDaysGrid(): string {
    const year = this.currentViewDate.year
    const month = this.currentViewDate.month
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
      const isSelected = this.tempSelectedDate
        ? this.tempSelectedDate.year === year &&
        this.tempSelectedDate.month === month &&
        this.tempSelectedDate.day === day
        : this.selectedDate.year === year && this.selectedDate.month === month && this.selectedDate.day === day

      const isToday = today.year === year && today.month === month && today.day === day

      const isDisabled = this.isDateDisabled(year, month, day)

      // Calculate day of week (0 = Sunday, 6 = Saturday)
      const date = new NepaliDate(year, month, day)
      const dayOfWeek = date.toGregorian().getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      const dayClass = `day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isDisabled ? "disabled" : ""} ${isWeekend ? "weekend" : ""}`

      const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(day) : day

      html += `<div class="${dayClass}" data-day="${day}">${dayText}</div>`
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

  // Check if a date should be disabled
  private isDateDisabled(year: number, month: number, day: number): boolean {
    if (!this.options.disableFutureDates && !this.options.disablePastDates) {
      return false
    }

    const date = new NepaliDate(year, month, day)
    const today = NepaliDate.today()
    const gregorianDate = date.toGregorian()
    const gregorianToday = today.toGregorian()

    if (this.options.disableFutureDates && gregorianDate > gregorianToday) {
      return true
    }

    if (this.options.disablePastDates && gregorianDate < gregorianToday) {
      return true
    }

    return false
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

    // Month select dropdown
    const monthSelect = this.pickerElement.querySelector(".month-select") as HTMLSelectElement
    if (monthSelect) {
      monthSelect.addEventListener("change", (e) => {
        const month = Number.parseInt((e.target as HTMLSelectElement).value)
        this.setMonth(month)
      })
    }

    // Year select dropdown
    const yearSelect = this.pickerElement.querySelector(".year-select") as HTMLSelectElement
    if (yearSelect) {
      yearSelect.addEventListener("change", (e) => {
        const year = Number.parseInt((e.target as HTMLSelectElement).value)
        this.setYear(year)
      })
    }

    // Edit icon
    const editIcon = this.pickerElement.querySelector(".edit-icon")
    if (editIcon) {
      editIcon.addEventListener("click", (e) => {
        e.stopPropagation()
        this.enableDateEditing()
      })
    }

    // Previous month button
    const prevButton = this.pickerElement.querySelector(".prev-month")
    if (prevButton) {
      prevButton.addEventListener("click", (e) => {
        e.stopPropagation() // Stop event propagation
        this.goToPrevMonth()
      })
    }

    // Next month button
    const nextButton = this.pickerElement.querySelector(".next-month")
    if (nextButton) {
      nextButton.addEventListener("click", (e) => {
        e.stopPropagation() // Stop event propagation
        this.goToNextMonth()
      })
    }

    // Day cells
    const dayCells = this.pickerElement.querySelectorAll(".day:not(.disabled)")
    dayCells.forEach((cell) => {
      if (!cell.classList.contains("other-month")) {
        cell.addEventListener("click", this.handleDayClick.bind(this))
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
        this.close()
      })
    }

    // OK button
    const okButton = this.pickerElement.querySelector(".ok-button")
    if (okButton) {
      okButton.addEventListener("click", () => {
        if (this.tempSelectedDate) {
          this.selectedDate = this.tempSelectedDate
          this.inputElement.value = this.formatSelectedDate()

          // Call onDateSelect callback
          if (this.options.onDateSelect) {
            this.options.onDateSelect(this.selectedDate.toObject())
          }
        }
        this.close()
      })
    }
  }

  // Enable date editing
  private enableDateEditing(): void {
    const dateDisplay = this.pickerElement?.querySelector(".selected-date")
    if (!dateDisplay) return

    const currentText = dateDisplay.textContent || ""

    // Create an input element
    const input = document.createElement("input")
    input.type = "text"
    input.className = "date-edit-input"
    input.value = currentText

    // Replace the text with the input
    dateDisplay.innerHTML = ""
    dateDisplay.appendChild(input)
    input.focus()

    // Handle input blur
    input.addEventListener("blur", () => {
      this.handleDateEdit(input.value)
    })

    // Handle enter key
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleDateEdit(input.value)
      }
    })
  }

  // Handle date editing
  private handleDateEdit(value: string): void {
    // Try to parse the date
    // This is a simplified implementation - you would need to enhance this
    // to properly parse different date formats
    try {
      // For example, if the format is "Friday, 1" we extract the day
      const match = value.match(/\d+/)
      if (match) {
        const day = Number.parseInt(match[0])
        if (
          !isNaN(day) &&
          day >= 1 &&
          day <= NepaliDate.getDaysInMonth(this.currentViewDate.year, this.currentViewDate.month)
        ) {
          this.tempSelectedDate = new NepaliDate(this.currentViewDate.year, this.currentViewDate.month, day)
          this.updatePickerContent()
          return
        }
      }
    } catch (e) {
      // Invalid format, just update the display
    }

    // If we get here, the edit was invalid, so just refresh the display
    this.updatePickerContent()
  }

  // Go to previous month
  private goToPrevMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(-1)
    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Go to next month
  private goToNextMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(1)
    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Set month
  private setMonth(month: number): void {
    if (month < 0 || month > 11) return

    const daysInMonth = NepaliDate.getDaysInMonth(this.currentViewDate.year, month)
    const day = Math.min(this.currentViewDate.day, daysInMonth)

    this.currentViewDate = new NepaliDate(this.currentViewDate.year, month, day)

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Set year
  private setYear(year: number): void {
    // Ensure year is within valid range
    if (year < 2070 || year > 2090) return

    const daysInMonth = NepaliDate.getDaysInMonth(year, this.currentViewDate.month)
    const day = Math.min(this.currentViewDate.day, daysInMonth)

    this.currentViewDate = new NepaliDate(year, this.currentViewDate.month, day)

    this.updatePickerContent()

    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month)
    }
  }

  // Handle day click
  private handleDayClick(event: Event): void {
    const cell = event.target as HTMLElement
    const day = Number.parseInt(cell.dataset.day || "1")

    this.tempSelectedDate = new NepaliDate(this.currentViewDate.year, this.currentViewDate.month, day)

    // Update the input value immediately when a day is clicked
    this.inputElement.value =
      this.options.language === "ne"
        ? this.tempSelectedDate.formatNepali(this.options.dateFormat || "YYYY-MM-DD")
        : this.tempSelectedDate.format(this.options.dateFormat || "YYYY-MM-DD")

    this.updatePickerContent()

    if (this.options.closeOnSelect) {
      this.selectedDate = this.tempSelectedDate

      // Call onDateSelect callback
      if (this.options.onDateSelect) {
        this.options.onDateSelect(this.selectedDate.toObject())
      }

      this.close()
    }
  }

  // Go to today
  private goToToday(): void {
    const today = NepaliDate.today()
    this.currentViewDate = today
    this.tempSelectedDate = today

    // Update the input value immediately
    this.inputElement.value =
      this.options.language === "ne"
        ? this.tempSelectedDate.formatNepali(this.options.dateFormat || "YYYY-MM-DD")
        : this.tempSelectedDate.format(this.options.dateFormat || "YYYY-MM-DD")

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
    this.tempSelectedDate = null
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

  // Set the date
  setDate(date: NepaliDateObject): void {
    this.selectedDate = new NepaliDate(date.year, date.month, date.day)
    this.currentViewDate = this.selectedDate

    // Update input value
    this.inputElement.value = this.formatSelectedDate()

    // Update picker if open
    if (this.isOpen) {
      this.updatePickerContent()
    }
  }

  // Set options
  setOptions(options: Partial<DatePickerOptions>): void {
    const oldPrimaryColor = this.options.primaryColor

    // Update options
    this.options = { ...this.options, ...options }

    // Apply color if it changed or was explicitly set
    if (options.primaryColor !== undefined && options.primaryColor !== oldPrimaryColor) {
      const colorToApply = this.options.primaryColor || NepaliDatePicker.DEFAULT_OPTIONS.primaryColor;
      this.applyCustomColor(colorToApply || "#4F46E5");
    }

    // Update input value if format or language changed
    if (options.dateFormat || options.language) {
      this.inputElement.value = this.formatSelectedDate()
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