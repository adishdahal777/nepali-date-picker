import type { NepaliDateObject, GregorianDateObject } from "../types/types"
import { calendarData } from "./calendarData"

export class NepaliDate {
  private _year: number
  private _month: number
  private _day: number

  // Minimum and maximum dates supported
  private static readonly MIN_YEAR = 2000 // 2070 BS
  private static readonly MAX_YEAR = 2090 // 2090 BS

  // Reference date: 1st Baisakh 2000 BS = 13th April 1943 AD
  private static readonly REF_NEPALI_DATE = { year: 2000, month: 0, day: 1 }
  private static readonly REF_GREGORIAN_DATE = new Date(1943, 3, 14) // Month is 0-indexed (3 = April)

  constructor(year: number, month: number, day: number) {
    // Get a valid year before validation
    year = NepaliDate.getValidYear(year)
    this.validateDate(year, month, day)
    this._year = year
    this._month = month
    this._day = day
  }

  // Get a valid year within the supported range
  private static getValidYear(year: number): number {
    if (year < this.MIN_YEAR) {
      console.warn(`Year ${year} is below minimum supported year ${this.MIN_YEAR}. Using ${this.MIN_YEAR} instead.`)
      return this.MIN_YEAR
    }
    if (year > this.MAX_YEAR) {
      console.warn(`Year ${year} is above maximum supported year ${this.MAX_YEAR}. Using ${this.MAX_YEAR} instead.`)
      return this.MAX_YEAR
    }
    return year
  }

  // Create NepaliDate from Gregorian date
  static fromGregorian(date: Date): NepaliDate {
    const gregorianDate: GregorianDateObject = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    }

    const nepaliDate = this.convertToNepali(gregorianDate)

    // Ensure the year is within valid range
    const validYear = this.getValidYear(nepaliDate.year)

    return new NepaliDate(validYear, nepaliDate.month, nepaliDate.day)
  }

  // Create NepaliDate from today's date
  static today(): NepaliDate {
    const todayNepali = this.fromGregorian(new Date())

    // Ensure the year is within valid range
    const validYear = this.getValidYear(todayNepali.year)

    if (validYear !== todayNepali.year) {
      // If year was adjusted, create a new date with the valid year
      return new NepaliDate(validYear, todayNepali.month, todayNepali.day)
    }

    return todayNepali
  }

  // Convert to Gregorian date
  toGregorian(): Date {
    const gregorianDate = NepaliDate.convertToGregorian({
      year: this._year,
      month: this._month,
      day: this._day,
    })

    return new Date(gregorianDate.year, gregorianDate.month, gregorianDate.day)
  }

  // Get date as object
  toObject(): NepaliDateObject {
    return {
      year: this._year,
      month: this._month,
      day: this._day,
    }
  }

  // Format date to string
  format(formatStr = "YYYY-MM-DD"): string {
    const monthNames = ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज", "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत्र"]
    const monthNamesEn = [
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
    const dayNames = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहिबार", "शुक्रबार", "शनिबार"]
    const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    const gregorianDate = this.toGregorian()
    const dayOfWeek = gregorianDate.getDay()

    return formatStr
      .replace("YYYY", this._year.toString())
      .replace("YY", (this._year % 100).toString().padStart(2, "0"))
      .replace("MM", (this._month + 1).toString().padStart(2, "0"))
      .replace("M", (this._month + 1).toString())
      .replace("DD", this._day.toString().padStart(2, "0"))
      .replace("D", this._day.toString())
      .replace("MMMM", monthNames[this._month])
      .replace("MMM", monthNamesEn[this._month])
      .replace("dddd", dayNames[dayOfWeek])
      .replace("ddd", dayNamesEn[dayOfWeek])
  }

  // Format date to Nepali digits
  formatNepali(formatStr = "YYYY-MM-DD"): string {
    const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]

    return this.format(formatStr).replace(/[0-9]/g, (match) => nepaliDigits[Number.parseInt(match)])
  }

  // Get days in month
  static getDaysInMonth(year: number, month: number): number {
    // Ensure year is valid before checking
    year = this.getValidYear(year)
    this.validateYearMonth(year, month)
    return calendarData[year][month]
  }

  // Validate date
  private validateDate(year: number, month: number, day: number): void {
    NepaliDate.validateYearMonth(year, month)

    if (day < 1 || day > calendarData[year][month]) {
      throw new Error(`Invalid day ${day} for year ${year}, month ${month}`)
    }
  }

  // Validate year and month
  private static validateYearMonth(year: number, month: number): void {
    // Year should already be valid at this point
    if (year < this.MIN_YEAR || year > this.MAX_YEAR) {
      throw new Error(`Year must be between ${this.MIN_YEAR} and ${this.MAX_YEAR}`)
    }

    if (month < 0 || month > 11) {
      throw new Error("Month must be between 0 and 11")
    }

    if (!calendarData[year]) {
      throw new Error(`Calendar data not available for year ${year}`)
    }
  }

  // Convert Gregorian date to Nepali date
  private static convertToNepali(gregorianDate: GregorianDateObject): NepaliDateObject {
    // Create a date object for the input Gregorian date
    const inputGregorianDate = new Date(Date.UTC(gregorianDate.year, gregorianDate.month, gregorianDate.day))
    const refDate = new Date(Date.UTC(
      this.REF_GREGORIAN_DATE.getFullYear(),
      this.REF_GREGORIAN_DATE.getMonth(),
      this.REF_GREGORIAN_DATE.getDate()
    ))
    const timeDiff = inputGregorianDate.getTime() - refDate.getTime()
    const totalDaysElapsed = Math.round(timeDiff / (1000 * 3600 * 24))


    // Find the corresponding Nepali date
    let nepaliYear = this.REF_NEPALI_DATE.year
    let nepaliMonth = this.REF_NEPALI_DATE.month
    let nepaliDay = this.REF_NEPALI_DATE.day
    let daysRemaining = totalDaysElapsed

    // Iterate through years and months to find the correct date
    while (daysRemaining > 0) {
      // Check if we have data for this year
      if (!calendarData[nepaliYear]) {
        // If we've exceeded available data, use the latest available year
        if (nepaliYear > this.MAX_YEAR) {
          console.warn(
            `Calendar data not available for year ${nepaliYear}. Using data from year ${this.MAX_YEAR} instead.`,
          )
          // Use the latest available year's data
          nepaliYear = this.MAX_YEAR
          nepaliMonth = 0
          nepaliDay = 1
          break
        } else if (nepaliYear < this.MIN_YEAR) {
          console.warn(
            `Calendar data not available for year ${nepaliYear}. Using data from year ${this.MIN_YEAR} instead.`,
          )
          // Use the earliest available year's data
          nepaliYear = this.MIN_YEAR
          nepaliMonth = 0
          nepaliDay = 1
          break
        } else {
          // For years within our range but missing data, this is still an error
          console.error(`Calendar data not available for year ${nepaliYear}`)
          // Return a fallback date
          return { year: this.MIN_YEAR, month: 0, day: 1 }
        }
      }

      // Days in current month
      const daysInCurrentMonth = calendarData[nepaliYear][nepaliMonth]

      // Check if we need to move to next month/year
      if (daysRemaining >= daysInCurrentMonth - nepaliDay + 1) {
        // Move to next month
        daysRemaining -= daysInCurrentMonth - nepaliDay + 1
        nepaliDay = 1
        nepaliMonth++

        // Move to next year if needed
        if (nepaliMonth > 11) {
          nepaliMonth = 0
          nepaliYear++

          // Check if we're about to exceed available data
          if (nepaliYear > this.MAX_YEAR) {
            console.warn(
              `Calendar data not available for year ${nepaliYear}. Using data from year ${this.MAX_YEAR} instead.`,
            )
            nepaliYear = this.MAX_YEAR
            break
          }
        }
      } else {
        // We found our date
        nepaliDay += daysRemaining
        daysRemaining = 0
      }
    }

    return { year: nepaliYear, month: nepaliMonth, day: nepaliDay }
  }

  // Convert Nepali date to Gregorian date
  private static convertToGregorian(nepaliDate: NepaliDateObject): GregorianDateObject {
    // Ensure the year is within our valid range
    nepaliDate.year = this.getValidYear(nepaliDate.year)

    // Calculate days elapsed from reference date
    let totalDaysElapsed = 0

    // Add days for complete years
    for (let year = this.REF_NEPALI_DATE.year; year < nepaliDate.year; year++) {
      if (calendarData[year]) {
        for (let month = 0; month < 12; month++) {
          totalDaysElapsed += calendarData[year][month]
        }
      } else {
        console.warn(`Calendar data not available for year ${year}. Using approximation.`)
        // Use an approximation of 365 days per year if data is missing
        totalDaysElapsed += 365
      }
    }

    // Add days for complete months in the current year
    for (let month = 0; month < nepaliDate.month; month++) {
      if (calendarData[nepaliDate.year] && calendarData[nepaliDate.year][month]) {
        totalDaysElapsed += calendarData[nepaliDate.year][month]
      } else {
        console.warn(`Calendar data not available for year ${nepaliDate.year}, month ${month}. Using approximation.`)
        // Use an approximation of 30 days per month if data is missing
        totalDaysElapsed += 30
      }
    }

    // Add days in the current month
    totalDaysElapsed += nepaliDate.day - 1

    // Calculate the equivalent Gregorian date
    const resultGregorianDate = new Date(this.REF_GREGORIAN_DATE)
    resultGregorianDate.setDate(this.REF_GREGORIAN_DATE.getDate() + totalDaysElapsed)

    return {
      year: resultGregorianDate.getFullYear(),
      month: resultGregorianDate.getMonth(),
      day: resultGregorianDate.getDate(),
    }
  }

  // Getters
  get year(): number {
    return this._year
  }

  get month(): number {
    return this._month
  }

  get day(): number {
    return this._day
  }

  // Add days
  addDays(days: number): NepaliDate {
    // Convert to Gregorian, add days, then convert back to Nepali
    const gregorianDate = this.toGregorian()
    gregorianDate.setDate(gregorianDate.getDate() + days)
    return NepaliDate.fromGregorian(gregorianDate)
  }

  // Add months
  addMonths(months: number): NepaliDate {
    let year = this._year
    let month = this._month + months

    while (month > 11) {
      month -= 12
      year += 1
    }

    while (month < 0) {
      month += 12
      year -= 1
    }

    // Ensure year is valid
    year = NepaliDate.getValidYear(year)

    const daysInMonth = NepaliDate.getDaysInMonth(year, month)
    const day = Math.min(this._day, daysInMonth)

    return new NepaliDate(year, month, day)
  }

  // Add years
  addYears(years: number): NepaliDate {
    let year = this._year + years

    // Ensure year is valid
    year = NepaliDate.getValidYear(year)

    const daysInMonth = NepaliDate.getDaysInMonth(year, this._month)
    const day = Math.min(this._day, daysInMonth)

    return new NepaliDate(year, this._month, day)
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
}
