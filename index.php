<?php
/**
 * מודלה - Modela 3D Print Shop
 * Front Controller / Router
 */

require_once __DIR__ . '/config/supabase.php';

$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Valid pages
$validPages = ['home', 'gallery', 'product', 'category', 'about', 'contact'];

if (!in_array($page, $validPages)) {
  $page = 'home';
}

// Include shared header
include __DIR__ . '/includes/header.php';

// Include requested page
$pageFile = __DIR__ . '/pages/' . $page . '.php';
if (file_exists($pageFile)) {
  include $pageFile;
} else {
  include __DIR__ . '/pages/home.php';
}

// Include shared footer
include __DIR__ . '/includes/footer.php';
