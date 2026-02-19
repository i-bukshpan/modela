<?php
/**
 * Vercel Entry Point / Router
 */

// Define root directory relative to this file (api/index.php)
$rootDir = dirname(__DIR__);

// Load configuration
require_once $rootDir . '/config/supabase.php';

// Simple routing logic (same as root index.php but with adjusted paths)
$page = isset($_GET['page']) ? $_GET['page'] : 'home';
$validPages = ['home', 'gallery', 'product', 'category', 'about', 'contact'];

if (!in_array($page, $validPages)) {
    $page = 'home';
}

// Set up globals or constants if needed
// The config/supabase.php already uses getenv() for Vercel support

// Include shared header
include $rootDir . '/includes/header.php';

// Include requested page
$pageFile = $rootDir . '/pages/' . $page . '.php';
if (file_exists($pageFile)) {
    include $pageFile;
} else {
    include $rootDir . '/pages/home.php';
}

// Include shared footer
include $rootDir . '/includes/footer.php';
