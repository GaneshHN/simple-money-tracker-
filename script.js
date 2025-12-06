let transactions = [];
let deletedTransaction = null;
let snackbarTimeout = null;

const incomeCategories = ['salary', 'freelance', 'investment', 'other-income'];
const expenseCategories = ['food', 'transport', 'utilities', 'entertainment', 'shopping', 'health', 'other'];

const categoryColors = {
    'salary': '#10b981',
    'freelance': '#3b82f6',
    'investment': '#8b5cf6',
    'other-income': '#6366f1',
    'food': '#ef4444',
    'transport': '#f59e0b',
    'utilities': '#06b6d4',
    'entertainment': '#ec4899',
    'shopping': '#f97316',
    'health': '#14b8a6',
    'other': '#6b7280'
};

document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    loadTheme();
    initializeEventListeners();
    setDefaultDate();
    updateUI();
});

function initializeEventListeners() {
    document.getElementById('addTransactionBtn').addEventListener('click', openAddModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('transactionForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('searchInput').addEventListener('input', filterTransactions);
    document.getElementById('filterCategory').addEventListener('change', filterTransactions);
    document.getElementById('filterDateFrom').addEventListener('change', filterTransactions);
    document.getElementById('filterDateTo').addEventListener('change', filterTransactions);
    document.getElementById('filterAmountMin').addEventListener('input', filterTransactions);
    document.getElementById('filterAmountMax').addEventListener('input', filterTransactions);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('importCsvInput').addEventListener('change', importFromCSV);
    document.getElementById('undoBtn').addEventListener('click', undoDelete);

    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateCategoryOptions(this.dataset.type);
        });
    });

    document.getElementById('transactionModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Transaction';
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    setDefaultDate();

    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.type-btn[data-type="income"]').classList.add('active');
    updateCategoryOptions('income');

    document.getElementById('transactionModal').classList.add('active');
}

function openEditModal(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    document.getElementById('modalTitle').textContent = 'Edit Transaction';
    document.getElementById('transactionId').value = transaction.id;
    document.getElementById('transactionDate').value = transaction.date;
    document.getElementById('transactionDescription').value = transaction.description;
    document.getElementById('transactionAmount').value = Math.abs(transaction.amount);

    const type = transaction.amount >= 0 ? 'income' : 'expense';
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.type-btn[data-type="${type}"]`).classList.add('active');
    updateCategoryOptions(type);

    document.getElementById('transactionCategory').value = transaction.category;
    document.getElementById('transactionModal').classList.add('active');
}

function closeModal() {
    document.getElementById('transactionModal').classList.remove('active');
}

function updateCategoryOptions(type) {
    const select = document.getElementById('transactionCategory');
    const categories = type === 'income' ? incomeCategories : expenseCategories;
    const currentValue = select.value;

    select.innerHTML = '<option value="">Select Category</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        select.appendChild(option);
    });

    if (categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('transactionId').value;
    const date = document.getElementById('transactionDate').value;
    const description = document.getElementById('transactionDescription').value.trim();
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const type = document.querySelector('.type-btn.active').dataset.type;

    if (!date || !description || !amount || !category) {
        alert('Please fill in all fields');
        return;
    }

    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    if (id) {
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { id, date, description, amount: finalAmount, category };
        }
    } else {
        const newTransaction = {
            id: generateId(),
            date,
            description,
            amount: finalAmount,
            category
        };
        transactions.push(newTransaction);
    }

    saveTransactions();
    updateUI();
    closeModal();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function deleteTransaction(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        deletedTransaction = { ...transactions[index], index };
        transactions.splice(index, 1);
        saveTransactions();
        updateUI();
        showSnackbar('Transaction deleted');
    }
}

function undoDelete() {
    if (deletedTransaction) {
        transactions.splice(deletedTransaction.index, 0, {
            id: deletedTransaction.id,
            date: deletedTransaction.date,
            description: deletedTransaction.description,
            amount: deletedTransaction.amount,
            category: deletedTransaction.category
        });
        saveTransactions();
        updateUI();
        hideSnackbar();
        deletedTransaction = null;
    }
}

function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    document.getElementById('snackbarMessage').textContent = message;
    snackbar.classList.add('active');

    if (snackbarTimeout) clearTimeout(snackbarTimeout);
    snackbarTimeout = setTimeout(hideSnackbar, 5000);
}

function hideSnackbar() {
    document.getElementById('snackbar').classList.remove('active');
    if (snackbarTimeout) {
        clearTimeout(snackbarTimeout);
        snackbarTimeout = null;
    }
}

function updateUI() {
    updateSummary();
    renderTransactions();
    renderCharts();
}

function updateSummary() {
    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = income - expenses;

    document.getElementById('balance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);

    const balanceEl = document.getElementById('balance');
    balanceEl.classList.remove('positive', 'negative');
    if (balance > 0) balanceEl.classList.add('positive');
    else if (balance < 0) balanceEl.classList.add('negative');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function renderTransactions() {
    const filteredTransactions = getFilteredTransactions();
    const tbody = document.getElementById('transactionsBody');
    const noDataMsg = document.getElementById('noTransactions');
    const table = document.getElementById('transactionsTable');

    tbody.innerHTML = '';

    if (filteredTransactions.length === 0) {
        table.style.display = 'none';
        noDataMsg.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    noDataMsg.style.display = 'none';

    const sorted = [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(transaction => {
        const row = document.createElement('tr');
        const isIncome = transaction.amount >= 0;

        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${escapeHtml(transaction.description)}</td>
            <td><span class="category-badge">${transaction.category.replace('-', ' ')}</span></td>
            <td class="amount-cell ${isIncome ? 'positive' : 'negative'}">
                ${isIncome ? '+' : ''}${formatCurrency(transaction.amount)}
            </td>
            <td class="action-btns">
                <button class="btn-edit" onclick="openEditModal('${transaction.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFilteredTransactions() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    const amountMin = parseFloat(document.getElementById('filterAmountMin').value) || null;
    const amountMax = parseFloat(document.getElementById('filterAmountMax').value) || null;

    return transactions.filter(t => {
        if (search && !t.description.toLowerCase().includes(search) && !t.category.toLowerCase().includes(search)) {
            return false;
        }

        if (category && t.category !== category) {
            return false;
        }

        if (dateFrom && t.date < dateFrom) {
            return false;
        }

        if (dateTo && t.date > dateTo) {
            return false;
        }

        const absAmount = Math.abs(t.amount);
        if (amountMin !== null && absAmount < amountMin) {
            return false;
        }

        if (amountMax !== null && absAmount > amountMax) {
            return false;
        }

        return true;
    });
}

function filterTransactions() {
    renderTransactions();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('filterAmountMin').value = '';
    document.getElementById('filterAmountMax').value = '';
    renderTransactions();
}

function renderCharts() {
    renderPieChart();
    renderBarChart();
}

function renderPieChart() {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    const legendContainer = document.getElementById('pieChartLegend');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    legendContainer.innerHTML = '';

    const expenses = transactions.filter(t => t.amount < 0);

    if (expenses.length === 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data', canvas.width / 2, canvas.height / 2);
        return;
    }

    const categoryTotals = {};
    expenses.forEach(t => {
        const cat = t.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const categories = Object.keys(categoryTotals);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let startAngle = -Math.PI / 2;

    categories.forEach(cat => {
        const value = categoryTotals[cat];
        const sliceAngle = (value / total) * 2 * Math.PI;
        const color = categoryColors[cat] || '#6b7280';

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        if (sliceAngle > 0.2) {
            const midAngle = startAngle + sliceAngle / 2;
            const labelX = centerX + (radius * 0.6) * Math.cos(midAngle);
            const labelY = centerY + (radius * 0.6) * Math.sin(midAngle);
            const percentage = Math.round((value / total) * 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${percentage}%`, labelX, labelY);
        }

        startAngle += sliceAngle;

        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <span class="legend-color" style="background-color: ${color}"></span>
            <span>${cat.replace('-', ' ')}: ${formatCurrency(value)}</span>
        `;
        legendContainer.appendChild(legendItem);
    });
}

function renderBarChart() {
    const canvas = document.getElementById('barChart');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const income = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    if (income === 0 && expenses === 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No transaction data', canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxValue = Math.max(income, expenses);
    const padding = 50;
    const chartHeight = canvas.height - padding * 2;
    const chartWidth = canvas.width - padding * 2;
    const barWidth = chartWidth / 4;

    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    const incomeHeight = maxValue > 0 ? (income / maxValue) * chartHeight : 0;
    const incomeX = padding + barWidth / 2;
    const incomeY = canvas.height - padding - incomeHeight;

    ctx.fillStyle = '#10b981';
    ctx.fillRect(incomeX, incomeY, barWidth, incomeHeight);

    const expenseHeight = maxValue > 0 ? (expenses / maxValue) * chartHeight : 0;
    const expenseX = padding + barWidth * 2;
    const expenseY = canvas.height - padding - expenseHeight;

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(expenseX, expenseY, barWidth, expenseHeight);

    ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#f9fafb' : '#1f2937';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillText('Income', incomeX + barWidth / 2, canvas.height - padding + 20);
    ctx.fillText(formatCurrency(income), incomeX + barWidth / 2, incomeY - 10);

    ctx.fillText('Expenses', expenseX + barWidth / 2, canvas.height - padding + 20);
    ctx.fillText(formatCurrency(expenses), expenseX + barWidth / 2, expenseY - 10);
}

function exportToCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }

    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        Math.abs(t.amount).toFixed(2),
        t.category,
        t.amount >= 0 ? 'income' : 'expense'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function importFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const content = event.target.result;
            const lines = content.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                alert('Invalid CSV file: Must contain header row and at least one data row');
                return;
            }

            const headerLine = lines[0].toLowerCase();
            if (!headerLine.includes('date') || !headerLine.includes('amount') || !headerLine.includes('type')) {
                alert('Invalid CSV format: Required columns are Date, Description, Amount, Category, Type');
                return;
            }

            const newTransactions = [];
            const skippedRows = [];

            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                
                if (values.length < 5) {
                    skippedRows.push(i + 1);
                    continue;
                }

                const [date, description, amount, category, type] = values;
                const trimmedDate = date ? date.trim() : '';
                const trimmedDescription = description ? description.trim() : '';
                const trimmedCategory = category ? category.trim().toLowerCase() : '';
                const trimmedType = type ? type.trim().toLowerCase() : '';
                const parsedAmount = parseFloat(amount);

                if (!trimmedDate || !isValidDate(trimmedDate)) {
                    skippedRows.push(i + 1);
                    continue;
                }

                if (!trimmedDescription) {
                    skippedRows.push(i + 1);
                    continue;
                }

                if (isNaN(parsedAmount) || parsedAmount < 0) {
                    skippedRows.push(i + 1);
                    continue;
                }

                if (!trimmedCategory) {
                    skippedRows.push(i + 1);
                    continue;
                }

                if (trimmedType !== 'income' && trimmedType !== 'expense') {
                    skippedRows.push(i + 1);
                    continue;
                }

                const finalAmount = trimmedType === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

                newTransactions.push({
                    id: generateId(),
                    date: trimmedDate,
                    description: trimmedDescription,
                    amount: finalAmount,
                    category: trimmedCategory
                });
            }

            if (newTransactions.length > 0) {
                transactions = [...transactions, ...newTransactions];
                saveTransactions();
                updateUI();
                let message = `Successfully imported ${newTransactions.length} transaction(s)`;
                if (skippedRows.length > 0) {
                    message += `\nSkipped ${skippedRows.length} invalid row(s): ${skippedRows.slice(0, 5).join(', ')}${skippedRows.length > 5 ? '...' : ''}`;
                }
                alert(message);
            } else {
                alert('No valid transactions found in CSV. Please ensure:\n- Date format is YYYY-MM-DD\n- Amount is a positive number\n- Type is either "income" or "expense"\n- All required fields are present');
            }
        } catch (error) {
            alert('Error parsing CSV file. Please check the file format.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
