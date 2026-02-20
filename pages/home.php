<!-- Homepage: Hero + Categories + Featured Products -->

<!-- Hero Section -->
<section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-grid-pattern"></div>
    <div class="hero-content">
        <div class="hero-badge">
            <i data-lucide="sparkles"></i>
            סטודיו יצירתי להדפסת תלת מימד
        </div>
        <h1>
            מדמיון<br>
            <span class="highlight">למציאות תלת־ממדית</span>
        </h1>
        <p class="hero-subtitle">
            מודלה הופכת כל רעיון למוצר מוחשי — בהתאמה אישית, בדיוק מרבי,
            ובתהליך מלא משלבי הדמיון ועד ההדפסה
        </p>
        <div class="hero-buttons">
            <a href="?page=gallery" class="btn btn-primary">
                <i data-lucide="grid-3x3"></i>
                ראה דוגמאות מהשטח
            </a>
            <a href="?page=contact" class="btn btn-secondary">
                <i data-lucide="send"></i>
                שלח רעיון, ניצור יחד
            </a>
        </div>
        <div class="hero-stats">
            <div class="hero-stat animate-on-scroll">
                <div class="stat-number" data-count="500">0</div>
                <div class="stat-label">מוצרים הודפסו</div>
            </div>
            <div class="hero-stat animate-on-scroll">
                <div class="stat-number" data-count="200">0</div>
                <div class="stat-label">לקוחות מרוצים</div>
            </div>
            <div class="hero-stat animate-on-scroll">
                <div class="stat-number" data-count="50">0</div>
                <div class="stat-label">קבצים להורדה</div>
            </div>
        </div>
    </div>
    <div class="hero-scroll-indicator">
        <span>גלול למטה</span>
        <i data-lucide="chevrons-down"></i>
    </div>
</section>

<!-- Categories Section -->
<section class="section">
    <div class="container">
        <div class="section-header animate-on-scroll">
            <h2>פתרונות תלת מימד</h2>
            <p>יצירתיות שימושית — מגוון רחב של פתרונות לכל צורך</p>
        </div>
        <div class="categories-grid" id="categoriesGrid">
            <!-- Loaded dynamically, fallback static content -->
            <a href="?page=gallery&cat=custom" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="palette"></i></div>
                <h3>התאמה אישית</h3>
                <p>מה שלא מצאת — ניצור במיוחד בשבילך</p>
            </a>
            <a href="?page=gallery&cat=medical" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="heart-pulse"></i></div>
                <h3>פתרונות רפואיים</h3>
                <p>מודלים ועזרים רפואיים מדויקים</p>
            </a>
            <a href="?page=gallery&cat=home" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="home"></i></div>
                <h3>פתרונות לבית</h3>
                <p>אביזרים ופתרונות חכמים לבית</p>
            </a>
            <a href="?page=gallery&cat=gifts" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="gift"></i></div>
                <h3>מתנות בהתאמה אישית</h3>
                <p>מתנות ייחודיות ובלתי נשכחות</p>
            </a>
            <a href="?page=gallery&cat=prototype" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="cpu"></i></div>
                <h3>אב טיפוס</h3>
                <p>רעיון שהופך למוצר מוחשי</p>
            </a>
            <a href="?page=gallery&cat=internet" class="category-card glass-card animate-on-scroll">
                <div class="cat-icon"><i data-lucide="globe"></i></div>
                <h3>מוצרים מהאינטרנט</h3>
                <p>הדפסת מודלים פופולריים מהרשת</p>
            </a>
        </div>
    </div>
</section>

<!-- Featured Products -->
<section class="section" style="background: var(--bg-secondary);">
    <div class="container">
        <div class="section-header animate-on-scroll">
            <h2>העבודות שלנו</h2>
            <p>כל פרויקט מתחיל בחלום קטן — הנה חלק מהם</p>
        </div>
        <div class="featured-scroll" id="featuredScroll">
            <!-- Loaded dynamically via JS -->
        </div>
        <div style="text-align:center;margin-top:var(--space-lg)">
            <a href="?page=gallery" class="btn btn-secondary">
                <i data-lucide="arrow-left"></i>
                לכל העבודות
            </a>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="section">
    <div class="container">
        <div class="glass-card animate-on-scroll"
            style="text-align:center;padding:var(--space-3xl);position:relative;overflow:hidden">
            <div style="position:absolute;inset:0;background:var(--gradient-subtle)"></div>
            <div style="position:relative;z-index:1">
                <h2 style="font-size:clamp(1.5rem,4vw,2.2rem);font-weight:800;margin-bottom:var(--space-md)">
                    רעיון. עיצוב. הדפסה.</h2>
                <p style="color:var(--text-secondary);max-width:500px;margin:0 auto var(--space-xl);font-size:1.05rem">
                    אנו מלווים אותך מהשלב הרעיוני — עד שהמוצר בידיים שלך
                </p>
                <a href="?page=contact" class="btn btn-primary">
                    <i data-lucide="send"></i>
                    שלח רעיון, ניצור יחד
                </a>
            </div>
        </div>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        initCounters();

        // Load real stats
        const stats = await fetchStats();
        const statProducts = document.querySelector('.hero-stat:nth-child(1) .stat-number');
        const statCustomers = document.querySelector('.hero-stat:nth-child(2) .stat-number');
        const statFiles = document.querySelector('.hero-stat:nth-child(3) .stat-number');

        if (statProducts) statProducts.setAttribute('data-count', stats.products || 0);
        if (statCustomers) statCustomers.setAttribute('data-count', stats.customers || 0);
        if (statFiles) statFiles.setAttribute('data-count', stats.files || 0);

        // Re-trigger counters
        initCounters();

        // Load featured products
        const featured = await fetchProducts({ featured: true, limit: 8 });
        const container = document.getElementById('featuredScroll');
        container.innerHTML = featured.map(product => {
            const cover = product.product_media?.find(m => m.is_cover) || product.product_media?.[0];
            const imgUrl = cover?.url || '';
            const slug = product.slug || product.id;
            const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]');
            const isLiked = likedProducts.includes(product.id);

            let priceHTML = '';
            if (product.price) {
                if (product.sale_price) {
                    priceHTML = `
                            <div class="card-price sale">
                                <span class="old-price">₪${product.price}</span>
                                <span class="current-price">₪${product.sale_price}</span>
                            </div>
                        `;
                } else {
                    priceHTML = `<div class="card-price"><span class="current-price">₪${product.price}</span></div>`;
                }
            }

            const commentCount = product.comments?.[0]?.count || 0;
            const commentHTML = commentCount > 0 ? `<span class="badge badge-outline" style="font-size:0.75rem;padding:1px 6px"><i data-lucide="message-square" style="width:11px;height:11px;margin-left:3px"></i>${commentCount}</span>` : '';

            return `
                <div class="featured-card glass-card" onclick="window.location.href='?page=product&slug=${slug}'" style="cursor:pointer">
                    <div class="card-media">
                        <img src="${imgUrl}" alt="${product.title}" loading="lazy">
                        <div class="card-overlay"></div>
                        <div class="card-actions" style="position:absolute;top:var(--space-sm);left:var(--space-sm);z-index:5;display:flex;gap:4px">
                            <button class="item-action-btn like-btn ${isLiked ? 'active' : ''}" onclick="handleLike(event, '${product.id}')" title="אהבתי" style="width:32px;height:32px;background:rgba(0,0,0,0.5);backdrop-filter:blur(5px);border-radius:50%;color:white;display:flex;align-items:center;justify-content:center;border:none;transition:all 0.3s">
                                <i data-lucide="heart" style="width:14px;height:14px" ${isLiked ? 'fill="currentColor"' : ''}></i>
                                <span class="like-count" style="font-size:0.7rem;margin-right:2px">${product.like_count || 0}</span>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-title">${product.title}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div style="display:flex;align-items:center;gap:var(--space-sm)">
                                <div class="card-category" style="margin-bottom:0">${product.categories?.name || ''}</div>
                                ${commentHTML}
                                <span class="badge badge-outline" style="font-size:0.75rem;padding:1px 6px"><i data-lucide="eye" style="width:11px;height:11px;margin-left:3px"></i>${product.view_count || 0}</span>
                            </div>
                            ${priceHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else if (container) {
        container.innerHTML = '<p style="color:var(--text-muted);padding:var(--space-xl)">העבודות שלנו יופיעו כאן בקרוב</p>';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    });
</script>