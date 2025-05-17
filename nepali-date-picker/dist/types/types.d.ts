export interface NepaliDateObject {
    year: number;
    month: number;
    day: number;
}
export interface GregorianDateObject {
    year: number;
    month: number;
    day: number;
}
export interface DatePickerOptions {
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
export interface CalendarData {
    [year: number]: number[];
}
