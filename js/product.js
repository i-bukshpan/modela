/**
 * Product Page JS — Media slider, lightbox, thumbnail navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    initMediaSlider();
    initLightbox();
});

let currentSlide = 0;
let slides = [];

function initMediaSlider() {
    const sliderMain = document.querySelector('.slider-main');
    if (!sliderMain) return;

    slides = Array.from(document.querySelectorAll('.slider-slide'));
    if (!slides.length) return;

    showSlide(0);

    // Nav buttons
    const prevBtn = document.querySelector('.slider-nav-btn.prev');
    const nextBtn = document.querySelector('.slider-nav-btn.next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });
    }

    // Thumbnails
    document.querySelectorAll('.slider-thumb').forEach((thumb, i) => {
        thumb.addEventListener('click', () => {
            currentSlide = i;
            showSlide(i);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        } else if (e.key === 'ArrowLeft') {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }
    });

    // Touch swipe
    let startX = 0;
    sliderMain.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    sliderMain.addEventListener('touchend', (e) => {
        const diffX = startX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                currentSlide = (currentSlide + 1) % slides.length;
            } else {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            }
            showSlide(currentSlide);
        }
    }, { passive: true });
}

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'flex' : 'none';
        // Pause videos that aren't shown
        const video = slide.querySelector('video');
        if (video) {
            if (i === index) { video.play().catch(() => { }); }
            else { video.pause(); }
        }
    });

    // Update thumbnails
    document.querySelectorAll('.slider-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// ── Lightbox ──
function initLightbox() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (!fullscreenBtn) return;

    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" onclick="closeLightbox()"><i data-lucide="x"></i></button>
        <div class="lightbox-content" id="lightboxContent"></div>
    `;
    document.body.appendChild(lightbox);

    fullscreenBtn.addEventListener('click', () => {
        const activeSlide = slides[currentSlide];
        if (!activeSlide) return;

        const content = document.getElementById('lightboxContent');
        const img = activeSlide.querySelector('img');
        const video = activeSlide.querySelector('video');

        if (img) {
            content.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
        } else if (video) {
            content.innerHTML = `<video src="${video.src}" controls autoplay></video>`;
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        const video = lightbox.querySelector('video');
        if (video) video.pause();
    }
}

// ── Load related products ──
async function loadRelatedProducts(categoryId, currentProductId) {
    const container = document.getElementById('relatedGrid');
    if (!container) return;

    const products = await fetchProducts({ category: categoryId, limit: 4 });
    const filtered = products.filter(p => p.id !== currentProductId);

    if (filtered.length === 0) {
        container.parentElement.style.display = 'none';
        return;
    }

    container.innerHTML = filtered.map(product => createProductCard(product)).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
