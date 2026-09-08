const API_BASE = '';
const TOKEN_KEY = 'admin_token';
const PAGE_SIZE = 25;

let currentPage = 1;
let allCards = [];
let filteredCards = [];

const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-btn');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const searchInput = document.getElementById('search');
const statusFilter = document.getElementById('status-filter');
const cardsBody = document.getElementById('cards-body');
const pagination = document.getElementById('pagination');
const generateBtn = document.getElementById('generate-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const cancelBtn = document.getElementById('cancel-btn');
const generateModal = document.getElementById('generate-modal');
const generateForm = document.getElementById('generate-form');
const cancelGenBtn = document.getElementById('cancel-gen-btn');

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers
    }
  });
  
  if (res.status === 401) {
    clearToken();
    showLogin();
    throw new Error('Unauthorized');
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  
  return res.json();
}

function showLogin() {
  loginScreen.classList.add('active');
  dashboardScreen.classList.remove('active');
  passwordInput.value = '';
  passwordInput.focus();
}

function showDashboard() {
  loginScreen.classList.remove('active');
  dashboardScreen.classList.add('active');
  loadCards();
}

async function loadCards() {
  try {
    allCards = await api('/api/cards');
    applyFilters();
  } catch (err) {
    console.error('Failed to load cards:', err);
  }
}

function applyFilters() {
  const search = searchInput.value.toLowerCase();
  const status = statusFilter.value;
  
  filteredCards = allCards.filter(card => {
    const matchesSearch = card.card_id.toLowerCase().includes(search) ||
                          (card.client_name || '').toLowerCase().includes(search) ||
                          (card.destination_url || '').toLowerCase().includes(search);
    const matchesStatus = !status || card.status === status;
    return matchesSearch && matchesStatus;
  });
  
  currentPage = 1;
  renderTable();
  renderPagination();
}

function renderTable() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageCards = filteredCards.slice(start, end);
  
  cardsBody.innerHTML = pageCards.map(card => `
    <tr>
      <td><strong>${card.card_id}</strong></td>
      <td>${card.client_name || '<span style="color:#9ca3af">—</span>'}</td>
      <td><span class="status-badge ${card.status}">${card.status}</span></td>
      <td class="url-cell ${card.destination_url ? '' : 'empty'}">
        ${card.destination_url || 'Not set'}
      </td>
      <td class="actions-cell">
        <button class="btn secondary sm" onclick="openEdit('${card.card_id}')">Edit</button>
        ${card.status === 'active' ? 
          `<button class="btn danger sm" onclick="deactivate('${card.card_id}')">Deactivate</button>` : ''}
      </td>
    </tr>
  `).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '';
  
  html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">‹ Prev</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="${i === currentPage ? 'primary' : 'secondary'}" onclick="goPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span>…</span>`;
    }
  }
  
  html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">Next ›</button>`;
  
  pagination.innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  renderTable();
  renderPagination();
}

window.openEdit = function(cardId) {
  const card = allCards.find(c => c.card_id === cardId);
  if (!card) return;
  
  document.getElementById('modal-card-id').textContent = cardId;
  document.getElementById('edit-card-id').value = cardId;
  document.getElementById('edit-client-name').value = card.client_name || '';
  document.getElementById('edit-destination-url').value = card.destination_url || '';
  document.getElementById('edit-status').value = card.status;
  
  editModal.classList.remove('hidden');
};

window.deactivate = async function(cardId) {
  if (!confirm(`Deactivate card ${cardId}? This will stop it from redirecting to the review URL.`)) return;
  
  try {
    await api(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'inactive' })
    });
    loadCards();
  } catch (err) {
    alert('Failed to deactivate: ' + err.message);
  }
};

function closeEditModal() {
  editModal.classList.add('hidden');
  editForm.reset();
}

async function handleEditSubmit(e) {
  e.preventDefault();
  
  const cardId = document.getElementById('edit-card-id').value;
  const data = {
    client_name: document.getElementById('edit-client-name').value.trim(),
    destination_url: document.getElementById('edit-destination-url').value.trim(),
    status: document.getElementById('edit-status').value
  };
  
  const submitBtn = editForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  
  try {
    await api(`/api/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    closeEditModal();
    loadCards();
  } catch (err) {
    alert('Failed to save: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save & Activate';
  }
}

function openGenerateModal() {
  generateModal.classList.remove('hidden');
}

function closeGenerateModal() {
  generateModal.classList.add('hidden');
  generateForm.reset();
}

async function handleGenerateSubmit(e) {
  e.preventDefault();
  
  const start = parseInt(document.getElementById('gen-start').value);
  const end = parseInt(document.getElementById('gen-end').value);
  
  if (start > end) {
    alert('Start must be less than or equal to end');
    return;
  }
  
  const submitBtn = generateForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating...';
  
  try {
    await api('/api/cards/batch', {
      method: 'POST',
      body: JSON.stringify({ start, end })
    });
    closeGenerateModal();
    loadCards();
  } catch (err) {
    alert('Failed to generate: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generate';
  }
}

loginForm.addEventListener('click', async () => {
  const password = passwordInput.value;
  if (!password) {
    loginError.textContent = 'Please enter a password';
    loginError.classList.remove('hidden');
    return;
  }
  
  loginForm.disabled = true;
  loginForm.textContent = 'Signing in...';
  loginError.classList.add('hidden');
  
  try {
    await api('/api/cards', { headers: { 'Authorization': `Bearer ${password}` } });
    setToken(password);
    showDashboard();
  } catch (err) {
    loginError.textContent = 'Invalid password';
    loginError.classList.remove('hidden');
  } finally {
    loginForm.disabled = false;
    loginForm.textContent = 'Login';
  }
});

passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loginForm.click();
});

searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);
cancelBtn.addEventListener('click', closeEditModal);
editForm.addEventListener('submit', handleEditSubmit);
generateBtn.addEventListener('click', openGenerateModal);
cancelGenBtn.addEventListener('click', closeGenerateModal);
generateForm.addEventListener('submit', handleGenerateSubmit);

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

generateModal.addEventListener('click', (e) => {
  if (e.target === generateModal) closeGenerateModal();
});

if (getToken()) {
  showDashboard();
} else {
  showLogin();
}