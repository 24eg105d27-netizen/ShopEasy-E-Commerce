/**
 * ShopEasy - Customer Dashboard & Order History
 */

let myOrders = [];

async function initDashboard() {
    if (!Storage.isLoggedIn()) {
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }

    const user = Storage.getUser();
    if (user) {
        document.getElementById('dash-user-name').innerText = user.name;
        document.getElementById('dash-user-email').innerText = user.email;
        document.getElementById('dash-user-phone').innerText = user.phone || 'Not provided';
        document.getElementById('dash-profile-name').innerText = user.name;
        document.getElementById('dash-profile-initial').innerText = user.name.charAt(0).toUpperCase();
    }

    await loadMyOrders();
}

async function loadMyOrders() {
    const listContainer = document.getElementById('my-orders-list');
    const emptyState = document.getElementById('dashboard-empty-orders');

    try {
        const res = await apiFetch('/orders/my-orders');
        if (res && res.success && res.data) {
            myOrders = res.data;

            document.getElementById('dash-total-orders-count').innerText = myOrders.length;

            if (myOrders.length === 0) {
                if (emptyState) emptyState.classList.remove('d-none');
                if (listContainer) listContainer.innerHTML = '';
                return;
            }

            if (emptyState) emptyState.classList.add('d-none');

            if (listContainer) {
                listContainer.innerHTML = myOrders.map(order => `
                    <div class="card border mb-3 shadow-sm rounded-3">
                        <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                                <span class="text-muted small">Order Number:</span>
                                <span class="fw-bold ms-1 font-monospace text-primary">${order.orderNumber}</span>
                                <span class="text-muted small ms-3">Placed on:</span>
                                <span class="fw-semibold ms-1 small">${formatDate(order.createdAt)}</span>
                            </div>
                            <div>
                                ${renderStatusBadge(order.status)}
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-7 mb-3 mb-md-0">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <i class="bi bi-box-seam text-secondary"></i>
                                        <span class="fw-semibold">${order.itemsCount} item${order.itemsCount === 1 ? '' : 's'}</span>
                                        <span class="text-muted mx-2">•</span>
                                        <span class="text-muted small">Payment: ${order.paymentMethod}</span>
                                    </div>
                                    <div class="text-muted small text-truncate" style="max-width: 480px;">
                                        <i class="bi bi-geo-alt me-1"></i> ${order.shippingAddress}
                                    </div>
                                </div>
                                <div class="col-md-5 text-md-end">
                                    <div class="fw-bold fs-5 text-dark mb-2">${formatCurrency(order.totalAmount)}</div>
                                    <div class="d-flex justify-content-md-end gap-2">
                                        <button class="btn btn-sm btn-outline-custom" onclick="openOrderModal('${order.orderNumber}')">
                                            <i class="bi bi-eye me-1"></i>View Details
                                        </button>
                                        ${(order.status === 'PLACED' || order.status === 'PROCESSING') ? `
                                            <button class="btn btn-sm btn-outline-danger" onclick="cancelOrder(${order.id})">
                                                <i class="bi bi-x-circle me-1"></i>Cancel
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        showToast(err.message || 'Failed to load orders', 'error');
    }
}

function renderStatusBadge(status) {
    const s = (status || '').toUpperCase();
    let badgeClass = 'status-placed';
    let icon = 'bi-clock-history';

    if (s === 'PROCESSING') {
        badgeClass = 'status-processing';
        icon = 'bi-gear-wide-connected';
    } else if (s === 'SHIPPED') {
        badgeClass = 'status-shipped';
        icon = 'bi-truck';
    } else if (s === 'DELIVERED') {
        badgeClass = 'status-delivered';
        icon = 'bi-check2-circle';
    } else if (s === 'CANCELLED') {
        badgeClass = 'status-cancelled';
        icon = 'bi-x-circle';
    }

    return `<span class="order-status-badge ${badgeClass}"><i class="bi ${icon}"></i>${s}</span>`;
}

function openOrderModal(orderNumber) {
    const order = myOrders.find(o => o.orderNumber === orderNumber);
    if (!order) return;

    document.getElementById('modal-order-number').innerText = order.orderNumber;
    document.getElementById('modal-order-date').innerText = formatDate(order.createdAt);
    document.getElementById('modal-order-status-badge').innerHTML = renderStatusBadge(order.status);
    document.getElementById('modal-customer-name').innerText = order.customerName;
    document.getElementById('modal-customer-phone').innerText = order.customerPhone;
    document.getElementById('modal-shipping-address').innerText = order.shippingAddress;
    document.getElementById('modal-payment-method').innerText = order.paymentMethod;
    document.getElementById('modal-order-total').innerText = formatCurrency(order.totalAmount);

    // Update Stepper
    updateTrackerStepper(order.status);

    const itemsTbody = document.getElementById('modal-order-items-tbody');
    if (itemsTbody) {
        itemsTbody.innerHTML = (order.items || []).map(item => `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}" 
                             class="rounded-2 border" 
                             style="width: 48px; height: 48px; object-fit: cover;">
                        <span class="fw-semibold text-truncate" style="max-width: 250px;">${item.productName}</span>
                    </div>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-end">${formatCurrency(item.unitPrice)}</td>
                <td class="text-end fw-bold">${formatCurrency(item.subtotal)}</td>
            </tr>
        `).join('');
    }

    const modalEl = document.getElementById('orderDetailsModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function updateTrackerStepper(status) {
    const steps = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const tracker = document.getElementById('modal-order-tracker');
    if (!tracker) return;

    if (status === 'CANCELLED') {
        tracker.innerHTML = `
            <div class="alert alert-danger w-100 text-center my-3 py-2">
                <i class="bi bi-x-octagon-fill me-2 fs-5"></i>
                <strong>Order Cancelled</strong> — This order has been cancelled.
            </div>
        `;
        return;
    }

    const currentIndex = steps.indexOf(status);

    tracker.innerHTML = `
        <div class="order-tracker w-100">
            <div class="tracker-step ${currentIndex >= 0 ? (currentIndex === 0 ? 'active' : 'completed') : ''}">
                <div class="step-circle"><i class="bi bi-receipt"></i></div>
                <div class="step-label">Placed</div>
            </div>
            <div class="tracker-step ${currentIndex >= 1 ? (currentIndex === 1 ? 'active' : 'completed') : ''}">
                <div class="step-circle"><i class="bi bi-box-seam"></i></div>
                <div class="step-label">Processing</div>
            </div>
            <div class="tracker-step ${currentIndex >= 2 ? (currentIndex === 2 ? 'active' : 'completed') : ''}">
                <div class="step-circle"><i class="bi bi-truck"></i></div>
                <div class="step-label">Shipped</div>
            </div>
            <div class="tracker-step ${currentIndex >= 3 ? 'completed active' : ''}">
                <div class="step-circle"><i class="bi bi-check-lg"></i></div>
                <div class="step-label">Delivered</div>
            </div>
        </div>
    `;
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        const res = await apiFetch(`/orders/${orderId}/cancel`, {
            method: 'POST'
        });

        if (res && res.success) {
            showToast('Order cancelled successfully', 'info');
            loadMyOrders();
        }
    } catch (err) {
        showToast(err.message || 'Could not cancel order', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});
