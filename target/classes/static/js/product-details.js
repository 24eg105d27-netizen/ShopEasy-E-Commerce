/**
 * ShopEasy - Single Product Details Handler
 */

let currentProduct = null;
let currentQuantity = 1;

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        showProductNotFound('No product ID provided');
        return;
    }

    try {
        const res = await apiFetch(`/products/${productId}`);
        if (res && res.success && res.data) {
            currentProduct = res.data;
            renderProductDetails(currentProduct);
            loadRelatedProducts(currentProduct.categoryId, currentProduct.id);
        } else {
            showProductNotFound('Product not found');
        }
    } catch (err) {
        showProductNotFound(err.message);
    }
}

function renderProductDetails(product) {
    document.title = `${product.name} — ShopEasy`;

    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    const breadcrumbProduct = document.getElementById('breadcrumb-product');
    if (breadcrumbCategory) {
        breadcrumbCategory.innerText = product.categoryName || 'Products';
        breadcrumbCategory.href = `products.html?category=${product.categoryId || ''}`;
    }
    if (breadcrumbProduct) {
        breadcrumbProduct.innerText = product.name;
    }

    const img = document.getElementById('detail-image');
    if (img) {
        img.src = product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
        img.alt = product.name;
    }

    const title = document.getElementById('detail-title');
    if (title) title.innerText = product.name;

    const categoryBadge = document.getElementById('detail-category-badge');
    if (categoryBadge) categoryBadge.innerText = product.categoryName || 'General';

    const price = document.getElementById('detail-price');
    if (price) price.innerText = formatCurrency(product.price);

    const stockBadge = document.getElementById('detail-stock-badge');
    const isAvailable = product.stockQuantity > 0;
    if (stockBadge) {
        if (isAvailable) {
            stockBadge.className = 'product-badge badge-instock position-static d-inline-flex';
            stockBadge.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> In Stock (${product.stockQuantity} available)`;
        } else {
            stockBadge.className = 'product-badge badge-outstock position-static d-inline-flex';
            stockBadge.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i> Out of Stock`;
        }
    }

    const desc = document.getElementById('detail-description');
    if (desc) desc.innerText = product.description || 'No description provided for this product.';

    const addBtn = document.getElementById('detail-add-btn');
    const buyBtn = document.getElementById('detail-buy-btn');
    const qtyInput = document.getElementById('detail-qty');

    if (!isAvailable) {
        if (addBtn) addBtn.disabled = true;
        if (buyBtn) buyBtn.disabled = true;
        if (qtyInput) qtyInput.disabled = true;
    }
}

function adjustQuantity(delta) {
    if (!currentProduct) return;
    const input = document.getElementById('detail-qty');
    if (!input) return;

    let qty = parseInt(input.value) || 1;
    qty += delta;

    if (qty < 1) qty = 1;
    if (qty > currentProduct.stockQuantity) {
        qty = currentProduct.stockQuantity;
        showToast(`Only ${currentProduct.stockQuantity} items in stock`, 'warning');
    }

    input.value = qty;
    currentQuantity = qty;
}

async function addCurrentToCart(goToCheckout = false) {
    if (!currentProduct) return;

    if (!Storage.isLoggedIn()) {
        showToast('Please sign in to add items to your cart', 'info');
        setTimeout(() => {
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        }, 1200);
        return;
    }

    const input = document.getElementById('detail-qty');
    const quantity = input ? parseInt(input.value) || 1 : 1;

    try {
        const res = await apiFetch('/cart/add', {
            method: 'POST',
            body: {
                productId: currentProduct.id,
                quantity: quantity
            }
        });

        if (res && res.success) {
            refreshCartBadge();
            if (goToCheckout) {
                window.location.href = 'checkout.html';
            } else {
                showToast(`Added ${quantity} × ${currentProduct.name} to cart!`, 'success');
            }
        }
    } catch (err) {
        showToast(err.message || 'Failed to add item to cart', 'error');
    }
}

async function loadRelatedProducts(categoryId, excludeId) {
    const container = document.getElementById('related-products-container');
    if (!container || !categoryId) return;

    try {
        const res = await apiFetch(`/products?categoryId=${categoryId}`);
        if (res && res.success && res.data) {
            const filtered = res.data.filter(p => p.id !== excludeId).slice(0, 4);
            if (filtered.length > 0) {
                container.innerHTML = filtered.map(p => renderProductCard(p)).join('');
            } else {
                document.getElementById('related-section')?.classList.add('d-none');
            }
        }
    } catch (e) {
        // quiet fail for related section
    }
}

function showProductNotFound(msg) {
    const content = document.getElementById('product-details-content');
    if (content) {
        content.innerHTML = `
            <div class="col-12 py-5 text-center">
                <div class="empty-state">
                    <i class="bi bi-box-seam empty-state-icon"></i>
                    <div class="empty-state-title">Product Not Found</div>
                    <div class="empty-state-desc">${msg || 'The product you are looking for does not exist or has been removed.'}</div>
                    <a href="products.html" class="btn btn-primary-custom">Browse All Products</a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});
