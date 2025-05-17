// Type definitions for the package

export interface NepaliDateObject {
    year: number;
    month: number; // 0-indexed (0 = Baisakh, 11 = Chaitra)
    day: number;
  }
  
  export interface GregorianDateObject {
    year: number;
    month: number; // 0-indexed (0 = January, 11 = December)
    day: number;
  }
  
  export interface DatePickerOptions {
    // Appearance
    theme?: 'light' | 'dark' | 'auto';
    primaryColor?: string;
    language?: 'ne' | 'en';
    showTodayButton?: boolean;
    
    // Behavior
    closeOnSelect?: boolean;
    disableFutureDates?: boolean;
    disablePastDates?: boolean;
    
    // Date range
    minDate?: NepaliDateObject;
    maxDate?: NepaliDateObject;
    
    // Callbacks
    onDateSelect?: (date: NepaliDateObject) => void;
    onMonthChange?: (year: number, month: number) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }
  
  export interface CalendarData {
    [year: number]: number[];
  }