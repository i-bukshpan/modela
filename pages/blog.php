<?php
/**
 * Blog Listing Page
 */
?>

<section class="section">
    <div class="container">
        <div class="section-header animate-on-scroll">
            <h1>הבלוג שלנו</h1>
            <p>מדריכים, טיפים ועדכונים מעולם הדפסת התלת-מימד</p>
        </div>

        <div class="blog-grid" id="blogGrid">
            <!-- Loading skeleton or posts will appear here -->
            <div class="skeleton-loader" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div class="spinner"></div>
                <p>טוען מאמרים...</p>
            </div>
        </div>
    </div>
</section>

<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const container = document.getElementById('blogGrid');

        try {
            const { data: posts, error } = await getSupabase()
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!posts || posts.length === 0) {
                container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">עדיין אין מאמרים בבלוג. חזרו בקרוב!</p>';
                return;
            }

            container.innerHTML = posts.map(post => {
                const date = new Date(post.created_at).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                return `
                <article class="blog-card glass-card animate-on-scroll" onclick="window.location.href='?page=post&slug=${post.slug}'">
                    <div class="blog-card-image">
                        <img src="${post.cover_image || 'css/img/blog-fallback.jpg'}" alt="${post.title}" loading="lazy">
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-card-date">${date}</div>
                        <h2 class="blog-card-title">${post.title}</h2>
                        <p class="blog-card-excerpt">${post.excerpt || ''}</p>
                        <div class="blog-card-footer">
                            <span class="read-more">קרא עוד <i data-lucide="arrow-left"></i></span>
                        </div>
                    </div>
                </article>
            `;
            }).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (typeof initScrollAnimations === 'function') initScrollAnimations();

        } catch (err) {
            console.error('Error loading blog posts:', err);
            container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--error);">שגיאה בטעינת המאמרים. נסו שוב מאוחר יותר.</p>';
        }
    });
</script>