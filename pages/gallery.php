<!-- Gallery Page: Masonry grid with filters -->

<section class="section" style="padding-top: calc(var(--nav-height) + var(--space-2xl));">
    <div class="container">
        <div class="section-header">
            <h2>העבודות שלנו</h2>
            <p>גלו את כל המוצרים שיצרנו — סננו לפי קטגוריה או חפשו מוצר ספציפי</p>
        </div>

        <!-- Controls -->
        <div class="gallery-controls">
            <div class="search-box">
                <input type="text" id="gallerySearch" placeholder="חיפוש מוצרים..." autocomplete="off">
                <i data-lucide="search" class="search-icon"></i>
            </div>
        </div>

        <!-- Filter pills -->
        <div class="filter-pills" id="filterPills">
            <button class="filter-pill active" data-category="">הכל</button>
        </div>

        <!-- Masonry Grid -->
        <div class="masonry-grid" id="masonryGrid">
            <!-- Loading skeletons -->
            <div class="masonry-item" style="height:300px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
            <div class="masonry-item" style="height:400px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
            <div class="masonry-item" style="height:250px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
            <div class="masonry-item" style="height:350px">
                <div class="loading-skeleton" style="width:100%;height:100%"></div>
            </div>
        </div>

        <!-- Load More -->
        <div class="load-more-container">
            <button class="btn btn-secondary" id="loadMoreBtn" style="display:none">
                <i data-lucide="plus"></i>
                טען עוד מוצרים
            </button>
        </div>
    </div>
</section>