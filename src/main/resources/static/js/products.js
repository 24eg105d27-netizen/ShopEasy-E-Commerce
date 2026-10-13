/**
 * ShopEasy - Product Catalog, Filtering, and Search
 */

let allCategories = [];
let currentFilter = {
    categoryId: null,
    keyword: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'newest'
};

async function initProductPage() {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) currentFilter.categoryId = params.get('category');
    if (params.get('keyword')) currentFilter.keyword = params.get('keyword');
    if (params.get('sortBy')) currentFilter.sortBy = params.get('sortBy');

    const searchBox = document.getElementById('catalog-search-input');
    if (searchBox && currentFilter.keyword) {
        searchBox.value = currentFilter.keyword;
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && currentFilter.sortBy) {
        sortSelect.value = currentFilter.sortBy;
    }

    await loadCategoriesFilter();
    await fetchProducts();
}

async function loadCategoriesFilter() {
    const filterContainer = document.getElementById('category-filter-list');
    if (!filterContainer) return;

    try {
        const res = await apiFetch('/categories');
        if (res && res.success && res.data) {
            allCategories = res.data;
            let html = `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="categoryRadio" id="cat-all" value="" ${!currentFilter.categoryId ? 'checked' : ''} onchange="onCategoryChange('')">
                    <label class="form-check-label" for="cat-all">All Categories</label>
                </div>
            `;
            html += allCategories.map(cat => `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="categoryRadio" id="cat-${cat.id}" value="${cat.id}" ${currentFilter.categoryId == cat.id ? 'checked' : ''} onchange="onCategoryChange(${cat.id})">
                    <label class="form-check-label" for="cat-${cat.id}">${cat.name}</label>
                </div>
            `).join('');

            filterContainer.innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

async function fetchProducts() {
    const grid = document.getElementById('products-grid');
    const countDisplay = document.getElementById('products-count');
    if (!grid) return;

    grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-loading mb-3"></div>
            <div class="text-muted fw-semibold">Loading products...</div>
        </div>
    `;

    const queryParams = new URLSearchParams();
    if (currentFilter.categoryId) queryParams.append('categoryId', currentFilter.categoryId);
    if (currentFilter.keyword) queryParams.append('keyword', currentFilter.keyword);
    if (currentFilter.minPrice) queryParams.append('minPrice', currentFilter.minPrice);
    if (currentFilter.maxPrice) queryParams.append('maxPrice', currentFilter.maxPrice);
    if (currentFilter.sortBy) queryParams.append('sortBy', currentFilter.sortBy);

    try {
        const res = await apiFetch(`/products?${queryParams.toString()}`);
        if (res && res.success && res.data) {
            const products = res.data;
            if (countDisplay) {
                countDisplay.innerText = `${products.length} product${products.length === 1 ? '' : 's'} found`;
            }

            if (products.length === 0) {
                grid.innerHTML = `
                    <div class="col-12">
                        <div class="empty-state">
                            <i class="bi bi-search empty-state-icon"></i>
                            <div class="empty-state-title">No products found</div>
                            <div class="empty-state-desc">We couldn't find any items matching your filters or search terms. Try clearing some filters.</div>
                            <button class="btn btn-outline-custom" onclick="resetFilters()">Reset All Filters</button>
                        </div>
                    </div>
                `;
                return;
            }

            grid.innerHTML = products.map(p => renderProductCard(p)).join('');
        }
    } catch (err) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5 text-danger">
                <i class="bi bi-exclamation-triangle fs-1 d-block mb-2"></i>
                <div class="fw-bold fs-5">Failed to load products</div>
                <div class="text-muted">${err.message}</div>
            </div>
        `;
    }
}

function onCategoryChange(catId) {
    currentFilter.categoryId = catId ? catId : null;
    fetchProducts();
}

function onPriceChange(min, max) {
    currentFilter.minPrice = min !== null ? min : null;
    currentFilter.maxPrice = max !== null ? max : null;
    fetchProducts();
}

function onSortChange(sortBy) {
    currentFilter.sortBy = sortBy;
    fetchProducts();
}

function onSearchInput(e) {
    e.preventDefault();
    const input = document.getElementById('catalog-search-input');
    if (input) {
        currentFilter.keyword = input.value.trim();
        fetchProducts();
    }
}

function resetFilters() {
    currentFilter = {
        categoryId: null,
        keyword: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'newest'
    };
    const searchBox = document.getElementById('catalog-search-input');
    if (searchBox) searchBox.value = '';
    const allCatRadio = document.getElementById('cat-all');
    if (allCatRadio) allCatRadio.checked = true;
    const allPriceRadio = document.getElementById('price-all');
    if (allPriceRadio) allPriceRadio.checked = true;
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'newest';

    fetchProducts();
}

document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
});
