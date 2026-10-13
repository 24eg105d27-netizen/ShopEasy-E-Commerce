/**
 * ShopEasy - Shopping Cart Manager
 */

let cartData = null;
let appliedDiscount = 0; // percentage or fixed

async function loadCart() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const cartWrapper = document.getElementById('cart-content-wrapper');

    if (!Storage.isLoggedIn()) {
        if (cartWrapper) cartWrapper.classList.add('d-none');
        if (emptyState) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="bi bi-person-lock empty-state-icon text-primary"></i>
                <div class="empty-state-title">Sign In to View Your Cart</div>
                <div class="empty-state-desc">Your cart items are saved in your account. Please log in or register to manage your cart and place orders.</div>
                <div class="d-flex justify-content-center gap-2">
                    <a href="login.html?redirect=cart.html" class="btn btn-primary-custom">Sign In</a>
                    <a href="register.html" class="btn btn-outline-custom">Create Account</a>
                </div>
            `;
        }
        return;
    }

    try {
        const res = await apiFetch('/cart');
        if (res && res.success && res.data) {
            cartData = res.data;
            renderCartUI();
        }
    } catch (err) {
        showToast(err.message || 'Failed to load cart', 'error');
    }
}

function renderCartUI() {
    const emptyState = document.getElementById('cart-empty-state');
    const cartWrapper = document.getElementById('cart-content-wrapper');
    const itemsTbody = document.getElementById('cart-items-tbody');

    if (!cartData || !cartData.items || cartData.items.length === 0) {
        if (cartWrapper) cartWrapper.classList.add('d-none');
        if (emptyState) emptyState.classList.remove('d-none');
        refreshCartBadge();
        return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (cartWrapper) cartWrapper.classList.remove('d-none');

    if (itemsTbody) {
        itemsTbody.innerHTML = cartData.items.map(item => `
            <tr>
                <td style="width: 100px;">
                    <a href="product-details.html?id=${item.productId}">
                        <img src="${item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}" 
                             alt="${item.productName}" 
                             class="rounded-3 border" 
                             style="width: 80px; height: 80px; object-fit: cover;">
                    </a>
                </td>
                <td>
                    <a href="product-details.html?id=${item.productId}" class="fw-bold text-decoration-none text-dark d-block">
                        ${item.productName}
                    </a>
                    <div class="text-muted small mt-1">Unit Price: ${formatCurrency(item.unitPrice)}</div>
                    ${!item.inStock ? `<span class="badge bg-danger-subtle text-danger mt-1">Exceeds available stock (${item.availableStock} left)</span>` : ''}
                </td>
                <td style="width: 150px;">
                    <div class="input-group input-group-sm" style="max-width: 120px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateItemQty(${item.id}, ${item.quantity - 1})">
                            <i class="bi bi-dash"></i>
                        </button>
                        <input type="text" class="form-control text-center bg-white" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary" type="button" onclick="updateItemQty(${item.id}, ${item.quantity + 1})">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td class="fw-bold text-primary" style="width: 130px;">
                    ${formatCurrency(item.subtotal)}
                </td>
                <td style="width: 60px;">
                    <button class="btn btn-sm text-danger border-0" onclick="removeItem(${item.id})" title="Remove">
                        <i class="bi bi-trash3 fs-5"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateSummaryBox();
    refreshCartBadge();
}

function updateSummaryBox() {
    if (!cartData) return;

    let subtotal = cartData.subtotal;
    let shipping = cartData.shippingFee;
    let tax = cartData.tax;

    let discountAmount = 0;
    if (appliedDiscount > 0) {
        discountAmount = (subtotal * (appliedDiscount / 100));
    }

    let finalTotal = Math.max(0, subtotal - discountAmount) + shipping + tax;

    document.getElementById('summary-subtotal').innerText = formatCurrency(subtotal);
    document.getElementById('summary-shipping').innerText = shipping === 0 ? 'FREE' : formatCurrency(shipping);
    document.getElementById('summary-tax').innerText = formatCurrency(tax);

    const discountRow = document.getElementById('summary-discount-row');
    const discountVal = document.getElementById('summary-discount');
    if (appliedDiscount > 0 && discountRow && discountVal) {
        discountRow.classList.remove('d-none');
        discountVal.innerText = `-${formatCurrency(discountAmount)} (${appliedDiscount}%)`;
    } else if (discountRow) {
        discountRow.classList.add('d-none');
    }

    document.getElementById('summary-total').innerText = formatCurrency(finalTotal);
    document.getElementById('summary-items-count').innerText = `${cartData.totalItems} item${cartData.totalItems === 1 ? '' : 's'}`;
}

async function updateItemQty(cartItemId, newQty) {
    try {
        const res = await apiFetch(`/cart/items/${cartItemId}`, {
            method: 'PUT',
            body: { quantity: newQty }
        });

        if (res && res.success) {
            cartData = res.data;
            renderCartUI();
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function removeItem(cartItemId) {
    try {
        const res = await apiFetch(`/cart/items/${cartItemId}`, {
            method: 'DELETE'
        });

        if (res && res.success) {
            cartData = res.data;
            showToast('Item removed from cart', 'info');
            renderCartUI();
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function clearEntireCart() {
    if (!confirm('Are you sure you want to remove all items from your cart?')) return;

    try {
        const res = await apiFetch('/cart/clear', {
            method: 'DELETE'
        });

        if (res && res.success) {
            cartData = { items: [], subtotal: 0, shippingFee: 0, tax: 0, total: 0, totalItems: 0 };
            showToast('Cart cleared', 'info');
            renderCartUI();
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (code === 'WELCOME10' || code === 'EASY10') {
        appliedDiscount = 10;
        showToast(`Promo code "${code}" applied: 10% OFF!`, 'success');
        updateSummaryBox();
    } else if (code === 'SHOPEASY20') {
        appliedDiscount = 20;
        showToast(`Promo code "${code}" applied: 20% OFF!`, 'success');
        updateSummaryBox();
    } else {
        showToast('Invalid coupon code. Try WELCOME10 for 10% off.', 'warning');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});
