interface GregorianDateObject {
    year: number;
    month: number;
    day: number;
}
interface NepaliDateObject {
    year: number;
    month: number;
    day: number;
}
interface DatePickerOptions {
    theme?: "light" | "dark";
    primaryColor?: string;
    language?: "ne" | "en";
    showTodayButton?: boolean;
    closeOnSelect?: boolean;
    disableFutureDates?: boolean;
    disablePastDates?: boolean;
    dateFormat?: string;
    unicodeDate?: boolean;
    readOnly?: boolean;
    initialDate?: NepaliDateObject;
    minDate?: NepaliDateObject;
    maxDate?: NepaliDateObject;
    disabledDates?: NepaliDateObject[];
    disabledDays?: number[];
    maxDaysCount?: number;
    triggerButtonText?: string;
    showTriggerButton?: boolean;
    onChange?: (date: NepaliDateObject) => void;
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
    private inputElement;
    private tempSelectedDate;
    private static readonly DEFAULT_OPTIONS;
    constructor(selector: string | HTMLElement, options?: DatePickerOptions);
    private init;
    private applyCustomColor;
    private hexToRgba;
    private adjustColor;
    private formatSelectedDate;
    private createPickerElement;
    private updatePickerContent;
    private generateMonthYearOptions;
    private generateDaysGrid;
    private convertToNepaliNumeral;
    private isDateDisabled;
    private positionPicker;
    private addPickerEventListeners;
    private enableDateEditing;
    private handleDateEdit;
    private goToPrevMonth;
    private goToNextMonth;
    private setMonth;
    private setYear;
    private handleDayClick;
    private goToToday;
    private toggle;
    private open;
    private close;
    private handleOutsideClick;
    getDate(): NepaliDateObject;
    setDate(date: NepaliDateObject): void;
    setOptions(options: Partial<DatePickerOptions>): void;
    show(): void;
    hide(): void;
    destroy(): void;
}

declare class NepaliDate {
    private _year;
    private _month;
    private _day;
    private static readonly MIN_YEAR;
    private static readonly MAX_YEAR;
    private static readonly REF_NEPALI_DATE;
    private static readonly REF_GREGORIAN_DATE;
    constructor(year: number, month: number, day: number);
    private static getValidYear;
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
    private hexToRgba;
}

export { DatePickerOptions, GregorianDateObject, NepaliDate, NepaliDateObject, NepaliDatePicker };
