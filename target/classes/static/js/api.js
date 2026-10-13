/**
 * ShopEasy - API Client & Core Utilities
 */

const API_BASE = '/api';

const Storage = {
    getToken() {
        return localStorage.getItem('shopeasy_token');
    },
    setToken(token) {
        localStorage.setItem('shopeasy_token', token);
    },
    getUser() {
        const u = localStorage.getItem('shopeasy_user');
        return u ? JSON.parse(u) : null;
    },
    setUser(user) {
        localStorage.setItem('shopeasy_user', JSON.stringify(user));
    },
    clearAuth() {
        localStorage.removeItem('shopeasy_token');
        localStorage.removeItem('shopeasy_user');
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'ROLE_ADMIN';
    }
};

/**
 * Perform authenticated or public API fetch
 */
async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
        'Accept': 'application/json',
        ...(options.headers || {})
    };

    const token = Storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMsg = (data && data.message) ? data.message : `Request failed with status ${response.status}`;
            if (response.status === 401 && !url.includes('/api/auth/login')) {
                // Token may be expired
                Storage.clearAuth();
                updateNavbarAuth();
            }
            throw new Error(errorMsg);
        }

        return data;
    } catch (err) {
        throw err;
    }
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-custom toast-${type}`;

    let icon = 'bi-info-circle-fill text-primary';
    if (type === 'success') icon = 'bi-check-circle-fill text-success';
    if (type === 'error') icon = 'bi-exclamation-triangle-fill text-danger';
    if (type === 'warning') icon = 'bi-exclamation-circle-fill text-warning';

    toast.innerHTML = `
        <i class="bi ${icon} fs-5"></i>
        <div class="flex-grow-1" style="font-size: 0.92rem; font-weight: 500;">${message}</div>
        <button type="button" class="btn-close btn-close-sm" style="font-size: 0.75rem;" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

/**
 * Format currency in Indian Rupees INR
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₹0.00';
    return '₹' + Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format timestamp
 */
function formatDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Refresh Cart Counter in Navbar
 */
async function refreshCartBadge() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    if (!Storage.isLoggedIn()) {
        badge.innerText = '0';
        badge.style.display = 'none';
        return;
    }

    try {
        const res = await apiFetch('/cart');
        if (res && res.success && res.data) {
            const count = res.data.totalItems || 0;
            badge.innerText = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (e) {
        badge.innerText = '0';
        badge.style.display = 'none';
    }
}

/**
 * Synchronize Navbar User State
 */
function updateNavbarAuth() {
    const authActions = document.getElementById('navbar-auth-actions');
    if (!authActions) return;

    if (Storage.isLoggedIn()) {
        const user = Storage.getUser() || { name: 'Customer' };
        const isAdmin = Storage.isAdmin();

        authActions.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-custom dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle fs-5 text-primary"></i>
                    <span class="d-none d-sm-inline fw-semibold">${user.name.split(' ')[0]}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><h6 class="dropdown-header">${user.email}</h6></li>
                    <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-bag-check me-2 text-primary"></i> My Orders & Profile</a></li>
                    ${isAdmin ? `<li><a class="dropdown-item fw-bold text-primary" href="admin.html"><i class="bi bi-speedometer2 me-2"></i> Admin Dashboard</a></li>` : ''}
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i> Sign Out</a></li>
                </ul>
            </div>
        `;
    } else {
        authActions.innerHTML = `
            <a href="login.html" class="btn btn-outline-custom">Sign In</a>
            <a href="register.html" class="btn btn-primary-custom d-none d-sm-inline-block">Register</a>
        `;
    }

    refreshCartBadge();
}

function logoutUser() {
    Storage.clearAuth();
    showToast('Signed out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuth();
});
