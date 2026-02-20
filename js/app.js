/**
 * Main Application JavaScript
 * Handles: navbar scroll, mobile menu, scroll animations, back-to-top
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollAnimations();
    initBackToTop();
    initMobileMenu();
});

// ── Navbar scroll effect ──
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

// ── Mobile menu ──
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    const overlay = document.getElementById('mobileOverlay');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
        document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';

        // Update icon
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.setAttribute('data-lucide', links.classList.contains('open') ? 'x' : 'menu');
            if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [toggle] });
        }
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            links.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close on nav link click
    links.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ── Scroll animations (Intersection Observer) ──
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
}

// ── Back to top button ──
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Counter animation ──
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const step = target / (duration / 16);

    function update() {
        start += step;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            return;
        }
        element.textContent = Math.floor(start).toLocaleString();
        requestAnimationFrame(update);
    }
    update();
}

// ── Init counters on scroll ──
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

// ── Date formatting in Hebrew ──
function formatDateHe(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ── Like Logic (Global) ──
async function handleLike(e, productId) {
    if (e) e.stopPropagation();
    const btn = e.currentTarget || e;
    const isActive = btn.classList.contains('active');

    const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]');
    const countSpan = btn.querySelector('.like-count');
    const icon = btn.querySelector('i');

    if (isActive) {
        // Unlike
        btn.classList.remove('active');
        if (countSpan) countSpan.textContent = Math.max(0, parseInt(countSpan.textContent) - 1);
        if (icon) icon.removeAttribute('fill');

        const index = likedProducts.indexOf(productId);
        if (index > -1) likedProducts.splice(index, 1);
        localStorage.setItem('liked_products', JSON.stringify(likedProducts));

        if (typeof decrementProductLike === 'function') {
            await decrementProductLike(productId);
        }
    } else {
        // Like
        btn.classList.add('active');
        if (countSpan) countSpan.textContent = parseInt(countSpan.textContent) + 1;
        if (icon) icon.setAttribute('fill', 'currentColor');

        if (!likedProducts.includes(productId)) {
            likedProducts.push(productId);
            localStorage.setItem('liked_products', JSON.stringify(likedProducts));
        }

        if (typeof incrementProductLike === 'function') {
            await incrementProductLike(productId);
        }
        if (typeof showToast === 'function') {
            showToast('תודה! שמחים שאהבת', 'heart');
        }
    }
}

// ── Create product card HTML ──
function createProductCard(product) {
    const coverMedia = product.product_media?.find(m => m.is_cover) || product.product_media?.[0];
    const isVideo = coverMedia?.type === 'video';
    const mediaUrl = coverMedia?.url || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%2314142e" width="400" height="300"/><text x="200" y="150" fill="%23686888" text-anchor="middle" font-family="sans-serif" font-size="16">אין תמונה</text></svg>';
    const categoryName = product.categories?.name || '';
    const slug = product.slug || product.id;
    const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]');
    const isLiked = likedProducts.includes(product.id);

    let priceHTML = '';
    if (product.price) {
        if (product.sale_price) {
            priceHTML = `
                <div class="item-price sale">
                    <span class="old-price">₪${product.price}</span>
                    <span class="current-price">₪${product.sale_price}</span>
                </div>
            `;
        } else {
            priceHTML = `<div class="item-price"><span class="current-price">₪${product.price}</span></div>`;
        }
    }

    const commentCount = product.comments?.[0]?.count || 0;
    const commentHTML = commentCount > 0 ? `<span class="badge badge-outline"><i data-lucide="message-square" style="width:12px;height:12px;margin-left:4px"></i>${commentCount}</span>` : '';

    return `
        <div class="masonry-item glass-card" onclick="window.location.href='?page=product&slug=${slug}'">
            <div class="item-media">
                ${isVideo
            ? `<video src="${mediaUrl}" muted loop playsinline preload="metadata"></video>
                       <div class="video-badge"><i data-lucide="play"></i></div>`
            : `<img src="${mediaUrl}" alt="${product.title}" loading="lazy">`
        }
                <div class="item-overlay">
                    <div class="item-title">${product.title}</div>
                    <div class="item-meta">
                        <div style="display:flex;align-items:center;gap:var(--space-sm)">
                            ${categoryName ? `<span class="badge">${categoryName}</span>` : ''}
                            ${commentHTML}
                            <span class="badge badge-outline"><i data-lucide="eye" style="width:12px;height:12px;margin-left:4px"></i>${product.view_count || 0}</span>
                        </div>
                        ${priceHTML}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-action-btn like-btn ${isLiked ? 'active' : ''}" onclick="handleLike(event, '${product.id}')" title="אהבתי">
                        <i data-lucide="heart" ${isLiked ? 'fill="currentColor"' : ''}></i>
                        <span class="like-count" style="font-size:0.75rem;margin-right:2px">${product.like_count || 0}</span>
                    </button>
                    <button class="item-action-btn" onclick="event.stopPropagation();shareProduct('${slug}','${product.title}')" title="שיתוף">
                        <i data-lucide="share-2"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ── Masonry hover video play ──
document.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.masonry-item');
    if (item) {
        const video = item.querySelector('video');
        if (video) video.play().catch(() => { });
    }
});

document.addEventListener('mouseout', (e) => {
    const item = e.target.closest('.masonry-item');
    if (item) {
        const video = item.querySelector('video');
        if (video) { video.pause(); video.currentTime = 0; }
    }
});
