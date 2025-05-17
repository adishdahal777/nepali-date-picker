# Nepali Date Picker

![](https://img.shields.io/npm/v/@rato-guras-technology/nepali-date-picker.svg)

![](https://img.shields.io/badge/License-MIT-yellow.svg)

A lightweight, customizable Nepali (Bikram Sambat) date picker for modern web applications. This package provides an intuitive interface for selecting dates in the Nepali calendar system while supporting seamless conversion between Gregorian and Nepali dates.

## Features

- 📅 Full Nepali Bikram Sambat calendar support (2000 BS - 2090 BS)
- 🔄 Automatic conversion between Gregorian and Nepali dates
- 🌐 Bilingual support (Nepali and English languages)
- 🎨 Customizable themes (light/dark) and primary colors
- 📱 Fully responsive and mobile-friendly design
- 🔍 Date range validation and constraints
- 🌙 Dark mode support with automatic system preference detection
- ⌨️ Keyboard navigation for improved accessibility
- ♿ WCAG compliant for better accessibility
- 📦 Lightweight (~50KB gzipped)
- 🚀 Zero dependencies
- 🔧 Easy integration with any JavaScript framework

## Installation

### **Using CDN**

```html
<!-- CSS -->
<link rel="stylesheet" href="https://unpkg.com/@rato-guras-technology/nepali-date-picker/dist/styles.css"><!-- JavaScript -->
<script src="https://unpkg.com/@rato-guras-technology/nepali-date-picker/dist/index.umd.js"></script>
```

## **Basic Usage**

### **HTML Setup**

```html
<input id="nepali-date" type="text" readonly placeholder="Select date">
```

### **JavaScript Initialization**

```jsx
// If using npm
import { NepaliDatePicker } from '@rato-guras-technology/nepali-date-picker';
import '@rato-guras-technology/nepali-date-picker/dist/styles.css';

// If using CDN
const NepaliDatePicker = window.NepaliDatePicker;

// Initialize
const datePicker = new NepaliDatePicker('#nepali-date', {
  onDateSelect: (date) => {
    console.log('Selected date:', date);
  }
});
```

## **Configuration Options**

| **Option** | **Type** | **Default** | **Description** |
| --- | --- | --- | --- |
| **`theme`** | string | **`'light'`** | Color theme (**`'light'`** or **`'dark'`**) |
| **`language`** | string | **`'ne'`** | Language (**`'ne'`** for Nepali, **`'en'`** for English) |
| **`primaryColor`** | string | **`'#4F46E5'`** | Primary color for UI elements (any valid CSS color) |
| **`showTodayButton`** | boolean | **`true`** | Whether to show the "Today" button |
| **`closeOnSelect`** | boolean | **`true`** | Close picker after selecting a date |
| **`disableFutureDates`** | boolean | **`false`** | Disable dates after today |
| **`disablePastDates`** | boolean | **`false`** | Disable dates before today |
| **`minDate`** | object | **`null`** | Minimum selectable date (**`{ year, month, day }`**) |
| **`maxDate`** | object | **`null`** | Maximum selectable date (**`{ year, month, day }`**) |
| **`initialDate`** | object | **`null`** | Initial date to display (**`{ year, month, day }`**) |
| **`dateFormat`** | string | **`'YYYY-MM-DD'`** | Format for displayed date (supports **`YYYY`**, **`MM`**, **`DD`**) |
| **`onDateSelect`** | function | **`null`** | Callback when date is selected |

## **Methods**

| **Method** | **Description** |
| --- | --- |
| **`getDate()`** | Returns currently selected date as **`{ year, month, day }`** |
| **`setDate(date)`** | Programmatically set date (**`date`** as **`{ year, month, day }`**) |
| **`setOptions(options)`** | Update configuration options dynamically |
| **`show()`** | Show the date picker |
| **`hide()`** | Hide the date picker |
| **`destroy()`** | Clean up and remove the date picker instance |

## **Advanced Usage**

### **Form Integration**

```html
<form id="my-form">
  <label for="event-date">Event Date:</label
  ><input id="event-date" type="text" readonly /><input
    type="hidden"
    id="event-date-value"
    name="eventDate"
  /><button type="submit">Submit</button>
</form>
<script>
  const formDatePicker = new NepaliDatePicker('#event-date', {
    onDateSelect: (date) => {
      document.getElementById('event-date-value').value =
        `${date.year}-${date.month + 1}-${date.day}`;
    }
  });

  document.getElementById('my-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Form submitted with:', Object.fromEntries(formData.entries()));
  });
</script>
```

### **Date Range Selection**

```html
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px">
  <div>
    <label for="start-date">Start Date:</label
    ><input id="start-date" type="text" readonly />
  </div>
  <div>
    <label for="end-date">End Date:</label
    ><input id="end-date" type="text" readonly />
  </div>
</div>
<script>
  const startPicker = new NepaliDatePicker('#start-date');
  const endPicker = new NepaliDatePicker('#end-date', {
    minDate: startPicker.getDate()
  });

  startPicker.setOptions({
    onDateSelect: (date) => {
      endPicker.setOptions({ minDate: date });
    }
  });
</script>
```

### **Dynamic Configuration**

```jsx
const picker = new NepaliDatePicker('#dynamic-picker');

// Change theme
document.getElementById('dark-mode-btn').addEventListener('click', () => {
  picker.setOptions({ theme: 'dark' });
});

// Change language
document.getElementById('english-btn').addEventListener('click', () => {
  picker.setOptions({ language: 'en' });
});

// Change color
document.getElementById('color-btn').addEventListener('click', () => {
  picker.setOptions({ primaryColor: '#F43F5E' }); // Rose color
});
```

## **Styling**

You can override the default styles with your own CSS. The date picker uses the following CSS classes:

- **`.ndp`** - Main container
- **`.ndp-header`** - Header section (month/year navigation)
- **`.ndp-body`** - Calendar grid
- **`.ndp-day`** - Individual day cell
- **`.ndp-day.selected`** - Selected day
- **`.ndp-day.today`** - Current day
- **`.ndp-day.disabled`** - Disabled day
- **`.ndp-footer`** - Footer section (today button)

Example custom styling:

```css
/* Change selected day style */
.ndp-day.selected {
  background-color: #4F46E5;
  color: white;
}

/* Change today's date style */
.ndp-day.today {
  border: 2px solid #4F46E5;
}

/* Change header background */
.ndp-header {
  background-color: #4F46E5;
  color: white;
}
```

## **Browser Support**

The Nepali Date Picker works on all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## **Local Development**

To contribute or run locally:

1. Clone the repository
2. Install dependencies:CopyDownload
    
    ```bash
    npm install
    ```
    
3. Start development server:CopyDownload
    
    ```bash
    npm run dev
    ```
    
4. Build for production:CopyDownload
    
    ```bash
    npm run build
    ```
    

## **License**

MIT © Rato Guras Technology Pvt Ltd

## **Contributing**

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## **Support**

For issues or feature requests, please [open an issue](https://github.com/adishdahal777/nepali-date-picker) on GitHub.
