// ===================================
// EXPENSE TRACKER - JAVASCRIPT
// Vanilla JS, No Frameworks
// Data stored temporarily in arrays only
// ===================================

// ===== GLOBAL VARIABLES =====

// Store all transactions in an array (temporary, resets on refresh)
let transactions = [];

// Chart instances
let categoryChart = null;
let comparisonChart = null;

// DOM Elements
const form = document.getElementById('transactionForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const noteInput = document.getElementById('note');

const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const transactionsList = document.getElementById('transactionsList');

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');

// Summary card elements
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpensesEl = document.getElementById('totalExpenses');
const totalSavingsEl = document.getElementById('totalSavings');

// ===== INITIALIZATION =====

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    document.getElementById('editDate').value = today;

    // Render initial state
    updateSummary();
    renderTransactions();
    initCharts();
});

// ===== FORM HANDLING =====

// Add new transaction
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const transaction = {
        id: Date.now(), // Unique ID using timestamp
        title: titleInput.value.trim(),
        amount: parseFloat(amountInput.value),
        type: typeInput.value,
        category: categoryInput.value,
        date: dateInput.value,
        note: noteInput.value.trim()
    };

    // Validate amount
    if (transaction.amount <= 0) {
        showNotification('Amount must be greater than 0', 'error');
        return;
    }

    // Add to transactions array
    transactions.push(transaction);

    // Reset form
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];

    // Update UI
    updateSummary();
    renderTransactions();
    updateCharts();

    // Show success message
    showNotification('Transaction added successfully!', 'success');
});

// ===== TRANSACTION RENDERING =====

// Render all transactions in the list
function renderTransactions() {
    // Get filter values
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;

    // Filter transactions
    let filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.title.toLowerCase().includes(searchTerm) ||
                            transaction.category.toLowerCase().includes(searchTerm) ||
                            (transaction.note && transaction.note.toLowerCase().includes(searchTerm));

        const matchesType = filterType === 'all' || transaction.type === filterType;

        return matchesSearch && matchesType;
    });

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clear list
    transactionsList.innerHTML = '';

    // Show empty state if no transactions
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <p class="empty-state">
                ${transactions.length === 0
                    ? 'No transactions yet. Add your first transaction above!'
                    : 'No transactions match your search or filter.'}
            </p>
        `;
        return;
    }

    // Render each transaction
    filteredTransactions.forEach(transaction => {
        const card = createTransactionCard(transaction);
        transactionsList.appendChild(card);
    });
}

// Create a transaction card element
function createTransactionCard(transaction) {
    const card = document.createElement('div');
    card.className = `transaction-card ${transaction.type}`;
    card.setAttribute('data-id', transaction.id);

    // Format amount
    const formattedAmount = formatCurrency(transaction.amount);

    // Format date
    const formattedDate = formatDate(transaction.date);

    card.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-header">
                <h4 class="transaction-title">${escapeHtml(transaction.title)}</h4>
                <span class="transaction-amount">${transaction.type === 'income' ? '+' : '-'}${formattedAmount}</span>
            </div>
            <div class="transaction-meta">
                <span class="category-badge">${getCategoryLabel(transaction.category)}</span>
                <span>📅 ${formattedDate}</span>
                ${transaction.note ? `<span>📝 ${escapeHtml(transaction.note.substring(0, 30))}${transaction.note.length > 30 ? '...' : ''}</span>` : ''}
            </div>
        </div>
        <div class="transaction-actions">
            <button class="btn btn-edit" onclick="editTransaction(${transaction.id})">Edit</button>
            <button class="btn btn-danger" onclick="deleteTransaction(${transaction.id})">Delete</button>
        </div>
    `;

    return card;
}

// ===== EDIT FUNCTIONALITY =====

// Open edit modal with transaction data
window.editTransaction = function(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    // Populate edit form
    document.getElementById('editTransactionId').value = id;
    document.getElementById('editTitle').value = transaction.title;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editType').value = transaction.type;
    document.getElementById('editCategory').value = transaction.category;
    document.getElementById('editDate').value = transaction.date;
    document.getElementById('editNote').value = transaction.note || '';

    // Show modal
    editModal.classList.add('active');
}

// Handle edit form submission
editForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = parseInt(document.getElementById('editTransactionId').value);
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) return;

    // Update transaction
    transactions[index] = {
        id: id,
        title: document.getElementById('editTitle').value.trim(),
        amount: parseFloat(document.getElementById('editAmount').value),
        type: document.getElementById('editType').value,
        category: document.getElementById('editCategory').value,
        date: document.getElementById('editDate').value,
        note: document.getElementById('editNote').value.trim()
    };

    // Close modal
    closeModal();

    // Update UI
    updateSummary();
    renderTransactions();
    updateCharts();

    showNotification('Transaction updated successfully!', 'success');
});

// Close modal
function closeModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);

// Close modal on outside click
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editModal.classList.contains('active')) {
        closeModal();
    }
});

// ===== DELETE FUNCTIONALITY =====

window.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateSummary();
        renderTransactions();
        updateCharts();
        showNotification('Transaction deleted', 'info');
    }
}

// Clear all transactions
document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (transactions.length === 0) {
        showNotification('No transactions to clear', 'info');
        return;
    }
    if (confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
        transactions = [];
        updateSummary();
        renderTransactions();
        updateCharts();
        showNotification('All transactions cleared', 'info');
    }
});

// ===== SEARCH & FILTER =====

// Real-time search and filter
searchInput.addEventListener('input', renderTransactions);
filterSelect.addEventListener('change', renderTransactions);

// ===== SUMMARY CALCULATIONS =====

// Update summary cards with current data
function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;
    const savings = totalIncome - totalExpenses;

    totalIncomeEl.textContent = formatCurrency(totalIncome);
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    totalBalanceEl.textContent = formatCurrency(totalBalance);
    totalSavingsEl.textContent = formatCurrency(savings);

    // Change savings color based on value
    if (savings >= 0) {
        totalSavingsEl.style.color = 'var(--income-color)';
    } else {
        totalSavingsEl.style.color = 'var(--expense-color)';
    }
}

// ===== CHART.js IMPLEMENTATION =====

// Initialize charts
function initCharts() {
    initCategoryChart();
    initComparisonChart();
}

// Pie Chart: Expenses by Category
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Group expenses by category
    const categoryData = {};

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryData[t.category]) {
                categoryData[t.category] = 0;
            }
            categoryData[t.category] += t.amount;
        });

    // Prepare chart data
    const labels = Object.keys(categoryData).map(cat => getCategoryLabel(cat));
    const data = Object.values(categoryData);
    const colors = generateCategoryColors(labels.length);

    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#1c1c1c',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b0b0b0',
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Bar Chart: Income vs Expenses
function initComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount',
                data: [0, 0],
                backgroundColor: [
                    'rgba(0, 214, 143, 0.8)',
                    'rgba(255, 71, 87, 0.8)'
                ],
                borderColor: [
                    '#00d68f',
                    '#ff4757'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b0b0',
                        callback: function(value) {
                            return '₹' + value;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b0b0b0'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update charts with current data
function updateCharts() {
    updateCategoryChart();
    updateComparisonChart();
}

function updateCategoryChart() {
    if (!categoryChart) return;

    // Group expenses by category
    const categoryData = {};

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryData[t.category]) {
                categoryData[t.category] = 0;
            }
            categoryData[t.category] += t.amount;
        });

    const labels = Object.keys(categoryData).map(cat => getCategoryLabel(cat));
    const data = Object.values(categoryData);
    const colors = generateCategoryColors(labels.length);

    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.data.datasets[0].backgroundColor = colors;
    categoryChart.update();
}

function updateComparisonChart() {
    if (!comparisonChart) return;

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    comparisonChart.data.datasets[0].data = [totalIncome, totalExpenses];
    comparisonChart.update();
}

// ===== UTILITY FUNCTIONS =====

// Format currency (e.g., 1234.56 -> ₹1,234.56)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date (YYYY-MM-DD -> Jan 1, 2024)
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get human-readable category label
function getCategoryLabel(category) {
    const labels = {
        salary: 'Salary',
        freelance: 'Freelance',
        investment: 'Investment',
        food: 'Food & Dining',
        transport: 'Transport',
        shopping: 'Shopping',
        bills: 'Bills',
        entertainment: 'Entertainment',
        health: 'Healthcare',
        education: 'Education',
        other: 'Other'
    };
    return labels[category] || category;
}

// Generate distinct colors for pie chart categories
function generateCategoryColors(count) {
    // Premium distinct color palette for better visual differentiation
    const distinctColors = [
        '#ff6b35', // Orange (primary)
        '#00d68f', // Green (income)
        '#ff4757', // Red (expense)
        '#ffa502', // Amber (savings)
        '#5f27cd', // Purple
        '#00d2d3', // Cyan
        '#ff9ff3', // Pink
        '#54a0ff', // Blue
        '#48dbfb', // Light Blue
        '#1dd1a1', // Teal
        '#feca57', // Yellow
        '#ff6b9d', // Rose
        '#c44569', // Deep Pink
        '#00e5ff', // Bright Cyan
        '#ffb347', // Peach
        '#00b894', // Dark Teal
        '#e17055', // Burnt Orange
        '#74b9ff', // Soft Blue
        '#a29bfe', // Lavender
        '#fd79a8'  // Hot Pink
    ];

    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(distinctColors[i % distinctColors.length]);
    }
    return colors;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification (simple alert replacement)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00d68f, #00b894)' : type === 'error' ? 'linear-gradient(135deg, #ff4757, #ff3838)' : 'linear-gradient(135deg, #ff6b35, #ff8c42)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// ===== CONSOLE GREETING =====
console.log('%c Expense Tracker ', 'background: linear-gradient(135deg, #ff6b35, #ff8c42); color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Track your money smartly! Built with vanilla HTML, CSS & JS ', 'color: #ff6b35; font-size: 12px;');
