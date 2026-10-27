const form = document.getElementById('expenseForm');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const expenseList = document.getElementById('expenseList');
const totalAmountEl = document.getElementById('totalAmount');
const categoryBreakdown = document.getElementById('categoryBreakdown');
const filterCategory = document.getElementById('filterCategory');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingId = null;

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function formatMoney(value) {
  return '$' + value.toFixed(2);
}

function render() {
  expenseList.innerHTML = '';

  const activeFilter = filterCategory.value;
  const visible = activeFilter
    ? expenses.filter(e => e.category === activeFilter)
    : expenses;

  if (visible.length === 0) {
    expenseList.innerHTML = '<li class="empty-message">No expenses yet</li>';
  }

  const sorted = [...visible].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach(expense => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="expense-info">
        <span class="expense-desc">${expense.description}</span>
        <span class="expense-meta">${expense.category} · ${expense.date}</span>
      </div>
      <div>
        <span class="expense-amount">${formatMoney(expense.amount)}</span>
        <span class="expense-actions">
          <button class="edit-btn" data-id="${expense.id}">Edit</button>
          <button class="delete-btn" data-id="${expense.id}">Delete</button>
        </span>
      </div>
    `;
    expenseList.appendChild(li);
  });

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  totalAmountEl.textContent = formatMoney(total);

  renderCategoryBreakdown();
}

function renderCategoryBreakdown() {
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  categoryBreakdown.innerHTML = '';
  Object.keys(totals).forEach(category => {
    const tag = document.createElement('span');
    tag.className = 'category-tag';
    tag.textContent = `${category}: ${formatMoney(totals[category])}`;
    categoryBreakdown.appendChild(tag);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!description || isNaN(amount) || amount <= 0 || !category || !date) {
    return;
  }

  if (editingId) {
    const expense = expenses.find(e => e.id === editingId);
    expense.description = description;
    expense.amount = amount;
    expense.category = category;
    expense.date = date;
    stopEditing();
  } else {
    expenses.push({
      id: Date.now().toString(),
      description,
      amount,
      category,
      date
    });
  }

  saveExpenses();
  render();
  form.reset();
});

function stopEditing() {
  editingId = null;
  submitBtn.textContent = 'Add Expense';
  cancelBtn.classList.add('hidden');
}

expenseList.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Delete this expense?')) return;
    expenses = expenses.filter(expense => expense.id !== id);
    saveExpenses();
    render();
  }

  if (e.target.classList.contains('edit-btn')) {
    const expense = expenses.find(expense => expense.id === id);
    descriptionInput.value = expense.description;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;
    editingId = id;
    submitBtn.textContent = 'Update Expense';
    cancelBtn.classList.remove('hidden');
    descriptionInput.focus();
  }
});

cancelBtn.addEventListener('click', () => {
  stopEditing();
  form.reset();
});

filterCategory.addEventListener('change', render);

render();
