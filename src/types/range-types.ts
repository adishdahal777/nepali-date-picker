import { NepaliDateObject } from './types';

export interface DateRange {
    start: NepaliDateObject;
    end: NepaliDateObject;
}

export interface DateRangePickerOptions {
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
    disabledDays?: number[]; // 0 = Sunday, 6 = Saturday
    maxDaysCount?: number;
    triggerButtonText?: string;
    showTriggerButton?: boolean;
    showPresets?: boolean;
    onRangeSelect?: (range: DateRange) => void;
    onChange?: (range: DateRange) => void;
    onOpen?: () => void;
    onClose?: () => void;
}

export interface PresetRange {
    label: string;
    labelNe: string;
    range: () => DateRange;
}
