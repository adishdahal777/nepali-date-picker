import { NepaliDate } from './NepaliDate';
import { DatePickerOptions, NepaliDateObject } from './types';

export class NepaliDatePicker {
  private element: HTMLElement;
  private options: DatePickerOptions;
  private selectedDate: NepaliDate;
  private currentViewDate: NepaliDate;
  private isOpen: boolean = false;
  private pickerElement: HTMLElement | null = null;
  
  // Default options
  private static readonly DEFAULT_OPTIONS: DatePickerOptions = {
    theme: 'light',
    primaryColor: '#4F46E5', // Indigo color
    language: 'ne',
    showTodayButton: true,
    closeOnSelect: true,
    disableFutureDates: false,
    disablePastDates: false,
    onDateSelect: () => {},
    onMonthChange: () => {},
    onOpen: () => {},
    onClose: () => {}
  };
  
  constructor(selector: string | HTMLElement, options: DatePickerOptions = {}) {
    // Get the target element
    if (typeof selector === 'string') {
      const el = document.querySelector(selector);
      if (!el) {
        throw new Error(`Element with selector "${selector}" not found`);
      }
      this.element = el as HTMLElement;
    } else {
      this.element = selector;
    }
    
    // Merge default options with user options
    this.options = { ...NepaliDatePicker.DEFAULT_OPTIONS, ...options };
    
    // Set initial dates
    this.selectedDate = NepaliDate.today();
    this.currentViewDate = this.selectedDate;
    
    // Initialize the date picker
    this.init();
  }
  
  // Initialize the date picker
  private init(): void {
    // Create input element if the target is not an input
    if (this.element.tagName !== 'INPUT') {
      const input = document.createElement('input');
      input.type = 'text';
      input.readOnly = true;
      input.className = 'nepali-date-picker-input';
      this.element.appendChild(input);
      this.element = input;
    }
    
    // Set initial value
    (this.element as HTMLInputElement).value = this.formatSelectedDate();
    
    // Add event listeners
    this.element.addEventListener('click', this.toggle.bind(this));
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }
  
  // Format the selected date based on language option
  private formatSelectedDate(): string {
    return this.options.language === 'ne' 
      ? this.selectedDate.formatNepali('YYYY-MM-DD')
      : this.selectedDate.format('YYYY-MM-DD');
  }
  
  // Toggle the date picker
  private toggle(event: Event): void {
    event.stopPropagation();
    
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // Open the date picker
  private open(): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.renderDatePicker();
    
    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }
  
  // Close the date picker
  private close(): void {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    if (this.pickerElement) {
      document.body.removeChild(this.pickerElement);
      this.pickerElement = null;
    }
    
    if (this.options.onClose) {
      this.options.onClose();
    }
  }
  
  // Handle clicks outside the date picker
  private handleOutsideClick(event: Event): void {
    if (this.isOpen && 
        this.pickerElement && 
        !this.pickerElement.contains(event.target as Node) &&
        !this.element.contains(event.target as Node)) {
      this.close();
    }
  }
  
  // Render the date picker
  private renderDatePicker(): void {
    // Create picker element
    this.pickerElement = document.createElement('div');
    this.pickerElement.className = `nepali-date-picker ${this.options.theme}`;
    this.pickerElement.style.position = 'absolute';
    
    // Position the picker
    const rect = this.element.getBoundingClientRect();
    this.pickerElement.style.top = `${rect.bottom + window.scrollY}px`;
    this.pickerElement.style.left = `${rect.left + window.scrollX}px`;
    this.pickerElement.style.zIndex = '1000';
    
    // Add picker content
    this.pickerElement.innerHTML = this.generatePickerHTML();
    
    // Add event listeners
    this.addPickerEventListeners();
    
    // Append to body
    document.body.appendChild(this.pickerElement);
  }
  
  // Generate HTML for the date picker
  private generatePickerHTML(): string {
    const year = this.currentViewDate.year;
    const month = this.currentViewDate.month;
    
    // Month names based on language
    const monthNames = this.options.language === 'ne'
      ? ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र']
      : ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
    
    // Day names based on language
    const dayNames = this.options.language === 'ne'
      ? ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Generate calendar grid
    let calendarHTML = '';
    
    // Get first day of month and total days
    const daysInMonth = NepaliDate.getDaysInMonth(year, month);
    
    // For simplicity, we'll assume the first day of the month starts on Sunday (0)
    // In a real implementation, this would be calculated based on the Gregorian equivalent
    let firstDayOfMonth = 0;
    
    // Generate day cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarHTML += '<div class="day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = this.selectedDate.year === year && 
                         this.selectedDate.month === month && 
                         this.selectedDate.day === day;
      
      const isDisabled = this.isDateDisabled(year, month, day);
      
      const dayClass = `day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
      
      const dayText = this.options.language === 'ne'
        ? this.convertToNepaliNumeral(day)
        : day;
      
      calendarHTML += `<div class="${dayClass}" data-day="${day}">${dayText}</div>`;
    }
    
    // Complete HTML
    return `
      <div class="picker-header" style="background-color: ${this.options.primaryColor}">
        <button class="prev-month">&lt;</button>
        <div class="current-month">
          <select class="month-select">
            ${monthNames.map((name, idx) => 
              `<option value="${idx}" ${idx === month ? 'selected' : ''}>${name}</option>`
            ).join('')}
          </select>
          <select class="year-select">
            ${this.generateYearOptions()}
          </select>
        </div>
        <button class="next-month">&gt;</button>
      </div>
      <div class="weekdays">
        ${dayNames.map(name => `<div class="weekday">${name}</div>`).join('')}
      </div>
      <div class="days">
        ${calendarHTML}
      </div>
      ${this.options.showTodayButton ? 
        `<div class="today-button">
          <button>${this.options.language === 'ne' ? 'आज' : 'Today'}</button>
        </div>` : 
        ''}
    `;
  }
  
  // Generate year options for the dropdown
  private generateYearOptions(): string {
    let options = '';
    for (let year = 2000; year <= 2090; year++) {
      const yearText = this.options.language === 'ne'
        ? this.convertToNepaliNumeral(year)
        : year;
      
      options += `<option value="${year}" ${year === this.currentViewDate.year ? 'selected' : ''}>${yearText}</option>`;
    }
    return options;
  }
  
  // Convert number to Nepali numeral
  private convertToNepaliNumeral(num: number): string {
    const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num.toString().split('').map(digit => 
      nepaliNumerals[parseInt(digit)]
    ).join('');
  }
  
  // Check if a date should be disabled
  private isDateDisabled(year: number, month: number, day: number): boolean {
    if (!this.options.disableFutureDates && !this.options.disablePastDates) {
      return false;
    }
    
    const date = new NepaliDate(year, month, day);
    const today = NepaliDate.today();
    const gregorianDate = date.toGregorian();
    const gregorianToday = today.toGregorian();
    
    if (this.options.disableFutureDates && gregorianDate > gregorianToday) {
      return true;
    }
    
    if (this.options.disablePastDates && gregorianDate < gregorianToday) {
      return true;
    }
    
    return false;
  }
  
  // Add event listeners to the picker elements
  private addPickerEventListeners(): void {
    if (!this.pickerElement) return;
    
    // Previous month button
    const prevButton = this.pickerElement.querySelector('.prev-month');
    if (prevButton) {
      prevButton.addEventListener('click', this.goToPrevMonth.bind(this));
    }
    
    // Next month button
    const nextButton = this.pickerElement.querySelector('.next-month');
    if (nextButton) {
      nextButton.addEventListener('click', this.goToNextMonth.bind(this));
    }
    
    // Month select
    const monthSelect = this.pickerElement.querySelector('.month-select');
    if (monthSelect) {
      monthSelect.addEventListener('change', this.handleMonthChange.bind(this));
    }
    
    // Year select
    const yearSelect = this.pickerElement.querySelector('.year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', this.handleYearChange.bind(this));
    }
    
    // Day cells
    const dayCells = this.pickerElement.querySelectorAll('.day:not(.empty):not(.disabled)');
    dayCells.forEach(cell => {
      cell.addEventListener('click', this.handleDayClick.bind(this));
    });
    
    // Today button
    if (this.options.showTodayButton) {
      const todayButton = this.pickerElement.querySelector('.today-button button');
      if (todayButton) {
        todayButton.addEventListener('click', this.goToToday.bind(this));
      }
    }
  }
  
  // Go to previous month
  private goToPrevMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(-1);
    this.updateDatePicker();
    
    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month);
    }
  }
  
  // Go to next month
  private goToNextMonth(): void {
    this.currentViewDate = this.currentViewDate.addMonths(1);
    this.updateDatePicker();
    
    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month);
    }
  }
  
  // Handle month change from dropdown
  private handleMonthChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const month = parseInt(select.value);
    
    this.currentViewDate = new NepaliDate(
      this.currentViewDate.year,
      month,
      Math.min(this.currentViewDate.day, NepaliDate.getDaysInMonth(this.currentViewDate.year, month))
    );
    
    this.updateDatePicker();
    
    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month);
    }
  }
  
  // Handle year change from dropdown
  private handleYearChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const year = parseInt(select.value);
    
    this.currentViewDate = new NepaliDate(
      year,
      this.currentViewDate.month,
      Math.min(this.currentViewDate.day, NepaliDate.getDaysInMonth(year, this.currentViewDate.month))
    );
    
    this.updateDatePicker();
    
    if (this.options.onMonthChange) {
      this.options.onMonthChange(this.currentViewDate.year, this.currentViewDate.month);
    }
  }
  
  // Handle day click
  private handleDayClick(event: Event): void {
    const cell = event.target as HTMLElement;
    const day = parseInt(cell.dataset.day || '1');
    
    this.selectedDate = new NepaliDate(
      this.currentViewDate.year,
      this.currentViewDate.month,
      day
    );
    
    // Update input value
    (this.element as HTMLInputElement).value = this.formatSelectedDate();
    
    // Update picker
    this.updateDatePicker();
    
    // Call onDateSelect callback
    if (this.options.onDateSelect) {
      this.options.onDateSelect(this.selectedDate.toObject());
    }
    
    // Close picker if closeOnSelect is true
    if (this.options.closeOnSelect) {
      this.close();
    }
  }
  
  // Go to today
  private goToToday(): void {
    this.currentViewDate = NepaliDate.today();
    this.selectedDate = this.currentViewDate;
    
    // Update input value
    (this.element as HTMLInputElement).value = this.formatSelectedDate();
    
    // Update picker
    this.updateDatePicker();
    
    // Call onDateSelect callback
    if (this.options.onDateSelect) {
      this.options.onDateSelect(this.selectedDate.toObject());
    }
    
    // Close picker if closeOnSelect is true
    if (this.options.closeOnSelect) {
      this.close();
    }
  }
  
  // Update the date picker UI
  private updateDatePicker(): void {
    if (!this.pickerElement) return;
    
    // Re-render the picker
    this.pickerElement.innerHTML = this.generatePickerHTML();
    this.addPickerEventListeners();
  }
  
  // Public methods
  
  // Get the selected date
  getDate(): NepaliDateObject {
    return this.selectedDate.toObject();
  }
  
  // Set the date
  setDate(date: NepaliDateObject): void {
    this.selectedDate = new NepaliDate(date.year, date.month, date.day);
    this.currentViewDate = this.selectedDate;
    
    // Update input value
    (this.element as HTMLInputElement).value = this.formatSelectedDate();
    
    // Update picker if open
    if (this.isOpen) {
      this.updateDatePicker();
    }
  }
  
  // Set options
  setOptions(options: Partial<DatePickerOptions>): void {
    this.options = { ...this.options, ...options };
    
    // Update picker if open
    if (this.isOpen) {
      this.updateDatePicker();
    }
  }
  
  // Destroy the date picker
  destroy(): void {
    // Remove event listeners
    this.element.removeEventListener('click', this.toggle.bind(this));
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    
    // Close and remove picker
    this.close();
    
    // Remove data attributes
    this.element.removeAttribute('data-nepali-date-picker-initialized');
  }
}