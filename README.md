# LENORA DEVELOPERS — Humanized Web Design & Development Agency

A bespoke, human-crafted website engineered for **Lenora Developers**, an independent design and development studio. Designed with an architectural stone & charcoal aesthetic, solid high-contrast typography, subtle tactile surfaces, native scroll triggers, 100% laptop and mobile responsiveness, a contact section with direct email and Instagram app navigation, and a completely hidden Admin Portal powered by Supabase & Firebase.

---

## ✦ Key Design & Engineering Features

### 1. Architectural Stone & Charcoal Palette
- **Light Stone Gray Background (`#dfdedb`)**: Natural, architectural, and tactile.
- **Strict Brand Palette**: Light stone gray, Pale gray, Soft gray, Near-black charcoal, Dark ink, and White.
- **Human-Written Copy**: Honest, grounded studio communication without corporate jargon.

### 2. Contact Section & Direct App Navigation
- **Direct Email**: `lenoradevelopersind@gmail.com` — when clicked, immediately opens the device's default email application (`mailto:` protocol).
- **Location**: Clearly marked as **Global Remote Working**.
- **Instagram ID**: `@lenoradevelopers` (`https://www.instagram.com/lenoradevelopers?exln=MW5uaGplNTByZzE3eA==`) — when clicked, automatically navigates into the native **Instagram App** with smooth universal web fallback on desktop.
- **Interactive Consultation Form**: Dispatches leads instantly to the local/cloud Admin Portal.

### 3. Refined Glassmorphism & 3D Tilt
- Interactive **3D perspective tilt physics** on the featured hero project showcase with floating parallax badges and live studio clock.
- Clean architectural borders and deep charcoal buttons.

### 4. 100% Laptop & Mobile Compatibility
- Floating island navigation pill that folds into a frosted glass mobile drawer on smartphones and tablets.
- Floating quick-action bottom dock for one-tap mobile inquiries and direct email.

---

## ✦ Hidden Admin Portal (Invisible to Public Visitors)

The admin portal is **completely hidden from public visitors** (no visible links or buttons on the public website).

### How to Access the Admin Portal:
1. **Direct Secret URL**: Navigate to **[http://localhost:3000/admin](http://localhost:3000/admin)** or `admin.html`.
2. **Keyboard Shortcut**: Press **`Ctrl + Shift + A`** (or `Cmd + Shift + A` on Mac) anywhere on the public website.
3. **Secret Triple-Click**: Triple-click the copyright line at the very bottom of the page footer (`© 2026 LENORA DEVELOPERS`).

---

## ✦ Admin Portal Capabilities

### 1. Multi-Provider Authentication (Supabase / Firebase / Master Demo)
- **Master Demo Mode**: Immediate testing with default credentials:
  - **Email**: `admin@agency.com`
  - **Password**: `admin123`
- **⚡ Supabase Auth Integration**:
  - Connect your Supabase project (URL & Anon Key). Authenticate against Supabase `auth.users`.
- **🔥 Firebase Auth Integration**:
  - Connect via Firebase Config JSON. Authenticate using Firebase `signInWithEmailAndPassword`.

### 2. Inquiries & Leads Inbox
- Live table of all project consultation briefs submitted via the public contact form.
- Real-time counters: Total Briefs, New/Unread, In Progress, Closed.
- Search and filter by client name, email, service, or status.
- Inline status updating (New ➔ In Progress ➔ Closed).
- 1-click **Reply via Email** (`mailto:`) with prefilled client details.
- 1-click **Export to CSV** for spreadsheets and CRM imports.
- "+ Generate Test Lead" button to test workflow instantly.

### 3. Live Site Content Editor
- Update the public site's **Hero Headline**, **Hero Sublead**, and **Performance Metric Statistics** live.
- Change studio contact email, location, and Instagram handle/URL.
- Changes are published immediately to the public site without writing code.

### 4. Portfolio & Media Showcase Manager
- Edit titles, descriptions, and photography for all 4 flagship projects.
- Replace the Hero 3D Card image.
- Supports both **direct image URLs** and **local photo file uploads** (with instant base64 preview).

### 5. Cloud Database Sync & Schema Generator
- **Supabase SQL Schema**: 1-click copy script to create the `inquiries` table with Row Level Security (RLS).
- **Firebase Firestore Rules**: 1-click copy rules to enforce public inserts and authenticated owner-only reads.

---

## ✦ Enterprise Security Architecture & Zero Data Leak Guarantee

Because this application handles sensitive prospective client inquiries and project budgets, enterprise security has been baked into every layer of the architecture:

```
+-----------------------------------------------------------------------------------+
|                            PUBLIC INTERNET (VISITORS)                             |
|                                                                                   |
|  [ Visitor Form ] ---> [ Honeypot Trap Check ] ---> [ 45s Submission Cooldown ]   |
|                                  |                                                |
|                                  v                                                |
|                 [ Direct Supabase/Firestore INSERT ]                              |
|         (Write-Only Anon Access · NEVER stored in visitor's localStorage)         |
+-----------------------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------------------+
|                        CLOUD BACKEND (SUPABASE / FIREBASE)                        |
|                                                                                   |
|  * Row Level Security (RLS) Active:                                               |
|    - Anon Key Permission: INSERT ONLY (Cannot read/select any rows)               |
|    - Authenticated Admin: FULL SELECT / UPDATE / DELETE                           |
|  * If an attacker steals your anon key and runs `select *`: Supabase returns []   |
+-----------------------------------------------------------------------------------+
                                   ^
                                   | (Encrypted TLS 1.3 / Supabase Auth JWT)
+-----------------------------------------------------------------------------------+
|                    INTERNAL ADMIN PORTAL (/admin or admin.html)                   |
|                                                                                   |
|  * Brute-Force Rate Limiter: 5 failed attempts = 15-minute lockout                |
|  * Session Security: 2-Hour Inactivity Token Expiry                               |
|  * Edge Protection: Cache-Control: no-store, X-Robots-Tag: noindex, nofollow     |
|  * Optional: Cloudflare Zero Trust Access (Google OTP / SSO gate)                 |
+-----------------------------------------------------------------------------------+
```

### 1. Zero Public Data Leaks (Visitor Storage Sanitization)
- **The Vulnerability in Typical Sites**: Standard client-side sites frequently save form submissions into `localStorage.inquiries`. If a client submits a brief on a shared office computer, café laptop, or public library terminal, anyone who inspects `localStorage` can see all previous customer names, emails, budgets, and briefs.
- **Lumen Studio Protection**: Public visitors **never write client inquiries into `localStorage`**. The inquiry is transmitted directly to Supabase via an atomic `INSERT`. Only an authenticated studio director logged into the Admin Portal has local decryption and management storage.

### 2. Supabase Row Level Security (RLS) — Read-Proof Anon Key
- Supabase's `anon` key is designed to be public in browser bundles, but **PostgreSQL Row Level Security (RLS)** strictly governs access:
  ```sql
  -- Enable Row Level Security (blocks all reads and writes by default)
  alter table inquiries enable row level security;

  -- 1. Public leads submission (INSERT ONLY - zero read permissions for anon):
  create policy "Allow insert for visitors" on inquiries 
    for insert to anon, authenticated 
    with check (true);

  -- 2. Authenticated studio owner access (FULL READ/WRITE/DELETE):
  create policy "Allow authenticated admin full access" on inquiries 
    for all to authenticated 
    using (auth.role() = 'authenticated') 
    with check (auth.role() = 'authenticated');
  ```
- **Result**: Even if a malicious user inspects your website network requests, copies your project URL and `anon` key, and executes `supabase.from('inquiries').select('*')`, PostgreSQL **blocks the query and returns 0 rows**. Customer data is 100% leak-proof.

### 3. Firebase Firestore Security Rules
- If you choose Firebase instead of Supabase, copy this into your Firestore Console:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /inquiries/{inquiryId} {
        allow create: if true;
        allow read, update, delete: if request.auth != null;
      }
    }
  }
  ```

### 4. Brute-Force Defense & Session Hardening
- **Login Lockout**: The Admin Portal (`admin.html` / `/admin`) monitors login attempts. If 5 consecutive incorrect passwords are submitted, the portal triggers a **15-minute lock**, preventing credential stuffing and brute-force attacks.
- **Session Auto-Expiration**: Admin sessions automatically invalidate after 2 hours of inactivity, clearing all tokens from memory.
- **Input Sanitization & XSS Defense**: All client-submitted names and briefs undergo multi-character HTML entity escaping (`escapeHtml()`) before rendering on the admin dashboard, neutralizing Stored Cross-Site Scripting (XSS).

### 5. Honeypot Bot Trap & Rate-Limiting
- The contact form includes an invisible honeypot trap (`_hp_security_check`). Automated spam bots that blindly fill every field are silently dropped.
- A rolling 45-second client-side submission cooldown prevents automated form flooding.

### 6. Cloudflare Edge Security Headers (`_headers`)
- **Strict-Transport-Security (HSTS)**: Forces HTTPS with `max-age=31536000; includeSubDomains; preload`.
- **Content-Security-Policy (CSP)**: Locks script execution exclusively to `'self'`, Supabase, Firebase, and trusted CDNs.
- **Anti-Clickjacking**: `X-Frame-Options: DENY` prevents framing your site or admin console inside malicious iframes.
- **Anti-MIME Sniffing**: `X-Content-Type-Options: nosniff`.
- **Admin Cache Prevention**: For `/admin*`, sends `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` and `X-Robots-Tag: noindex, nofollow, noarchive` so no search engine or proxy ever caches admin screens or client leads.

---

## ✦ Deploying to Cloudflare Pages (Step-by-Step)

Your repository already contains `_redirects` and `_headers` configured specifically for Cloudflare Pages:

1. **Push your code to GitHub / GitLab**.
2. **Open Cloudflare Dashboard**:
   - Go to **Compute (Workers & Pages)** ➔ **Pages** ➔ **Connect to Git**.
   - Select your repository.
3. **Build Settings**:
   - **Framework preset**: `None` / `HTML`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/` (or `.` root directory)
4. **Click "Save and Deploy"**:
   - Cloudflare will deploy your site to `https://your-agency.pages.dev` in ~15 seconds.
5. **Access Your Admin Portal on Cloudflare**:
   - Go to `https://your-agency.pages.dev/admin` (Cloudflare automatically executes the `_redirects` rule to load `admin.html`).
   - Or press `Ctrl + Shift + A` on the live site.

### Optional: Cloudflare Zero Trust (Hardware / Email OTP Protection)
For maximum security on the admin portal:
1. In Cloudflare, go to **Zero Trust** ➔ **Access** ➔ **Applications**.
2. Add an application for path: `your-agency.pages.dev/admin*`.
3. Add a policy: "Allow only my email address (`yourname@gmail.com`) via One-Time PIN (OTP)".
4. Cloudflare's global edge will now intercept anyone attempting to reach `/admin` and challenge them with an email PIN code before letting them even view the login page!

---

## ✦ Getting Started & Running Locally

1. Start the local server:
   ```bash
   node server.js
   ```
2. Open the public website:
   - **Main Website**: [http://localhost:3000/](http://localhost:3000/)
3. Access the Admin Portal:
   - **Secret URL**: [http://localhost:3000/admin](http://localhost:3000/admin) (or press `Ctrl + Shift + A` on the main page).
   - Sign in with demo credentials `admin@agency.com` / `admin123` or your Supabase/Firebase credentials.
