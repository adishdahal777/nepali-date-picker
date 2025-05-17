import { NepaliDateObject } from './types';
export declare class NepaliDate {
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
