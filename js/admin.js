/**
 * Admin Panel JavaScript
 * Handles authentication, CRUD operations, media uploads, and UI management
 */

// ── Auth ──
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    const db = getSupabase();
    if (!db) { errorEl.textContent = 'שגיאה בחיבור ל-Supabase'; errorEl.style.display = 'block'; return; }

    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
        errorEl.textContent = 'שם משתמש או סיסמה שגויים';
        errorEl.style.display = 'block';
        return;
    }
    showAdminApp();
}

async function handleLogout() {
    const db = getSupabase();
    if (db) await db.auth.signOut();
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminApp').style.display = 'none';
}

async function checkAuth() {
    const db = getSupabase();
    if (!db) return;
    const { data: { session } } = await db.auth.getSession();
    if (session) showAdminApp();
}

function showAdminApp() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    loadDashboard();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── Navigation ──
function toggleAdminSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('adminOverlay');
    if (sidebar) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function showSection(name, el) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById('section-' + name).style.display = 'block';
    if (el) el.classList.add('active');

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        document.querySelector('.admin-sidebar')?.classList.remove('open');
        document.getElementById('adminOverlay')?.classList.remove('active');
    }

    switch (name) {
        case 'dashboard': loadDashboard(); break;
        case 'products': loadProductsList(); break;
        case 'categories': loadCategoriesList(); break;
        case 'comments': loadCommentsList(); break;
        case 'blogs': loadBlogsList(); break;
        case 'messages': loadMessagesList(); break;
    }
}

// ── Dashboard ──
async function loadDashboard() {
    const db = getSupabase();
    if (!db) return;

    const [products, comments, messages, blogs] = await Promise.all([
        db.from('products').select('id', { count: 'exact', head: true }),
        db.from('comments').select('id', { count: 'exact', head: true }),
        db.from('contact_messages').select('id', { count: 'exact', head: true }),
        db.from('blog_posts').select('id', { count: 'exact', head: true })
    ]);

    document.getElementById('dashboardStats').innerHTML = `
        <div class="admin-stat-card glass-card">
            <div class="stat-icon"><i data-lucide="package"></i></div>
            <div><div class="stat-number">${products.count || 0}</div><div class="stat-label">מוצרים</div></div>
        </div>
        <div class="admin-stat-card glass-card">
            <div class="stat-icon" style="background:var(--gradient-accent)"><i data-lucide="message-square"></i></div>
            <div><div class="stat-number">${comments.count || 0}</div><div class="stat-label">תגובות</div></div>
        </div>
        <div class="admin-stat-card glass-card">
            <div class="stat-icon" style="background:var(--gradient-primary)"><i data-lucide="book-open"></i></div>
            <div><div class="stat-number">${blogs.count || 0}</div><div class="stat-label">מאמרים</div></div>
        </div>
        <div class="admin-stat-card glass-card">
            <div class="stat-icon" style="background:linear-gradient(135deg,#5cb85c,#3d9970)"><i data-lucide="mail"></i></div>
            <div><div class="stat-number">${messages.count || 0}</div><div class="stat-label">הודעות</div></div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Recent products
    const { data: recent } = await db.from('products').select('title,created_at').order('created_at', { ascending: false }).limit(5);
    const actEl = document.getElementById('recentActivity');
    if (recent && recent.length) {
        actEl.innerHTML = recent.map(p => `
            <div style="display:flex;justify-content:space-between;padding:var(--space-sm) 0;border-bottom:1px solid var(--border-glass)">
                <span>${p.title}</span>
                <span style="color:var(--text-muted);font-size:0.8rem">${new Date(p.created_at).toLocaleDateString('he-IL')}</span>
            </div>
        `).join('');
    } else {
        actEl.innerHTML = '<p style="color:var(--text-muted)">אין פעילות אחרונה</p>';
    }
}

// ── Products ──
async function loadProductsList() {
    const db = getSupabase();
    if (!db) return;

    const { data, error } = await db.from('products').select(`
        *, categories(name), product_media(url, is_cover), comments(count)
    `).order('created_at', { ascending: false });

    const tbody = document.getElementById('productsBody');
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">אין מוצרים עדיין</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(p => {
        const cover = p.product_media?.find(m => m.is_cover) || p.product_media?.[0];
        const thumb = cover ? `<img src="${cover.url}" class="thumb" alt="">` : '<div class="thumb" style="background:var(--bg-glass)"></div>';
        let priceDisplay = '—';
        if (p.price) {
            if (p.sale_price) {
                priceDisplay = `<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.8rem">₪${p.price}</span> <strong style="color:var(--color-primary)">₪${p.sale_price}</strong>`;
            } else {
                priceDisplay = `₪${p.price}`;
            }
        }
        const commentCount = p.comments?.[0]?.count || 0;
        return `<tr>
            <td>${thumb}</td>
            <td><strong>${p.title}</strong></td>
            <td>${p.categories?.name || '—'}</td>
            <td>${priceDisplay}</td>
            <td>${commentCount > 0 ? `<span class="badge" style="cursor:pointer" onclick="showSection('comments')"><i data-lucide="message-square" style="width:12px;height:12px;margin-left:4px"></i>${commentCount}</span>` : '—'}</td>
            <td>${p.featured ? '<span class="badge">⭐ מובחר</span>' : '—'}</td>
            <td style="font-size:0.8rem;color:var(--text-muted)">${new Date(p.created_at).toLocaleDateString('he-IL')}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editProduct('${p.id}')"><i data-lucide="edit-2"></i></button>
                <button class="btn btn-sm btn-secondary" onclick="deleteProduct('${p.id}')" style="color:var(--color-accent)"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Track pending uploads for new/edit product
let pendingMediaFiles = [];
let pendingDownloadFiles = [];
let existingMedia = [];
let existingFiles = [];

function showProductForm(product = null) {
    const container = document.getElementById('productFormContainer');
    container.style.display = 'block';

    // Reset upload arrays
    pendingMediaFiles = [];
    pendingDownloadFiles = [];
    existingMedia = product ? (product.product_media || []) : [];
    existingFiles = product ? (product.product_files || []) : [];

    container.innerHTML = `
        <div class="glass-card" style="padding:var(--space-xl);margin-bottom:var(--space-xl)">
            <h3 style="margin-bottom:var(--space-lg)">${product ? 'עריכת מוצר' : 'מוצר חדש'}</h3>
            <form class="admin-form" onsubmit="saveProduct(event,'${product?.id || ''}')">
                <div class="form-group">
                    <label>שם המוצר *</label>
                    <input type="text" id="pTitle" required value="${product?.title || ''}" placeholder="שם המוצר">
                </div>
                <div class="form-group">
                    <label>Slug (URL) *</label>
                    <input type="text" id="pSlug" required value="${product?.slug || ''}" placeholder="product-name">
                </div>
                <div class="form-group">
                    <label>תיאור</label>
                    <textarea id="pDesc" rows="4" placeholder="תיאור המוצר...">${product?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>קטגוריה</label>
                    <select id="pCategory"><option value="">בחר קטגוריה</option></select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
                    <div class="form-group"><label>מחיר (₪)</label><input type="number" step="0.01" min="0" id="pPrice" value="${product?.price || ''}" placeholder="0.00"></div>
                    <div class="form-group"><label>מחיר מבצע (₪)</label><input type="number" step="0.01" min="0" id="pSalePrice" value="${product?.sale_price || ''}" placeholder="השאר ריק אם אין מבצע"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md)">
                    <div class="form-group"><label>חומר</label><input type="text" id="pMaterial" value="${product?.material || ''}" placeholder="PLA, PETG..."></div>
                    <div class="form-group"><label>זמן הדפסה</label><input type="text" id="pPrintTime" value="${product?.print_time || ''}" placeholder="3 שעות"></div>
                    <div class="form-group"><label>מידות</label><input type="text" id="pDimensions" value="${product?.dimensions || ''}" placeholder="10x5x5 ס''מ"></div>
                </div>
                <div class="form-group">
                    <label style="display:flex;align-items:center;gap:var(--space-sm)">
                        <input type="checkbox" id="pFeatured" ${product?.featured ? 'checked' : ''}> מוצר מובחר
                    </label>
                </div>

                <!-- ═══ Media Upload Section ═══ -->
                <div class="upload-section">
                    <h4 style="margin-bottom:var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
                        <i data-lucide="image" style="width:20px;height:20px;color:var(--color-primary)"></i>
                        תמונות וסרטונים
                    </h4>
                    <div class="upload-zone" id="mediaDropZone" onclick="document.getElementById('mediaInput').click()">
                        <i data-lucide="upload-cloud" style="width:40px;height:40px;color:var(--text-muted)"></i>
                        <p>לחצו או גררו תמונות וסרטונים לכאן</p>
                        <span style="color:var(--text-muted);font-size:0.8rem">JPG, PNG, WebP, MP4, MOV</span>
                        <input type="file" id="mediaInput" accept="image/*,video/*" multiple style="display:none" onchange="handleMediaSelect(this.files)">
                    </div>
                    <div class="upload-preview-grid" id="mediaPreviewGrid">
                        ${existingMedia.map((m, i) => renderExistingMediaThumb(m, i)).join('')}
                    </div>
                </div>

                <!-- ═══ Downloadable Files Section ═══ -->
                <div class="upload-section">
                    <h4 style="margin-bottom:var(--space-md);display:flex;align-items:center;gap:var(--space-sm)">
                        <i data-lucide="file-down" style="width:20px;height:20px;color:var(--color-primary)"></i>
                        קבצים להורדה (STL, OBJ, 3MF...)
                    </h4>
                    <div class="upload-zone" onclick="document.getElementById('filesInput').click()">
                        <i data-lucide="folder-plus" style="width:40px;height:40px;color:var(--text-muted)"></i>
                        <p>לחצו להוספת קבצים להורדה</p>
                        <span style="color:var(--text-muted);font-size:0.8rem">STL, OBJ, 3MF, ZIP ועוד</span>
                        <input type="file" id="filesInput" multiple style="display:none" onchange="handleFilesSelect(this.files)">
                    </div>
                    <div class="upload-file-list" id="filesPreviewList">
                        ${existingFiles.map((f, i) => renderExistingFileItem(f, i)).join('')}
                    </div>
                </div>

                <div style="display:flex;gap:var(--space-md);margin-top:var(--space-lg)">
                    <button type="submit" class="btn btn-primary" id="saveProductBtn"><i data-lucide="save"></i> שמור</button>
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('productFormContainer').style.display='none'">ביטול</button>
                </div>
            </form>
        </div>
    `;

    // Load categories into select
    loadCategorySelect(product?.category_id);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Auto-generate slug
    document.getElementById('pTitle').addEventListener('input', (e) => {
        const slugField = document.getElementById('pSlug');
        if (!product) {
            slugField.value = e.target.value.replace(/\s+/g, '-').replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '').toLowerCase();
        }
    });

    // Drag & drop for media
    const dropZone = document.getElementById('mediaDropZone');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleMediaSelect(e.dataTransfer.files); });
}

function renderExistingMediaThumb(media, index) {
    const isVideo = media.type === 'video';
    return `
        <div class="upload-thumb" data-existing-id="${media.id}">
            ${isVideo
            ? `<video src="${media.url}" muted></video>`
            : `<img src="${media.url}" alt="">`}
            <div class="thumb-actions">
                <button type="button" class="thumb-cover-btn ${media.is_cover ? 'active' : ''}" onclick="setExistingCover('${media.id}')" title="תמונת כיסוי">
                    <i data-lucide="star" style="width:14px;height:14px"></i>
                </button>
                <button type="button" class="thumb-delete-btn" onclick="removeExistingMedia('${media.id}')" title="מחק">
                    <i data-lucide="x" style="width:14px;height:14px"></i>
                </button>
            </div>
            ${media.is_cover ? '<span class="cover-tag">כיסוי</span>' : ''}
        </div>
    `;
}

function renderExistingFileItem(file, index) {
    const sizeStr = file.file_size ? formatFileSize(file.file_size) : '';
    return `
        <div class="upload-file-item" data-existing-id="${file.id}">
            <div style="display:flex;align-items:center;gap:var(--space-sm)">
                <i data-lucide="file-3d" style="width:20px;height:20px;color:var(--color-primary)"></i>
                <span>${file.filename}</span>
                ${sizeStr ? `<span style="color:var(--text-muted);font-size:0.8rem">(${sizeStr})</span>` : ''}
            </div>
            <button type="button" class="thumb-delete-btn" onclick="removeExistingFile('${file.id}')" title="מחק">
                <i data-lucide="x" style="width:14px;height:14px"></i>
            </button>
        </div>
    `;
}

function handleMediaSelect(fileList) {
    for (const file of fileList) {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
        pendingMediaFiles.push(file);
        addMediaPreview(file);
    }
}

function addMediaPreview(file) {
    const grid = document.getElementById('mediaPreviewGrid');
    const idx = pendingMediaFiles.indexOf(file);
    const div = document.createElement('div');
    div.className = 'upload-thumb';
    div.dataset.pendingIdx = idx;

    if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        div.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        div.appendChild(img);
    }

    div.innerHTML += `
        <div class="thumb-actions">
            <button type="button" class="thumb-cover-btn" onclick="setPendingCover(${idx})" title="תמונת כיסוי">
                <i data-lucide="star" style="width:14px;height:14px"></i>
            </button>
            <button type="button" class="thumb-delete-btn" onclick="removePendingMedia(${idx})" title="מחק">
                <i data-lucide="x" style="width:14px;height:14px"></i>
            </button>
        </div>
    `;
    grid.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleFilesSelect(fileList) {
    for (const file of fileList) {
        pendingDownloadFiles.push(file);
        addFilePreview(file);
    }
}

function addFilePreview(file) {
    const list = document.getElementById('filesPreviewList');
    const idx = pendingDownloadFiles.indexOf(file);
    const div = document.createElement('div');
    div.className = 'upload-file-item';
    div.dataset.pendingIdx = idx;
    div.innerHTML = `
        <div style="display:flex;align-items:center;gap:var(--space-sm)">
            <i data-lucide="file" style="width:20px;height:20px;color:var(--color-primary)"></i>
            <span>${file.name}</span>
            <span style="color:var(--text-muted);font-size:0.8rem">(${formatFileSize(file.size)})</span>
        </div>
        <button type="button" class="thumb-delete-btn" onclick="removePendingFile(${idx})" title="מחק">
            <i data-lucide="x" style="width:14px;height:14px"></i>
        </button>
    `;
    list.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removePendingMedia(idx) {
    pendingMediaFiles[idx] = null;
    const el = document.querySelector(`.upload-thumb[data-pending-idx="${idx}"]`);
    if (el) el.remove();
}

function removePendingFile(idx) {
    pendingDownloadFiles[idx] = null;
    const el = document.querySelector(`.upload-file-item[data-pending-idx="${idx}"]`);
    if (el) el.remove();
}

function setPendingCover(idx) {
    // Clear all cover states
    document.querySelectorAll('.thumb-cover-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cover-tag').forEach(t => t.remove());
    existingMedia.forEach(m => m.is_cover = false);

    const btn = document.querySelector(`.upload-thumb[data-pending-idx="${idx}"] .thumb-cover-btn`);
    if (btn) {
        btn.classList.add('active');
        const parent = btn.closest('.upload-thumb');
        parent.insertAdjacentHTML('beforeend', '<span class="cover-tag">כיסוי</span>');
    }
    pendingMediaFiles._coverIdx = idx;
}

function setExistingCover(mediaId) {
    document.querySelectorAll('.thumb-cover-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cover-tag').forEach(t => t.remove());
    existingMedia.forEach(m => m.is_cover = false);
    delete pendingMediaFiles._coverIdx;

    const media = existingMedia.find(m => m.id === mediaId);
    if (media) media.is_cover = true;

    const btn = document.querySelector(`.upload-thumb[data-existing-id="${mediaId}"] .thumb-cover-btn`);
    if (btn) {
        btn.classList.add('active');
        const parent = btn.closest('.upload-thumb');
        parent.insertAdjacentHTML('beforeend', '<span class="cover-tag">כיסוי</span>');
    }
}

async function removeExistingMedia(mediaId) {
    if (!confirm('למחוק את המדיה?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('product_media').delete().eq('id', mediaId);
    existingMedia = existingMedia.filter(m => m.id !== mediaId);
    const el = document.querySelector(`.upload-thumb[data-existing-id="${mediaId}"]`);
    if (el) el.remove();
    showToast('המדיה נמחקה');
}

async function removeExistingFile(fileId) {
    if (!confirm('למחוק את הקובץ?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('product_files').delete().eq('id', fileId);
    existingFiles = existingFiles.filter(f => f.id !== fileId);
    const el = document.querySelector(`.upload-file-item[data-existing-id="${fileId}"]`);
    if (el) el.remove();
    showToast('הקובץ נמחק');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function loadCategorySelect(selectedId) {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('categories').select('*').order('sort_order');
    const select = document.getElementById('pCategory');
    if (data) {
        data.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            if (cat.id === selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    }
}

async function saveProduct(e, id) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) return;

    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i data-lucide="loader" style="animation:spin 1s linear infinite"></i> שומר...';

    const priceVal = document.getElementById('pPrice').value;
    const salePriceVal = document.getElementById('pSalePrice').value;

    const productData = {
        title: document.getElementById('pTitle').value,
        slug: document.getElementById('pSlug').value,
        description: document.getElementById('pDesc').value,
        category_id: document.getElementById('pCategory').value || null,
        price: priceVal ? parseFloat(priceVal) : null,
        sale_price: salePriceVal ? parseFloat(salePriceVal) : null,
        material: document.getElementById('pMaterial').value,
        print_time: document.getElementById('pPrintTime').value,
        dimensions: document.getElementById('pDimensions').value,
        featured: document.getElementById('pFeatured').checked,
        updated_at: new Date().toISOString()
    };

    let productId = id;
    let error;

    if (id) {
        console.log('Updating product:', id);
        ({ error } = await db.from('products').update(productData).eq('id', id));
    } else {
        console.log('Inserting new product...');
        const result = await db.from('products').insert(productData).select('id').single();
        error = result.error;
        if (result.data) {
            productId = result.data.id;
            console.log('New product ID:', productId);
        }
    }

    if (error || !productId) {
        console.error('Initial save error:', error);
        alert('שגיאה בשמירת המוצר: ' + (error?.message || 'לא התקבל מזהה מוצר'));
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="save"></i> שמור';
        return;
    }

    // Update existing media cover states
    for (const media of existingMedia) {
        await db.from('product_media').update({ is_cover: media.is_cover || false }).eq('id', media.id);
    }

    // Upload new media files
    const newMediaFiles = pendingMediaFiles.filter(f => f !== null);
    if (newMediaFiles.length > 0) console.log(`Uploading ${newMediaFiles.length} new media files...`);
    for (let i = 0; i < newMediaFiles.length; i++) {
        const file = newMediaFiles[i];
        const isVideo = file.type.startsWith('video/');
        const bucket = isVideo ? 'product-videos' : 'product-images';
        const ext = file.name.split('.').pop();
        const path = `${productId}/${Date.now()}_${i}.${ext}`;

        const { data: uploadData, error: uploadError } = await db.storage.from(bucket).upload(path, file, { upsert: true });

        if (!uploadError) {
            const { data: urlData } = db.storage.from(bucket).getPublicUrl(path);
            const isCover = pendingMediaFiles._coverIdx === pendingMediaFiles.indexOf(file);

            const { error: insertError } = await db.from('product_media').insert({
                product_id: productId,
                url: urlData.publicUrl,
                type: isVideo ? 'video' : 'image',
                is_cover: isCover,
                sort_order: existingMedia.length + i
            });
            if (insertError) console.error('Media DB record error:', insertError);
        } else {
            console.error('Media upload error:', uploadError);
        }
    }

    // Upload new downloadable files
    const newDownloadFiles = pendingDownloadFiles.filter(f => f !== null);
    if (newDownloadFiles.length > 0) console.log(`Uploading ${newDownloadFiles.length} new downloadable files...`);
    for (let i = 0; i < newDownloadFiles.length; i++) {
        const file = newDownloadFiles[i];
        const ext = file.name.split('.').pop();
        const sanitizedName = sanitizeFilename(file.name);
        const path = `${productId}/${Date.now()}_${sanitizedName}`;

        console.log(`Uploading file ${i + 1}/${newDownloadFiles.length}: ${file.name}`);
        const { data: uploadData, error: uploadError } = await db.storage.from('product-files').upload(path, file, { upsert: true });

        if (!uploadError) {
            const { data: urlData } = db.storage.from('product-files').getPublicUrl(path);

            const { error: insertError } = await db.from('product_files').insert({
                product_id: productId,
                filename: file.name,
                file_url: urlData.publicUrl,
                file_size: file.size,
                file_type: ext.toUpperCase()
            });
            if (insertError) {
                console.error('File DB record error:', insertError);
                alert(`הקובץ ${file.name} הועלה אך לא נרשם במסד הנתונים: ${insertError.message}`);
            } else {
                console.log(`Successfully saved file: ${file.name}`);
            }
        } else {
            console.error('File storage upload error:', uploadError);
            alert(`שגיאה בהעלאת הקובץ ${file.name}: ${uploadError.message}`);
        }
    }

    showToast(id ? 'המוצר עודכן בהצלחה' : 'המוצר נוצר בהצלחה');
    document.getElementById('productFormContainer').style.display = 'none';
    loadProductsList();
}

async function editProduct(id) {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('products').select(`
        *,
        product_media(id, url, type, sort_order, is_cover),
        product_files(id, filename, file_url, file_size, file_type)
    `).eq('id', id).single();
    if (data) showProductForm(data);
}

async function deleteProduct(id) {
    if (!confirm('בטוחים שרוצים למחוק את המוצר?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('products').delete().eq('id', id);
    showToast('המוצר נמחק');
    loadProductsList();
}

// Helper: Sanitize filename for Supabase Storage paths
function sanitizeFilename(filename) {
    // Remove extension to sanitize name separately
    const parts = filename.split('.');
    const ext = parts.pop();
    const name = parts.join('.');

    // Replace non-alphanumeric (allowing some basics) with underscores
    // We stay safe with ASCII for storage paths
    const sanitized = name.replace(/[^\w-]/g, '_');
    return sanitized + '.' + ext;
}

// ── Categories ──
async function loadCategoriesList() {
    const tree = await fetchCategoryTree();
    const container = document.getElementById('categoriesTree');

    if (!tree.length) {
        container.innerHTML = '<p style="color:var(--text-muted)">אין קטגוריות עדיין — צור את הקטגוריות שלך</p>';
        return;
    }

    container.innerHTML = renderCategoryTree(tree);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCategoryTree(categories, level = 0) {
    return categories.map(cat => `
        <div style="padding:var(--space-md);margin-right:${level * 24}px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-glass)">
            <div style="display:flex;align-items:center;gap:var(--space-sm)">
                <i data-lucide="${cat.icon || 'folder'}" style="width:18px;height:18px;color:var(--color-primary)"></i>
                <strong>${cat.name}</strong>
                <span style="color:var(--text-muted);font-size:0.8rem">${cat.slug}</span>
                ${cat.children?.length ? `<span class="badge">${cat.children.length} תת-קטגוריות</span>` : ''}
            </div>
            <div style="display:flex;gap:var(--space-sm)">
                <button class="btn btn-sm btn-secondary" onclick="editCategory('${cat.id}')"><i data-lucide="edit-2"></i></button>
                <button class="btn btn-sm btn-secondary" onclick="deleteCategory('${cat.id}')" style="color:var(--color-accent)"><i data-lucide="trash-2"></i></button>
            </div>
        </div>
        ${cat.children?.length ? renderCategoryTree(cat.children, level + 1) : ''}
    `).join('');
}

function showCategoryForm(category = null) {
    const container = document.getElementById('categoryFormContainer');
    container.style.display = 'block';
    container.innerHTML = `
        <div class="glass-card" style="padding:var(--space-xl);margin-bottom:var(--space-xl)">
            <h3 style="margin-bottom:var(--space-lg)">${category ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</h3>
            <form class="admin-form" onsubmit="saveCategory(event,'${category?.id || ''}')">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
                    <div class="form-group"><label>שם *</label><input type="text" id="catName" required value="${category?.name || ''}"></div>
                    <div class="form-group"><label>Slug *</label><input type="text" id="catSlug" required value="${category?.slug || ''}"></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md)">
                    <div class="form-group"><label>אייקון (lucide)</label><input type="text" id="catIcon" value="${category?.icon || 'box'}" placeholder="box"></div>
                    <div class="form-group"><label>קטגוריית אב</label><select id="catParent"><option value="">ראשית</option></select></div>
                    <div class="form-group"><label>סדר</label><input type="number" id="catSort" value="${category?.sort_order || 0}"></div>
                </div>
                <div class="form-group"><label>תיאור</label><textarea id="catDesc" rows="2">${category?.description || ''}</textarea></div>
                <div style="display:flex;gap:var(--space-md)">
                    <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> שמור</button>
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('categoryFormContainer').style.display='none'">ביטול</button>
                </div>
            </form>
        </div>
    `;

    // Load parent categories
    (async () => {
        const db = getSupabase();
        if (!db) return;
        const { data } = await db.from('categories').select('id,name').is('parent_id', null).order('sort_order');
        const sel = document.getElementById('catParent');
        if (data) data.forEach(c => {
            if (c.id !== category?.id) {
                const opt = document.createElement('option');
                opt.value = c.id; opt.textContent = c.name;
                if (c.id === category?.parent_id) opt.selected = true;
                sel.appendChild(opt);
            }
        });
    })();

    // Auto-generate slug for new categories
    if (!category) {
        document.getElementById('catName').addEventListener('input', (e) => {
            document.getElementById('catSlug').value = e.target.value.replace(/\s+/g, '-').replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '').toLowerCase();
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function saveCategory(e, id) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) return;

    const catData = {
        name: document.getElementById('catName').value,
        slug: document.getElementById('catSlug').value,
        icon: document.getElementById('catIcon').value,
        parent_id: document.getElementById('catParent').value || null,
        sort_order: parseInt(document.getElementById('catSort').value) || 0,
        description: document.getElementById('catDesc').value
    };

    let error;
    if (id) {
        ({ error } = await db.from('categories').update(catData).eq('id', id));
    } else {
        ({ error } = await db.from('categories').insert(catData));
    }

    if (error) { alert('שגיאה: ' + error.message); return; }
    showToast(id ? 'הקטגוריה עודכנה' : 'הקטגוריה נוצרה');
    document.getElementById('categoryFormContainer').style.display = 'none';
    loadCategoriesList();
}

async function editCategory(id) {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('categories').select('*').eq('id', id).single();
    if (data) showCategoryForm(data);
}

async function deleteCategory(id) {
    if (!confirm('בטוחים? פעולה זו תמחק את הקטגוריה.')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('categories').delete().eq('id', id);
    showToast('הקטגוריה נמחקה');
    loadCategoriesList();
}

// ── Comments ──
async function loadCommentsList() {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('comments').select('*, products(title)').order('created_at', { ascending: false });
    const tbody = document.getElementById('commentsBody');

    if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">אין תגובות</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(c => `<tr>
        <td><strong>${c.author_name}</strong><br><span style="color:var(--text-muted);font-size:0.8rem">${c.author_email || ''}</span></td>
        <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis">${c.content}</td>
        <td>${c.products?.title || '—'}</td>
        <td>${c.approved ? '<span class="badge" style="background:rgba(92,184,92,0.15);color:#5cb85c">מאושר</span>' : '<span class="badge badge-accent">ממתין</span>'}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${new Date(c.created_at).toLocaleDateString('he-IL')}</td>
        <td>
            ${!c.approved ? `<button class="btn btn-sm btn-secondary" onclick="approveComment('${c.id}')" style="color:var(--color-success)"><i data-lucide="check"></i></button>` : ''}
            <button class="btn btn-sm btn-secondary" onclick="deleteComment('${c.id}')" style="color:var(--color-accent)"><i data-lucide="trash-2"></i></button>
        </td>
    </tr>`).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function approveComment(id) {
    const db = getSupabase();
    if (!db) return;
    await db.from('comments').update({ approved: true }).eq('id', id);
    showToast('התגובה אושרה');
    loadCommentsList();
}

async function deleteComment(id) {
    if (!confirm('למחוק את התגובה?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('comments').delete().eq('id', id);
    showToast('התגובה נמחקה');
    loadCommentsList();
}

// ── Messages ──
async function loadMessagesList() {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('contact_messages').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('messagesBody');

    if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">אין הודעות</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(m => `<tr>
        <td><strong>${m.name}</strong></td>
        <td>${m.email || '—'}</td>
        <td>${m.subject || '—'}</td>
        <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis">${m.message}</td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${new Date(m.created_at).toLocaleDateString('he-IL')}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="deleteMessage('${m.id}')" style="color:var(--color-accent)"><i data-lucide="trash-2"></i></button></td>
    </tr>`).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function deleteMessage(id) {
    if (!confirm('למחוק את ההודעה?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('contact_messages').delete().eq('id', id);
    showToast('ההודעה נמחקה');
    loadMessagesList();
}

// ── Blogs ──
async function loadBlogsList() {
    const db = getSupabase();
    if (!db) return;

    const { data, error } = await db.from('blog_posts').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('blogsBody');

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted)">אין מאמרים עדיין</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(p => {
        const thumb = p.cover_image ? `<img src="${p.cover_image}" class="thumb" alt="">` : '<div class="thumb" style="background:var(--bg-glass)"></div>';
        const statusBadge = p.status === 'published' ? '<span class="badge" style="background:rgba(92,184,92,0.15);color:#5cb85c">פורסם</span>' : '<span class="badge badge-accent">טיוטה</span>';

        return `<tr>
            <td>${thumb}</td>
            <td><strong>${p.title}</strong></td>
            <td>${statusBadge}</td>
            <td><i data-lucide="eye" style="width:12px;height:12px;margin-left:4px"></i>${p.view_count || 0}</td>
            <td style="font-size:0.8rem;color:var(--text-muted)">${new Date(p.created_at).toLocaleDateString('he-IL')}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editBlog('${p.id}')"><i data-lucide="edit-2"></i></button>
                <button class="btn btn-sm btn-secondary" onclick="deleteBlog('${p.id}')" style="color:var(--color-accent)"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showBlogForm(post = null) {
    const container = document.getElementById('blogFormContainer');
    container.style.display = 'block';

    container.innerHTML = `
        <div class="glass-card" style="padding:var(--space-xl);margin-bottom:var(--space-xl)">
            <h3 style="margin-bottom:var(--space-lg)">${post ? 'עריכת מאמר' : 'מאמר חדש'}</h3>
            <form class="admin-form" onsubmit="saveBlog(event,'${post?.id || ''}')">
                <div class="form-group">
                    <label>כותרת *</label>
                    <input type="text" id="bTitle" required value="${post?.title || ''}" placeholder="כותרת המאמר">
                </div>
                <div class="form-group">
                    <label>Slug (URL) *</label>
                    <input type="text" id="bSlug" required value="${post?.slug || ''}" placeholder="post-title">
                </div>
                <div class="form-group">
                    <label>תקציר</label>
                    <textarea id="bExcerpt" rows="2" placeholder="תקציר קצר שיופיע בכרטיס המאמר...">${post?.excerpt || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>תוכן (HTML)</label>
                    <textarea id="bContent" rows="10" placeholder="תוכן המאמר ב-HTML...">${post?.content || ''}</textarea>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
                    <div class="form-group">
                        <label>תמונת כיסוי (URL)</label>
                        <input type="text" id="bCoverImage" value="${post?.cover_image || ''}" placeholder="URL של התמונה">
                    </div>
                    <div class="form-group">
                        <label>סטטוס</label>
                        <select id="bStatus">
                            <option value="published" ${post?.status === 'published' ? 'selected' : ''}>פורסם</option>
                            <option value="draft" ${post?.status === 'draft' ? 'selected' : ''}>טיוטה</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>תגיות (מופרדות בפסיק)</label>
                    <input type="text" id="bTags" value="${(post?.tags || []).join(', ')}" placeholder="תלת מימד, טיפים, מדריכים">
                </div>
                <div style="display:flex;gap:var(--space-md);margin-top:var(--space-lg)">
                    <button type="submit" class="btn btn-primary" id="saveBlogBtn"><i data-lucide="save"></i> שמור</button>
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('blogFormContainer').style.display='none'">ביטול</button>
                </div>
            </form>
        </div>
    `;

    // Auto-generate slug
    document.getElementById('bTitle').addEventListener('input', (e) => {
        const slugField = document.getElementById('bSlug');
        if (!post) {
            slugField.value = e.target.value.replace(/\s+/g, '-').replace(/[^\u0590-\u05FFa-zA-Z0-9-]/g, '').toLowerCase();
        }
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function saveBlog(e, id) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) return;

    const saveBtn = document.getElementById('saveBlogBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i data-lucide="loader" style="animation:spin 1s linear infinite"></i> שומר...';

    const blogData = {
        title: document.getElementById('bTitle').value,
        slug: document.getElementById('bSlug').value,
        excerpt: document.getElementById('bExcerpt').value,
        content: document.getElementById('bContent').value,
        cover_image: document.getElementById('bCoverImage').value,
        status: document.getElementById('bStatus').value,
        tags: document.getElementById('bTags').value.split(',').map(s => s.trim()).filter(s => s !== ''),
        updated_at: new Date().toISOString()
    };

    let error;
    if (id) {
        ({ error } = await db.from('blog_posts').update(blogData).eq('id', id));
    } else {
        ({ error } = await db.from('blog_posts').insert(blogData));
    }

    if (error) {
        alert('שגיאה בשמירת המאמר: ' + error.message);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="save"></i> שמור';
        return;
    }

    showToast(id ? 'המאמר עודכן בהצלחה' : 'המאמר נוצר בהצלחה');
    document.getElementById('blogFormContainer').style.display = 'none';
    loadBlogsList();
}

async function editBlog(id) {
    const db = getSupabase();
    if (!db) return;
    const { data } = await db.from('blog_posts').select('*').eq('id', id).single();
    if (data) showBlogForm(data);
}

async function deleteBlog(id) {
    if (!confirm('בטוחים שרוצים למחוק את המאמר?')) return;
    const db = getSupabase();
    if (!db) return;
    await db.from('blog_posts').delete().eq('id', id);
    showToast('המאמר נמחק');
    loadBlogsList();
}

// ── CSS for spin animation ──
const adminStyleExtra = document.createElement('style');
adminStyleExtra.textContent = `@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`;
document.head.appendChild(adminStyleExtra);

// ── Init ──
document.addEventListener('DOMContentLoaded', () => { checkAuth(); });
