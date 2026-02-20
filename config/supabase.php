<?php
/**
 * Supabase Configuration
 * Replace these placeholders with your actual Supabase project credentials
 */

define('SUPABASE_URL', getenv('SUPABASE_URL') ?: 'https://onfgfiidwvdmlfubwqmv.supabase.co');
define('SUPABASE_ANON_KEY', getenv('SUPABASE_ANON_KEY') ?: 'sb_publishable_u7SKsP70TVWn0no55C6U5g_mG7RAl-x');

// Site Configuration
define('SITE_NAME', 'מודלה');
define('SITE_TAGLINE', 'יוצרים בתלת מימד');

// Auto-detect SITE_URL for Vercel/Production vs Localhost
if (getenv('SITE_URL')) {
    define('SITE_URL', rtrim(getenv('SITE_URL'), '/'));
} else if (isset($_SERVER['HTTP_HOST'])) {
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    // On Vercel, HTTP_HOST is usually the deployment URL
    if ($host === 'localhost' || $host === '127.0.0.1') {
        define('SITE_URL', $protocol . $host . '/3D');
    } else {
        define('SITE_URL', $protocol . $host);
    }
} else {
    define('SITE_URL', 'http://localhost/3D');
}

define('SITE_DIR', __DIR__ . '/..');
