<?php
/**
 * Single Blog Post Page
 */
if (!isset($_GET['slug'])) {
    header('Location: ?page=blog');
    exit;
}
?>

<article class="post-page">
    <div id="postContent">
        <!-- Post content loaded via JS -->
        <div class="container section">
            <div class="skeleton-loader" style="text-align: center; padding: 5rem;">
                <div class="spinner"></div>
                <p>טוען מאמר...</p>
            </div>
        </div>
    </div>
</article>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const slug = new URLSearchParams(window.location.search).get('slug');
        const container = document.getElementById('postContent');

        try {
            const { data: post, error } = await getSupabase()
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error || !post) throw error || new Error('Post not found');

            // Update view count
            await getSupabase().rpc('increment_blog_view', { post_id: post.id });

            const date = new Date(post.created_at).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            container.innerHTML = `
            <header class="post-header">
                <div class="post-hero" style="background-image: url('${post.cover_image || 'css/img/blog-fallback.jpg'}')">
                    <div class="post-hero-overlay"></div>
                </div>
                <div class="container">
                    <div class="post-meta-top animate-on-scroll">
                        <a href="?page=blog" class="back-link"><i data-lucide="arrow-right"></i> חזרה לבלוג</a>
                        <span class="post-date">${date}</span>
                    </div>
                    <h1 class="post-title animate-on-scroll">${post.title}</h1>
                    ${post.excerpt ? `<p class="post-excerpt animate-on-scroll">${post.excerpt}</p>` : ''}
                </div>
            </header>

            <div class="container">
                <div class="post-body animate-on-scroll">
                    ${post.content}
                </div>
                
                <footer class="post-footer animate-on-scroll">
                    <div class="post-tags">
                        ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-share">
                        <span>שתפו:</span>
                        <button onclick="sharePost('whatsapp')" class="share-btn"><i data-lucide="message-circle"></i></button>
                        <button onclick="sharePost('facebook')" class="share-btn"><i data-lucide="facebook"></i></button>
                    </div>
                </footer>
            </div>
        `;

            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (typeof initScrollAnimations === 'function') initScrollAnimations();

        } catch (err) {
            console.error('Error loading post:', err);
            container.innerHTML = `
            <div class="container section text-center">
                <h2>המאמר לא נמצא</h2>
                <p>מצטערים, המאמר שחיפשת לא קיים או שהוסר.</p>
                <a href="?page=blog" class="btn btn-primary">חזרה לבלוג</a>
            </div>
        `;
        }
    });

    function sharePost(platform) {
        const url = window.location.href;
        const title = document.title;
        let shareUrl = '';

        if (platform === 'whatsapp') {
            shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        } else if (platform === 'facebook') {
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        }

        if (shareUrl) window.open(shareUrl, '_blank');
    }
</script>