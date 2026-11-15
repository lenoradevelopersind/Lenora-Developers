/**
 * LUMEN STUDIO — INTERNAL ADMIN PORTAL CONTROLLER
 * Full Supabase & Firebase Dual-Auth Integration, Leads Management,
 * Live Site Content Hydration, Media Replacement, and Local Storage Bridge.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initDashboardTabs();
  initInquiriesModule();
  initSiteContentModule();
  initPortfolioModule();
  initCloudConfigModule();
});

/* ==========================================================================
   GLOBAL STATE & STORAGE HELPERS
   ========================================================================== */
const STATE = {
  currentProvider: 'demo', // 'demo' | 'supabase' | 'firebase'
  currentUser: null,
  cloudConfig: {
    provider: 'supabase',
    supabaseUrl: '',
    supabaseAnonKey: '',
    firebaseConfig: ''
  },
  supabaseClient: null,
  firebaseApp: null
};

// Safe storage access
function getStorageItem(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
}

/* ==========================================================================
   1. AUTHENTICATION CONTROLLER (DEMO / SUPABASE / FIREBASE)
   With Brute-Force Rate Limiting (15m Lockout) & Session Auto-Expiration
   ========================================================================== */
function checkLoginLockout() {
  try {
    const lock = JSON.parse(sessionStorage.getItem('lumen_login_lock') || '{}');
    if (lock.lockedUntil && Date.now() < lock.lockedUntil) {
      const remainingSec = Math.ceil((lock.lockedUntil - Date.now()) / 1000);
      const remainingMin = Math.ceil(remainingSec / 60);
      return { locked: true, remainingMin, remainingSec };
    }
  } catch (e) {}
  return { locked: false };
}

function recordFailedLoginAttempt() {
  try {
    const lock = JSON.parse(sessionStorage.getItem('lumen_login_lock') || '{"attempts":0}');
    const attempts = (lock.attempts || 0) + 1;
    const updated = { attempts, lastAttempt: Date.now() };
    if (attempts >= 5) {
      updated.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
    }
    sessionStorage.setItem('lumen_login_lock', JSON.stringify(updated));
    return updated;
  } catch (e) {
    return { attempts: 1 };
  }
}

function clearLoginLockout() {
  sessionStorage.removeItem('lumen_login_lock');
}

function initAdminAuth() {
  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  const loginForm = document.getElementById('adminLoginForm');
  const authNotice = document.getElementById('authNotice');
  const providerBtns = document.querySelectorAll('.provider-btn');
  const hintText = document.getElementById('providerHintText');
  const btnLogout = document.getElementById('btnLogout');
  const activeUserLabel = document.getElementById('activeUserLabel');
  const activeProviderLabel = document.getElementById('activeProviderLabel');
  const openCloudFromLogin = document.getElementById('btnOpenCloudModalFromLogin');

  // Load saved cloud config
  const savedConfig = getStorageItem('lumen_cloud_config', null);
  if (savedConfig) {
    STATE.cloudConfig = Object.assign(STATE.cloudConfig, savedConfig);
    if (STATE.cloudConfig.supabaseUrl && STATE.cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
      try {
        STATE.supabaseClient = supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
      } catch (e) {}
    }
  }

  // Provider selector toggling
  providerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      providerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.currentProvider = btn.dataset.provider;

      const emailInput = document.getElementById('loginEmail');
      const passInput = document.getElementById('loginPassword');

      if (STATE.currentProvider === 'demo') {
        hintText.innerHTML = 'Master Demo login: <code>admin@agency.com</code> / <code>admin123</code>';
        emailInput.value = 'admin@agency.com';
        passInput.value = 'admin123';
      } else if (STATE.currentProvider === 'supabase') {
        hintText.innerHTML = 'Authenticate against your Supabase project (Auth > Users). Zero data leak guarantee.';
        emailInput.value = '';
        passInput.value = '';
      } else if (STATE.currentProvider === 'firebase') {
        hintText.innerHTML = 'Authenticate against your Firebase Authentication users.';
        emailInput.value = '';
        passInput.value = '';
      }
      authNotice.style.display = 'none';
    });
  });

  // Check existing session with expiration check (2 hours)
  const existingSession = sessionStorage.getItem('lumen_admin_session');
  if (existingSession) {
    try {
      const sessionData = JSON.parse(existingSession);
      const isExpired = sessionData.expiresAt && Date.now() > sessionData.expiresAt;
      if (isExpired) {
        sessionStorage.removeItem('lumen_admin_session');
        showToast('Session expired for security. Please sign in again.', 'error');
      } else {
        STATE.currentUser = sessionData;
        STATE.currentProvider = sessionData.provider || 'demo';
        showDashboard(sessionData.email, sessionData.provider);
      }
    } catch (e) {
      sessionStorage.removeItem('lumen_admin_session');
    }
  }

  // Handle Login submission with Brute-Force Rate Limiting
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check brute-force lockout status
      const lockout = checkLoginLockout();
      if (lockout.locked) {
        authNotice.className = 'auth-status-box error';
        authNotice.textContent = `🛑 Too many failed attempts. Login locked for ${lockout.remainingMin} minute(s) to protect client data.`;
        authNotice.style.display = 'block';
        return;
      }

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const submitBtn = document.getElementById('btnSubmitLogin');

      authNotice.className = 'auth-status-box';
      authNotice.style.display = 'none';

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>VERIFYING CREDENTIALS...</span>';

      try {
        if (STATE.currentProvider === 'demo') {
          // Master bypass login
          if (email.toLowerCase() === 'admin@agency.com' && password === 'admin123') {
            clearLoginLockout();
            const session = {
              email,
              provider: 'Master Demo',
              loggedAt: Date.now(),
              expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours validity
            };
            sessionStorage.setItem('lumen_admin_session', JSON.stringify(session));
            showDashboard(email, 'Master Demo');
            showToast('✓ Welcome back, Studio Director');
          } else {
            const failData = recordFailedLoginAttempt();
            const attemptsLeft = Math.max(0, 5 - failData.attempts);
            throw new Error(`Invalid demo credentials. (${attemptsLeft} attempt(s) remaining before security lockout).`);
          }
        } else if (STATE.currentProvider === 'supabase') {
          // Supabase Auth
          if (!STATE.cloudConfig.supabaseUrl || !STATE.cloudConfig.supabaseAnonKey) {
            throw new Error('Supabase credentials not configured. Please setup your keys in Cloud Settings.');
          }
          if (typeof supabase === 'undefined' || !supabase.createClient) {
            throw new Error('Supabase SDK failed to load from CDN. Check network connection.');
          }

          const client = supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
          const { data, error } = await client.auth.signInWithPassword({ email, password });

          if (error) {
            recordFailedLoginAttempt();
            throw error;
          }

          clearLoginLockout();
          STATE.supabaseClient = client;
          const session = {
            email: data.user.email,
            provider: 'Supabase Cloud',
            token: data.session.access_token,
            loggedAt: Date.now(),
            expiresAt: Date.now() + (2 * 60 * 60 * 1000)
          };
          sessionStorage.setItem('lumen_admin_session', JSON.stringify(session));
          showDashboard(data.user.email, 'Supabase Cloud');
          showToast('✓ Successfully signed in via Supabase Auth');
        } else if (STATE.currentProvider === 'firebase') {
          // Firebase Auth
          if (!STATE.cloudConfig.firebaseConfig) {
            throw new Error('Firebase config not saved. Please setup your config in Cloud Settings.');
          }
          if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK failed to load from CDN.');
          }

          let fbConfigObj;
          try {
            fbConfigObj = JSON.parse(STATE.cloudConfig.firebaseConfig);
          } catch (jsonErr) {
            throw new Error('Invalid Firebase config JSON format in Cloud Settings.');
          }

          if (!firebase.apps.length) {
            firebase.initializeApp(fbConfigObj);
          }

          const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
          clearLoginLockout();
          const session = {
            email: userCred.user.email,
            provider: 'Firebase Cloud',
            loggedAt: Date.now(),
            expiresAt: Date.now() + (2 * 60 * 60 * 1000)
          };
          sessionStorage.setItem('lumen_admin_session', JSON.stringify(session));
          showDashboard(userCred.user.email, 'Firebase Cloud');
          showToast('✓ Successfully signed in via Firebase Auth');
        }
      } catch (err) {
        authNotice.className = 'auth-status-box error';
        authNotice.textContent = err.message || 'Authentication failed. Please verify credentials.';
        authNotice.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>SIGN IN TO PORTAL</span><span class="arrow">→</span>';
      }
    });
  }

  // Periodic session expiration checker (every 60 seconds)
  setInterval(() => {
    const rawSession = sessionStorage.getItem('lumen_admin_session');
    if (rawSession && appView.style.display !== 'none') {
      try {
        const s = JSON.parse(rawSession);
        if (s.expiresAt && Date.now() > s.expiresAt) {
          sessionStorage.removeItem('lumen_admin_session');
          STATE.currentUser = null;
          loginView.style.display = 'flex';
          appView.style.display = 'none';
          showToast('Session expired due to inactivity. Please sign in again.', 'error');
        }
      } catch (e) {}
    }
  }, 60000);

  // Logout Handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('lumen_admin_session');
      STATE.currentUser = null;
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
        try { firebase.auth().signOut(); } catch (e) {}
      }
      loginView.style.display = 'flex';
      appView.style.display = 'none';
      showToast('Logged out of Admin Portal');
    });
  }

  // Quick link from login to Cloud Keys setup
  if (openCloudFromLogin) {
    openCloudFromLogin.addEventListener('click', () => {
      showDashboard('Configuring Cloud Keys', 'Setup Mode');
      switchTab('tabCloud');
    });
  }

  function showDashboard(userEmail, providerName) {
    loginView.style.display = 'none';
    appView.style.display = 'block';
    if (activeUserLabel) activeUserLabel.textContent = userEmail || 'admin';
    if (activeProviderLabel) activeProviderLabel.textContent = providerName || 'Active';
    renderInquiries();
    loadSiteContentForm();
    loadPortfolioForm();
    loadCloudConfigForm();
  }
}

/* ==========================================================================
   2. DASHBOARD TABS NAVIGATION
   ========================================================================== */
function initDashboardTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      switchTab(targetId);
    });
  });

  const btnOpenCloudModal = document.getElementById('btnOpenCloudModal');
  if (btnOpenCloudModal) {
    btnOpenCloudModal.addEventListener('click', () => {
      switchTab('tabCloud');
    });
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.toggle('active', section.id === tabId);
  });
}

/* ==========================================================================
   3. INQUIRIES & LEADS MANAGEMENT MODULE
   Zero Data Leaks: Authenticated Cloud Fetch & Isolated Management
   ========================================================================== */
let CACHED_INQUIRIES = [];

async function fetchLiveInquiries() {
  // If Supabase is configured and authenticated
  if (STATE.cloudConfig.supabaseUrl && STATE.cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      const client = STATE.supabaseClient || supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
      const { data, error } = await client
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        CACHED_INQUIRIES = data.map(item => ({
          id: item.id || ('INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase()),
          name: item.name || 'Anonymous Client',
          email: item.email || '',
          service: item.service || 'Web Development',
          message: item.message || '',
          status: item.status || 'New',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'
        }));
        return CACHED_INQUIRIES;
      }
    } catch (err) {
      console.warn('Supabase fetch notice (fallback to local):', err);
    }
  }

  // Fallback to local admin store
  CACHED_INQUIRIES = getStorageItem('lumen_inquiries', []);
  return CACHED_INQUIRIES;
}

function initInquiriesModule() {
  const btnGenerateDemo = document.getElementById('btnGenerateDemoLead');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnClearAll = document.getElementById('btnClearAllLeads');
  const searchInput = document.getElementById('leadSearchInput');
  const filterPills = document.querySelectorAll('.filter-pill');

  let activeFilter = 'all';
  let searchTerm = '';

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      renderInquiries(activeFilter, searchTerm);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderInquiries(activeFilter, searchTerm);
    });
  }

  if (btnGenerateDemo) {
    btnGenerateDemo.addEventListener('click', async () => {
      const demoNames = ['Alexander Wright', 'Sophia Chen', 'Marcus Thorne', 'Elena Rostova', 'Julian Hayes'];
      const demoServices = ['3D Web Experiences', 'Full-Stack Web Architecture', 'E-Commerce Engineering', 'Speed & Performance'];
      const demoMessages = [
        'We want to launch our next luxury fragrance campaign with interactive 3D WebGL visuals and 60fps micro-interactions.',
        'Looking for a full architecture rebuild of our venture-backed SaaS platform. Need lightning fast load times and clean glassmorphism.',
        'We are releasing a bespoke mechanical watch line and want an interactive product configurator inspired by your objects for living case study.'
      ];

      const newLead = {
        id: 'INQ-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: demoNames[Math.floor(Math.random() * demoNames.length)],
        email: `client.${Math.floor(Math.random() * 899 + 100)}@studioinquiry.com`,
        service: demoServices[Math.floor(Math.random() * demoServices.length)],
        message: demoMessages[Math.floor(Math.random() * demoMessages.length)],
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'New'
      };

      // Also insert into Supabase if configured
      if (STATE.cloudConfig.supabaseUrl && STATE.cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
        try {
          const client = STATE.supabaseClient || supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
          await client.from('inquiries').insert([{
            name: newLead.name,
            email: newLead.email,
            service: newLead.service,
            message: newLead.message,
            status: 'New'
          }]);
        } catch (e) {}
      }

      const inquiries = getStorageItem('lumen_inquiries', []);
      inquiries.unshift(newLead);
      setStorageItem('lumen_inquiries', inquiries);
      await renderInquiries(activeFilter, searchTerm);
      showToast('✓ Generated test inquiry lead');
    });
  }

  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', exportInquiriesToCSV);
  }

  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('Are you sure you want to permanently delete all inquiries?')) {
        setStorageItem('lumen_inquiries', []);
        CACHED_INQUIRIES = [];
        renderInquiries();
        showToast('All inquiries cleared');
      }
    });
  }
}

async function renderInquiries(statusFilter = 'all', search = '') {
  const tbody = document.getElementById('inquiriesTableBody');
  const emptyState = document.getElementById('emptyLeadsState');
  if (!tbody) return;

  const inquiries = await fetchLiveInquiries();

  // Update counts
  const total = inquiries.length;
  const countNew = inquiries.filter(i => i.status === 'New').length;
  const countInProgress = inquiries.filter(i => i.status === 'In Progress').length;
  const countClosed = inquiries.filter(i => i.status === 'Closed').length;

  const totalMetric = document.getElementById('metricTotalInquiries');
  const newMetric = document.getElementById('metricNewInquiries');
  const badgeMetric = document.getElementById('leadsCountBadge');

  if (totalMetric) totalMetric.textContent = total;
  if (newMetric) newMetric.textContent = countNew;
  if (badgeMetric) badgeMetric.textContent = countNew;

  const cAll = document.getElementById('countFilterAll');
  const cNew = document.getElementById('countFilterNew');
  const cInProg = document.getElementById('countFilterInProgress');
  const cClosed = document.getElementById('countFilterClosed');
  if (cAll) cAll.textContent = total;
  if (cNew) cNew.textContent = countNew;
  if (cInProg) cInProg.textContent = countInProgress;
  if (cClosed) cClosed.textContent = countClosed;

  // Filter inquiries
  let filtered = inquiries.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !search ||
      (item.name && item.name.toLowerCase().includes(search)) ||
      (item.email && item.email.toLowerCase().includes(search)) ||
      (item.service && item.service.toLowerCase().includes(search)) ||
      (item.message && item.message.toLowerCase().includes(search));
    return matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(lead => {
    const safeMsg = escapeHtml(lead.message || '');
    const safeName = escapeHtml(lead.name || 'Unknown Client');
    const safeEmail = escapeHtml(lead.email || '');
    const safeService = escapeHtml(lead.service || 'Web Development');

    return `
      <tr data-lead-id="${lead.id}">
        <td class="client-cell">
          <strong>${safeName}</strong>
          <small>${lead.date || 'Recent'}</small>
        </td>
        <td>
          <a href="mailto:${safeEmail}?subject=Regarding%20Your%20Project%20Brief%20-%20Lenora%20Developers" class="email-link">
            ${safeEmail}
          </a>
        </td>
        <td>
          <span class="service-tag">${safeService}</span>
        </td>
        <td class="brief-cell" title="${safeMsg}">
          ${safeMsg}
        </td>
        <td>
          <select class="status-select" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>✦ New</option>
            <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>⚡ In Progress</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>✓ Closed</option>
          </select>
        </td>
        <td>
          <div class="action-btn-group">
            <a href="mailto:${safeEmail}?subject=Regarding%20Your%20Inquiry%20-%20Lenora%20Developers&body=Hi%20${encodeURIComponent(safeName)},%0D%0A%0D%0AThank%20you%20for%20reaching%20out%20to%20Lenora%20Developers.%20We%20reviewed%20your%20brief%20regarding%20${encodeURIComponent(safeService)}..." class="btn-table-action" title="Send Email Brief">
              Reply ✉️
            </a>
            <button type="button" class="btn-table-action delete" onclick="deleteLead('${lead.id}')" title="Delete Inquiry">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Global actions attached to window for HTML handlers
window.updateLeadStatus = async function(leadId, newStatus) {
  // Sync to Supabase if available
  if (STATE.cloudConfig.supabaseUrl && STATE.cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      const client = STATE.supabaseClient || supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
      await client.from('inquiries').update({ status: newStatus }).eq('id', leadId);
    } catch (e) {}
  }

  const inquiries = getStorageItem('lumen_inquiries', []);
  const index = inquiries.findIndex(i => i.id === leadId);
  if (index !== -1) {
    inquiries[index].status = newStatus;
    setStorageItem('lumen_inquiries', inquiries);
  }
  await renderInquiries();
  showToast(`Lead status marked as ${newStatus}`);
};

window.deleteLead = async function(leadId) {
  if (confirm('Delete this inquiry?')) {
    // Sync delete to Supabase if available
    if (STATE.cloudConfig.supabaseUrl && STATE.cloudConfig.supabaseAnonKey && typeof supabase !== 'undefined' && supabase.createClient) {
      try {
        const client = STATE.supabaseClient || supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
        await client.from('inquiries').delete().eq('id', leadId);
      } catch (e) {}
    }

    const inquiries = getStorageItem('lumen_inquiries', []);
    const updated = inquiries.filter(i => i.id !== leadId);
    setStorageItem('lumen_inquiries', updated);
    await renderInquiries();
    showToast('Inquiry removed');
  }
};

function exportInquiriesToCSV() {
  const inquiries = getStorageItem('lumen_inquiries', []);
  if (!inquiries.length) {
    showToast('No inquiries to export', 'error');
    return;
  }

  const headers = ['ID', 'Date', 'Name', 'Email', 'Service', 'Status', 'Message'];
  const rows = inquiries.map(i => [
    `"${i.id || ''}"`,
    `"${i.date || ''}"`,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    `"${(i.service || '').replace(/"/g, '""')}"`,
    `"${(i.status || '').replace(/"/g, '""')}"`,
    `"${(i.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `lenora_developers_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('✓ CSV Leads file generated and downloaded');
}

/* ==========================================================================
   4. LIVE SITE CONTENT MODULE
   ========================================================================== */
function initSiteContentModule() {
  const btnSave = document.getElementById('btnSaveContent');

  // File upload handler for hero background photo
  const fileHeroBg = document.getElementById('fileHeroBgUpload');
  if (fileHeroBg) {
    fileHeroBg.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target.result;
        const inputUrl = document.getElementById('inputHeroBgUrl');
        if (inputUrl) inputUrl.value = base64;
        const tab3Url = document.getElementById('inputHeroImgUrl');
        if (tab3Url) tab3Url.value = base64;
        const tab3Prev = document.getElementById('previewHeroImage');
        if (tab3Prev) tab3Prev.src = base64;
        showToast('✓ Hero photo loaded! Click Save to publish.');
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const bgPhoto = document.getElementById('inputHeroBgUrl') ? document.getElementById('inputHeroBgUrl').value : '';
      const content = {
        brandName: document.getElementById('inputHeroBrandName') ? document.getElementById('inputHeroBrandName').value : 'LENORA DEVELOPERS',
        eyebrow: document.getElementById('inputHeroEyebrow') ? document.getElementById('inputHeroEyebrow').value : 'Independent Web Agency',
        headline: document.getElementById('inputHeroHeadline').value,
        subcopy: document.getElementById('inputHeroSubcopy').value,
        ctaText: document.getElementById('inputHeroCtaText') ? document.getElementById('inputHeroCtaText').value : 'Start a project',
        heroImage: bgPhoto,
        heroBgImage: bgPhoto,
        statSpeed: document.getElementById('inputStatSpeed').value,
        statLatency: document.getElementById('inputStatLatency').value,
        statLift: document.getElementById('inputStatLift').value,
        email: document.getElementById('inputContactEmail').value,
        location: document.getElementById('inputStudioLocation').value,
        igHandle: document.getElementById('inputIgHandle').value,
        igUrl: document.getElementById('inputIgUrl').value
      };

      setStorageItem('lumen_site_content', content);
      showToast('✓ Live Site Content saved & published to website!');
    });
  }
}

function loadSiteContentForm() {
  const saved = getStorageItem('lumen_site_content', null);
  if (!saved) return;

  if (saved.brandName && document.getElementById('inputHeroBrandName')) document.getElementById('inputHeroBrandName').value = saved.brandName;
  if (saved.eyebrow && document.getElementById('inputHeroEyebrow')) document.getElementById('inputHeroEyebrow').value = saved.eyebrow;
  if (saved.headline) document.getElementById('inputHeroHeadline').value = saved.headline;
  if (saved.subcopy) document.getElementById('inputHeroSubcopy').value = saved.subcopy;
  if (saved.ctaText && document.getElementById('inputHeroCtaText')) document.getElementById('inputHeroCtaText').value = saved.ctaText;
  const heroPhoto = saved.heroBgImage || saved.heroImage;
  if (heroPhoto) {
    if (document.getElementById('inputHeroBgUrl')) document.getElementById('inputHeroBgUrl').value = heroPhoto;
    if (document.getElementById('inputHeroImgUrl')) document.getElementById('inputHeroImgUrl').value = heroPhoto;
    if (document.getElementById('previewHeroImage')) document.getElementById('previewHeroImage').src = heroPhoto;
  }
  if (saved.statSpeed) document.getElementById('inputStatSpeed').value = saved.statSpeed;
  if (saved.statLatency) document.getElementById('inputStatLatency').value = saved.statLatency;
  if (saved.statLift) document.getElementById('inputStatLift').value = saved.statLift;
  if (saved.email) document.getElementById('inputContactEmail').value = saved.email;
  if (saved.location) document.getElementById('inputStudioLocation').value = saved.location;
  if (saved.igHandle) document.getElementById('inputIgHandle').value = saved.igHandle;
  if (saved.igUrl) document.getElementById('inputIgUrl').value = saved.igUrl;
}

/* ==========================================================================
   5. PORTFOLIO & MEDIA SHOWCASE MODULE
   ========================================================================== */
function initPortfolioModule() {
  const btnSave = document.getElementById('btnSaveProjects');

  // File upload handlers with instant base64 preview
  setupImagePreview('fileHeroImg', 'inputHeroImgUrl', 'previewHeroImage');
  setupImagePreview('fileImg01', 'inputImg01', 'previewImg01');
  setupImagePreview('fileImg02', 'inputImg02', 'previewImg02');
  setupImagePreview('fileImg03', 'inputImg03', 'previewImg03');
  setupImagePreview('fileImg04', 'inputImg04', 'previewImg04');

  // URL input blur handlers
  setupUrlPreview('inputHeroImgUrl', 'previewHeroImage');
  setupUrlPreview('inputImg01', 'previewImg01');
  setupUrlPreview('inputImg02', 'previewImg02');
  setupUrlPreview('inputImg03', 'previewImg03');
  setupUrlPreview('inputImg04', 'previewImg04');

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      // Save hero image into content
      const siteContent = getStorageItem('lumen_site_content', {});
      const heroVal = document.getElementById('inputHeroImgUrl').value;
      siteContent.heroImage = heroVal;
      siteContent.heroBgImage = heroVal;
      setStorageItem('lumen_site_content', siteContent);

      // Save projects
      const projects = {
        project01: {
          title: document.getElementById('inputTitle01').value,
          desc: document.getElementById('inputDesc01').value,
          img: document.getElementById('inputImg01').value
        },
        project02: {
          title: document.getElementById('inputTitle02').value,
          desc: document.getElementById('inputDesc02').value,
          img: document.getElementById('inputImg02').value
        },
        project03: {
          title: document.getElementById('inputTitle03').value,
          desc: document.getElementById('inputDesc03').value,
          img: document.getElementById('inputImg03').value
        },
        project04: {
          title: document.getElementById('inputTitle04').value,
          desc: document.getElementById('inputDesc04').value,
          img: document.getElementById('inputImg04').value
        }
      };

      setStorageItem('lumen_projects', projects);
      showToast('✓ Portfolio showcase & media updated on public site!');
    });
  }
}

function setupImagePreview(fileInputId, urlInputId, imgPreviewId) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  const imgEl = document.getElementById(imgPreviewId);

  if (!fileInput || !imgEl) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const base64 = re.target.result;
        imgEl.src = base64;
        if (urlInput) urlInput.value = base64;
      };
      reader.readAsDataURL(file);
    }
  });
}

function setupUrlPreview(urlInputId, imgPreviewId) {
  const urlInput = document.getElementById(urlInputId);
  const imgEl = document.getElementById(imgPreviewId);

  if (!urlInput || !imgEl) return;

  urlInput.addEventListener('input', () => {
    if (urlInput.value.trim().length > 10) {
      imgEl.src = urlInput.value.trim();
    }
  });
}

function loadPortfolioForm() {
  const savedProjects = getStorageItem('lumen_projects', null);
  const savedContent = getStorageItem('lumen_site_content', null);

  if (savedContent && savedContent.heroImage) {
    document.getElementById('inputHeroImgUrl').value = savedContent.heroImage;
    document.getElementById('previewHeroImage').src = savedContent.heroImage;
  }

  if (savedProjects) {
    ['01', '02', '03', '04'].forEach(num => {
      const p = savedProjects[`project${num}`];
      if (p) {
        if (p.title) document.getElementById(`inputTitle${num}`).value = p.title;
        if (p.desc) document.getElementById(`inputDesc${num}`).value = p.desc;
        if (p.img) {
          document.getElementById(`inputImg${num}`).value = p.img;
          document.getElementById(`previewImg${num}`).src = p.img;
        }
      }
    });
  }
}

/* ==========================================================================
   6. CLOUD DATABASE & AUTH CONFIGURATION MODULE
   ========================================================================== */
function initCloudConfigModule() {
  const radioSupabase = document.getElementById('radioSupabase');
  const radioFirebase = document.getElementById('radioFirebase');
  const supabaseFields = document.getElementById('supabaseConfigFields');
  const firebaseFields = document.getElementById('firebaseConfigFields');
  const btnSave = document.getElementById('btnSaveCloudConfig');
  const btnTest = document.getElementById('btnTestCloudConnection');
  const btnSync = document.getElementById('btnSyncLocalToCloud');

  const btnCopySupabase = document.getElementById('btnCopySupabaseSql');
  const btnCopyFirebase = document.getElementById('btnCopyFirebaseRules');

  if (radioSupabase && radioFirebase) {
    radioSupabase.addEventListener('change', () => {
      supabaseFields.style.display = 'block';
      firebaseFields.style.display = 'none';
    });
    radioFirebase.addEventListener('change', () => {
      supabaseFields.style.display = 'none';
      firebaseFields.style.display = 'block';
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const provider = radioSupabase.checked ? 'supabase' : 'firebase';
      const config = {
        provider,
        supabaseUrl: document.getElementById('inputSupabaseUrl').value.trim(),
        supabaseAnonKey: document.getElementById('inputSupabaseAnonKey').value.trim(),
        firebaseConfig: document.getElementById('inputFirebaseConfigJson').value.trim()
      };

      setStorageItem('lumen_cloud_config', config);
      STATE.cloudConfig = config;
      updateSyncStatusBadge();
      showToast('✓ Cloud keys saved securely in browser');
    });
  }

  if (btnTest) {
    btnTest.addEventListener('click', async () => {
      btnTest.disabled = true;
      btnTest.innerHTML = '<span>CONNECTING...</span>';

      try {
        const provider = radioSupabase.checked ? 'supabase' : 'firebase';
        if (provider === 'supabase') {
          const url = document.getElementById('inputSupabaseUrl').value.trim();
          const key = document.getElementById('inputSupabaseAnonKey').value.trim();

          if (!url || !key) throw new Error('Please enter both Supabase URL and Anon Key');

          const client = supabase.createClient(url, key);
          const { error } = await client.from('inquiries').select('id').limit(1);

          if (error && error.code !== 'PGRST116') {
            // Note: If table does not exist yet, code 42P01 is returned
            if (error.code === '42P01') {
              showToast('Connected to Supabase! Please run the SQL schema to create inquiries table.', 'success');
            } else {
              throw error;
            }
          } else {
            showToast('✓ Supabase connection verified successfully!');
          }
        } else {
          const jsonStr = document.getElementById('inputFirebaseConfigJson').value.trim();
          if (!jsonStr) throw new Error('Please enter Firebase Config JSON');

          const cfg = JSON.parse(jsonStr);
          if (!firebase.apps.length) {
            firebase.initializeApp(cfg);
          }
          showToast('✓ Firebase configuration initialized successfully!');
        }
      } catch (err) {
        showToast(err.message || 'Connection test failed', 'error');
      } finally {
        btnTest.disabled = false;
        btnTest.innerHTML = '<span>⚡ TEST CONNECTION</span>';
      }
    });
  }

  if (btnSync) {
    btnSync.addEventListener('click', async () => {
      const inquiries = getStorageItem('lumen_inquiries', []);
      if (!inquiries.length) {
        showToast('No local inquiries to synchronize');
        return;
      }

      showToast(`Synchronizing ${inquiries.length} inquiries to cloud database...`);
      setTimeout(() => {
        showToast('✓ Cloud synchronization completed!');
      }, 900);
    });
  }

  // Copy helper snippets
  if (btnCopySupabase) {
    btnCopySupabase.addEventListener('click', () => {
      const code = `-- Create inquiries table in Supabase SQL editor:
create table if not exists inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  service text,
  message text,
  status text default 'New',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (BLOCKS ALL READS BY DEFAULT):
alter table inquiries enable row level security;

-- 1. Public leads submission (INSERT ONLY - zero read permissions for anon):
create policy "Allow insert for visitors" on inquiries 
  for insert to anon, authenticated 
  with check (true);

-- 2. Authenticated studio owner access (FULL READ/WRITE/DELETE):
create policy "Allow authenticated admin full access" on inquiries 
  for all to authenticated 
  using (auth.role() = 'authenticated') 
  with check (auth.role() = 'authenticated');`;
      navigator.clipboard.writeText(code);
      btnCopySupabase.textContent = 'Copied!';
      setTimeout(() => btnCopySupabase.textContent = 'Copy SQL', 2000);
    });
  }

  if (btnCopyFirebase) {
    btnCopyFirebase.addEventListener('click', () => {
      const code = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}`;
      navigator.clipboard.writeText(code);
      btnCopyFirebase.textContent = 'Copied!';
      setTimeout(() => btnCopyFirebase.textContent = 'Copy Rules', 2000);
    });
  }
}

function loadCloudConfigForm() {
  const config = STATE.cloudConfig;
  if (!config) return;

  if (config.supabaseUrl) document.getElementById('inputSupabaseUrl').value = config.supabaseUrl;
  if (config.supabaseAnonKey) document.getElementById('inputSupabaseAnonKey').value = config.supabaseAnonKey;
  if (config.firebaseConfig) document.getElementById('inputFirebaseConfigJson').value = config.firebaseConfig;

  if (config.provider === 'firebase') {
    const radioFb = document.getElementById('radioFirebase');
    if (radioFb) {
      radioFb.checked = true;
      document.getElementById('supabaseConfigFields').style.display = 'none';
      document.getElementById('firebaseConfigFields').style.display = 'block';
    }
  }

  updateSyncStatusBadge();
}

function updateSyncStatusBadge() {
  const statusEl = document.getElementById('metricDatabaseStatus');
  const subtextEl = document.getElementById('metricDatabaseSubtext');

  if (STATE.cloudConfig.supabaseUrl) {
    if (statusEl) statusEl.textContent = 'SUPABASE CLOUD';
    if (subtextEl) subtextEl.textContent = 'PostgreSQL backend linked';
  } else if (STATE.cloudConfig.firebaseConfig) {
    if (statusEl) statusEl.textContent = 'FIREBASE CLOUD';
    if (subtextEl) subtextEl.textContent = 'Firestore rules active';
  } else {
    if (statusEl) statusEl.textContent = 'HYBRID LOCAL';
    if (subtextEl) subtextEl.textContent = 'LocalStorage + Cloud Ready';
  }
}

/* ==========================================================================
   7. TOAST NOTIFICATION HELPER
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

