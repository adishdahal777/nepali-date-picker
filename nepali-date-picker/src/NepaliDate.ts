import { NepaliDateObject, GregorianDateObject, CalendarData } from './types';
import { calendarData } from './calendarData';

export class NepaliDate {
  private _year: number;
  private _month: number;
  private _day: number;
  
  // Minimum and maximum dates supported
  private static readonly MIN_YEAR = 2000; // 2000 BS
  private static readonly MAX_YEAR = 2090; // 2090 BS
  
  constructor(year: number, month: number, day: number) {
    this.validateDate(year, month, day);
    this._year = year;
    this._month = month;
    this._day = day;
  }
  
  // Create NepaliDate from Gregorian date
  static fromGregorian(date: Date): NepaliDate {
    const gregorianDate: GregorianDateObject = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate()
    };
    
    const nepaliDate = this.convertToNepali(gregorianDate);
    return new NepaliDate(nepaliDate.year, nepaliDate.month, nepaliDate.day);
  }
  
  // Create NepaliDate from today's date
  static today(): NepaliDate {
    return this.fromGregorian(new Date());
  }
  
  // Convert to Gregorian date
  toGregorian(): Date {
    const gregorianDate = NepaliDate.convertToGregorian({
      year: this._year,
      month: this._month,
      day: this._day
    });
    
    return new Date(
      gregorianDate.year,
      gregorianDate.month,
      gregorianDate.day
    );
  }
  
  // Get date as object
  toObject(): NepaliDateObject {
    return {
      year: this._year,
      month: this._month,
      day: this._day
    };
  }
  
  // Format date to string
  format(formatStr: string = 'YYYY-MM-DD'): string {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const monthNames = [
      'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज', 
      'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत्र'
    ];
    const monthNamesEn = [
      'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];
    const dayNames = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
    const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const gregorianDate = this.toGregorian();
    const dayOfWeek = gregorianDate.getDay();
    
    return formatStr
      .replace('YYYY', this._year.toString())
      .replace('YY', (this._year % 100).toString().padStart(2, '0'))
      .replace('MM', (this._month + 1).toString().padStart(2, '0'))
      .replace('M', (this._month + 1).toString())
      .replace('DD', this._day.toString().padStart(2, '0'))
      .replace('D', this._day.toString())
      .replace('MMMM', monthNames[this._month])
      .replace('MMM', monthNamesEn[this._month])
      .replace('dddd', dayNames[dayOfWeek])
      .replace('ddd', dayNamesEn[dayOfWeek]);
  }
  
  // Format date to Nepali digits
  formatNepali(formatStr: string = 'YYYY-MM-DD'): string {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    
    return this.format(formatStr)
      .replace(/[0-9]/g, match => nepaliDigits[parseInt(match)]);
  }
  
  // Get days in month
  static getDaysInMonth(year: number, month: number): number {
    this.validateYearMonth(year, month);
    return calendarData[year][month];
  }
  
  // Validate date
  private validateDate(year: number, month: number, day: number): void {
    NepaliDate.validateYearMonth(year, month);
    
    if (day < 1 || day > calendarData[year][month]) {
      throw new Error(`Invalid day ${day} for year ${year}, month ${month}`);
    }
  }
  
  // Validate year and month
  private static validateYearMonth(year: number, month: number): void {
    if (year < this.MIN_YEAR || year > this.MAX_YEAR) {
      throw new Error(`Year must be between ${this.MIN_YEAR} and ${this.MAX_YEAR}`);
    }
    
    if (month < 0 || month > 11) {
      throw new Error('Month must be between 0 and 11');
    }
    
    if (!calendarData[year]) {
      throw new Error(`Calendar data not available for year ${year}`);
    }
  }
  
  // Convert Gregorian date to Nepali date
  private static convertToNepali(gregorianDate: GregorianDateObject): NepaliDateObject {
    // Implementation of conversion algorithm
    // This is a simplified placeholder - actual implementation would use
    // reference dates and calculate the difference
    
    // For demonstration, we'll return a fixed date
    // In a real implementation, this would use the calendar data to calculate
    // the actual Nepali date based on the Gregorian input
    return { year: 2080, month: 0, day: 1 };
  }
  
  // Convert Nepali date to Gregorian date
  private static convertToGregorian(nepaliDate: NepaliDateObject): GregorianDateObject {
    // Implementation of conversion algorithm
    // This is a simplified placeholder - actual implementation would use
    // reference dates and calculate the difference
    
    // For demonstration, we'll return a fixed date
    // In a real implementation, this would use the calendar data to calculate
    // the actual Gregorian date based on the Nepali input
    return { year: 2023, month: 3, day: 14 };
  }
  
  // Getters
  get year(): number {
    return this._year;
  }
  
  get month(): number {
    return this._month;
  }
  
  get day(): number {
    return this._day;
  }
  
  // Add days
  addDays(days: number): NepaliDate {
    // Convert to Gregorian, add days, then convert back to Nepali
    const gregorianDate = this.toGregorian();
    gregorianDate.setDate(gregorianDate.getDate() + days);
    return NepaliDate.fromGregorian(gregorianDate);
  }
  
  // Add months
  addMonths(months: number): NepaliDate {
    let year = this._year;
    let month = this._month + months;
    
    while (month > 11) {
      month -= 12;
      year += 1;
    }
    
    while (month < 0) {
      month += 12;
      year -= 1;
    }
    
    const daysInMonth = NepaliDate.getDaysInMonth(year, month);
    const day = Math.min(this._day, daysInMonth);
    
    return new NepaliDate(year, month, day);
  }
  
  // Add years
  addYears(years: number): NepaliDate {
    const year = this._year + years;
    const daysInMonth = NepaliDate.getDaysInMonth(year, this._month);
    const day = Math.min(this._day, daysInMonth);
    
    return new NepaliDate(year, this._month, day);
  }
}