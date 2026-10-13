/**
 * ShopEasy - Home Page Operations
 */

async function loadHomeCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;

    try {
        const res = await apiFetch('/categories');
        if (res && res.success && res.data && res.data.length > 0) {
            container.innerHTML = res.data.map(cat => `
                <div class="col-6 col-md-4 col-lg-2 mb-3">
                    <a href="products.html?category=${cat.id}" class="category-card">
                        <img src="${cat.imageUrl || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200'}" alt="${cat.name}" class="category-card-img">
                        <div class="fw-bold fs-6 text-truncate">${cat.name}</div>
                    </a>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="col-12 text-center text-muted py-3">No categories available</div>';
        }
    } catch (err) {
        container.innerHTML = '<div class="col-12 text-center text-danger py-3">Failed to load categories</div>';
    }
}

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;

    try {
        const res = await apiFetch('/products/featured');
        if (res && res.success && res.data && res.data.length > 0) {
            container.innerHTML = res.data.map(p => renderProductCard(p)).join('');
        } else {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">No featured products found</div>';
        }
    } catch (err) {
        container.innerHTML = '<div class="col-12 text-center text-danger py-5">Failed to load featured products</div>';
    }
}

function renderProductCard(product) {
    const isAvailable = product.stockQuantity > 0;
    const badgeHtml = isAvailable 
        ? `<span class="product-badge badge-instock"><i class="bi bi-check-circle-fill me-1"></i>In Stock</span>`
        : `<span class="product-badge badge-outstock"><i class="bi bi-x-circle-fill me-1"></i>Out of Stock</span>`;

    return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="product-card h-100">
                <div class="product-img-wrapper">
                    ${badgeHtml}
                    <a href="product-details.html?id=${product.id}">
                        <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}" 
                             alt="${product.name}" 
                             class="product-img"
                             onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'">
                    </a>
                </div>
                <div class="product-body">
                    <div class="product-category">${product.categoryName || 'General'}</div>
                    <a href="product-details.html?id=${product.id}" class="product-title" title="${product.name}">
                        ${product.name}
                    </a>
                    <div class="product-rating">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-half"></i>
                        <span class="text-muted ms-1 fs-7">(4.8)</span>
                    </div>
                    <div class="product-price-row">
                        <div>
                            <span class="product-price">${formatCurrency(product.price)}</span>
                        </div>
                        <button class="btn btn-sm ${isAvailable ? 'btn-primary-custom' : 'btn-secondary'} px-3" 
                                onclick="quickAddToCart(${product.id}, event)"
                                ${!isAvailable ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus me-1"></i>Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function quickAddToCart(productId, event) {
    if (event) event.stopPropagation();

    if (!Storage.isLoggedIn()) {
        showToast('Please sign in to add items to your cart', 'info');
        setTimeout(() => {
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }, 1200);
        return;
    }

    try {
        const res = await apiFetch('/cart/add', {
            method: 'POST',
            body: { productId, quantity: 1 }
        });

        if (res && res.success) {
            showToast('Item added to cart!', 'success');
            refreshCartBadge();
        } else {
            showToast(res.message || 'Could not add to cart', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Could not add to cart', 'error');
    }
}

function handleSearchSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('search-query-input');
    if (input && input.value.trim()) {
        window.location.href = `products.html?keyword=${encodeURIComponent(input.value.trim())}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHomeCategories();
    loadFeaturedProducts();
});
