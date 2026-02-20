<!-- Product Detail Page -->
<?php
$productSlug = isset($_GET['slug']) ? htmlspecialchars($_GET['slug']) : '';
?>

<section class="product-page">
    <div class="container">
        <div class="product-layout" id="productLayout">
            <!-- Media Slider -->
            <div class="media-slider" id="mediaSlider">
                <div class="slider-main" id="sliderMain">
                    <!-- Slides loaded dynamically -->
                    <div class="loading-skeleton" style="width:100%;height:100%"></div>
                </div>
                <button class="slider-nav-btn prev"><i data-lucide="chevron-right"></i></button>
                <button class="slider-nav-btn next"><i data-lucide="chevron-left"></i></button>
                <button class="fullscreen-btn"><i data-lucide="maximize-2"></i></button>
                <div class="slider-thumbnails" id="sliderThumbs"></div>
            </div>

            <!-- Product Info -->
            <div class="product-info" id="productInfo">
                <div class="loading-skeleton" style="width:200px;height:16px;margin-bottom:16px"></div>
                <div class="loading-skeleton" style="width:100%;height:32px;margin-bottom:16px"></div>
                <div class="loading-skeleton" style="width:100%;height:80px;margin-bottom:24px"></div>
            </div>
        </div>

        <!-- Comments -->
        <div class="comments-section container" style="max-width:900px;margin:0 auto">
            <h3><i data-lucide="message-square"></i> תגובות</h3>

            <form class="comment-form glass-card" id="commentForm" data-product-id="">
                <div class="form-row">
                    <div class="form-group">
                        <label for="commentName">שם *</label>
                        <input type="text" id="commentName" required placeholder="השם שלכם">
                    </div>
                    <div class="form-group">
                        <label for="commentEmail">אימייל</label>
                        <input type="email" id="commentEmail" placeholder="email@example.com">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-md)">
                    <label for="commentContent">תגובה *</label>
                    <textarea id="commentContent" required placeholder="כתבו את התגובה שלכם..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i data-lucide="send"></i>
                    שלח תגובה
                </button>
            </form>

            <div class="comment-list" id="commentList"></div>
        </div>

        <!-- Related Products -->
        <div class="related-products container" style="max-width:var(--container-max)">
            <div class="section-header">
                <h2>מוצרים נוספים</h2>
            </div>
            <div class="related-grid" id="relatedGrid"></div>
        </div>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const slug = '<?php echo $productSlug; ?>';
        if (!slug) { window.location.href = '?page=gallery'; return; }

        const product = await fetchProduct(slug);
        if (!product) {
            // ... (keep error handling)
            return;
        }

        // ── Tracking & Stats ──
        incrementProductView(product.id);
        const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]');
        const isLiked = likedProducts.includes(product.id);

        // Set comment form product ID
        document.getElementById('commentForm').setAttribute('data-product-id', product.id);

        // Build media slider (keep original logic)
        // ...

        // Build product info
        const catPath = product.categories
            ? `<a href="?page=gallery">גלריה</a> / <a href="?page=category&id=${product.categories.id}">${product.categories.name}</a>`
            : '<a href="?page=gallery">גלריה</a>';

        const specs = [];
        if (product.material) specs.push({ label: 'חומר', value: product.material });
        if (product.print_time) specs.push({ label: 'זמן הדפסה', value: product.print_time });
        if (product.dimensions) specs.push({ label: 'מידות', value: product.dimensions });
        if (product.categories?.name) specs.push({ label: 'קטגוריה', value: product.categories.name });

        const files = product.product_files || [];
        console.log('Product Files:', files); // Debug

        let priceHTML = '';
        if (product.price) {
            if (product.sale_price) {
                priceHTML = `
                    <div class="product-price sale">
                        <span class="old-price">₪${product.price}</span>
                        <span class="current-price">₪${product.sale_price}</span>
                        <span class="sale-badge">מבצע!</span>
                    </div>
                `;
            } else {
                priceHTML = `
                    <div class="product-price">
                        <span class="current-price">₪${product.price}</span>
                    </div>
                `;
            }
        }

        let infoHTML = `
        <div class="product-category-path">${catPath}</div>
        <div class="product-header-row" style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-md);margin-bottom:var(--space-sm)">
            <h1 style="margin:0">${product.title}</h1>
            <button class="like-btn ${isLiked ? 'active' : ''}" onclick="handleLike(this, '${product.id}')" title="אהבתי">
                <i data-lucide="heart" ${isLiked ? 'fill="currentColor"' : ''}></i>
                <span class="like-count">${product.like_count || 0}</span>
            </button>
        </div>
        
        <div class="product-meta-stats" style="display:flex;gap:var(--space-md);margin-bottom:var(--space-lg);color:var(--text-muted);font-size:0.85rem">
            <span><i data-lucide="eye" style="width:14px;height:14px;vertical-align:middle;margin-left:4px"></i> ${product.view_count || 0} צפיות</span>
            <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-left:4px"></i> פורסם ב-${new Date(product.created_at).toLocaleDateString('he-IL')}</span>
        </div>

        ${priceHTML}
        <p class="product-description">${product.description || ''}</p>
    `;

        if (specs.length) {
            infoHTML += `<div class="product-specs">${specs.map(s => `
            <div class="spec-item">
                <div class="spec-label">${s.label}</div>
                <div class="spec-value">${s.value}</div>
            </div>
        `).join('')}</div>`;
        }

        if (files.length > 0) {
            infoHTML += `
            <div class="download-section">
                <h3><i data-lucide="download"></i> קבצים להורדה</h3>
                <div class="download-list">${files.map(f => `
                    <div class="download-item glass-card">
                        <div class="file-info">
                            <div class="file-icon"><i data-lucide="file-box"></i></div>
                            <div>
                                <div class="file-name">${f.filename}</div>
                                <div class="file-size">${f.file_type?.toUpperCase() || 'FILE'} · ${formatFileSize(f.file_size)}</div>
                            </div>
                        </div>
                        <a href="${f.file_url}" class="download-btn" download target="_blank" onclick="trackDownload('${f.id}')">
                            <i data-lucide="download"></i> הורד
                        </a>
                    </div>
                `).join('')}</div>
            </div>
        `;
        }

        infoHTML += `
        <div class="share-section">
            <span>שיתוף בכיף:</span>
            <div class="share-buttons">
                <button class="share-btn whatsapp" onclick="shareProduct('${product.slug}', '${product.title.replace(/'/g, "\\'")}')" title="WhatsApp"><i data-lucide="message-circle"></i></button>
                <button class="share-btn facebook" data-share="facebook" title="Facebook"><i data-lucide="facebook"></i></button>
                <button class="share-btn twitter" data-share="twitter" title="Twitter"><i data-lucide="twitter"></i></button>
                <button class="share-btn copy-link" data-share="copy" title="העתק קישור"><i data-lucide="link"></i></button>
            </div>
        </div>
    `;

        document.getElementById('productInfo').innerHTML = infoHTML;
        // ... (title, related, comments etc.)

        // Update page title
        document.title = product.title + ' — מודלה';

        // Load related
        if (product.category_id) {
            loadRelatedProducts(product.category_id, product.id);
        }

        // Load comments
        loadComments(product.id);

        // Re-init everything
        if (typeof lucide !== 'undefined') lucide.createIcons();
        initMediaSlider();
        initShareButtons();
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
    initMediaSlider();
    initShareButtons();
    });

    // ── Comment Management ──
    async function loadComments(productId) {
        const container = document.getElementById('commentList');
        if (!container) return;

        const db = getSupabase();
        if (!db) return;

        const { data, error } = await db.from('comments')
            .select('*')
            .eq('product_id', productId)
            .eq('approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading comments:', error);
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="no-comments">אין תגובות עדיין. היו הראשונים להגיב!</p>';
            const headerCount = document.querySelector('.comments-section h3');
            if (headerCount) headerCount.innerHTML = `<i data-lucide="message-square"></i> תגובות <span class="comment-count-badge">0</span>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        const count = data.length;
        const headerCount = document.querySelector('.comments-section h3');
        if (headerCount) headerCount.innerHTML = `<i data-lucide="message-square"></i> תגובות <span class="comment-count-badge">${count}</span>`;

        container.innerHTML = data.map(c => `
            <div class="comment-item glass-card">
                <div class="comment-header">
                    <span class="comment-author">${c.author_name}</span>
                    <span class="comment-date">${new Date(c.created_at).toLocaleDateString('he-IL')}</span>
                </div>
                <div class="comment-content">${c.content}</div>
            </div>
        `).join('');
    }

    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = commentForm.getAttribute('data-product-id');
            const name = document.getElementById('commentName').value;
            const email = document.getElementById('commentEmail').value;
            const content = document.getElementById('commentContent').value;
            const submitBtn = commentForm.querySelector('button[type="submit"]');

            if (!productId) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" style="animation:spin 1s linear infinite"></i> שולח...';
            if (typeof lucide !== 'undefined') lucide.createIcons();

            const db = getSupabase();
            const { error } = await db.from('comments').insert({
                product_id: productId,
                author_name: name,
                author_email: email,
                content: content,
                approved: false // Require admin approval
            });

            if (error) {
                alert('שגיאה בשליחת התגובה: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-lucide="send"></i> שלח תגובה';
            } else {
                commentForm.innerHTML = `
                    <div class="comment-success">
                        <i data-lucide="check-circle" style="width:48px;height:48px;color:var(--color-primary)"></i>
                        <h4>התגובה נשלחה בהצלחה!</h4>
                        <p>התגובה שלך ממתינה לאישור מנהל המערכת ותופיע בקרוב.</p>
                        <button type="button" class="btn btn-secondary" onclick="location.reload()">שלח תגובה נוספת</button>
                    </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    function formatFileSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }
</script>