interface NepaliDateObject {
    year: number;
    month: number;
    day: number;
}
interface DatePickerOptions {
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
    language?: 'ne' | 'en';
    showTodayButton?: boolean;
    closeOnSelect?: boolean;
    disableFutureDates?: boolean;
    disablePastDates?: boolean;
    minDate?: NepaliDateObject;
    maxDate?: NepaliDateObject;
    onDateSelect?: (date: NepaliDateObject) => void;
    onMonthChange?: (year: number, month: number) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

declare class NepaliDatePicker {
    private element;
    private options;
    private selectedDate;
    private currentViewDate;
    private isOpen;
    private pickerElement;
    private static readonly DEFAULT_OPTIONS;
    constructor(selector: string | HTMLElement, options?: DatePickerOptions);
    private init;
    private formatSelectedDate;
    private toggle;
    private open;
    private close;
    private handleOutsideClick;
    private renderDatePicker;
    private generatePickerHTML;
    private generateYearOptions;
    private convertToNepaliNumeral;
    private isDateDisabled;
    private addPickerEventListeners;
    private goToPrevMonth;
    private goToNextMonth;
    private handleMonthChange;
    private handleYearChange;
    private handleDayClick;
    private goToToday;
    private updateDatePicker;
    getDate(): NepaliDateObject;
    setDate(date: NepaliDateObject): void;
    setOptions(options: Partial<DatePickerOptions>): void;
    destroy(): void;
}

declare class NepaliDate {
    private _year;
    private _month;
    private _day;
    private static readonly MIN_YEAR;
    private static readonly MAX_YEAR;
    constructor(year: number, month: number, day: number);
    static fromGregorian(date: Date): NepaliDate;
    static today(): NepaliDate;
    toGregorian(): Date;
    toObject(): NepaliDateObject;
    format(formatStr?: string): string;
    formatNepali(formatStr?: string): string;
    static getDaysInMonth(year: number, month: number): number;
    private validateDate;
    private static validateYearMonth;
    private static convertToNepali;
    private static convertToGregorian;
    get year(): number;
    get month(): number;
    get day(): number;
    addDays(days: number): NepaliDate;
    addMonths(months: number): NepaliDate;
    addYears(years: number): NepaliDate;
}

export { DatePickerOptions, NepaliDate, NepaliDatePicker };
