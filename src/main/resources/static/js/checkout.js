/**
 * ShopEasy - Checkout Handler
 */

let checkoutCart = null;

async function initCheckout() {
    if (!Storage.isLoggedIn()) {
        showToast('Please sign in to complete your checkout', 'info');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=checkout.html';
        }, 1000);
        return;
    }

    const user = Storage.getUser();
    if (user) {
        document.getElementById('checkout-name').value = user.name || '';
        document.getElementById('checkout-email').value = user.email || '';
        document.getElementById('checkout-phone').value = user.phone || '';
    }

    await loadCheckoutSummary();
}

async function loadCheckoutSummary() {
    const listContainer = document.getElementById('checkout-items-list');

    try {
        const res = await apiFetch('/cart');
        if (res && res.success && res.data) {
            checkoutCart = res.data;

            if (!checkoutCart.items || checkoutCart.items.length === 0) {
                showToast('Your cart is empty', 'warning');
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1200);
                return;
            }

            if (listContainer) {
                listContainer.innerHTML = checkoutCart.items.map(item => `
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${item.productImageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}" 
                                 class="rounded-2 border" 
                                 style="width: 50px; height: 50px; object-fit: cover;">
                            <div>
                                <div class="fw-bold fs-7 text-truncate" style="max-width: 180px;">${item.productName}</div>
                                <div class="text-muted small">Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}</div>
                            </div>
                        </div>
                        <div class="fw-bold">${formatCurrency(item.subtotal)}</div>
                    </div>
                `).join('');
            }

            document.getElementById('checkout-subtotal').innerText = formatCurrency(checkoutCart.subtotal);
            document.getElementById('checkout-shipping').innerText = checkoutCart.shippingFee === 0 ? 'FREE' : formatCurrency(checkoutCart.shippingFee);
            document.getElementById('checkout-tax').innerText = formatCurrency(checkoutCart.tax);
            document.getElementById('checkout-total').innerText = formatCurrency(checkoutCart.total);
        }
    } catch (err) {
        showToast(err.message || 'Error fetching cart details', 'error');
    }
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('place-order-btn');
    const originalText = btn.innerHTML;

    const customerName = document.getElementById('checkout-name').value.trim();
    const customerEmail = document.getElementById('checkout-email').value.trim();
    const customerPhone = document.getElementById('checkout-phone').value.trim();
    const street = document.getElementById('checkout-street').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const state = document.getElementById('checkout-state').value.trim();
    const zipCode = document.getElementById('checkout-zip').value.trim();

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'Cash on Delivery';

    if (!customerName || !customerEmail || !customerPhone || !street || !city || !state || !zipCode) {
        showToast('Please fill in all customer and shipping address fields', 'warning');
        return;
    }

    const shippingAddress = `${street}, ${city}, ${state} - ${zipCode}, India`;

    try {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Securing & Placing Order...`;

        const res = await apiFetch('/orders/checkout', {
            method: 'POST',
            body: {
                customerName,
                customerEmail,
                customerPhone,
                shippingAddress,
                paymentMethod
            }
        });

        if (res && res.success && res.data) {
            showToast('Order placed successfully!', 'success');
            refreshCartBadge();

            setTimeout(() => {
                window.location.href = `order-confirmation.html?orderNumber=${encodeURIComponent(res.data.orderNumber)}`;
            }, 800);
        } else {
            showToast(res.message || 'Checkout failed', 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } catch (err) {
        showToast(err.message || 'Checkout failed. Please check stock availability.', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});
