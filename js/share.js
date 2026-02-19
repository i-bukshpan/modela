/**
 * Share JS — Product sharing via Web Share API with fallbacks
 */

function shareProduct(slug, title) {
    const url = window.location.origin + '/3D/?page=product&slug=' + slug;
    const text = `${title} — מודלה הדפסת תלת מימד`;

    // Try native Web Share API first
    if (navigator.share) {
        navigator.share({ title: text, url: url }).catch(() => { });
        return;
    }

    // Fallback: show share modal
    showShareModal(url, text);
}

function showShareModal(url, text) {
    // Remove existing modal
    const existing = document.getElementById('shareModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'shareModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.3s ease';

    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    modal.innerHTML = `
        <div class="glass-card" style="padding:var(--space-2xl);max-width:400px;width:90%;text-align:center">
            <h3 style="margin-bottom:var(--space-lg)">שיתוף מוצר</h3>
            <div class="share-buttons" style="justify-content:center;gap:var(--space-md);margin-bottom:var(--space-lg)">
                <a href="https://wa.me/?text=${encodedText}%20${encodedUrl}" target="_blank" class="share-btn whatsapp" title="WhatsApp">
                    <i data-lucide="message-circle"></i>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="share-btn facebook" title="Facebook">
                    <i data-lucide="facebook"></i>
                </a>
                <a href="https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}" target="_blank" class="share-btn twitter" title="Twitter">
                    <i data-lucide="twitter"></i>
                </a>
                <button class="share-btn copy-link" onclick="copyLink('${url}')" title="העתק קישור">
                    <i data-lucide="link"></i>
                </button>
            </div>
            <button class="btn btn-secondary" onclick="document.getElementById('shareModal').remove()" style="width:100%">סגור</button>
        </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function copyLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('הקישור הועתק בהצלחה!', 'check-circle');
    }).catch(() => {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('הקישור הועתק בהצלחה!', 'check-circle');
    });
}

// Share buttons on product page
function initShareButtons() {
    document.querySelectorAll('[data-share]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-share');
            const url = window.location.href;
            const title = document.querySelector('.product-info h1')?.textContent || 'מוצר מודלה';
            const encoded = encodeURIComponent(url);
            const textEncoded = encodeURIComponent(title + ' — מודלה');

            switch (type) {
                case 'whatsapp':
                    window.open(`https://wa.me/?text=${textEncoded}%20${encoded}`, '_blank');
                    break;
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?text=${textEncoded}&url=${encoded}`, '_blank');
                    break;
                case 'copy':
                    copyLink(url);
                    break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initShareButtons);
