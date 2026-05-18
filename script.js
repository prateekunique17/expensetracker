let transactions = [];
let categoryChart = null;
let comparisonChart = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('editDate').valueAsDate = new Date();
    updateUI();
});

document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    if (amount <= 0) {
        alert('Amount must be greater than 0');
        return;
    }

    const transaction = {
        id: Date.now(),
        title: document.getElementById('title').value.trim(),
        amount: amount,
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
        note: document.getElementById('note').value.trim()
    };

    transactions.push(transaction);
    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    
    updateUI();
});

function renderTransactions() {
    const list = document.getElementById('transactionsList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterSelect').value;

    const filtered = transactions.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm) || 
                              t.category.toLowerCase().includes(searchTerm);
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
        list.innerHTML = '<p class="empty-state">No transactions found.</p>';
        return;
    }

    list.innerHTML = filtered.map(t => `
        <div class="transaction-card ${t.type}">
            <div class="transaction-info">
                <h4>${escapeHtml(t.title)}</h4>
                <div class="transaction-meta">
                    <span class="tag">${t.category}</span>
                    <span>${t.date}</span>
                    ${t.note ? `<span>- ${escapeHtml(t.note)}</span>` : ''}
                </div>
            </div>
            <div class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}&#8377;${t.amount.toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button onclick="editTransaction(${t.id})">Edit</button>
                <button onclick="deleteTransaction(${t.id})" class="danger">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateSummary() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;

    document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${expenses.toFixed(2)}`;
    document.getElementById('totalBalance').textContent = `₹${balance.toFixed(2)}`;
    document.getElementById('totalSavings').textContent = `₹${balance.toFixed(2)}`;
}

window.deleteTransaction = (id) => {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    }
};

window.editTransaction = (id) => {
    const t = transactions.find(t => t.id === id);
    if (!t) return;

    document.getElementById('editTransactionId').value = t.id;
    document.getElementById('editTitle').value = t.title;
    document.getElementById('editAmount').value = t.amount;
    document.getElementById('editType').value = t.type;
    document.getElementById('editCategory').value = t.category;
    document.getElementById('editDate').value = t.date;
    document.getElementById('editNote').value = t.note || '';

    document.getElementById('editModal').style.display = 'flex';
};

document.getElementById('editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('editTransactionId').value);
    const index = transactions.findIndex(t => t.id === id);
    
    if (index > -1) {
        transactions[index] = {
            id: id,
            title: document.getElementById('editTitle').value.trim(),
            amount: parseFloat(document.getElementById('editAmount').value),
            type: document.getElementById('editType').value,
            category: document.getElementById('editCategory').value,
            date: document.getElementById('editDate').value,
            note: document.getElementById('editNote').value.trim()
        };
        closeModal();
        updateUI();
    }
});

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelEdit').addEventListener('click', closeModal);

document.getElementById('clearAllBtn').addEventListener('click', () => {
    if (confirm('Clear all transactions?')) {
        transactions = [];
        updateUI();
    }
});

document.getElementById('searchInput').addEventListener('input', renderTransactions);
document.getElementById('filterSelect').addEventListener('change', renderTransactions);

function updateUI() {
    updateSummary();
    renderTransactions();
    updateCharts();
}

function updateCharts() {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const pieCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                borderWidth: 1
            }]
        },
        options: { responsive: true }
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const barCtx = document.getElementById('comparisonChart').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                label: 'Amount (₹)',
                data: [totalIncome, totalExpense],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}
