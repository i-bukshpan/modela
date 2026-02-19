<!DOCTYPE html>
<html lang="he" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>
        <?php echo SITE_NAME; ?> —
        <?php echo SITE_TAGLINE; ?>
    </title>
    <meta name="description"
        content="מודלה — סטודיו יצירתי להדפסת תלת מימד. מדמיון למציאות תלת־ממדית. מוצרים בהתאמה אישית, אב טיפוס, מתנות ועוד.">
    <meta name="keywords"
        content="הדפסת תלת מימד, 3D printing, מודלה, Modela, מוצרים מותאמים אישית, STL, מודלים תלת מימד, אב טיפוס">
    <meta property="og:title" content="<?php echo SITE_NAME; ?> — <?php echo SITE_TAGLINE; ?>">
    <meta property="og:description" content="מודלה — מדמיון למציאות תלת־ממדית. הדפסות תלת מימד בהתאמה אישית.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo SITE_URL; ?>">

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