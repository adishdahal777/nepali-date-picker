import { NepaliDate } from "../utils/NepaliDate"
import type { DatePickerOptions, NepaliDateObject } from "../types/types"

export class NepaliDatePickerCopy {
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
    this.options = { ...NepaliDatePickerCopy.DEFAULT_OPTIONS, ...options }

    // Set initial dates
    this.selectedDate = options.initialDate
      ? new NepaliDate(options.initialDate.year, options.initialDate.month, options.initialDate.day)
      : NepaliDate.today()
    this.currentViewDate = this.selectedDate
    this.tempSelectedDate = null

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

    // Apply custom primary color if provided
    if (this.options.primaryColor && this.options.primaryColor !== NepaliDatePickerCopy.DEFAULT_OPTIONS.primaryColor) {
      this.applyCustomColor(this.options.primaryColor)
    }

    // Create picker element
    this.createPickerElement()
  }

  // Apply custom primary color
  private applyCustomColor(color: string): void {
    const style = document.createElement("style")
    style.textContent = `
      .nepali-date-picker-input:focus {
        border-color: ${color};
        box-shadow: 0 0 0 3px ${this.hexToRgba(color, 0.1)};
      }
      .day.today {
        border-color: ${color};
        color: ${color};
      }
      .day.selected {
        background-color: ${color};
        color: white;
      }
      .day.highlighted {
        background-color: ${this.hexToRgba(color, 0.1)};
      }
      .today-button {
        border-color: ${color};
        color: ${color};
      }
      .today-button:hover {
        background-color: ${color};
        color: black;
      }
      .ok-button {
        background-color: ${color};
        border-color: ${color};
      }
      .ok-button:hover {
        background-color: ${this.adjustColor(color, -10)};
      }
      .month-dropdown, .year-dropdown {
        display: inline-block;
        margin-right: 10px;
      }
      .dropdown-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
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
        border: 1px solid ${color};
        border-radius: 4px;
        font-size: inherit;
      }
      .picker-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
      }
      .month-year-selector {
        display: flex;
        flex-direction: row;
        align-items: center;
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
      this.options.language === "ne" ? ["आ", "सो", "मं", "बु", "बि", "शु", "श"] : ["S", "M", "T", "W", "T", "F", "S"]

    // Generate HTML content
    this.pickerElement.innerHTML = `
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
        ${dayNames.map((name) => `<div class="weekday">${name}</div>`).join("")}
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
    // For simplicity, we'll calculate the day of week of the first day
    // In a real implementation, this would be calculated based on the Gregorian equivalent
    const firstDayDate = new NepaliDate(year, month, 1)
    const firstDayOfWeek = firstDayDate.toGregorian().getDay() // 0 = Sunday, 6 = Saturday

    let html = ""

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      html += '<div class="day empty"></div>'
    }

    // Generate day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = this.tempSelectedDate
        ? this.tempSelectedDate.year === year &&
        this.tempSelectedDate.month === month &&
        this.tempSelectedDate.day === day
        : this.selectedDate.year === year && this.selectedDate.month === month && this.selectedDate.day === day

      const isToday = today.year === year && today.month === month && today.day === day

      const isDisabled = this.isDateDisabled(year, month, day)

      const dayClass = `day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isDisabled ? "disabled" : ""}`

      const dayText = this.options.language === "ne" ? this.convertToNepaliNumeral(day) : day

      html += `<div class="${dayClass}" data-day="${day}">${dayText}</div>`
    }

    // Calculate remaining cells to complete the grid
    const totalCells = Math.ceil((daysInMonth + firstDayOfWeek) / 7) * 7
    const remainingCells = totalCells - (daysInMonth + firstDayOfWeek)

    // Add empty cells for days after the last day of month
    for (let i = 0; i < remainingCells; i++) {
      html += '<div class="day empty"></div>'
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
    const dayCells = this.pickerElement.querySelectorAll(".day:not(.empty):not(.disabled)")
    dayCells.forEach((cell) => {
      cell.addEventListener("click", this.handleDayClick.bind(this))
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
    if (year < NepaliDate["MIN_YEAR"] || year > NepaliDate["MAX_YEAR"]) return

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
    this.options = { ...this.options, ...options }

    // Apply custom color if changed
    if (options.primaryColor && options.primaryColor !== this.options.primaryColor) {
      this.applyCustomColor(options.primaryColor)
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
