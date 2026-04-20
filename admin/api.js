const BASE = window.location.origin;

const api = {
  async login(username, password) {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    return { token: data.token };
  },

  async getProducts() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE}/api/admin/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Ошибка загрузки товаров');
    return await res.json();
  },

  async getStats() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Ошибка загрузки статистики');
    return await res.json();
  },

  async getOrders(status) {
    const token = localStorage.getItem('admin_token');
    const url = status ? `${BASE}/api/admin/orders?status=${status}` : `${BASE}/api/admin/orders`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Ошибка загрузки заказов');
    return await res.json();
  },

  async getOrder(id) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE}/api/admin/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },

  async updateStatus(id, status) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE}/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },

  async deleteOrder(id) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${BASE}/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await res.json();
  },
};

function getToken() {
  return localStorage.getItem('admin_token');
}

async function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/admin/login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login.html';
}
