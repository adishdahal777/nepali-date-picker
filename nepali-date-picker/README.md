# Nepali Date Picker

A lightweight, customizable Nepali (Bikram Sambat) date picker for modern web applications.

## Features

- 📅 Nepali Bikram Sambat calendar support (2000 BS - 2090 BS)
- 🔄 Conversion between Gregorian and Nepali dates
- 🌐 Supports both Nepali and English languages
- 🎨 Customizable themes and colors
- 📱 Responsive and mobile-friendly
- 🔍 Date range validation
- 🌙 Dark mode support
- ⌨️ Keyboard navigation
- ♿ Accessibility features

## Installation

\`\`\`bash
npm install nepali-date-picker
\`\`\`

### With Options

\`\`\`javascript
import { NepaliDatePicker } from 'nepali-date-picker';
import 'nepali-date-picker/dist/styles.css';

const datePicker = new NepaliDatePicker('#date-picker', {
  theme: 'dark',
  primaryColor: '#10B981', // Emerald color
  language: 'ne',
  showTodayButton: true,
  closeOnSelect: true,
  disableFutureDates: true,
  onDateSelect: (date) => {
    console.log('Selected date:', date);
  }
});

## Usage

### Basic Usage

```html
<input id="date-picker" type="text" readonly />