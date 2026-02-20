<?php require_once __DIR__ . '/../config/supabase.php'; ?>
<!DOCTYPE html>
<html lang="he" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מודלה — פאנל ניהול</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>/css/style.css">
    <link rel="stylesheet" href="<?php echo SITE_URL; ?>/css/admin.css">
</head>

<body>
    <div class="admin-login" id="loginPage">
        <div class="login-card glass-card">
            <div style="text-align:center;margin-bottom:var(--space-xl)">
                <div class="logo-icon" style="width:56px;height:56px;margin:0 auto var(--space-md)">
                    <i data-lucide="box" style="width:28px;height:28px;color:white"></i>
                </div>
                <h2>פאנל ניהול מודלה</h2>
                <p style="color:var(--text-secondary);font-size:0.9rem">התחברו כדי לנהל את האתר</p>
            </div>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label for="loginEmail">אימייל</label>
                    <input type="email" id="loginEmail" required placeholder="admin@modela3d.com">
                </div>
                <div class="form-group" style="margin-bottom:var(--space-lg)">
                    <label for="loginPassword">סיסמה</label>
                    <input type="password" id="loginPassword" required placeholder="סיסמה">
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%">
                    <i data-lucide="log-in"></i>
                    התחברות
                </button>
                <p id="loginError"
                    style="color:var(--color-accent);font-size:0.85rem;margin-top:var(--space-md);display:none"></p>
            </form>
        </div>
    </div>

    <div id="adminApp" style="display:none">
        <!-- Navbar -->
        <nav class="navbar scrolled">
            <div class="nav-container">
                <a href="<?php echo SITE_URL; ?>/admin/" class="nav-logo">
                    <span class="logo-icon"><i data-lucide="box" class="logo-svg"></i></span>
                    <span class="logo-text">modela</span>
                    <span class="badge" style="margin-right:var(--space-sm)">אדמין</span>
                </a>
                <div style="display:flex;align-items:center;gap:var(--space-md)">
                    <a href="<?php echo SITE_URL; ?>" class="btn btn-sm btn-secondary" target="_blank">
                        <i data-lucide="external-link"></i>
                        <span class="btn-text">צפייה באתר</span>
                    </a>
                    <button class="btn btn-sm btn-secondary" onclick="handleLogout()">
                        <i data-lucide="log-out"></i>
                        <span class="btn-text">יציאה</span>
                    </button>
                    <!-- Mobile Sidebar Toggle -->
                    <button class="admin-mobile-toggle" onclick="toggleAdminSidebar()" aria-label="תפריט ניהול">
                        <i data-lucide="menu"></i>
                    </button>
                </div>
            </div>
        </nav>

        <div class="admin-layout">
            <!-- Sidebar -->
            <aside class="admin-sidebar">
                <div class="sidebar-title">ניהול</div>
                <a href="#dashboard" class="sidebar-link active" data-section="dashboard"
                    onclick="showSection('dashboard',this)">
                    <i data-lucide="bar-chart-3"></i> לוח בקרה
                </a>
                <a href="#products" class="sidebar-link" data-section="products" onclick="showSection('products',this)">
                    <i data-lucide="package"></i> מוצרים
                </a>
                <a href="#categories" class="sidebar-link" data-section="categories"
                    onclick="showSection('categories',this)">
                    <i data-lucide="folder-tree"></i> קטגוריות
                </a>
                <a href="#comments" class="sidebar-link" data-section="comments" onclick="showSection('comments',this)">
                    <i data-lucide="message-square"></i> תגובות
                </a>
                <a href="#messages" class="sidebar-link" data-section="messages" onclick="showSection('messages',this)">
                    <i data-lucide="mail"></i> הודעות
                </a>
            </aside>

            <!-- Main content -->
            <div class="admin-main">
                <!-- Dashboard -->
                <div class="admin-section" id="section-dashboard">
                    <div class="admin-header">
                        <h1>לוח בקרה</h1>
                    </div>
                    <div class="admin-stats" id="dashboardStats"></div>
                    <div class="glass-card" style="padding:var(--space-xl)">
                        <h3 style="margin-bottom:var(--space-lg)">פעילות אחרונה</h3>
                        <div id="recentActivity">
                            <p style="color:var(--text-muted)">טוען...</p>
                        </div>
                    </div>
                </div>

                <!-- Products -->
                <div class="admin-section" id="section-products" style="display:none">
                    <div class="admin-header">
                        <h1>מוצרים</h1>
                        <button class="btn btn-primary" onclick="showProductForm()">
                            <i data-lucide="plus"></i> מוצר חדש
                        </button>
                    </div>
                    <div id="productFormContainer" style="display:none"></div>
                    <div class="glass-card" style="padding:var(--space-lg);overflow-x:auto">
                        <table class="admin-table" id="productsTable">
                            <thead>
                                <tr>
                                    <th>תמונה</th>
                                    <th>שם</th>
                                    <th>קטגוריה</th>
                                    <th>מחיר</th>
                                    <th>תגובות</th>
                                    <th>מובחר</th>
                                    <th>תאריך</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody id="productsBody">
                                <tr>
                                    <td colspan="6" style="text-align:center;color:var(--text-muted)">טוען...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Categories -->
                <div class="admin-section" id="section-categories" style="display:none">
                    <div class="admin-header">
                        <h1>קטגוריות</h1>
                        <button class="btn btn-primary" onclick="showCategoryForm()">
                            <i data-lucide="plus"></i> קטגוריה חדשה
                        </button>
                    </div>
                    <div id="categoryFormContainer" style="display:none"></div>
                    <div class="glass-card" style="padding:var(--space-lg)">
                        <div id="categoriesTree">
                            <p style="color:var(--text-muted)">טוען...</p>
                        </div>
                    </div>
                </div>

                <!-- Comments -->
                <div class="admin-section" id="section-comments" style="display:none">
                    <div class="admin-header">
                        <h1>תגובות</h1>
                    </div>
                    <div class="glass-card" style="padding:var(--space-lg);overflow-x:auto">
                        <table class="admin-table" id="commentsTable">
                            <thead>
                                <tr>
                                    <th>מחבר</th>
                                    <th>תגובה</th>
                                    <th>מוצר</th>
                                    <th>סטטוס</th>
                                    <th>תאריך</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody id="commentsBody">
                                <tr>
                                    <td colspan="6" style="text-align:center;color:var(--text-muted)">טוען...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Messages -->
                <div class="admin-section" id="section-messages" style="display:none">
                    <div class="admin-header">
                        <h1>הודעות</h1>
                    </div>
                    <div class="glass-card" style="padding:var(--space-lg);overflow-x:auto">
                        <table class="admin-table" id="messagesTable">
                            <thead>
                                <tr>
                                    <th>שם</th>
                                    <th>אימייל</th>
                                    <th>נושא</th>
                                    <th>הודעה</th>
                                    <th>תאריך</th>
                                    <th>פעולות</th>
                                </tr>
                            </thead>
                            <tbody id="messagesBody">
                                <tr>
                                    <td colspan="6" style="text-align:center;color:var(--text-muted)">טוען...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="admin-overlay" id="adminOverlay" onclick="toggleAdminSidebar()"></div>

            <script src="<?php echo SITE_URL; ?>/js/supabase-client.js"></script>
            <script src="<?php echo SITE_URL; ?>/js/admin.js"></script>
            <script>lucide.createIcons();</script>
</body>

</html>