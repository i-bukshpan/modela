<!-- Contact Page -->

<section class="contact-page">
    <div class="container">
        <div class="section-header animate-on-scroll">
            <span class="badge">צור קשר</span>
            <h2>שלח רעיון, <span class="gradient-text">ניצור יחד</span></h2>
            <p>יש לכם שאלה, רעיון לפרויקט או צורך בייעוץ טכני? אנחנו כאן כדי להפוך את הדמיון שלכם למציאות.</p>
        </div>

        <div class="contact-grid">
            <!-- Contact Info -->
            <div class="contact-info glass-card animate-on-scroll">
                <div class="info-header">
                    <h3>בואו <span class="gradient-text">נדבר</span></h3>
                    <p>צוות המומחים שלנו זמין עבורכם לכל שאלה.</p>
                </div>

                <div class="contact-methods">
                    <a href="tel:+972504283555" class="contact-method">
                        <div class="method-icon"><i data-lucide="phone"></i></div>
                        <div class="method-content">
                            <h4>טלפון</h4>
                            <p>050-428-3555</p>
                        </div>
                    </a>
                    <a href="https://wa.me/972504283555" target="_blank" class="contact-method">
                        <div class="method-icon" style="background:rgba(37,211,102,0.15);color:#25d366">
                            <i data-lucide="message-circle"></i>
                        </div>
                        <div class="method-content">
                            <h4>וואטסאפ</h4>
                            <p>שיחה ישירה ומהירה</p>
                        </div>
                    </a>
                    <a href="mailto:yb8511@gmail.com" class="contact-method">
                        <div class="method-icon"><i data-lucide="mail"></i></div>
                        <div class="method-content">
                            <h4>אימייל</h4>
                            <p>yb8511@gmail.com</p>
                        </div>
                    </a>
                    <div class="contact-method">
                        <div class="method-icon"><i data-lucide="map-pin"></i></div>
                        <div class="method-content">
                            <h4>סטודיו</h4>
                            <p>רחוב יעקב מוצפי, ביתר עילית</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Form -->
            <div class="contact-form-card glass-card animate-on-scroll">
                <h3>שלחו לנו הודעה</h3>
                <form id="contactForm" class="admin-form" onsubmit="handleContactSubmit(event)">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)">
                        <div class="form-group">
                            <label for="contactName">שם מלא *</label>
                            <input type="text" id="contactName" required placeholder="ישראל ישראלי">
                        </div>
                        <div class="form-group">
                            <label for="contactPhone">טלפון</label>
                            <input type="tel" id="contactPhone" placeholder="050-000-0000">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="contactEmail">אימייל *</label>
                        <input type="email" id="contactEmail" required placeholder="email@example.com">
                    </div>
                    <div class="form-group">
                        <label for="contactSubject">נושא הפנייה</label>
                        <input type="text" id="contactSubject" placeholder="מה תרצו שנדפיס לכם?">
                    </div>
                    <div class="form-group">
                        <label for="contactMessage">הודעה *</label>
                        <textarea id="contactMessage" required placeholder="ספרו לנו קצת על הרעיון או השאלה שלכם..."
                            rows="5"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;margin-top:var(--space-md)">
                        <i data-lucide="send"></i>
                        שליחת הודעה
                    </button>
                </form>
            </div>
        </div>
    </div>
</section>

<script>
    async function handleContactSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2"></i> שולח...';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });

        // Save to Supabase contact_messages table (or use any method)
        const db = getSupabase();
        if (db) {
            try {
                await db.from('contact_messages').insert({
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    phone: document.getElementById('contactPhone').value,
                    subject: document.getElementById('contactSubject').value,
                    message: document.getElementById('contactMessage').value
                });
            } catch (err) {
                console.log('Contact save error (table may not exist):', err);
            }
        }

        showToast('ההודעה נשלחה בהצלחה! נחזור אליכם בהקדם.');
        form.reset();

        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send"></i> שליחה';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [btn] });
    }
</script>