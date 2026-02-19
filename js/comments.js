/**
 * Comments JS — AJAX comment form + live comments list
 */

document.addEventListener('DOMContentLoaded', () => {
    initCommentForm();
    loadComments();
});

function initCommentForm() {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = form.getAttribute('data-product-id');
        const nameInput = form.querySelector('#commentName');
        const emailInput = form.querySelector('#commentEmail');
        const contentInput = form.querySelector('#commentContent');
        const submitBtn = form.querySelector('button[type="submit"]');

        // Validate
        if (!nameInput.value.trim() || !contentInput.value.trim()) {
            showToast('נא למלא את כל השדות הנדרשים', 'alert-circle');
            return;
        }

        // Disable submit
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> שולח...';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [submitBtn] });

        const result = await submitComment(
            productId,
            nameInput.value.trim(),
            emailInput.value.trim(),
            contentInput.value.trim()
        );

        if (result) {
            showToast('התגובה נשלחה בהצלחה! תפורסם לאחר אישור.');
            form.reset();
        } else {
            showToast('שגיאה בשליחת התגובה. נסו שוב.', 'alert-circle');
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send"></i> שלח תגובה';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [submitBtn] });
    });
}

async function loadComments() {
    const container = document.getElementById('commentList');
    const form = document.getElementById('commentForm');
    if (!container || !form) return;

    const productId = form.getAttribute('data-product-id');
    if (!productId) return;

    const comments = await fetchComments(productId);

    if (comments.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: var(--space-xl)">
                <p style="color: var(--text-muted)">אין תגובות עדיין. היו הראשונים להגיב!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comments.map(comment => {
        const initial = comment.author_name.charAt(0).toUpperCase();
        return `
            <div class="comment-item glass-card">
                <div class="comment-header">
                    <div class="comment-avatar">${initial}</div>
                    <div>
                        <div class="comment-author">${escapeHtml(comment.author_name)}</div>
                        <div class="comment-date">${formatDateHe(comment.created_at)}</div>
                    </div>
                </div>
                <div class="comment-body">${escapeHtml(comment.content)}</div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
