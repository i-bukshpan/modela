<!-- Category Page: filtered gallery by category -->
<?php
$categoryId = isset($_GET['id']) ? htmlspecialchars($_GET['id']) : '';
$categorySlug = isset($_GET['cat']) ? htmlspecialchars($_GET['cat']) : '';
?>

<section class="category-header">
    <div class="container">
        <h1 id="categoryTitle" class="gradient-text">טוען...</h1>
        <p id="categoryDesc"></p>
        <div class="subcategories-bar" id="subcategoriesBar"></div>
    </div>
</section>

<section class="section" style="padding-top: var(--space-xl);">
    <div class="container">
        <div class="gallery-controls">
            <div class="search-box">
                <input type="text" id="gallerySearch" placeholder="חיפוש בקטגוריה..." autocomplete="off">
                <i data-lucide="search" class="search-icon"></i>
            </div>
        </div>

        <div class="filter-pills" id="filterPills" style="display:none"></div>

        <div class="masonry-grid" id="masonryGrid">
            <div class="masonry-item" style="height:300px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
            <div class="masonry-item" style="height:400px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
            <div class="masonry-item" style="height:250px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
        </div>

        <div class="load-more-container">
            <button class="btn btn-secondary" id="loadMoreBtn" style="display:none">
                <i data-lucide="plus"></i>
                טען עוד מוצרים
            </button>
        </div>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const categoryId = '<?php echo $categoryId; ?>';
        const categorySlug = '<?php echo $categorySlug; ?>';

        // Set global category filter
        if (categoryId) currentCategory = categoryId;

        // Try to load category info
        const categories = await fetchCategories();
        let category = null;

        if (categoryId) {
            category = categories.find(c => c.id == categoryId);
        } else if (categorySlug) {
            category = categories.find(c => c.slug === categorySlug);
            if (category) currentCategory = category.id;
        }

        if (category) {
            document.getElementById('categoryTitle').textContent = category.name;
            document.getElementById('categoryDesc').textContent = category.description || '';
            document.title = category.name + ' — מודלה';

            // Load subcategories
            const subcats = await fetchCategories(category.id);
            const subBar = document.getElementById('subcategoriesBar');
            if (subcats.length > 0 && subBar) {
                subBar.innerHTML = subcats.map(sub =>
                    `<a href="?page=category&id=${sub.id}" class="filter-pill">${sub.name}</a>`
                ).join('');
            }
        } else {
            document.getElementById('categoryTitle').textContent = 'קטגוריה';
        }

        // Load products
        await loadProducts();
        initSearch();
        initInfiniteScroll();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
</script>