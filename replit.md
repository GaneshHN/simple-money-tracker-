# Simple Money Tracker

## Overview
A fully functional personal finance tracking website built with vanilla HTML, CSS, and JavaScript. Users can track income and expenses, view summaries, filter transactions, and export/import data.

## Current State
The application is complete with all core features and optional enhancements implemented.

## Project Architecture

### Files
- `index.html` - Main HTML structure with dashboard, transaction form modal, and transaction list
- `style.css` - Complete styling with responsive design and dark mode support
- `script.js` - All JavaScript functionality including transaction CRUD, filtering, charts, and data persistence

### Features Implemented
1. **Transaction Management**
   - Add, edit, and delete transactions
   - Income and expense categorization
   - Date, description, amount, and category fields

2. **Dashboard**
   - Current balance display
   - Total income summary
   - Total expenses summary
   - Pie chart for expense categories
   - Bar chart for income vs expenses comparison

3. **Filtering & Search**
   - Search by description or category
   - Filter by date range
   - Filter by category
   - Filter by amount range

4. **Data Persistence**
   - All data saved to localStorage
   - Persists across page refreshes

5. **Optional Features**
   - Dark mode toggle with theme persistence
   - CSV export functionality
   - CSV import functionality
   - Undo delete with snackbar notification
   - Visual charts using Canvas API

### Data Model
```javascript
{
    id: string,      // Unique identifier
    date: string,    // ISO date format (YYYY-MM-DD)
    description: string,
    amount: number,  // Positive for income, negative for expenses
    category: string
}
```

### Categories
**Income:** salary, freelance, investment, other-income
**Expense:** food, transport, utilities, entertainment, shopping, health, other

## Running the Application
The website is served via Python's HTTP server on port 5000.

## Technical Notes
- No frameworks or libraries used (pure vanilla HTML/CSS/JS)
- Responsive design works on desktop and mobile
- Uses CSS custom properties for theming
- Charts rendered using HTML5 Canvas API
