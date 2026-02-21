</main>

<!-- Footer -->
<footer class="footer">
    <div class="footer-content">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-logo">
                    <i data-lucide="box"></i>
                    <span class="logo-brand">modela</span>
                </div>
                <p class="footer-desc">סטודיו יצירתי להדפסת תלת מימד — מדמיון למציאות תלת־ממדית. מוצרים בהתאמה אישית,
                    אב טיפוס, מתנות מיוחדות ועוד.</p>
                <div class="footer-social">
                    <a href="#" class="social-link" aria-label="Instagram"><i data-lucide="instagram"></i></a>
                    <a href="#" class="social-link" aria-label="Facebook"><i data-lucide="facebook"></i></a>
                    <a href="#" class="social-link" aria-label="WhatsApp"><i data-lucide="message-circle"></i></a>
                </div>
            </div>

            <div class="footer-links-group">
                <h4>ניווט</h4>
                <a href="<?php echo SITE_URL; ?>">בית</a>
                <a href="<?php echo SITE_URL; ?>/?page=gallery">העבודות שלנו</a>
                <a href="<?php echo SITE_URL; ?>/?page=about">כך זה עובד</a>
                <a href="<?php echo SITE_URL; ?>/?page=contact">צור קשר</a>
            </div>

            <div class="footer-links-group">
                <h4>שירותים</h4>
                <a href="<?php echo SITE_URL; ?>/?page=gallery&cat=custom">התאמה אישית</a>
                <a href="<?php echo SITE_URL; ?>/?page=gallery&cat=medical">פתרונות רפואיים</a>
                <a href="<?php echo SITE_URL; ?>/?page=gallery&cat=prototype">אב טיפוס</a>
                <a href="<?php echo SITE_URL; ?>/?page=gallery&cat=gifts">מתנות בהתאמה אישית</a>
            </div>

            <div class="footer-links-group">
                <h4>יצירת קשר</h4>
                <a href="tel:+972504283555"><i data-lucide="phone" style="width:14px;height:14px"></i> 050-428-3555</a>
                <a href="mailto:yb8511@gmail.com"><i data-lucide="mail" style="width:14px;height:14px"></i>
                    yb8511@gmail.com</a>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy;
                <?php echo date('Y'); ?> Modela — יוצרים בתלת מימד. כל הזכויות שמורות
            </p>
        </div>
    </div>
</footer>

<!-- Floating WhatsApp -->
<a href="https://wa.me/972504283555" class="whatsapp-float" target="_blank" aria-label="צור קשר בוואטסאפ">
    <i data-lucide="message-circle"></i>
</a>

<!-- Scripts -->
<script src="<?php echo SITE_URL; ?>/js/app.js"></script>
<?php if ($page === 'gallery' || $page === 'home' || $page === 'category'): ?>
    <script src="<?php echo SITE_URL; ?>/js/gallery.js"></script>
<?php endif; ?>
<?php if ($page === 'product'): ?>
    <script src="<?php echo SITE_URL; ?>/js/product.js"></script>
    <script src="<?php echo SITE_URL; ?>/js/comments.js"></script>
    <script src="<?php echo SITE_URL; ?>/js/share.js"></script>
<?php endif; ?>

<script>
    // Initialize Lucide icons
    lucide.createIcons();
</script>
</body>

</html>