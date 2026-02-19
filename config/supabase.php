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
define('SITE_URL', getenv('SITE_URL') ?: 'http://localhost/3D');
define('SITE_DIR', __DIR__ . '/..');
