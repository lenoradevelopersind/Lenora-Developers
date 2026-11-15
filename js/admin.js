/**
 * LENORA DEVELOPERS — ADVANCED STUDIO ADMIN & CONTENT PORTAL CONTROLLER
 * Full Dynamic Projects Manager (Add/Remove & Live Web Links),
 * Services & Reviews CMS, 1-Click Backup & Restore, Custom Password, and Cloud DB.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initDashboardTabs();
  initInquiriesModule();
  initPortfolioModule();
  initSiteContentModule();
  initServicesModule();
  initReviewsModule();
  initSettingsAndBackupModule();
});

/* ==========================================================================
   GLOBAL STATE, STORAGE & CONSTANTS
   ========================================================================== */
const STATE = {
  currentProvider: 'demo',
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

const DEFAULT_PROJECTS = [
  {
    id: 'proj_01',
    num: '01',
    title: 'Objects for Living — Curated Store',
    category: 'Home & Lifestyle Goods',
    badgeType: 'E-Commerce',
    badgeText: '+42% Online Sales',
    desc: 'An artisan lifestyle brand selling handcrafted ceramic and wooden objects. Features smooth 3D product previews and a seamless checkout experience.',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/objects-for-living',
    tags: ['Online Store', 'Product Storytelling', 'Mobile Checkout']
  },
  {
    id: 'proj_02',
    num: '02',
    title: 'Form & Space — Architecture Studio',
    category: 'Design & Architecture',
    badgeType: 'Portfolio',
    badgeText: 'Architecture Studio',
    desc: 'A clean, editorial portfolio for a boutique architecture practice. Full-bleed gallery imagery, fluid mobile transitions, and an interactive spatial project index.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/form-and-space',
    tags: ['Creative Portfolio', 'Editorial Typography', 'Interactive Gallery']
  },
  {
    id: 'proj_03',
    num: '03',
    title: 'Pulse Analytics — Business Dashboard',
    category: 'SaaS & Analytics',
    badgeType: 'Web Application',
    badgeText: 'Real-Time Data',
    desc: 'A clear, uncluttered dashboard for founders to monitor their core metrics. Fast data rendering, accessible contrast, and zero confusing clutter.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/pulse-analytics',
    tags: ['Web Application', 'Clean Data Views', 'Fast Performance']
  },
  {
    id: 'proj_04',
    num: '04',
    title: 'Flour & Stone — Artisanal Bakery',
    category: 'Bakery & Café',
    badgeType: 'Local Business',
    badgeText: '3.4x Booking Lift',
    desc: 'A warm, inviting website for an artisan sourdough bakery. Includes online pre-orders, daily seasonal menus, and a direct inquiry form for private catering events.',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/flour-and-stone',
    tags: ['Business Website', 'Online Ordering', 'Local SEO']
  }
];

const DEFAULT_SERVICES = [
  {
    num: '01',
    category: 'Design',
    title: 'Web Design & Art Direction',
    desc: 'Custom designs tailored specifically to your brand. Clean typography, generous whitespace, and intuitive navigation that your customers will love using.',
    features: ['Custom Figma design mockups', 'Mobile-first layout design', 'Brand colors & typography systems']
  },
  {
    num: '02',
    category: 'Engineering',
    title: 'Frontend & Full-Stack Development',
    desc: 'Hand-coded websites built from scratch. Lightning-fast load times, zero unnecessary plugins, and clean code that is easy to maintain and grow over time.',
    features: ['Semantic, accessible HTML & CSS', 'Modern JavaScript without bloat', 'Sub-second page transitions']
  },
  {
    num: '03',
    category: 'Commerce',
    title: 'E-Commerce & Digital Stores',
    desc: 'High-converting online shops designed to turn visitors into repeat buyers. Smooth product catalogs, quick mobile checkouts, and clean payment flows.',
    features: ['Streamlined cart & checkout', 'High-res product visual galleries', 'Inventory & order management']
  },
  {
    num: '04',
    category: 'Growth',
    title: 'Speed, SEO & Search Optimization',
    desc: 'Get found easily on Google. We optimize site structure, page titles, meta descriptions, and load speeds so your business climbs local search rankings.',
    features: ['Google Core Web Vitals 95+', 'Structured Schema markup', 'Search-friendly semantic URLs']
  },
  {
    num: '05',
    category: 'Partnership',
    title: 'Maintenance & Ongoing Support',
    desc: "You won't be left on your own after launch. We provide regular updates, security checks, and quick turnarounds whenever you want to add new content.",
    features: ['Quick updates whenever you need them', 'Regular security & browser checks', 'Direct founder communication']
  },
  {
    num: '06',
    category: 'Admin & Tools',
    title: 'Private Admin Portals & Tools',
    desc: 'Simple backends and admin portals built specifically for your needs. Update your photos, text, and review customer inquiries anytime without touching code.',
    features: ['Custom admin dashboard for you', 'Real-time client leads & inquiries', 'Easy photo & text updates']
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Marcus Vance',
    role: 'Founder, Vance Living',
    quote: 'They rebuilt our website to be completely mobile-friendly. Bounce rate dropped 45% and our inquiries doubled within weeks.',
    rating: 5,
    metric: '+140% Mobile Sales'
  },
  {
    id: 'rev_2',
    author: 'Elena Rostova',
    role: 'Partner, Rostova Design',
    quote: 'No bloated WordPress templates. Pure, fast, handcrafted code that looks incredible on retina phone screens.',
    rating: 5,
    metric: '<300ms Load Time'
  },
  {
    id: 'rev_3',
    author: 'Julian Thorne',
    role: 'Director, Thorne Bakery',
    quote: 'Our customers love ordering on their phones now. Clean typography, smooth transitions, and catering inquiries poured in.',
    rating: 5,
    metric: 'Doubled Inquiries'
  },
  {
    id: 'rev_4',
    author: 'Sofia Lindqvist',
    role: 'Principal, Studio Form',
    quote: 'The 3D perspective touches and tactile stone layout gave our studio an unfair advantage when pitching international clients.',
    rating: 5,
    metric: 'Top PageSpeed'
  }
];

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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" class="toast-close" style="background:none; border:none; cursor:pointer; font-size:14px; opacity:0.6;">✕</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (container.contains(toast)) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

/* ==========================================================================
   1. AUTHENTICATION CONTROLLER (DEMO / SUPABASE / FIREBASE)
   ========================================================================== */
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

  // Load saved cloud config
  const savedConfig = getStorageItem('lumen_cloud_config', null);
  if (savedConfig) {
    STATE.cloudConfig = Object.assign(STATE.cloudConfig, savedConfig);
  }

  // Check existing session
  const activeSession = sessionStorage.getItem('lumen_admin_session');
  if (activeSession) {
    try {
      const sess = JSON.parse(activeSession);
      STATE.currentUser = sess.user;
      STATE.currentProvider = sess.provider || 'demo';
      showAppView();
    } catch (e) {
      sessionStorage.removeItem('lumen_admin_session');
    }
  }

  // Switch login provider
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
        hintText.innerHTML = 'Authenticate with your Supabase <code>auth.users</code> credentials';
        emailInput.value = '';
        passInput.value = '';
      } else if (STATE.currentProvider === 'firebase') {
        hintText.innerHTML = 'Authenticate with your Firebase Auth email & password';
        emailInput.value = '';
        passInput.value = '';
      }
    });
  });

  // Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      authNotice.style.display = 'none';

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      const btnSubmit = document.getElementById('btnLoginSubmit');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Verifying credentials...</span>';

      try {
        if (STATE.currentProvider === 'demo') {
          // Check custom password if user changed it, else default admin123
          const customPassword = localStorage.getItem('lenora_admin_password') || 'admin123';
          if (email.toLowerCase() === 'admin@agency.com' && password === customPassword) {
            STATE.currentUser = { email: 'admin@agency.com', role: 'Director' };
            completeLogin();
          } else {
            throw new Error('Invalid email or password. Default is admin@agency.com / admin123');
          }
        } else if (STATE.currentProvider === 'supabase') {
          if (!STATE.cloudConfig.supabaseUrl || !STATE.cloudConfig.supabaseAnonKey) {
            throw new Error('Supabase is not configured yet. Please configure your project keys in Cloud settings.');
          }
          const client = supabase.createClient(STATE.cloudConfig.supabaseUrl, STATE.cloudConfig.supabaseAnonKey);
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          STATE.currentUser = data.user;
          STATE.supabaseClient = client;
          completeLogin();
        } else if (STATE.currentProvider === 'firebase') {
          if (!firebase.apps.length && STATE.cloudConfig.firebaseConfig) {
            firebase.initializeApp(JSON.parse(STATE.cloudConfig.firebaseConfig));
          }
          const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
          STATE.currentUser = cred.user;
          completeLogin();
        }
      } catch (err) {
        authNotice.style.display = 'block';
        authNotice.className = 'auth-notice error';
        authNotice.textContent = err.message || 'Authentication failed.';
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span>ACCESS ADMIN PORTAL ↗</span>';
      }
    });
  }

  function completeLogin() {
    sessionStorage.setItem('lumen_admin_session', JSON.stringify({
      user: STATE.currentUser,
      provider: STATE.currentProvider,
      timestamp: Date.now()
    }));
    showAppView();
    showToast('✓ Welcome back! Admin portal session authorized.');
  }

  function showAppView() {
    loginView.style.display = 'none';
    appView.style.display = 'block';

    if (activeUserLabel && STATE.currentUser) {
      activeUserLabel.textContent = STATE.currentUser.email || 'Admin';
    }
    if (activeProviderLabel) {
      activeProviderLabel.textContent = STATE.currentProvider.toUpperCase() + ' MODE';
    }

    renderInquiries();
    renderDynamicProjectsAdmin();
    loadSiteContentForm();
    renderServicesAdmin();
    renderReviewsAdmin();
    updateDashboardMetrics();
  }

  // Logout handler
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      sessionStorage.removeItem('lumen_admin_session');
      STATE.currentUser = null;
      appView.style.display = 'none';
      loginView.style.display = 'flex';
      showToast('Logged out of admin session');
    });
  }
}

/* ==========================================================================
   2. DASHBOARD TABS & GLOBAL METRICS CONTROLLER
   ========================================================================== */
window.switchAdminTab = function(tabId) {
  const tabs = document.querySelectorAll('.admin-tab-nav .tab-btn');
  const sections = document.querySelectorAll('.tab-content');

  tabs.forEach(t => {
    if (t.dataset.tab === tabId) t.classList.add('active');
    else t.classList.remove('active');
  });

  sections.forEach(s => {
    if (s.id === tabId) s.classList.add('active');
    else s.classList.remove('active');
  });
};

function initDashboardTabs() {
  const tabs = document.querySelectorAll('.admin-tab-nav .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchAdminTab(tab.dataset.tab);
    });
  });
}

function updateDashboardMetrics() {
  // Update Projects Count
  const projects = getStorageItem('lenora_projects_list', DEFAULT_PROJECTS);
  const projMetric = document.getElementById('metricProjectsCount');
  const projBadge = document.getElementById('projectsCountBadge');
  if (projMetric) projMetric.textContent = projects.length;
  if (projBadge) projBadge.textContent = projects.length;

  // Update Reviews Count
  const reviews = getStorageItem('lenora_reviews_list', DEFAULT_REVIEWS);
  const revMetric = document.getElementById('metricReviewsCount');
  if (revMetric) revMetric.textContent = reviews.length;
}

/* ==========================================================================
   3. INQUIRIES & LEADS MANAGEMENT MODULE
   ========================================================================== */
let CACHED_INQUIRIES = [];

async function fetchLiveInquiries() {
  if (STATE.currentProvider === 'supabase' && STATE.supabaseClient) {
    try {
      const { data, error } = await STATE.supabaseClient
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        CACHED_INQUIRIES = data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          service: item.service,
          message: item.message,
          status: item.status || 'New',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'
        }));
        return CACHED_INQUIRIES;
      }
    } catch (e) {
      console.warn('Supabase fetch error, fallback to local:', e);
    }
  }

  CACHED_INQUIRIES = getStorageItem('lumen_inquiries', []);
  return CACHED_INQUIRIES;
}

function initInquiriesModule() {
  const filterBtns = document.querySelectorAll('.filter-pill');
  const searchInput = document.getElementById('leadSearchInput');
  const btnDemoLead = document.getElementById('btnGenerateDemoLead');
  const btnExportCSV = document.getElementById('btnExportCSV');
  const btnClearAll = document.getElementById('btnClearAllLeads');

  let activeFilter = 'all';
  let searchTerm = '';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderInquiries(activeFilter, searchTerm);
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderInquiries(activeFilter, searchTerm);
    });
  }

  if (btnDemoLead) {
    btnDemoLead.addEventListener('click', async () => {
      const sampleNames = ['Marcus Vance', 'Elena Rostova', 'Julian Thorne', 'Sofia Lindqvist'];
      const sampleServices = ['Custom Web Development', 'Mobile-First Optimization', 'E-Commerce Store', 'Speed Tuning'];
      const sampleBudgets = ['Looking for a full architecture rebuild of our venture-backed SaaS platform. Need lightning fast load times and clean glassmorphism.', 'Want a mobile-first e-commerce experience for our ceramic goods brand. Ready to start next week.'];

      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomService = sampleServices[Math.floor(Math.random() * sampleServices.length)];
      const randomBrief = sampleBudgets[Math.floor(Math.random() * sampleBudgets.length)];

      const newLead = {
        id: 'INQ-' + Date.now().toString(36).toUpperCase(),
        name: randomName,
        email: randomName.toLowerCase().replace(/\s+/g, '.') + '@example.com',
        service: randomService,
        message: randomBrief,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'New'
      };

      if (STATE.currentProvider === 'supabase' && STATE.supabaseClient) {
        try {
          await STATE.supabaseClient.from('inquiries').insert([{
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
      showToast(`✓ Generated sample inquiry from ${newLead.name}`);
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

  const total = inquiries.length;
  const countNew = inquiries.filter(i => i.status === 'New').length;
  const countInProgress = inquiries.filter(i => i.status === 'In Progress').length;
  const countClosed = inquiries.filter(i => i.status === 'Closed').length;

  const totalMetric = document.getElementById('metricTotalInquiries');
  const newMetric = document.getElementById('metricNewInquiries');
  const leadsBadge = document.getElementById('leadsCountBadge');

  if (totalMetric) totalMetric.textContent = total;
  if (newMetric) newMetric.textContent = countNew;
  if (leadsBadge) leadsBadge.textContent = countNew;

  const fAll = document.getElementById('countFilterAll');
  const fNew = document.getElementById('countFilterNew');
  const fProg = document.getElementById('countFilterInProgress');
  const fClosed = document.getElementById('countFilterClosed');

  if (fAll) fAll.textContent = total;
  if (fNew) fNew.textContent = countNew;
  if (fProg) fProg.textContent = countInProgress;
  if (fClosed) fClosed.textContent = countClosed;

  let filtered = inquiries.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search) ||
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
    const safeName = escapeHtml(lead.name);
    const safeEmail = escapeHtml(lead.email);
    const safeService = escapeHtml(lead.service || 'General Consultation');
    const safeMsg = escapeHtml(lead.message || '');
    const safeDate = escapeHtml(lead.date || 'Recent');
    const statusClass = (lead.status || 'new').toLowerCase().replace(/\s+/g, '-');

    return `
      <tr data-lead-id="${lead.id}">
        <td>
          <div class="lead-client-info">
            <strong class="lead-name">${safeName}</strong>
            <span class="lead-date">${safeDate}</span>
          </div>
        </td>
        <td>
          <a href="mailto:${safeEmail}?subject=Regarding%20Your%20Project%20Brief%20-%20Lenora%20Developers" class="email-link">
            ${safeEmail}
          </a>
        </td>
        <td>
          <span class="service-tag">${safeService}</span>
        </td>
        <td>
          <div class="lead-brief-preview" title="${safeMsg}">${safeMsg}</div>
        </td>
        <td>
          <select class="status-select status-${statusClass}" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="In Progress" ${lead.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
          </select>
        </td>
        <td style="text-align: right;">
          <div class="table-row-actions">
            <a href="mailto:${safeEmail}?subject=Regarding%20Your%20Inquiry%20-%20Lenora%20Developers" class="btn-table-action" title="Send Email Brief">✉</a>
            <button type="button" class="btn-table-action delete" onclick="deleteLead('${lead.id}')" title="Delete Inquiry">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateLeadStatus = async function(leadId, newStatus) {
  if (STATE.currentProvider === 'supabase' && STATE.supabaseClient) {
    try {
      await STATE.supabaseClient.from('inquiries').update({ status: newStatus }).eq('id', leadId);
    } catch (e) {}
  }

  const inquiries = getStorageItem('lumen_inquiries', []);
  const index = inquiries.findIndex(i => i.id === leadId);
  if (index !== -1) {
    inquiries[index].status = newStatus;
    setStorageItem('lumen_inquiries', inquiries);
  }
  await renderInquiries();
  showToast(`Updated status to ${newStatus}`);
};

window.deleteLead = async function(leadId) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;

  if (STATE.currentProvider === 'supabase' && STATE.supabaseClient) {
    try {
      await STATE.supabaseClient.from('inquiries').delete().eq('id', leadId);
    } catch (e) {}
  }

  const inquiries = getStorageItem('lumen_inquiries', []);
  const updated = inquiries.filter(i => i.id !== leadId);
  setStorageItem('lumen_inquiries', updated);
  await renderInquiries();
  showToast('Inquiry removed');
};

function exportInquiriesToCSV() {
  const inquiries = getStorageItem('lumen_inquiries', []);
  if (!inquiries.length) {
    showToast('No inquiries to export', 'error');
    return;
  }

  const rows = inquiries.map(i => [
    `"${(i.id || '').replace(/"/g, '""')}"`,
    `"${(i.date || '').replace(/"/g, '""')}"`,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    `"${(i.email || '').replace(/"/g, '""')}"`,
    `"${(i.service || '').replace(/"/g, '""')}"`,
    `"${(i.status || '').replace(/"/g, '""')}"`,
    `"${(i.message || '').replace(/"/g, '""')}"`
  ]);

  const csv = ['"ID","Date","Client Name","Email","Service Requested","Status","Project Brief"', ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lenora-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${inquiries.length} leads to CSV`);
}

/* ==========================================================================
   4. DYNAMIC PORTFOLIO PROJECTS MANAGER (ADD / REMOVE & LIVE WEB LINKS)
   ========================================================================== */
function initPortfolioModule() {
  const btnOpenNewProj = document.getElementById('btnOpenNewProjectModal');
  const btnCloseNewProj = document.getElementById('btnCloseNewProjectBox');
  const btnCancelNewProj = document.getElementById('btnCancelNewProject');
  const newProjBox = document.getElementById('newProjectBox');
  const newProjForm = document.getElementById('newProjectForm');
  const btnSaveAll = document.getElementById('btnSaveAllProjects');
  const btnTestNewProjUrl = document.getElementById('btnTestNewProjUrl');

  // Toggle Project Creator
  if (btnOpenNewProj && newProjBox) {
    btnOpenNewProj.addEventListener('click', () => {
      newProjBox.style.display = 'block';
      newProjBox.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('newProjTitle').focus();
    });
  }

  function hideNewProjBox() {
    if (newProjBox) newProjBox.style.display = 'none';
  }

  if (btnCloseNewProj) btnCloseNewProj.addEventListener('click', hideNewProjBox);
  if (btnCancelNewProj) btnCancelNewProj.addEventListener('click', hideNewProjBox);

  // Test URL button inside new project form
  if (btnTestNewProjUrl) {
    btnTestNewProjUrl.addEventListener('click', () => {
      let url = (document.getElementById('newProjLiveUrl').value || '').trim();
      if (!url) {
        showToast('Please enter a website URL first', 'error');
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // Handle local photo file upload for new project
  const newProjFileInput = document.getElementById('newProjImgFile');
  if (newProjFileInput) {
    newProjFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('newProjImgUrl').value = event.target.result;
          showToast('✓ Photo ready for project cover');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Add Project Submission
  if (newProjForm) {
    newProjForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const titleInput = document.getElementById('newProjTitle');
      const title = (titleInput ? titleInput.value : '').trim();
      if (!title) {
        showToast('Please enter a project title', 'error');
        if (titleInput) titleInput.focus();
        return;
      }

      const category = (document.getElementById('newProjCategory').value || '').trim() || 'Web Experience';
      let liveUrl = (document.getElementById('newProjLiveUrl').value || '').trim();
      if (liveUrl && liveUrl !== '#' && !/^https?:\/\//i.test(liveUrl)) {
        liveUrl = 'https://' + liveUrl;
      }

      const badgeText = (document.getElementById('newProjBadgeText').value || '').trim() || '+100% Growth';
      const badgeType = (document.getElementById('newProjBadgeType').value || '').trim() || category;
      const img = (document.getElementById('newProjImgUrl').value || '').trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';
      const tagsRaw = (document.getElementById('newProjTags').value || '').trim();
      const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : ['Custom Build', 'Fast Load'];
      const desc = (document.getElementById('newProjDesc').value || '').trim() || 'Custom high-performance web experience crafted by Lenora Developers.';

      const projects = getStorageItem('lenora_projects_list', DEFAULT_PROJECTS);
      const nextNum = String(projects.length + 1).padStart(2, '0');

      const newProj = {
        id: 'proj_' + Date.now(),
        num: nextNum,
        title,
        category,
        liveUrl,
        badgeText,
        badgeType,
        img,
        tags,
        desc
      };

      projects.unshift(newProj);
      setStorageItem('lenora_projects_list', projects);

      newProjForm.reset();
      hideNewProjBox();
      renderDynamicProjectsAdmin();
      updateDashboardMetrics();
      showToast(`✓ Added "${title}" with live link to showcase!`);
    });
  }

  // Save All Projects Button
  if (btnSaveAll) {
    btnSaveAll.addEventListener('click', () => {
      saveAllProjectsFromDOM();
    });
  }

  // Hero 3D Card Image controls
  setupImagePreview('fileHeroImg', 'inputHeroImgUrl', 'previewHeroImage');
  setupUrlPreview('inputHeroImgUrl', 'previewHeroImage');
}

function renderDynamicProjectsAdmin() {
  const container = document.getElementById('dynamicProjectsList');
  if (!container) return;

  const projects = getStorageItem('lenora_projects_list', DEFAULT_PROJECTS);

  container.innerHTML = projects.map((p, idx) => {
    const safeTitle = escapeHtml(p.title);
    const safeCat = escapeHtml(p.category);
    const safeUrl = escapeHtml(p.liveUrl || '');
    const safeImg = escapeHtml(p.img);
    const safeDesc = escapeHtml(p.desc);
    const safeTags = escapeHtml((p.tags || []).join(', '));
    const safeBadgeText = escapeHtml(p.badgeText || '');
    const safeBadgeType = escapeHtml(p.badgeType || '');

    return `
      <div class="glass-project-editor-card" data-project-id="${p.id}">
        <div class="project-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="project-index-pill">PROJECT ${String(idx + 1).padStart(2, '0')}</span>
            ${safeUrl ? `<span class="live-link-badge"><span class="dot"></span>Live Linked</span>` : `<span style="font-size:11px; color:var(--text-muted);">No Link</span>`}
          </div>
          <button type="button" class="btn-delete-card" onclick="deleteProject('${p.id}')">
            <span>🗑 Remove</span>
          </button>
        </div>

        <div class="image-preview-box">
          <img id="previewProj_${p.id}" src="${safeImg}" alt="${safeTitle} Cover">
        </div>

        <div class="form-group">
          <label>Project Title</label>
          <input type="text" class="proj-input-title" value="${safeTitle}">
        </div>

        <div class="form-group">
          <label>Category / Subtitle</label>
          <input type="text" class="proj-input-category" value="${safeCat}">
        </div>

        <div class="form-group">
          <label>Live Website URL (Destination when clicked)</label>
          <div class="input-with-action">
            <input type="text" class="proj-input-url" value="${safeUrl}" placeholder="e.g. clientwebsite.com or https://clientwebsite.com">
            <button type="button" class="btn-admin-subtle small" onclick="testProjectUrl('${p.id}')" title="Test project URL in new tab">
              <span>Test ↗</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Cover Image Source URL</label>
          <input type="text" class="proj-input-img" id="urlInputProj_${p.id}" value="${safeImg}" oninput="updateCardImgPreview('${p.id}')">
        </div>

        <div class="form-group">
          <label>Or Upload Photo</label>
          <input type="file" accept="image/*" class="admin-file-input" onchange="handleProjectFileUpload(this, '${p.id}')">
        </div>

        <div class="form-group">
          <label>HUD Badge (Stat & Category)</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <input type="text" class="proj-input-badgetext" value="${safeBadgeText}" placeholder="e.g. +42% Sales">
            <input type="text" class="proj-input-badgetype" value="${safeBadgeType}" placeholder="e.g. E-Commerce">
          </div>
        </div>

        <div class="form-group">
          <label>Tags (Comma-separated)</label>
          <input type="text" class="proj-input-tags" value="${safeTags}">
        </div>

        <div class="form-group">
          <label>Project Description / Brief</label>
          <textarea class="proj-input-desc" rows="3">${safeDesc}</textarea>
        </div>
      </div>
    `;
  }).join('');

  updateDashboardMetrics();
}

window.testProjectUrl = function(projId) {
  const card = document.querySelector(`[data-project-id="${projId}"]`);
  if (!card) return;
  let url = card.querySelector('.proj-input-url').value.trim();
  if (!url) {
    showToast('No URL specified for this project', 'error');
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

window.deleteProject = function(projId) {
  if (!confirm('Are you sure you want to permanently remove this project from your showcase?')) return;
  const projects = getStorageItem('lenora_projects_list', DEFAULT_PROJECTS);
  const updated = projects.filter(p => p.id !== projId);
  setStorageItem('lenora_projects_list', updated);
  renderDynamicProjectsAdmin();
  showToast('✓ Project removed from showcase');
};

window.updateCardImgPreview = function(projId) {
  const urlInput = document.getElementById(`urlInputProj_${projId}`);
  const imgEl = document.getElementById(`previewProj_${projId}`);
  if (urlInput && imgEl && urlInput.value) {
    imgEl.src = urlInput.value;
  }
};

window.handleProjectFileUpload = function(inputEl, projId) {
  const file = inputEl.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target.result;
      const urlInput = document.getElementById(`urlInputProj_${projId}`);
      const imgEl = document.getElementById(`previewProj_${projId}`);
      if (urlInput) urlInput.value = b64;
      if (imgEl) imgEl.src = b64;
      showToast('✓ Photo preview loaded');
    };
    reader.readAsDataURL(file);
  }
};

function saveAllProjectsFromDOM() {
  const cards = document.querySelectorAll('#dynamicProjectsList .glass-project-editor-card');
  const projects = [];

  cards.forEach((card, idx) => {
    const id = card.dataset.projectId || ('proj_' + idx);
    const title = card.querySelector('.proj-input-title').value.trim();
    const category = card.querySelector('.proj-input-category').value.trim();
    let liveUrl = card.querySelector('.proj-input-url').value.trim();
    if (liveUrl && liveUrl !== '#' && !/^https?:\/\//i.test(liveUrl)) {
      liveUrl = 'https://' + liveUrl;
    }
    const img = card.querySelector('.proj-input-img').value.trim();
    const badgeText = card.querySelector('.proj-input-badgetext').value.trim();
    const badgeType = card.querySelector('.proj-input-badgetype').value.trim();
    const tagsRaw = card.querySelector('.proj-input-tags').value.trim();
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const desc = card.querySelector('.proj-input-desc').value.trim();

    projects.push({
      id,
      num: String(idx + 1).padStart(2, '0'),
      title,
      category,
      liveUrl,
      img,
      badgeText,
      badgeType,
      tags,
      desc
    });
  });

  setStorageItem('lenora_projects_list', projects);

  // Save hero 3D card image as well
  const heroVal = document.getElementById('inputHeroImgUrl').value;
  const siteContent = getStorageItem('lumen_site_content', {});
  siteContent.heroImage = heroVal;
  siteContent.heroBgImage = heroVal;
  setStorageItem('lumen_site_content', siteContent);

  renderDynamicProjectsAdmin();
  showToast(`✓ Successfully saved ${projects.length} showcase projects!`);
}

/* ==========================================================================
   5. LIVE SITE CONTENT & BRANDING MODULE
   ========================================================================== */
function initSiteContentModule() {
  const btnSave = document.getElementById('btnSaveContent');

  setupImagePreview('fileHeroBgUpload', 'inputHeroBgUrl', 'previewHeroImage');
  setupUrlPreview('inputHeroBgUrl', 'previewHeroImage');

  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const bgPhoto = document.getElementById('inputHeroBgUrl').value;
      const content = {
        brandName: document.getElementById('inputHeroBrandName').value,
        eyebrow: document.getElementById('inputHeroEyebrow').value,
        headline: document.getElementById('inputHeroHeadline').value,
        subcopy: document.getElementById('inputHeroSubcopy').value,
        ctaText: document.getElementById('inputHeroCtaText').value,
        heroImage: bgPhoto,
        heroBgImage: bgPhoto,
        standard01: document.getElementById('inputStandard01').value,
        standard02: document.getElementById('inputStandard02').value,
        standard03: document.getElementById('inputStandard03').value,
        aboutHeading: document.getElementById('inputAboutHeading').value,
        aboutLead: document.getElementById('inputAboutLead').value,
        email: document.getElementById('inputContactEmail').value,
        location: document.getElementById('inputStudioLocation').value,
        igHandle: document.getElementById('inputIgHandle').value,
        igUrl: document.getElementById('inputIgUrl').value,
        guarantee: document.getElementById('inputGuarantee').value
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
  if (saved.headline && document.getElementById('inputHeroHeadline')) document.getElementById('inputHeroHeadline').value = saved.headline;
  if (saved.subcopy && document.getElementById('inputHeroSubcopy')) document.getElementById('inputHeroSubcopy').value = saved.subcopy;
  if (saved.ctaText && document.getElementById('inputHeroCtaText')) document.getElementById('inputHeroCtaText').value = saved.ctaText;

  const heroPhoto = saved.heroBgImage || saved.heroImage;
  if (heroPhoto) {
    if (document.getElementById('inputHeroBgUrl')) document.getElementById('inputHeroBgUrl').value = heroPhoto;
    if (document.getElementById('inputHeroImgUrl')) document.getElementById('inputHeroImgUrl').value = heroPhoto;
    if (document.getElementById('previewHeroImage')) document.getElementById('previewHeroImage').src = heroPhoto;
  }

  if (saved.standard01 && document.getElementById('inputStandard01')) document.getElementById('inputStandard01').value = saved.standard01;
  if (saved.standard02 && document.getElementById('inputStandard02')) document.getElementById('inputStandard02').value = saved.standard02;
  if (saved.standard03 && document.getElementById('inputStandard03')) document.getElementById('inputStandard03').value = saved.standard03;

  if (saved.aboutHeading && document.getElementById('inputAboutHeading')) document.getElementById('inputAboutHeading').value = saved.aboutHeading;
  if (saved.aboutLead && document.getElementById('inputAboutLead')) document.getElementById('inputAboutLead').value = saved.aboutLead;

  if (saved.email && document.getElementById('inputContactEmail')) document.getElementById('inputContactEmail').value = saved.email;
  if (saved.location && document.getElementById('inputStudioLocation')) document.getElementById('inputStudioLocation').value = saved.location;
  if (saved.igHandle && document.getElementById('inputIgHandle')) document.getElementById('inputIgHandle').value = saved.igHandle;
  if (saved.igUrl && document.getElementById('inputIgUrl')) document.getElementById('inputIgUrl').value = saved.igUrl;
  if (saved.guarantee && document.getElementById('inputGuarantee')) document.getElementById('inputGuarantee').value = saved.guarantee;
}

/* ==========================================================================
   6. SERVICES SECTION MANAGER (FULL SERVICES ACCESS)
   ========================================================================== */
function initServicesModule() {
  const btnSave = document.getElementById('btnSaveServices');
  if (btnSave) {
    btnSave.addEventListener('click', saveServicesFromDOM);
  }
}

function renderServicesAdmin() {
  const container = document.getElementById('servicesEditorList');
  if (!container) return;

  const services = getStorageItem('lenora_services_list', DEFAULT_SERVICES);

  container.innerHTML = services.map((s, idx) => {
    const safeTitle = escapeHtml(s.title);
    const safeCat = escapeHtml(s.category);
    const safeDesc = escapeHtml(s.desc);
    const safeFeatures = (s.features || []).map(f => escapeHtml(f)).join('\n');

    return `
      <div class="service-edit-card" data-service-index="${idx}">
        <div class="service-edit-header">
          <span class="service-num-badge">SERVICE ${s.num || String(idx + 1).padStart(2, '0')}</span>
          <input type="text" class="service-input-category" value="${safeCat}" style="font-size:12px; padding:3px 8px; width:130px; text-align:right;">
        </div>

        <div class="form-group">
          <label>Service Title</label>
          <input type="text" class="service-input-title" value="${safeTitle}">
        </div>

        <div class="form-group">
          <label>Service Description</label>
          <textarea class="service-input-desc" rows="3">${safeDesc}</textarea>
        </div>

        <div class="form-group">
          <label>Key Features / Deliverables (1 per line)</label>
          <textarea class="service-input-features" rows="3">${safeFeatures}</textarea>
        </div>
      </div>
    `;
  }).join('');
}

function saveServicesFromDOM() {
  const cards = document.querySelectorAll('#servicesEditorList .service-edit-card');
  const services = [];

  cards.forEach((card, idx) => {
    const category = card.querySelector('.service-input-category').value.trim();
    const title = card.querySelector('.service-input-title').value.trim();
    const desc = card.querySelector('.service-input-desc').value.trim();
    const featuresRaw = card.querySelector('.service-input-features').value.trim();
    const features = featuresRaw.split('\n').map(f => f.trim()).filter(Boolean);

    services.push({
      num: String(idx + 1).padStart(2, '0'),
      category,
      title,
      desc,
      features
    });
  });

  setStorageItem('lenora_services_list', services);
  showToast(`✓ Saved ${services.length} services!`);
}

/* ==========================================================================
   7. REVIEWS & TESTIMONIALS MANAGER (MOVING BANNER)
   ========================================================================== */
function initReviewsModule() {
  const btnOpenNewRev = document.getElementById('btnOpenNewReviewModal');
  const btnCloseNewRev = document.getElementById('btnCloseNewReviewBox');
  const btnCancelNewRev = document.getElementById('btnCancelNewReview');
  const newRevBox = document.getElementById('newReviewBox');
  const newRevForm = document.getElementById('newReviewForm');
  const btnSaveReviews = document.getElementById('btnSaveReviews');

  if (btnOpenNewRev && newRevBox) {
    btnOpenNewRev.addEventListener('click', () => {
      newRevBox.style.display = 'block';
      newRevBox.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('newRevAuthor').focus();
    });
  }

  function hideNewRevBox() {
    if (newRevBox) newRevBox.style.display = 'none';
  }

  if (btnCloseNewRev) btnCloseNewRev.addEventListener('click', hideNewRevBox);
  if (btnCancelNewRev) btnCancelNewRev.addEventListener('click', hideNewRevBox);

  if (newRevForm) {
    newRevForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const author = (document.getElementById('newRevAuthor').value || '').trim();
      if (!author) {
        showToast('Please enter the client name', 'error');
        document.getElementById('newRevAuthor').focus();
        return;
      }
      const role = (document.getElementById('newRevRole').value || '').trim() || 'Client Partner';
      const metric = (document.getElementById('newRevMetric').value || '').trim() || 'Top Quality';
      const rating = parseInt(document.getElementById('newRevRating').value, 10) || 5;
      const quote = (document.getElementById('newRevQuote').value || '').trim() || 'Outstanding collaboration and delivery.';

      const reviews = getStorageItem('lenora_reviews_list', DEFAULT_REVIEWS);
      reviews.push({
        id: 'rev_' + Date.now(),
        author,
        role,
        metric,
        rating,
        quote
      });

      setStorageItem('lenora_reviews_list', reviews);
      newRevForm.reset();
      hideNewRevBox();
      renderReviewsAdmin();
      updateDashboardMetrics();
      showToast(`✓ Added review from ${author}`);
    });
  }

  if (btnSaveReviews) {
    btnSaveReviews.addEventListener('click', saveReviewsFromDOM);
  }
}

function renderReviewsAdmin() {
  const container = document.getElementById('reviewsEditorList');
  if (!container) return;

  const reviews = getStorageItem('lenora_reviews_list', DEFAULT_REVIEWS);

  container.innerHTML = reviews.map((r, idx) => {
    const safeAuthor = escapeHtml(r.author);
    const safeRole = escapeHtml(r.role);
    const safeMetric = escapeHtml(r.metric || '');
    const safeQuote = escapeHtml(r.quote);
    const stars = '★'.repeat(r.rating || 5);

    return `
      <div class="review-edit-card" data-review-id="${r.id}">
        <div class="review-edit-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stars-badge">${stars}</span>
            <input type="text" class="rev-input-metric" value="${safeMetric}" placeholder="Metric Chip" style="font-size:11px; padding:2px 8px; width:120px;">
          </div>
          <button type="button" class="btn-delete-card" onclick="deleteReview('${r.id}')">
            <span>🗑 Remove</span>
          </button>
        </div>

        <div class="form-group">
          <label>Reviewer Name</label>
          <input type="text" class="rev-input-author" value="${safeAuthor}">
        </div>

        <div class="form-group">
          <label>Role / Company</label>
          <input type="text" class="rev-input-role" value="${safeRole}">
        </div>

        <div class="form-group">
          <label>Testimonial Quote</label>
          <textarea class="rev-input-quote" rows="3">${safeQuote}</textarea>
        </div>
      </div>
    `;
  }).join('');

  updateDashboardMetrics();
}

window.deleteReview = function(revId) {
  if (!confirm('Are you sure you want to remove this client review?')) return;
  const reviews = getStorageItem('lenora_reviews_list', DEFAULT_REVIEWS);
  const updated = reviews.filter(r => r.id !== revId);
  setStorageItem('lenora_reviews_list', updated);
  renderReviewsAdmin();
  showToast('✓ Review removed');
};

function saveReviewsFromDOM() {
  const cards = document.querySelectorAll('#reviewsEditorList .review-edit-card');
  const reviews = [];

  cards.forEach((card, idx) => {
    const id = card.dataset.reviewId || ('rev_' + idx);
    const metric = card.querySelector('.rev-input-metric').value.trim();
    const author = card.querySelector('.rev-input-author').value.trim();
    const role = card.querySelector('.rev-input-role').value.trim();
    const quote = card.querySelector('.rev-input-quote').value.trim();

    reviews.push({
      id,
      author,
      role,
      metric,
      rating: 5,
      quote
    });
  });

  setStorageItem('lenora_reviews_list', reviews);
  showToast(`✓ Saved ${reviews.length} reviews for moving banner!`);
}

/* ==========================================================================
   8. 1-CLICK BACKUP, RESTORE & ADVANCED SECURITY MODULE
   ========================================================================== */
function initSettingsAndBackupModule() {
  const btnExport = document.getElementById('btnExportFullBackup');
  const btnExportTop = document.getElementById('btnExportFullBackupTop');
  const fileImport = document.getElementById('fileImportBackup');
  const btnImport = document.getElementById('btnImportBackup');
  const btnUpdatePass = document.getElementById('btnUpdateAdminPassword');

  // Full Site Export
  function exportFullBackupJSON() {
    const backupData = {
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      siteContent: getStorageItem('lumen_site_content', {}),
      projects: getStorageItem('lenora_projects_list', DEFAULT_PROJECTS),
      services: getStorageItem('lenora_services_list', DEFAULT_SERVICES),
      reviews: getStorageItem('lenora_reviews_list', DEFAULT_REVIEWS),
      inquiries: getStorageItem('lumen_inquiries', [])
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lenora-developers-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Complete website backup JSON downloaded!');
  }

  if (btnExport) btnExport.addEventListener('click', exportFullBackupJSON);
  if (btnExportTop) btnExportTop.addEventListener('click', exportFullBackupJSON);

  // Full Site Import / Restore
  if (btnImport && fileImport) {
    btnImport.addEventListener('click', () => {
      const file = fileImport.files[0];
      if (!file) {
        showToast('Please select a .json backup file first', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.siteContent) setStorageItem('lumen_site_content', data.siteContent);
          if (data.projects) setStorageItem('lenora_projects_list', data.projects);
          if (data.services) setStorageItem('lenora_services_list', data.services);
          if (data.reviews) setStorageItem('lenora_reviews_list', data.reviews);
          if (data.inquiries) setStorageItem('lumen_inquiries', data.inquiries);

          renderDynamicProjectsAdmin();
          loadSiteContentForm();
          renderServicesAdmin();
          renderReviewsAdmin();
          renderInquiries();
          updateDashboardMetrics();

          showToast('✓ All website contents and projects restored successfully!');
        } catch (err) {
          showToast('Failed to parse backup JSON file', 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  // Update Password
  if (btnUpdatePass) {
    btnUpdatePass.addEventListener('click', () => {
      const newPass = document.getElementById('inputNewAdminPassword').value;
      if (!newPass || newPass.length < 4) {
        showToast('Password must be at least 4 characters long', 'error');
        return;
      }
      localStorage.setItem('lenora_admin_password', newPass);
      document.getElementById('inputNewAdminPassword').value = '';
      showToast('✓ Master Admin password updated successfully!');
    });
  }

  // Cloud Config & Supabase Keys
  const btnSaveCloud = document.getElementById('btnSaveCloudConfig');
  const btnTestCloud = document.getElementById('btnTestCloudConnection');
  const radioSupabase = document.getElementById('radioSupabase');
  const radioFirebase = document.getElementById('radioFirebase');
  const subFields = document.getElementById('supabaseConfigFields');
  const fireFields = document.getElementById('firebaseConfigFields');

  if (radioSupabase && radioFirebase) {
    radioSupabase.addEventListener('change', () => {
      subFields.style.display = 'block';
      fireFields.style.display = 'none';
      STATE.cloudConfig.provider = 'supabase';
    });
    radioFirebase.addEventListener('change', () => {
      subFields.style.display = 'none';
      fireFields.style.display = 'block';
      STATE.cloudConfig.provider = 'firebase';
    });
  }

  if (btnSaveCloud) {
    btnSaveCloud.addEventListener('click', () => {
      STATE.cloudConfig.supabaseUrl = document.getElementById('inputSupabaseUrl').value.trim();
      STATE.cloudConfig.supabaseAnonKey = document.getElementById('inputSupabaseAnonKey').value.trim();
      STATE.cloudConfig.firebaseConfig = document.getElementById('inputFirebaseConfigJson').value.trim();

      setStorageItem('lumen_cloud_config', STATE.cloudConfig);
      showToast('✓ Cloud settings saved');
    });
  }

  if (btnTestCloud) {
    btnTestCloud.addEventListener('click', async () => {
      const url = document.getElementById('inputSupabaseUrl').value.trim();
      const key = document.getElementById('inputSupabaseAnonKey').value.trim();

      if (!url || !key) {
        showToast('Please enter Supabase URL and Anon Key first', 'error');
        return;
      }

      try {
        const client = supabase.createClient(url, key);
        const { error } = await client.from('inquiries').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
          showToast(`Supabase connected! Note: Table check response: ${error.message}`);
        } else {
          showToast('✓ Supabase connected successfully!');
        }
      } catch (err) {
        showToast(`Connection failed: ${err.message}`, 'error');
      }
    });
  }
}

/* ==========================================================================
   IMAGE & URL HELPER UTILITIES
   ========================================================================== */
function setupImagePreview(fileInputId, urlInputId, imgPreviewId) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  const previewImg = document.getElementById(imgPreviewId);

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (urlInput) urlInput.value = event.target.result;
        if (previewImg) previewImg.src = event.target.result;
        showToast('✓ Image preview loaded');
      };
      reader.readAsDataURL(file);
    }
  });
}

function setupUrlPreview(urlInputId, imgPreviewId) {
  const urlInput = document.getElementById(urlInputId);
  const previewImg = document.getElementById(imgPreviewId);

  if (!urlInput || !previewImg) return;

  urlInput.addEventListener('blur', () => {
    const url = urlInput.value.trim();
    if (url) {
      previewImg.src = url;
    }
  });
}
