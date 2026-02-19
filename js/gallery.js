/**
 * Gallery JS — Masonry grid with filtering, search, infinite scroll
 */

document.addEventListener('DOMContentLoaded', () => {
    initGallery();
});

let galleryPage = 0;
const ITEMS_PER_PAGE = 12;
let currentCategory = null;
let currentSearch = '';
let isLoading = false;
let hasMore = true;

async function initGallery() {
    const grid = document.getElementById('masonryGrid');
    if (!grid) return;

    await loadCategories();
    await loadProducts();
    initSearch();
    initFilterPills();
    initInfiniteScroll();
}

async function loadCategories() {
    const container = document.getElementById('filterPills');
    if (!container) return;

    const categories = await fetchCategories();
    let html = '<button class="filter-pill active" data-category="">הכל</button>';
    categories.forEach(cat => {
        html += `<button class="filter-pill" data-category="${cat.id}">${cat.name}</button>`;
    });
    container.innerHTML = html;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function loadProducts(append = false) {
    const grid = document.getElementById('masonryGrid');
    if (!grid || isLoading) return;

    isLoading = true;

    const products = await fetchProducts({
        category: currentCategory,
        search: currentSearch,
        limit: ITEMS_PER_PAGE,
        offset: galleryPage * ITEMS_PER_PAGE
    });

    hasMore = products.length === ITEMS_PER_PAGE;

    if (!append) grid.innerHTML = '';

    if (products.length === 0 && !append) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;column-span:all">
                <i data-lucide="package-x"></i>
                <h3>לא נמצאו מוצרים</h3>
                <p>נסו לחפש עם מילות מפתח אחרות</p>
            </div>
        `;
    } else {
        products.forEach((product, i) => {
            const card = document.createElement('div');
            card.innerHTML = createProductCard(product);
            const item = card.firstElementChild;
            item.style.animationDelay = `${i * 0.1}s`;
            grid.appendChild(item);
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    isLoading = false;

    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    }
}

function initSearch() {
    const searchInput = document.getElementById('gallerySearch');
    if (!searchInput) return;

    let timeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            currentSearch = e.target.value.trim();
            galleryPage = 0;
            loadProducts();
        }, 400);
    });
}

function initFilterPills() {
    const container = document.getElementById('filterPills');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (!pill) return;

        container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const catId = pill.getAttribute('data-category');
        currentCategory = catId || null;
        galleryPage = 0;
        loadProducts();
    });
}

function initInfiniteScroll() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            galleryPage++;
            loadProducts(true);
        });
    }
}
