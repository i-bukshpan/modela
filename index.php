<?php
/**
 * מודלה - Modela 3D Print Shop
 * Front Controller / Router
 */

require_once __DIR__ . '/config/supabase.php';

$page = isset($_GET['page']) ? $_GET['page'] : 'home';

// Valid pages
$validPages = ['home', 'gallery', 'product', 'category', 'about', 'contact', 'blog', 'post'];

if (!in_array($page, $validPages)) {
  $page = 'home';
}

// ── SEO & Sharing Metadata ──
$metaProduct = null;
if ($page === 'product' && isset($_GET['slug'])) {
  $slug = $_GET['slug'];
  $apiUrl = SUPABASE_URL . '/rest/v1/products?slug=eq.' . $slug . '&select=*,product_media(url,is_cover)';

  $opts = [
    "http" => [
      "method" => "GET",
      "header" => "apikey: " . SUPABASE_ANON_KEY . "\r\n" .
        "Authorization: Bearer " . SUPABASE_ANON_KEY . "\r\n"
    ]
  ];

  $context = stream_context_create($opts);
  $response = @file_get_contents($apiUrl, false, $context);

  if ($response) {
    $data = json_decode($response, true);
    if (!empty($data)) {
      $metaProduct = $data[0];
    }
  }
}

// Blog Post Metadata
$metaPost = null;
if ($page === 'post' && isset($_GET['slug'])) {
  $slug = $_GET['slug'];
  $apiUrl = SUPABASE_URL . '/rest/v1/blog_posts?slug=eq.' . $slug . '&select=*';

  $opts = [
    "http" => [
      "method" => "GET",
      "header" => "apikey: " . SUPABASE_ANON_KEY . "\r\n" .
        "Authorization: Bearer " . SUPABASE_ANON_KEY . "\r\n"
    ]
  ];

  $context = stream_context_create($opts);
  $response = @file_get_contents($apiUrl, false, $context);

  if ($response) {
    $data = json_decode($response, true);
    if (!empty($data)) {
      $metaPost = $data[0];
    }
  }
}

// Include shared header (it will use $metaProduct if set)
include __DIR__ . '/includes/header.php';

// Include requested page
if (file_exists($pageFile)) {
  include $pageFile;
} else {
  include __DIR__ . '/pages/home.php';
}

// Include shared footer
include __DIR__ . '/includes/footer.php';
