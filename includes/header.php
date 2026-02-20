<!DOCTYPE html>
<html lang="he" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php
    // Default metadata
    $metaTitle = SITE_NAME . ' — ' . SITE_TAGLINE;
    $metaDesc = "מודלה — סטודיו יצירתי להדפסת תלת מימד. מדמיון למציאות תלת־ממדית. מוצרים בהתאמה אישית, אב טיפוס, מתנות ועוד.";
    $metaURL = SITE_URL . ($_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : '');
    $metaImage = SITE_URL . '/css/img/og-fallback.jpg'; // Need to ensure an image exists or is provided
    
    // If on product page, fetch metadata from Supabase via PHP if possible (or just use defaults)
if (isset($metaProduct)) {
    $metaTitle = $metaProduct['title'] . ' — ' . SITE_NAME;
    if (!empty($metaProduct['description'])) {
        $metaDesc = mb_strimwidth(strip_tags($metaProduct['description']), 0, 160, "...");
    }
    
    // Find cover image
    if (!empty($metaProduct['product_media'])) {
        $cover = array_filter($metaProduct['product_media'], function($m) {
            return isset($m['is_cover']) && $m['is_cover'];
        });
        $cover = !empty($cover) ? reset($cover) : $metaProduct['product_media'][0];
        if (isset($cover['url'])) {
            $metaImage = $cover['url'];
        }
    }
}
    ?>
    <title><?php echo $metaTitle; ?></title>
    <meta name="description" content="<?php echo $metaDesc; ?>">
    <meta name="keywords"
        content="הדפסת תלת מימד, 3D printing, מודלה, Modela, מוצרים מותאמים אישית, STL, מודלים תלת מימד, אב טיפוס">

    <meta property="og:title" content="<?php echo $metaTitle; ?>">
    <meta property="og:description" content="<?php echo $metaDesc; ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo $metaURL; ?>">
    <meta property="og:image" content="<?php echo $metaImage; ?>">
    <meta property="og:image:alt" content="<?php echo $metaTitle; ?>">

    <!-- Google Fonts: Heebo (Hebrew) + Montserrat & Poppins (English/Logo) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">

    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

    <!-- Supabase JS SDK -->
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

    <!-- Styles -->
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>/css/style.css">
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>/css/components.css">
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>/css/pages.css">
</head>

<body>
    <!-- Navigation -->
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="<?php echo SITE_URL; ?>" class="nav-logo">
                <span class="logo-icon">
                    <i data-lucide="box" class="logo-svg"></i>
                </span>
                <span class="logo-text">modela</span>
            </a>

            <div class="nav-links" id="navLinks">
                <a href="<?php echo SITE_URL; ?>" class="nav-link <?php echo $page === 'home' ? 'active' : ''; ?>">
                    <i data-lucide="home"></i>
                    <span>בית</span>
                </a>
                <a href="<?php echo SITE_URL; ?>/?page=gallery"
                    class="nav-link <?php echo $page === 'gallery' ? 'active' : ''; ?>">
                    <i data-lucide="grid-3x3"></i>
                    <span>העבודות שלנו</span>
                </a>
                <a href="<?php echo SITE_URL; ?>/?page=about"
                    class="nav-link <?php echo $page === 'about' ? 'active' : ''; ?>">
                    <i data-lucide="info"></i>
                    <span>אודות</span>
                </a>
                <a href="<?php echo SITE_URL; ?>/?page=contact"
                    class="nav-link <?php echo $page === 'contact' ? 'active' : ''; ?>">
                    <i data-lucide="mail"></i>
                    <span>צור קשר</span>
                </a>
            </div>

            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                <i data-lucide="menu"></i>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" id="mobileOverlay"></div>

    <main class="main-content">