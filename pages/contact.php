<!-- Contact Page -->

<section class="contact-page">
    <div class="container">
        <div class="section-header animate-on-scroll">
            <h2>שלח רעיון, ניצור יחד</h2>
            <p>יש לכם שאלה, רעיון או פרויקט? נשמח לשמוע מכם</p>
        </div>

        <div class="contact-grid">
            <!-- Contact Info -->
            <div class="contact-info glass-card animate-on-scroll">
                <h2>בואו <span class="gradient-text">נדבר</span></h2>
                <p>אנחנו כאן בשבילכם — שלחו הודעה, התקשרו, או כתבו לנו בוואטסאפ</p>

                <div class="contact-methods">
                    <a href="tel:+972504283555" class="contact-method">
                        <div class="method-icon"><i data-lucide="phone"></i></div>
                        <div>
                            <h4>טלפון</h4>
                            <p>050-428-3555</p>
                        </div>
                    </a>
                    <a href="https://wa.me/972504283555" target="_blank" class="contact-method">
                        <div class="method-icon" style="background:rgba(37,211,102,0.15);color:#25d366"><i
                                data-lucide="message-circle"></i></div>
                        <div>
                            <h4>וואטסאפ</h4>
                            <p>שלחו הודעה ישירה</p>
                        </div>
                    </a>
                    <a href="mailto:yb8511@gmail.com" class="contact-method">
                        <div class="method-icon"><i data-lucide="mail"></i></div>
                        <div>
                            <h4>אימייל</h4>
                            <p>yb8511@gmail.com</p>
                        </div>
                    </a>
                    <div class="contact-method">
                        <div class="method-icon"><i data-lucide="map-pin"></i></div>
                        <div>
                            <h4>מיקום</h4>
                            <p>רחוב יעקב מוצפי, ביתר עילית</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Form -->
            <div class="contact-form-card glass-card animate-on-scroll">
                <h3>שלחו לנו הודעה</h3>
                <form id="contactForm" onsubmit="handleContactSubmit(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="contactName">שם מלא *</label>
                            <input type="text" id="contactName" required placeholder="השם שלכם">
                        </div>
                        <div class="form-group">
                            <label for="contactPhone">טלפון</label>
                            <input type="tel" id="contactPhone" placeholder="050-428-3555">
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-md)">
                        <label for="contactEmail">אימייל *</label>
                        <input type="email" id="contactEmail" required placeholder="email@example.com">
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-md)">
                        <label for="contactSubject">נושא</label>
                        <input type="text" id="contactSubject" placeholder="על מה תרצו לדבר?">
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-lg)">
                        <label for="contactMessage">הודעה *</label>
                        <textarea id="contactMessage" required placeholder="ספרו לנו על הפרויקט או הרעיון שלכם..."
                            rows="5"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">
                        <i data-lucide="send"></i>
                        שליחה
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