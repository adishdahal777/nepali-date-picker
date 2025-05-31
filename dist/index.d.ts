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
interface DateRange$1 {
    start: NepaliDateObject;
    end: NepaliDateObject;
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
    disabledDates?: NepaliDateObject[] | string[];
    disabledDays?: number[];
    maxDaysCount?: number;
    triggerButtonText?: string;
    showTriggerButton?: boolean;
    onRangeSelect?: (range: DateRange$1) => void;
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
    private parseDateString;
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

interface DateRange {
    start: NepaliDateObject;
    end: NepaliDateObject;
}
interface DateRangePickerOptions {
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
    initialDateRange?: DateRange;
    minDate?: NepaliDateObject;
    maxDate?: NepaliDateObject;
    disabledDates?: NepaliDateObject[] | string[];
    disabledDays?: number[];
    maxDaysCount?: number;
    triggerButtonText?: string;
    showTriggerButton?: boolean;
    showPresets?: boolean;
    onRangeSelect?: (range: DateRange) => void;
    onChange?: (range: DateRange) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

declare class NepaliDateRangePicker {
    private element;
    private options;
    private selectedRange;
    private currentViewDate;
    private nextViewDate;
    private isOpen;
    private pickerElement;
    private inputElement;
    private tempSelectedRange;
    private selectionState;
    private static readonly DEFAULT_OPTIONS;
    private presets;
    constructor(selector: string | HTMLElement, options?: DateRangePickerOptions);
    private init;
    private applyCustomColor;
    private hexToRgba;
    private adjustColor;
    private formatSelectedDateRange;
    private getNextMonthDate;
    private createPickerElement;
    private updatePickerContent;
    private generatePresetOptions;
    private getActivePresetIndex;
    private generateDaysGrid;
    private isSameDate;
    private isDateInRange;
    private convertToNepaliNumeral;
    private isDateDisabled;
    private parseDateString;
    private positionPicker;
    private addPickerEventListeners;
    private applyPreset;
    private handleDayClick;
    private toggle;
    private open;
    private close;
    private handleOutsideClick;
    getDateRange(): DateRange;
    setDateRange(range: DateRange): void;
    setOptions(options: Partial<DateRangePickerOptions>): void;
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

export { DatePickerOptions, DateRange, DateRangePickerOptions, GregorianDateObject, NepaliDate, NepaliDateObject, NepaliDatePicker, NepaliDateRangePicker };
