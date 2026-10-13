/**
 * ShopEasy - Admin Dashboard Management
 */

let adminStats = null;
let adminProducts = [];
let adminOrders = [];
let adminCategories = [];
let editingProductId = null;

async function initAdmin() {
    if (!Storage.isLoggedIn()) {
        showToast('Please sign in as Admin to access this panel', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=admin.html';
        }, 1000);
        return;
    }

    if (!Storage.isAdmin()) {
        showToast('Access denied: Admin credentials required', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
        return;
    }

    await loadCategories();
    await loadStats();
    await loadProducts();
    await loadOrders();
    await loadCustomers();
}

async function loadCategories() {
    try {
        const res = await apiFetch('/categories');
        if (res && res.success && res.data) {
            adminCategories = res.data;
            populateCategoryDropdowns();
        }
    } catch (e) {
        console.error(e);
    }
}

function populateCategoryDropdowns() {
    const select = document.getElementById('product-form-category');
    const filterSelect = document.getElementById('admin-product-filter-cat');

    const options = adminCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (select) {
        select.innerHTML = '<option value="">Select Category...</option>' + options;
    }
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + options;
    }
}

async function loadStats() {
    try {
        const res = await apiFetch('/admin/stats');
        if (res && res.success && res.data) {
            adminStats = res.data;
            document.getElementById('stat-sales').innerText = formatCurrency(adminStats.totalSales);
            document.getElementById('stat-orders').innerText = adminStats.totalOrders;
            document.getElementById('stat-products').innerText = adminStats.totalProducts;
            document.getElementById('stat-customers').innerText = adminStats.totalCustomers;

            // Low stock badge alert
            const lowStockAlert = document.getElementById('low-stock-alert');
            if (lowStockAlert && adminStats.lowStockProducts && adminStats.lowStockProducts.length > 0) {
                lowStockAlert.classList.remove('d-none');
                lowStockAlert.innerHTML = `
                    <div class="alert alert-warning border-0 shadow-sm d-flex align-items-center justify-content-between mb-4">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                            <div><strong>Low Stock Warning:</strong> ${adminStats.lowStockProducts.length} product(s) have 5 or fewer items remaining.</div>
                        </div>
                        <button class="btn btn-sm btn-outline-dark" onclick="filterLowStock()">View Low Stock</button>
                    </div>
                `;
            }
        }
    } catch (err) {
        showToast(err.message || 'Failed to load stats', 'error');
    }
}

/* ==========================================================================
   Product Management
   ========================================================================== */
async function loadProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    try {
        const res = await apiFetch('/admin/products');
        if (res && res.success && res.data) {
            adminProducts = res.data;
            renderProductsTable(adminProducts);
        }
    } catch (err) {
        showToast(err.message || 'Failed to load products', 'error');
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No products found</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr>
            <td class="text-muted small">#${p.id}</td>
            <td>
                <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}" 
                     class="rounded border" 
                     style="width: 44px; height: 44px; object-fit: cover;">
            </td>
            <td>
                <div class="fw-bold text-truncate" style="max-width: 240px;">${p.name}</div>
                <div class="text-muted small">${p.categoryName || 'Uncategorized'}</div>
            </td>
            <td class="fw-bold">${formatCurrency(p.price)}</td>
            <td>
                <span class="badge ${p.stockQuantity <= 5 ? (p.stockQuantity === 0 ? 'bg-danger' : 'bg-warning text-dark') : 'bg-success'}">
                    ${p.stockQuantity} in stock
                </span>
            </td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="openEditProductModal(${p.id})">
                        <i class="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openAddProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').innerText = 'Add New Product';
    document.getElementById('product-form-name').value = '';
    document.getElementById('product-form-category').value = '';
    document.getElementById('product-form-price').value = '';
    document.getElementById('product-form-stock').value = '';
    document.getElementById('product-form-image').value = '';
    document.getElementById('product-form-description').value = '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function openEditProductModal(id) {
    const p = adminProducts.find(item => item.id === id);
    if (!p) return;

    editingProductId = id;
    document.getElementById('productModalTitle').innerText = 'Edit Product';
    document.getElementById('product-form-name').value = p.name;
    document.getElementById('product-form-category').value = p.categoryId || '';
    document.getElementById('product-form-price').value = p.price;
    document.getElementById('product-form-stock').value = p.stockQuantity;
    document.getElementById('product-form-image').value = p.imageUrl || '';
    document.getElementById('product-form-description').value = p.description || '';

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const btn = document.getElementById('save-product-btn');
    const originalText = btn.innerHTML;

    const name = document.getElementById('product-form-name').value.trim();
    const categoryId = document.getElementById('product-form-category').value;
    const price = parseFloat(document.getElementById('product-form-price').value);
    const stockQuantity = parseInt(document.getElementById('product-form-stock').value);
    const imageUrl = document.getElementById('product-form-image').value.trim();
    const description = document.getElementById('product-form-description').value.trim();

    if (!name || isNaN(price) || isNaN(stockQuantity)) {
        showToast('Please fill in product name, price, and stock', 'warning');
        return;
    }

    const payload = {
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        price,
        stockQuantity,
        imageUrl,
        description
    };

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving...`;

        let res;
        if (editingProductId) {
            res = await apiFetch(`/products/${editingProductId}`, {
                method: 'PUT',
                body: payload
            });
        } else {
            res = await apiFetch('/products', {
                method: 'POST',
                body: payload
            });
        }

        if (res && res.success) {
            showToast(editingProductId ? 'Product updated successfully' : 'Product created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            await loadProducts();
            await loadStats();
        }
    } catch (err) {
        showToast(err.message || 'Failed to save product', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;

    try {
        const res = await apiFetch(`/products/${id}`, {
            method: 'DELETE'
        });

        if (res && res.success) {
            showToast('Product deleted', 'info');
            await loadProducts();
            await loadStats();
        }
    } catch (err) {
        showToast(err.message || 'Could not delete product', 'error');
    }
}

function filterProducts() {
    const keyword = document.getElementById('admin-product-search').value.toLowerCase().trim();
    const catId = document.getElementById('admin-product-filter-cat').value;

    const filtered = adminProducts.filter(p => {
        const matchKeyword = !keyword || p.name.toLowerCase().includes(keyword) || (p.description && p.description.toLowerCase().includes(keyword));
        const matchCat = !catId || (p.categoryId && p.categoryId == catId);
        return matchKeyword && matchCat;
    });

    renderProductsTable(filtered);
}

function filterLowStock() {
    const tabEl = document.getElementById('nav-products-tab');
    if (tabEl) bootstrap.Tab.getOrCreateInstance(tabEl).show();

    const lowStock = adminProducts.filter(p => p.stockQuantity <= 5);
    renderProductsTable(lowStock);
}

/* ==========================================================================
   Order Management
   ========================================================================== */
async function loadOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    try {
        const res = await apiFetch('/admin/orders');
        if (res && res.success && res.data) {
            adminOrders = res.data;
            renderOrdersTable(adminOrders);
        }
    } catch (err) {
        showToast(err.message || 'Failed to load orders', 'error');
    }
}

function renderOrdersTable(orders) {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No orders found</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>
                <span class="font-monospace fw-bold text-primary">${o.orderNumber}</span>
                <div class="text-muted small">${formatDate(o.createdAt)}</div>
            </td>
            <td>
                <div class="fw-semibold">${o.customerName}</div>
                <div class="text-muted small">${o.customerEmail}</div>
            </td>
            <td>${o.itemsCount} items</td>
            <td class="fw-bold">${formatCurrency(o.totalAmount)}</td>
            <td>
                ${renderStatusBadge(o.status)}
            </td>
            <td>
                <select class="form-select form-select-sm" onchange="updateOrderStatus(${o.id}, this.value)" style="width: 140px;">
                    <option value="PLACED" ${o.status === 'PLACED' ? 'selected' : ''}>Placed</option>
                    <option value="PROCESSING" ${o.status === 'PROCESSING' ? 'selected' : ''}>Processing</option>
                    <option value="SHIPPED" ${o.status === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
                    <option value="DELIVERED" ${o.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
                    <option value="CANCELLED" ${o.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-custom" onclick="openAdminOrderModal('${o.orderNumber}')">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await apiFetch(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: { status: newStatus }
        });

        if (res && res.success) {
            showToast(`Order status updated to ${newStatus}`, 'success');
            await loadOrders();
            await loadStats();
        }
    } catch (err) {
        showToast(err.message || 'Failed to update order status', 'error');
        await loadOrders();
    }
}

function filterOrders() {
    const keyword = document.getElementById('admin-order-search').value.toLowerCase().trim();
    const status = document.getElementById('admin-order-filter-status').value;

    const filtered = adminOrders.filter(o => {
        const matchKeyword = !keyword || 
            o.orderNumber.toLowerCase().includes(keyword) || 
            o.customerName.toLowerCase().includes(keyword) || 
            o.customerEmail.toLowerCase().includes(keyword);
        const matchStatus = !status || o.status === status;
        return matchKeyword && matchStatus;
    });

    renderOrdersTable(filtered);
}

function openAdminOrderModal(orderNumber) {
    const order = adminOrders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    document.getElementById('admin-modal-order-number').innerText = order.orderNumber;
    document.getElementById('admin-modal-order-date').innerText = formatDate(order.createdAt);
    document.getElementById('admin-modal-status-badge').innerHTML = renderStatusBadge(order.status);
    document.getElementById('admin-modal-customer').innerText = `${order.customerName} (${order.customerEmail}, ${order.customerPhone})`;
    document.getElementById('admin-modal-address').innerText = order.shippingAddress;
    document.getElementById('admin-modal-payment').innerText = order.paymentMethod;
    document.getElementById('admin-modal-total').innerText = formatCurrency(order.totalAmount);

    const tbody = document.getElementById('admin-modal-items-tbody');
    if (tbody) {
        tbody.innerHTML = (order.items || []).map(item => `
            <tr>
                <td>
                    <div class="fw-semibold">${item.productName}</div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-end">${formatCurrency(item.unitPrice)}</td>
                <td class="text-end fw-bold">${formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('');
    }

    const modal = new bootstrap.Modal(document.getElementById('adminOrderDetailsModal'));
    modal.show();
}

/* ==========================================================================
   Customers Management
   ========================================================================== */
async function loadCustomers() {
    const tbody = document.getElementById('admin-customers-tbody');
    if (!tbody) return;

    try {
        const res = await apiFetch('/admin/customers');
        if (res && res.success && res.data) {
            tbody.innerHTML = res.data.map(c => `
                <tr>
                    <td class="text-muted small">#${c.id}</td>
                    <td class="fw-bold">${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone || '<span class="text-muted">-</span>'}</td>
                    <td>${formatDate(c.createdAt)}</td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});
