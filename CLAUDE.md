# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense Tracker is a single-page web application built with vanilla HTML, CSS, and JavaScript (no frameworks). It allows users to track income and expenses with real-time charts using Chart.js. All data is stored temporarily in memory (arrays) and resets on page refresh.

## Architecture

**Three-file structure:**
- `index.html` - Complete UI structure with forms, transaction list, charts, and edit modal
- `style.css` - Premium black & orange theme with CSS variables, animations, and responsive design
- `script.js` - Vanilla JavaScript with Chart.js integration, CRUD operations, and state management

**Data Flow:**
- Global `transactions` array stores all transaction objects with unique ID
- Form submissions add transactions; edit/delete modify the array
- UI updates triggered after every state change: `updateSummary()` → summary cards, `renderTransactions()` → list, `updateCharts()` → visualizations

**Key Patterns:**
- Event-driven architecture with DOM event listeners
- Real-time filtering via `searchInput` (input event) and `filterSelect` (change event)
- Chart.js used for two visualizations: pie chart (expenses by category) and bar chart (income vs expenses)
- XSS prevention via `escapeHtml()` function for user input
- Notifications with custom CSS animations (no alerts)

## Development Tasks

**No build process** - this is a static site. Simply open `index.html` in a browser.

**Test manually:**
1. Open `index.html` in browser
2. Add transactions (income/expense, various categories)
3. Verify summary cards update correctly
4. Test search and filter functionality
5. Edit and delete transactions
6. Check charts reflect accurate data
7. Test responsive design at different viewport sizes
8. Verify modal opens/closes with button, outside click, and Escape key

**Common modifications:**
- Add new transaction categories: Update the `<select>` options in both `#category` and `#editCategory` in `index.html`, and optionally `getCategoryLabel()` mapping in `script.js` (line 488-502)
- Change colors: Modify CSS variables in `:root` section of `style.css` (lines 7-80)
- Adjust Chart.js styling: Look for `categoryChart` and `comparisonChart` initialization functions in `script.js` (lines 300-419)

## Important Notes

- Data is ephemeral - no localStorage or backend integration
- Uses Chart.js 4.4.1 from CDN (`https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js`)
- Modal uses global functions (`window.editTransaction`, `window.deleteTransaction`) for onclick handlers
- Date input defaults to today on page load (line 45-47 in script.js)
