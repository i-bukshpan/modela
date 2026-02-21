/**
 * Supabase Client Initialization
 * This file initializes the Supabase client for use across the application
 */

if (typeof SUPABASE_URL === 'undefined') {
    var SUPABASE_URL = 'https://onfgfiidwvdmlfubwqmv.supabase.co';
}
if (typeof SUPABASE_ANON_KEY === 'undefined') {
    var SUPABASE_ANON_KEY = 'sb_publishable_u7SKsP70TVWn0no55C6U5g_mG7RAl-x';
}

if (typeof supabaseClient === 'undefined') {
    var supabaseClient = null;
}

function getSupabase() {
    if (!supabaseClient && typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

// Helper: fetch products with optional filters
async function fetchProducts(options = {}) {
    const db = getSupabase();
    if (!db) return [];

    let query = db.from('products').select(`
        *,
        categories(id, name, slug),
        product_media(id, url, type, sort_order, is_cover),
        comments(count)
    `).order('created_at', { ascending: false });

    if (options.category) {
        query = query.eq('category_id', options.category);
    }
    if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    if (options.featured) {
        query = query.eq('featured', true);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }
    if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 12) - 1);
    }

    const { data, error } = await query;
    if (error) { console.error('Error fetching products:', error); return []; }
    return data || [];
}

// Helper: fetch single product by slug
async function fetchProduct(slug) {
    const db = getSupabase();
    if (!db) return null;

    const { data, error } = await db.from('products').select(`
        *,
        categories(id, name, slug, parent_id),
        product_media(id, url, type, sort_order, is_cover),
        product_files(id, filename, file_url, file_size, file_type, download_count),
        comments(count)
    `).eq('slug', slug).single();

    if (error) { console.error('Error fetching product:', error); return null; }
    return data;
}

// Helper: fetch categories
async function fetchCategories(parentId = null) {
    const db = getSupabase();
    if (!db) return [];

    let query = db.from('categories').select('*').order('sort_order', { ascending: true });
    if (parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;
    if (error) { console.error('Error fetching categories:', error); return []; }
    return data || [];
}

// Helper: fetch all categories tree
async function fetchCategoryTree() {
    const db = getSupabase();
    if (!db) return [];

    const { data, error } = await db.from('categories')
        .select('*').order('sort_order', { ascending: true });

    if (error) { console.error('Error:', error); return []; }

    const categories = data || [];
    const tree = [];
    const map = {};

    categories.forEach(cat => { map[cat.id] = { ...cat, children: [] }; });
    categories.forEach(cat => {
        if (cat.parent_id && map[cat.parent_id]) {
            map[cat.parent_id].children.push(map[cat.id]);
        } else {
            tree.push(map[cat.id]);
        }
    });
    return tree;
}

// Helper: fetch comments for a product
async function fetchComments(productId) {
    const db = getSupabase();
    if (!db) return [];

    const { data, error } = await db.from('comments')
        .select('*')
        .eq('product_id', productId)
        .eq('approved', true)
        .order('created_at', { ascending: false });

    if (error) { console.error('Error fetching comments:', error); return []; }
    return data || [];
}

// Helper: submit comment
async function submitComment(productId, name, email, content) {
    const db = getSupabase();
    if (!db) return null;

    const { data, error } = await db.from('comments').insert({
        product_id: productId,
        author_name: name,
        author_email: email,
        content: content,
        approved: false
    }).select();

    if (error) { console.error('Error submitting comment:', error); return null; }
    return data;
}

// Helper: increment download count
async function trackDownload(fileId) {
    const db = getSupabase();
    if (!db) return;
    await db.rpc('increment_download', { file_id: fileId });
}

// Helper: increment product view
async function incrementProductView(productId) {
    const db = getSupabase();
    if (!db) return;
    await db.rpc('increment_view', { product_id: productId });
}

// Helper: increment product like
async function incrementProductLike(productId) {
    const db = getSupabase();
    if (!db) return;
    await db.rpc('increment_like', { product_id: productId });
}

async function decrementProductLike(productId) {
    const db = getSupabase();
    if (!db) return;
    await db.rpc('decrement_like', { product_id: productId });
}

// Helper: fetch site statistics
async function fetchStats() {
    const db = getSupabase();
    if (!db) return { products: 0, customers: 200, files: 0, comments: 0 };

    try {
        const [
            { count: products },
            { count: files },
            { count: comments }
        ] = await Promise.all([
            db.from('products').select('*', { count: 'exact', head: true }),
            db.from('product_files').select('*', { count: 'exact', head: true }),
            db.from('comments').select('*', { count: 'exact', head: true }).eq('approved', true)
        ]);

        return {
            products: products || 0,
            customers: 200 + (products || 0), // Base aesthetic number + products
            files: files || 0,
            comments: comments || 0
        };
    } catch (err) {
        console.error('Error fetching stats:', err);
        return { products: 0, customers: 200, files: 0, comments: 0 };
    }
}

// Toast notification
function showToast(message, icon = 'check-circle') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="${icon}"></i> ${message}`;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [toast] });
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
