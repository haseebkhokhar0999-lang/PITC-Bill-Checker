/**
 * Bijli Bill Checker - Frontend JavaScript
 * High-performance, bug-free, fully responsive, integrating city and company synchronization
 */

// All Major Pakistani Cities Mapped to Electricity Distribution Companies
const PAKISTAN_CITIES = [
  { city: 'Lahore', disco: 'lesco', region: 'Punjab' },
  { city: 'Multan', disco: 'mepco', region: 'South Punjab' },
  { city: 'Islamabad', disco: 'iesco', region: 'Federal Capital' },
  { city: 'Rawalpindi', disco: 'iesco', region: 'Punjab' },
  { city: 'Faisalabad', disco: 'fesco', region: 'Punjab' },
  { city: 'Gujranwala', disco: 'gepco', region: 'Punjab' },
  { city: 'Sialkot', disco: 'gepco', region: 'Punjab' },
  { city: 'Peshawar', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Hyderabad', disco: 'hesco', region: 'Sindh' },
  { city: 'Quetta', disco: 'qesco', region: 'Balochistan' },
  { city: 'Sukkur', disco: 'sepco', region: 'Sindh' },
  { city: 'Sargodha', disco: 'fesco', region: 'Punjab' },
  { city: 'Bahawalpur', disco: 'mepco', region: 'South Punjab' },
  { city: 'Sahiwal', disco: 'mepco', region: 'Punjab' },
  { city: 'Dera Ghazi Khan', disco: 'mepco', region: 'South Punjab' },
  { city: 'Rahim Yar Khan', disco: 'mepco', region: 'South Punjab' },
  { city: 'Gujrat', disco: 'gepco', region: 'Punjab' },
  { city: 'Mardan', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Swat', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Abbottabad', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Kasur', disco: 'lesco', region: 'Punjab' },
  { city: 'Sheikhupura', disco: 'lesco', region: 'Punjab' },
  { city: 'Okara', disco: 'lesco', region: 'Punjab' },
  { city: 'Nankana Sahib', disco: 'lesco', region: 'Punjab' },
  { city: 'Jhelum', disco: 'iesco', region: 'Punjab' },
  { city: 'Attock', disco: 'iesco', region: 'Punjab' },
  { city: 'Chakwal', disco: 'iesco', region: 'Punjab' },
  { city: 'Jhang', disco: 'fesco', region: 'Punjab' },
  { city: 'Toba Tek Singh', disco: 'fesco', region: 'Punjab' },
  { city: 'Chiniot', disco: 'fesco', region: 'Punjab' },
  { city: 'Mianwali', disco: 'fesco', region: 'Punjab' },
  { city: 'Bhakkar', disco: 'fesco', region: 'Punjab' },
  { city: 'Hafizabad', disco: 'gepco', region: 'Punjab' },
  { city: 'Narowal', disco: 'gepco', region: 'Punjab' },
  { city: 'Mandi Bahauddin', disco: 'gepco', region: 'Punjab' },
  { city: 'Mirpurkhas', disco: 'hesco', region: 'Sindh' },
  { city: 'Nawabshah', disco: 'hesco', region: 'Sindh' },
  { city: 'Badin', disco: 'hesco', region: 'Sindh' },
  { city: 'Thatta', disco: 'hesco', region: 'Sindh' },
  { city: 'Larkana', disco: 'sepco', region: 'Sindh' },
  { city: 'Ghotki', disco: 'sepco', region: 'Sindh' },
  { city: 'Jacobabad', disco: 'sepco', region: 'Sindh' },
  { city: 'Khairpur', disco: 'sepco', region: 'Sindh' },
  { city: 'Kohat', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Bannu', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Dera Ismail Khan', disco: 'pesco', region: 'Khyber Pakhtunkhwa' },
  { city: 'Gwadar', disco: 'qesco', region: 'Balochistan' },
  { city: 'Khuzdar', disco: 'qesco', region: 'Balochistan' },
  { city: 'Turbat', disco: 'qesco', region: 'Balochistan' }
];

// DISCO Mapping & Prefix Registry
const DISCOS = [
  { code: 'lesco', name: 'LESCO', fullName: 'Lahore Electric Supply Company', defaultCity: 'Lahore', sampleRef: '06113530462901' },
  { code: 'mepco', name: 'MEPCO', fullName: 'Multan Electric Power Company', defaultCity: 'Multan', sampleRef: '15112310123401' },
  { code: 'fesco', name: 'FESCO', fullName: 'Faisalabad Electric Supply Company', defaultCity: 'Faisalabad', sampleRef: '13112340123401' },
  { code: 'iesco', name: 'IESCO', fullName: 'Islamabad Electric Supply Company', defaultCity: 'Islamabad', sampleRef: '08112340567801' },
  { code: 'gepco', name: 'GEPCO', fullName: 'Gujranwala Electric Power Company', defaultCity: 'Gujranwala', sampleRef: '20112340123401' },
  { code: 'pesco', name: 'PESCO', fullName: 'Peshawar Electric Supply Company', defaultCity: 'Peshawar', sampleRef: '26112340123401' },
  { code: 'hesco', name: 'HESCO', fullName: 'Hyderabad Electric Supply Company', defaultCity: 'Hyderabad', sampleRef: '24112340123401' },
  { code: 'qesco', name: 'QESCO', fullName: 'Quetta Electric Supply Company', defaultCity: 'Quetta', sampleRef: '29112340123401' },
  { code: 'sepco', name: 'SEPCO', fullName: 'Sukkur Electric Power Company', defaultCity: 'Sukkur', sampleRef: '23112340123401' }
];

// Exact Mapping: Electricity Company (DISCO) -> City
const DISCO_CITY_MAP = {
  LESCO: 'Lahore',
  MEPCO: 'Multan',
  FESCO: 'Faisalabad',
  IESCO: 'Islamabad',
  GEPCO: 'Gujranwala',
  PESCO: 'Peshawar',
  HESCO: 'Hyderabad',
  SEPCO: 'Sukkur',
  QESCO: 'Quetta',
  lesco: 'Lahore',
  mepco: 'Multan',
  fesco: 'Faisalabad',
  iesco: 'Islamabad',
  gepco: 'Gujranwala',
  pesco: 'Peshawar',
  hesco: 'Hyderabad',
  sepco: 'Sukkur',
  qesco: 'Quetta'
};

// Urdu DISCO Translations Registry
const DISCO_NAMES_URDU = {
  lesco: { name: 'لیسکو', fullName: 'لاہور الیکٹرک سپلائی کمپنی', city: 'لاہور' },
  mepco: { name: 'میپکو', fullName: 'ملتان الیکٹرک پاور کمپنی', city: 'ملتان' },
  fesco: { name: 'فیسکو', fullName: 'فیصل آباد الیکٹرک سپلائی کمپنی', city: 'فیصل آباد' },
  iesco: { name: 'آئیسکو', fullName: 'اسلام آباد الیکٹرک سپلائی کمپنی', city: 'اسلام آباد' },
  gepco: { name: 'گیپکو', fullName: 'گوجرانوالہ الیکٹرک پاور کمپنی', city: 'گوجرانوالہ' },
  pesco: { name: 'پیسکو', fullName: 'پشاور الیکٹرک سپلائی کمپنی', city: 'پشاور' },
  hesco: { name: 'حیسکو', fullName: 'حیدرآباد الیکٹرک سپلائی کمپنی', city: 'حیدرآباد' },
  qesco: { name: 'کیسکو', fullName: 'کوئٹہ الیکٹرک سپلائی کمپنی', city: 'کوئٹہ' },
  sepco: { name: 'سیپکو', fullName: 'سکھر الیکٹرک پاور کمپنی', city: 'سکھر' }
};

// UI Translations Dictionary (English & Urdu)
const TRANSLATIONS = {
  en: {
    // Header
    brandTitle: "Bijli Bill Checker",
    brandSubtitle: "Check Your Electricity Bill Online",
    navHome: "Home",
    navBillCheck: "Bill Check",
    navHowItWorks: "How It Works",
    navFaq: "FAQ",
    navTerms: "Terms",
    navPrivacy: "Privacy",
    navArticles: "Articles",
    searchCityPlaceholder: "Search your city...",

    // Homepage Hero
    badgeWapda: "WAPDA & DISCOs",
    badgeOfficial: "Bill Checking",
    heroTitle: 'Electricity Bill <span class="highlight-blue">Check Online</span>',
    heroSubtitle: "Click your electricity company below to check your bill.<br>Fast, secure and easy — all in one place.",
    popularProviders: "Popular Providers:",

    // DISCO Action Buttons
    checkBillAction: "Check Bill &rarr;",

    // Why Section
    whyTitle: "Why Check Your Bill Online?",
    whyDesc: "Get your electricity bill details in seconds. No waiting, no hassle.",
    featFastTitle: "Fast & Easy",
    featFastDesc: "Get your bill in seconds",
    featSecureTitle: "100% Secure",
    featSecureDesc: "Your data is safe with us",
    featAccessTitle: "24/7 Access",
    featAccessDesc: "Check anytime, anywhere",

    // How It Works
    howMainTitle: "How It Works",
    howSubTitle: "Checking your electricity bill is simple and takes less than a minute.",
    step1Title: "Click Your DISCO Card/Chip",
    step1Desc: "Click your DISCO card/chip (LESCO, MEPCO, FESCO, etc.).",
    step2Title: "Enter Reference Number",
    step2Desc: "On that DISCO's own page, enter your 14-digit reference number.",
    step3Title: "View Bill Details",
    step3Desc: "View your bill details.",
    step4Title: "Print Original Bill (اصل بل کا پرنٹ)",
    step4Desc: "Print Original Bill (اصل بل کا پرنٹ).",

    // FAQ Section
    faqBadge: "Help Center",
    faqBadgeUrdu: "سوالات و جوابات",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about checking, verifying, paying, and printing electricity bills in Pakistan.",
    faqViewAll: "View All FAQs & Knowledge Base &rarr;",

    // Footer
    footerTitle: "Bijli Bill Checker",
    footerSubtitle: "All Pakistani DISCOs & WAPDA",
    footerServing: "Made for a Better Pakistan 🇵🇰 💚",
    footerCopy: "© 2026 Bijli Bill Checker. All rights reserved.",
    footerHome: "Home",
    footerBillCheck: "Bill Check",
    footerFaq: "FAQ",
    footerTerms: "Terms & Conditions",
    footerPrivacy: "Privacy Policy",
    footerAbout: "About Us",
    footerContact: "Contact",

    // DISCO Dedicated Pages
    refInputPlaceholder: "Enter Reference Number (e.g. 14-digit)",
    btnCheckBill: "Check Bill",
    otherDiscosTitle: "Check Other Electricity Distribution Companies",
    otherDiscosDesc: "Quickly access bill checking for any other Pakistani electric supply company:"
  },
  ur: {
    // Header
    brandTitle: "بجلی بل چیکر",
    brandSubtitle: "آن لائن بجلی کا بل چیک کریں",
    navHome: "ہوم",
    navBillCheck: "بل چیک",
    navHowItWorks: "طریقہ کار",
    navFaq: "سوالات",
    navTerms: "شرائط",
    navPrivacy: "پرائیویسی",
    navArticles: "مضامین",
    searchCityPlaceholder: "اپنا شہر تلاش کریں...",

    // Homepage Hero
    badgeWapda: "واپڈا اور ڈسکوز",
    badgeOfficial: "بل تصدیق",
    heroTitle: 'بجلی کا بل <span class="highlight-blue">آن لائن چیک کریں</span>',
    heroSubtitle: "اپنا بل چیک کرنے کے لیے نیچے دی گئی اپنی بجلی کمپنی پر کلک کریں۔<br>تیز، محفوظ اور آسان — سب ایک ہی جگہ۔",
    popularProviders: "مقبول کمپنیاں:",

    // DISCO Action Buttons
    checkBillAction: "بل چیک کریں &larr;",

    // Why Section
    whyTitle: "آن لائن بل کیوں چیک کریں؟",
    whyDesc: "سیکنڈوں میں اپنے بجلی کے بل کی تفصیلات حاصل کریں۔ بغیر انتظار، بغیر کسی پریشانی کے۔",
    featFastTitle: "تیز اور آسان",
    featFastDesc: "چند سیکنڈز میں اپنا بل حاصل کریں",
    featSecureTitle: "100٪ محفوظ",
    featSecureDesc: "آپ کا ڈیٹا ہمارے پاس محفوظ ہے",
    featAccessTitle: "24/7 دستیابی",
    featAccessDesc: "کسی بھی وقت، کہیں بھی چیک کریں",

    // How It Works
    howMainTitle: "یہ کیسے کام کرتا ہے",
    howSubTitle: "اپنا بجلی کا بل چیک کرنا انتہائی آسان ہے اور ایک منٹ سے بھی کم وقت لگتا ہے۔",
    step1Title: "اپنی کمپنی کے کارڈ/چپ پر کلک کریں",
    step1Desc: "اپنی کمپنی کے کارڈ یا چپ پر کلک کریں (LESCO، MEPCO، FESCO وغیرہ)۔",
    step2Title: "ریفرنس نمبر درج کریں",
    step2Desc: "اس کمپنی کے اپنے صفحے پر اپنا 14 ہندسوں کا ریفرنس نمبر درج کریں۔",
    step3Title: "بل کی تفصیلات دیکھیں",
    step3Desc: "اپنے بجلی بل کی مکمل تفصیلات دیکھیں۔",
    step4Title: "Print Original Bill (اصل بل کا پرنٹ)",
    step4Desc: "Print Original Bill (اصل بل کا پرنٹ)۔",

    // FAQ Section
    faqBadge: "امدادی مرکز",
    faqBadgeUrdu: "سوالات و جوابات",
    faqTitle: "اکثر پوچھے جانے والے سوالات",
    faqSubtitle: "پاکستان میں بجلی کے بل چیک کرنے، تصدیق کرنے اور ادا کرنے کی تمام تفصیلات۔",
    faqViewAll: "تمام سوالات و معلومات دیکھیں &larr;",

    // Footer
    footerTitle: "بجلی بل چیکر",
    footerSubtitle: "تمام پاکستانی ڈسکوز اور واپڈا",
    footerServing: "بہتر پاکستان کے لیے 🇵🇰 💚",
    footerCopy: "© 2026 بجلی بل چیکر۔ جملہ حقوق محفوظ ہیں۔",
    footerHome: "ہوم",
    footerBillCheck: "بل چیک",
    footerFaq: "سوالات",
    footerTerms: "شرائط و ضوابط",
    footerPrivacy: "پرائیویسی پالیسی",
    footerAbout: "ہمارے بارے میں",
    footerContact: "رابطہ",

    // DISCO Dedicated Pages
    refInputPlaceholder: "14 ہندسوں کا ریفرنس نمبر درج کریں",
    btnCheckBill: "بل چیک کریں",
    otherDiscosTitle: "دیگر بجلی کی کمپنیوں کے بل دیکھیں",
    otherDiscosDesc: "پاکستان کی کسی بھی دوسری بجلی تقسیم کار کمپنی کا بل چیک کرنے کے لیے منتخب کریں:"
  }
};

// Application State
const state = {
  selectedCompany: localStorage.getItem('bijli_company') || 'lesco',
  selectedCity: localStorage.getItem('bijli_city') || 'Lahore',
  currentBill: null,
  theme: localStorage.getItem('bijli_theme') || 'light',
  lang: localStorage.getItem('bijli_lang') || 'en'
};

// DOM References
const refInput = document.getElementById('refNoInput');
const companySelectDropdown = document.getElementById('companySelectDropdown');
const billForm = document.getElementById('billSearchForm');
const btnSubmit = document.getElementById('btnSubmitBill');
const btnSubmitText = document.getElementById('btnSubmitText');
const alertContainer = document.getElementById('alertContainer');
const resultsArea = document.getElementById('resultsArea');
const billResultSection = document.getElementById('billResultSection');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const langToggleBtn = document.getElementById('langToggleBtn');

// City Dropdown DOM Elements
const cityDropdownWrap = document.getElementById('cityDropdownWrap');
const cityDropdownBtn = document.getElementById('cityDropdownBtn');
const selectedCityText = document.getElementById('selectedCityText');
const cityMenuPopover = document.getElementById('cityMenuPopover');
const citySearchInput = document.getElementById('citySearchInput');
const cityOptionsList = document.getElementById('cityOptionsList');

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if dedicated DISCO page
  const pageDisco = document.body.dataset.disco;
  if (pageDisco) {
    state.selectedCompany = pageDisco;
  }

  // 1. Apply theme
  applyTheme(state.theme);

  // 2. Initialize and apply language
  applyLanguage(state.lang);

  // 3. Language toggle listener
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = state.lang === 'ur' ? 'en' : 'ur';
      applyLanguage(newLang);
    });
  }

  // 4. Initialize and render city dropdown
  initCityDropdown();

  // 5. Set initial active company & city
  if (pageDisco) {
    selectCompany(state.selectedCompany, false);
  } else {
    // Homepage initial load: NO card or chip must be pre-selected
    state.selectedCompany = null;
    document.querySelectorAll('.provider-pill').forEach(pill => pill.classList.remove('active'));
    document.querySelectorAll('.disco-card').forEach(card => card.classList.remove('active'));
  }

  // 6. Synchronize company select dropdown in search bar & handle changes anywhere
  if (companySelectDropdown) {
    if (state.selectedCompany) {
      companySelectDropdown.value = state.selectedCompany;
    }
    const handleCompanyChange = (e) => {
      selectCompany(e.target.value, false);
    };
    companySelectDropdown.addEventListener('change', handleCompanyChange);
    companySelectDropdown.addEventListener('input', handleCompanyChange);
  }

  // Handle dropdown changes for any company select elements across the site
  document.addEventListener('change', (e) => {
    if (e.target && (e.target.id === 'companySelectDropdown' || 
                     e.target.name === 'company' || 
                     (e.target.classList && (
                       e.target.classList.contains('company-select') ||
                       e.target.classList.contains('company-dropdown') ||
                       e.target.classList.contains('company-inline-select')
                     )))) {
      selectCompany(e.target.value, false);
    }
  });

  // Whenever user clicks Popular Providers chips or DISCO cards anywhere on the site
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.provider-pill');
    if (pill) {
      const disco = (pill.dataset.disco || 
                     (pill.getAttribute('href') ? pill.getAttribute('href').replace(/^\/|-bill$/g, '') : '') ||
                     pill.textContent).trim().toLowerCase();
      if (DISCO_CITY_MAP[disco]) {
        selectCompany(disco, false);
      }
      return;
    }

    const card = e.target.closest('.disco-card');
    if (card) {
      const disco = (card.getAttribute('data-disco') || 
                     (card.id ? card.id.replace('disco-card-', '') : '') ||
                     (card.getAttribute('href') ? card.getAttribute('href').replace(/^\/|-bill$/g, '') : '') ||
                     (card.querySelector('.disco-title') ? card.querySelector('.disco-title').textContent : '')).trim().toLowerCase();
      if (DISCO_CITY_MAP[disco]) {
        selectCompany(disco, false);
      }
      return;
    }
  });

  // 7. Input formatting (removes invalid chars, allows digits and optional U/R suffix)
  if (refInput) {
    refInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
      if (val.length > 15) val = val.slice(0, 15);
      e.target.value = val;
    });
  }

  // 8. Form submit listener
  if (billForm) {
    billForm.addEventListener('submit', handleBillSubmit);
  }

  // 9. Theme toggle listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
});

// Language Management Function
function applyLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('bijli_lang', lang);
  const isUr = lang === 'ur';

  // 1. Update HTML attributes for RTL/LTR & language
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isUr ? 'rtl' : 'ltr');
  document.body.setAttribute('data-lang', lang);

  // 2. Update all Language Toggle Buttons UI
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    const enText = btn.querySelector('.lang-text-en');
    const urText = btn.querySelector('.lang-text-ur');
    if (enText && urText) {
      if (isUr) {
        enText.classList.remove('active');
        urText.classList.add('active');
      } else {
        enText.classList.add('active');
        urText.classList.remove('active');
      }
    }
  });

  // 3. Update Elements with data-i18n
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (dict[key].includes('<') && dict[key].includes('>')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // 4. Update Elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // 5. Update Elements with data-en & data-ur attributes
  document.querySelectorAll('[data-en][data-ur]').forEach(el => {
    el.textContent = isUr ? el.getAttribute('data-ur') : el.getAttribute('data-en');
  });

  // 6. Update DISCO Cards Action Buttons
  document.querySelectorAll('.btn-disco-action').forEach(btn => {
    btn.innerHTML = isUr ? 'بل چیک کریں &larr;' : 'Check Bill &rarr;';
  });

  // 7. Update DISCO Cards Fullnames
  document.querySelectorAll('.disco-card').forEach(card => {
    const disco = card.getAttribute('data-disco') || (card.id ? card.id.replace('disco-card-', '') : '');
    const fullnameEl = card.querySelector('.disco-fullname');
    if (fullnameEl && DISCO_NAMES_URDU[disco]) {
      if (isUr) {
        if (!fullnameEl.getAttribute('data-orig-en')) {
          fullnameEl.setAttribute('data-orig-en', fullnameEl.textContent);
        }
        fullnameEl.textContent = DISCO_NAMES_URDU[disco].fullName;
      } else if (fullnameEl.getAttribute('data-orig-en')) {
        fullnameEl.textContent = fullnameEl.getAttribute('data-orig-en');
      }
    }
  });

  // 8. Update Input Placeholders and Submit Button on DISCO Form Pages
  if (refInput) {
    refInput.placeholder = isUr ? '14 ہندسوں کا ریفرنس نمبر درج کریں' : 'Enter Reference Number (e.g. 14-digit)';
  }
  if (citySearchInput) {
    citySearchInput.placeholder = isUr ? 'اپنا شہر تلاش کریں...' : 'Search your city...';
  }
  if (btnSubmitText) {
    const disco = state.selectedCompany || 'lesco';
    if (isUr) {
      const urName = DISCO_NAMES_URDU[disco] ? DISCO_NAMES_URDU[disco].name : disco.toUpperCase();
      btnSubmitText.textContent = `${urName} کا بل چیک کریں`;
    } else {
      btnSubmitText.textContent = `Check ${disco.toUpperCase()} Bill`;
    }
  }

  // 9. Update DISCO Articles Language Visibility (English & Urdu)
  document.querySelectorAll('.disco-article-lang-en').forEach(el => {
    el.style.display = isUr ? 'none' : 'block';
  });
  document.querySelectorAll('.disco-article-lang-ur').forEach(el => {
    el.style.display = isUr ? 'block' : 'none';
  });
}

// Theme Management
function applyTheme(theme) {
  state.theme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('bijli_theme', theme);
}

// Initialize City Dropdown Menu
function initCityDropdown() {
  if (!cityDropdownBtn || !cityMenuPopover || !cityOptionsList) return;

  // Render all cities
  renderCityOptions(PAKISTAN_CITIES);

  // Toggle popover on button click
  cityDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = cityDropdownWrap.classList.contains('open');
    if (isOpen) {
      closeCityDropdown();
    } else {
      openCityDropdown();
    }
  });

  // Filter cities as user types in search box
  if (citySearchInput) {
    citySearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      const filtered = PAKISTAN_CITIES.filter(c => 
        c.city.toLowerCase().includes(q) || 
        c.disco.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
      renderCityOptions(filtered);
    });

    citySearchInput.addEventListener('click', (e) => e.stopPropagation());
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!cityDropdownWrap.contains(e.target)) {
      closeCityDropdown();
    }
  });
}

function openCityDropdown() {
  cityDropdownWrap.classList.add('open');
  if (citySearchInput) {
    citySearchInput.value = '';
    renderCityOptions(PAKISTAN_CITIES);
    setTimeout(() => citySearchInput.focus(), 50);
  }
}

function closeCityDropdown() {
  cityDropdownWrap.classList.remove('open');
}

// Render City Option Items in Dropdown
function renderCityOptions(cities) {
  if (!cityOptionsList) return;

  if (cities.length === 0) {
    cityOptionsList.innerHTML = `
      <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12px;">
        No cities found
      </div>
    `;
    return;
  }

  cityOptionsList.innerHTML = cities.map(c => `
    <div class="city-option-item ${c.city === state.selectedCity ? 'active' : ''}" 
         onclick="selectCity('${c.city}', '${c.disco}')">
      <span>📍 ${c.city}</span>
      <span class="city-disco-tag">${c.disco.toUpperCase()}</span>
    </div>
  `).join('');
}

// Select City Handler
function selectCity(cityName, discoCode) {
  state.selectedCity = cityName;
  localStorage.setItem('bijli_city', cityName);

  if (selectedCityText) {
    selectedCityText.textContent = cityName;
  }

  closeCityDropdown();

  // Switch active company to the city's DISCO
  selectCompany(discoCode, false);
}

// Master Function: Select Company & Synchronize Entire UI
function selectCompany(code, shouldScroll = false) {
  if (!code) return;
  const normalizedCode = String(code).toLowerCase().trim();
  state.selectedCompany = normalizedCode;
  localStorage.setItem('bijli_company', normalizedCode);

  // 1. Update Company Select Dropdown in Search Bar
  if (companySelectDropdown) {
    companySelectDropdown.value = normalizedCode;
  }
  document.querySelectorAll('select#companySelectDropdown, select[name="company"], select.company-select, select.company-inline-select').forEach(sel => {
    sel.value = normalizedCode;
  });

  // 2. Update Submit Button Text
  if (btnSubmitText) {
    if (state.lang === 'ur') {
      const urName = DISCO_NAMES_URDU[normalizedCode] ? DISCO_NAMES_URDU[normalizedCode].name : normalizedCode.toUpperCase();
      btnSubmitText.textContent = `${urName} کا بل چیک کریں`;
    } else {
      btnSubmitText.textContent = `Check ${normalizedCode.toUpperCase()} Bill`;
    }
  }

  // 3. Update Popular Providers Pills
  document.querySelectorAll('.provider-pill').forEach(pill => {
    const disco = (pill.dataset.disco || 
                   (pill.getAttribute('href') ? pill.getAttribute('href').replace(/^\/|-bill$/g, '') : '') ||
                   pill.textContent).trim().toLowerCase();
    if (disco === normalizedCode) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // 4. Update DISCO Cards Highlight
  document.querySelectorAll('.disco-card').forEach(card => {
    const disco = (card.getAttribute('data-disco') || 
                   (card.id ? card.id.replace('disco-card-', '') : '') ||
                   (card.getAttribute('href') ? card.getAttribute('href').replace(/^\/|-bill$/g, '') : '')).trim().toLowerCase();
    if (disco === normalizedCode) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // 5. Automatically update header city selector to that company's city from exact mapping
  const mappedCity = DISCO_CITY_MAP[normalizedCode] || DISCO_CITY_MAP[normalizedCode.toUpperCase()];
  if (mappedCity) {
    state.selectedCity = mappedCity;
    localStorage.setItem('bijli_city', mappedCity);
    if (selectedCityText) {
      selectedCityText.textContent = mappedCity;
    }
  }

  // 6. Smooth scroll and focus if user clicked a card
  if (shouldScroll) {
    const hero = document.getElementById('heroSection');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
    if (refInput) {
      refInput.focus();
    }
  }
}

// Handle Form Submission & Live PITC Query
async function handleBillSubmit(e) {
  e.preventDefault();
  const rawInput = (refInput ? refInput.value : '').trim().toUpperCase();
  const digits = rawInput.replace(/[^0-9]/g, '');
  const isRural = /R$/.test(rawInput);
  const ruParam = isRural ? '&ruCode=R' : '';
  const company = state.selectedCompany || 'lesco';

  if (!digits || digits.length < 10) {
    showAlert('Please enter a valid 10-14 digit reference number from your electricity bill.', 'warning');
    return;
  }

  clearAlert();
  setLoading(true);

  try {
    const res = await fetch(`/api/check-bill?refNo=${encodeURIComponent(digits)}&company=${encodeURIComponent(company)}${ruParam}`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      const errorMsg = json.error || `The reference number <strong>${digits}</strong> was not found in <strong>${company.toUpperCase()}</strong>.`;
      const otherCompanies = DISCOS.filter(d => d.code !== company).slice(0, 4);
      showAlert(`
        <div>${errorMsg}</div>
        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
          If your electricity connection belongs to another company, select below:
        </div>
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
          ${otherCompanies.map(d => `
            <button type="button" class="provider-pill" onclick="retryWithCompany('${d.code}', '${digits}')">
              Try with ${d.name}
            </button>
          `).join('')}
        </div>
      `, 'danger');

      if (billResultSection) billResultSection.style.display = 'none';
      return;
    }

    if (json.autoDiscovered && json.company) {
      selectCompany(json.company, false);
      showAlert(`
        ⚡ Note: Reference number was automatically found in <strong>${(json.companyName || json.company).toUpperCase()}</strong>!
      `, 'warning');
    }

    state.currentBill = json;
    renderBillResult(json);

    if (billResultSection) {
      billResultSection.style.display = 'block';
      billResultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    showAlert('Unable to reach the bill verification server. Please verify your connection or try again.', 'danger');
  } finally {
    setLoading(false);
  }
}

// 1-Click Retry with Another Company
function retryWithCompany(discoCode, refNo) {
  selectCompany(discoCode, false);
  if (refInput) refInput.value = refNo;
  if (billForm) billForm.dispatchEvent(new Event('submit'));
}

// Loading Spinner State, Estimated Progress Bar & Elapsed Timer
let billLoadingInterval = null;
let billLoadingHideTimeout = null;
let billLoadingStartMs = 0;

function computeEstimatedProgress(elapsedMs) {
  if (elapsedMs <= 0) return 4;
  if (elapsedMs <= 20000) {
    const ratio = elapsedMs / 20000;
    return 4 + 86 * (1 - Math.pow(1 - ratio, 1.4));
  }
  const extraSec = (elapsedMs - 20000) / 1000;
  return Math.min(95, 90 + extraSec * 0.25);
}

function getOrCreateLoadingProgressEl() {
  let wrap = document.getElementById('billCheckProgressWrap');
  if (wrap) return wrap;

  const anchor = billForm || (btnSubmit ? btnSubmit.closest('form') || btnSubmit : null);
  if (!anchor || !anchor.parentNode) return null;

  wrap = document.createElement('div');
  wrap.id = 'billCheckProgressWrap';
  wrap.className = 'bill-loading-progress-wrap';
  wrap.setAttribute('role', 'status');
  wrap.setAttribute('aria-live', 'polite');
  wrap.innerHTML = `
    <div class="bill-loading-bar-row">
      <div class="bill-loading-track" role="progressbar" aria-label="Estimated check progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="4" id="billCheckProgressTrack">
        <div class="bill-loading-fill" id="billCheckProgressFill" style="width: 4%;"></div>
      </div>
      <span class="bill-loading-timer" id="billCheckElapsedTimer" dir="ltr">0s</span>
    </div>
    <div class="bill-loading-hint">
      <span>Estimated wait &mdash; usually takes 10-20 seconds</span>
      <span class="bill-loading-hint-ur">عام طور پر 10 سے 20 سیکنڈ لگتے ہیں</span>
    </div>
  `;
  anchor.insertAdjacentElement('afterend', wrap);
  return wrap;
}

function setLoading(isLoading, customText = 'Verifying Bill & Payment Status...') {
  if (!btnSubmit) return;

  if (billLoadingHideTimeout) {
    clearTimeout(billLoadingHideTimeout);
    billLoadingHideTimeout = null;
  }
  if (billLoadingInterval) {
    clearInterval(billLoadingInterval);
    billLoadingInterval = null;
  }

  if (isLoading) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <div style="width: 14px; height: 14px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;"></div>
      <span>${customText}</span>
    `;

    const wrap = getOrCreateLoadingProgressEl();
    if (wrap) {
      wrap.classList.remove('is-completing');
      const fillEl = document.getElementById('billCheckProgressFill');
      const trackEl = document.getElementById('billCheckProgressTrack');
      const timerEl = document.getElementById('billCheckElapsedTimer');
      if (fillEl) fillEl.style.width = '4%';
      if (trackEl) trackEl.setAttribute('aria-valuenow', '4');
      if (timerEl) timerEl.textContent = '0s';

      billLoadingStartMs = Date.now();
      billLoadingInterval = setInterval(() => {
        const elapsedMs = Date.now() - billLoadingStartMs;
        const pct = computeEstimatedProgress(elapsedMs);
        const sec = Math.floor(elapsedMs / 1000);
        if (fillEl) fillEl.style.width = `${pct.toFixed(1)}%`;
        if (trackEl) trackEl.setAttribute('aria-valuenow', String(Math.round(pct)));
        if (timerEl) timerEl.textContent = `${sec}s`;
      }, 200);
    }
  } else {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
      <svg class="btn-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span id="btnSubmitText">Check ${state.selectedCompany.toUpperCase()} Bill</span>
      <span class="btn-arrow">&rarr;</span>
    `;

    const wrap = document.getElementById('billCheckProgressWrap');
    if (wrap) {
      wrap.classList.add('is-completing');
      const fillEl = document.getElementById('billCheckProgressFill');
      const trackEl = document.getElementById('billCheckProgressTrack');
      if (fillEl) fillEl.style.width = '100%';
      if (trackEl) trackEl.setAttribute('aria-valuenow', '100');
      billLoadingHideTimeout = setTimeout(() => {
        const currentWrap = document.getElementById('billCheckProgressWrap');
        if (currentWrap) currentWrap.remove();
        billLoadingHideTimeout = null;
      }, 220);
    }
  }
}

// Alerts
function showAlert(htmlMsg, type = 'warning') {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert-box ${type}">
      <span style="font-size: 18px; flex-shrink: 0;">${type === 'danger' ? '⚠️' : 'ℹ️'}</span>
      <div style="flex: 1;">${htmlMsg}</div>
      <button type="button" class="btn-close-alert" onclick="clearAlert()">&times;</button>
    </div>
  `;
}

function clearAlert() {
  if (alertContainer) alertContainer.innerHTML = '';
}

// Render Bill Details Result Voucher in Original PITC Bill Document Layout
// Resize handler for embedded original PITC duplicate bill document iframe
function resizeOriginalBillIframe(iframe) {
  try {
    if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.body) {
      const h = iframe.contentWindow.document.body.scrollHeight;
      if (h > 400) {
        iframe.style.height = (h + 40) + 'px';
      }
    }
  } catch (e) {
    iframe.style.height = '1350px';
  }
}

// Main Bill Result: Shows the ORIGINAL PITC duplicate bill document itself
async function renderBillResult(res) {
  const ref = res.refNo || state.currentBill?.refNo;
  const comp = (res.company || state.selectedCompany || 'lesco').toLowerCase();
  const isPaid = res.data?.paymentStatus?.isPaid ? 'true' : 'false';
  const duplicateBillUrl = `/api/original-bill?refNo=${encodeURIComponent(ref)}&company=${encodeURIComponent(comp)}&forcePaid=${isPaid}`;

  resultsArea.innerHTML = `
    <div class="original-bill-loading" id="originalBillLoading">
      <div style="width: 28px; height: 28px; border: 3px solid var(--border-light); border-top-color: var(--blue-primary); border-radius: 50%; animation: spin 0.7s linear infinite;"></div>
      <div style="font-size: 14px; font-weight: 600; color: var(--text-main);">Loading original PITC duplicate bill document...</div>
    </div>
  `;

  try {
    // Fetch duplicate bill document using the site's own duplicate-bill route
    const docRes = await fetch(duplicateBillUrl, { method: 'GET' });
    if (!docRes.ok) {
      throw new Error(`Original bill endpoint returned status ${docRes.status}`);
    }

    // Display the original PITC duplicate bill document
    resultsArea.innerHTML = `
      <div class="original-bill-result-wrap" id="originalBillResultWrap">
        <div class="original-bill-top-controls">
          <div class="original-bill-header-info">
            <span class="badge-status ${isPaid === 'true' ? 'paid' : 'unpaid'}">
              ${isPaid === 'true' ? 'PAID' : 'UNPAID'}
            </span>
            <span class="original-bill-heading">Original Electricity Consumer Bill</span>
          </div>
          <div class="bill-actions-bar">
            <button type="button" class="btn-bill-action original-print" onclick="printOriginalBill()">
              <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Original Bill (اصل بل کا پرنٹ)
            </button>
            <button type="button" class="btn-bill-action view-original" onclick="viewOriginalBill()">
              <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              View Duplicate Bill in New Tab (مکمل بل)
            </button>
            <button type="button" class="btn-bill-action whatsapp" onclick="shareWhatsApp()">
              <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Share on WhatsApp
            </button>
          </div>
        </div>

        <div class="original-bill-frame-wrapper">
          <iframe id="pitcDuplicateBillFrame" src="${duplicateBillUrl}" title="Original PITC Duplicate Bill Document" class="original-pitc-bill-frame" onload="resizeOriginalBillIframe(this)"></iframe>
        </div>
      </div>
    `;
  } catch (err) {
    console.warn('Original duplicate bill document fetch failed, using fallback display:', err);
    renderFallbackHtmlBill(res, 'Original duplicate bill document could not be loaded. Displaying bill details below.');
  }
}

// Fallback HTML Bill Display (shown if original duplicate bill document cannot be loaded)
function renderFallbackHtmlBill(res, note) {
  const data = res.data || {};
  const consumer = data.consumerDetails || {};
  const bill = data.billDetails || {};
  const charges = data.charges || {};
  const history = data.history || [];
  const payment = data.paymentStatus || {};
  const isPaid = Boolean(payment.isPaid);

  const companyCode = (res.company || state.selectedCompany || 'lesco').toLowerCase();
  const discoObj = DISCOS.find(d => d.code === companyCode) || {
    code: companyCode,
    name: companyCode.toUpperCase(),
    fullName: res.companyName || (companyCode.toUpperCase() + ' Electric Power Company')
  };
  const discoShort = discoObj.name;
  const discoFull = res.companyName || discoObj.fullName;
  const logoSrc = `/assets/${companyCode}_logo_exact.png`;

  const formatRs = (val) => {
    if (!val && val !== 0) return '';
    const num = Number(String(val).replace(/,/g, ''));
    return isNaN(num) ? `Rs. ${val}` : `Rs. ${num.toLocaleString()}`;
  };

  const fallbackNoteHtml = note ? `
    <div class="original-bill-fallback-note">
      <svg style="width: 18px; height: 18px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <span><strong>Notice:</strong> ${note}</span>
    </div>
  ` : '';

  // Top Bar: reads "Duplicate Electricity Bill" with badge reading only "UNPAID" (or "PAID")
  const statusBannerHtml = `
    <div class="payment-status-banner ${isPaid ? 'paid' : 'unpaid'}" id="paymentStatusBanner">
      <div class="status-banner-badge">
        ${isPaid ? 'PAID' : 'UNPAID'}
      </div>
      <div class="status-banner-content">
        <div class="status-banner-title">Duplicate Electricity Bill</div>
      </div>
    </div>
  `;

  // 12-Month History table
  let historyTableHtml = '';
  if (history && history.length > 0) {
    const group1 = history.slice(0, 6);
    const group2 = history.slice(6, 12);
    const maxRows = Math.max(group1.length, group2.length, 6);

    const renderCellVal = (val) => {
      if (val === undefined || val === null || val === '') return '';
      return String(val);
    };

    const renderNumVal = (val) => {
      if (val === undefined || val === null || val === '' || val === 0 || val === '0') return '';
      const num = Number(String(val).replace(/,/g, ''));
      return isNaN(num) ? String(val) : num.toLocaleString();
    };

    let rowsHtml = '';
    for (let i = 0; i < maxRows; i++) {
      const h1 = group1[i];
      const h2 = group2[i];

      rowsHtml += `
        <tr>
          <td class="col-month">${h1 ? renderCellVal(h1.month) : ''}</td>
          <td class="col-status">${h1 ? renderCellVal(h1.status) : ''}</td>
          <td class="col-units">${h1 ? renderNumVal(h1.units) : ''}</td>
          <td class="col-bill">${h1 ? renderNumVal(h1.billAmount) : ''}</td>
          <td class="col-payment">${h1 ? renderNumVal(h1.paymentAmount) : ''}</td>

          <td class="col-month col-divider-left">${h2 ? renderCellVal(h2.month) : ''}</td>
          <td class="col-status">${h2 ? renderCellVal(h2.status) : ''}</td>
          <td class="col-units">${h2 ? renderNumVal(h2.units) : ''}</td>
          <td class="col-bill">${h2 ? renderNumVal(h2.billAmount) : ''}</td>
          <td class="col-payment">${h2 ? renderNumVal(h2.paymentAmount) : ''}</td>
        </tr>
      `;
    }

    const deferredRaw = data.charges?.deferredAmount || data.billDetails?.deferredAmount || data.deferredAmount || '';
    const deferredVal = deferredRaw ? (isNaN(Number(String(deferredRaw).replace(/,/g, ''))) ? deferredRaw : Number(String(deferredRaw).replace(/,/g, '')).toLocaleString()) : '';

    const outstandingRaw = data.charges?.outstandingBalance || data.charges?.arrears || data.outstandingBalance || '';
    const outstandingVal = outstandingRaw ? (isNaN(Number(String(outstandingRaw).replace(/,/g, ''))) ? outstandingRaw : Number(String(outstandingRaw).replace(/,/g, '')).toLocaleString()) : '';

    historyTableHtml = `
      <div class="bill-history-table-container">
        <table class="bill-history-dual-table">
          <thead>
            <tr>
              <th class="col-month">MONTH</th>
              <th class="col-status">STATUS</th>
              <th class="col-units">UNITS</th>
              <th class="col-bill">BILL (RS.)</th>
              <th class="col-payment">PAYMENT (RS.)</th>

              <th class="col-month col-divider-left">MONTH</th>
              <th class="col-status">STATUS</th>
              <th class="col-units">UNITS</th>
              <th class="col-bill">BILL (RS.)</th>
              <th class="col-payment">PAYMENT (RS.)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <div class="bill-history-summary-lines">
        <div class="history-summary-line">
          <span class="history-summary-lbl">Deferred Amount:</span>
          <span class="history-summary-val">${deferredVal}</span>
        </div>
        <div class="history-summary-line">
          <span class="history-summary-lbl">Outstanding Balance:</span>
          <span class="history-summary-val">${outstandingVal}</span>
        </div>
      </div>
    `;
  } else {
    historyTableHtml = `
      <div class="history-empty-note">
        12-Month electricity consumption history is not available in PITC record for this connection.
      </div>
    `;
  }

  // Barcode / QR Code Area for Bank Copy
  let barcodeHtml = '';
  if (bill.barcodeText || bill.barcode || data.barcode || data.barcodeText) {
    const codeVal = bill.barcodeText || bill.barcode || data.barcode || data.barcodeText;
    barcodeHtml = `
      <div class="bank-barcode-box">
        <div class="barcode-label">PITC BILL BARCODE / IDENTIFIER</div>
        <div class="barcode-display-val">${codeVal}</div>
      </div>
    `;
  } else if (bill.barcodeImg || data.barcodeImg || data.qrCodeImg) {
    const imgSrc = bill.barcodeImg || data.barcodeImg || data.qrCodeImg;
    barcodeHtml = `
      <div class="bank-barcode-box">
        <img src="${imgSrc}" alt="Bill Barcode" class="bank-barcode-img">
      </div>
    `;
  }

  resultsArea.innerHTML = `
    ${fallbackNoteHtml}
    ${statusBannerHtml}

    <div class="bill-card-wrapper" id="printableBillArea">
      
      ${isPaid ? `
        <div class="voucher-paid-stamp" id="voucherPaidStamp">
          <span>PAID</span>
          <small>ONLINE VERIFIED</small>
        </div>
      ` : ''}

      <!-- 1. HEADER -->
      <div class="bill-doc-header-wrap">
        <div class="bill-doc-header-top">
          <div class="bill-doc-disco-left">
            <div class="bill-doc-logo-wrap">
              <img src="${logoSrc}" alt="${discoShort} Logo" class="bill-doc-logo-img">
            </div>
            <div class="bill-doc-disco-info">
              <h2 class="bill-doc-disco-name">${discoFull.toUpperCase()}</h2>
              <div class="bill-doc-slogan">YOUR BETTER SERVICE – OUR PRIDE</div>
              <div class="bill-doc-main-title">ELECTRICITY CONSUMER BILL</div>
            </div>
          </div>
          <div class="bill-doc-header-right">
            <span class="badge-status ${isPaid ? 'paid' : 'unpaid'}" id="billStatusBadge">
              ${isPaid ? 'PAID' : 'UNPAID'}
            </span>
            <div class="bill-doc-ref-pill" onclick="copyToClipboard('${res.refNo}', 'Reference Number copied!')" title="Click to copy Reference Number">
              REF: <strong>${res.refNo}</strong> 📋
            </div>
          </div>
        </div>

        <div class="bill-doc-top-summary-grid">
          <div class="summary-box">
            <div class="s-label">BILL MONTH</div>
            <div class="s-val month-val">${bill.billMonth || ''}</div>
          </div>
          <div class="summary-box">
            <div class="s-label">DUE DATE</div>
            <div class="s-val due-val">${bill.dueDate || ''}</div>
          </div>
          <div class="summary-box ${isPaid ? 's-paid' : 's-within'}">
            <div class="s-label">${isPaid ? 'AMOUNT PAID' : 'PAYABLE WITHIN DUE DATE'}</div>
            <div class="s-val within-val">${charges.payableWithinDueDate || charges.totalAmount ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : ''}</div>
          </div>
          <div class="summary-box s-after">
            <div class="s-label">PAYABLE AFTER DUE DATE</div>
            <div class="s-val after-val">${isPaid ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : (charges.amountAfterDueDate ? formatRs(charges.amountAfterDueDate) : '')}</div>
          </div>
        </div>
      </div>

      <!-- 2. CONSUMER DETAIL -->
      <div class="bill-doc-section">
        <div class="bill-doc-sec-title">
          <span>CONSUMER DETAIL</span>
        </div>
        <div class="bill-doc-grid-2col">
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Consumer Name:</th><td><strong>${consumer.name || consumer.nameAndAddress || ''}</strong></td></tr>
              <tr><th>Address:</th><td>${consumer.address || consumer.nameAndAddress || ''}</td></tr>
              <tr><th>Feeder:</th><td>${consumer.feeder || ''}</td></tr>
              <tr><th>Sub Division:</th><td>${consumer.subDivision || ''}</td></tr>
              <tr><th>Reference Number:</th><td><strong class="highlight-mono">${res.refNo}</strong></td></tr>
            </tbody>
          </table>
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Consumer ID:</th><td><strong class="highlight-mono">${consumer.customerId || ''}</strong></td></tr>
              <tr><th>Connection Category:</th><td>${consumer.category || ''}</td></tr>
              <tr><th>Tariff:</th><td>${bill.tariff || consumer.tariffCategory || ''}</td></tr>
              <tr><th>Sanctioned Load:</th><td>${consumer.sanctionedLoad ? consumer.sanctionedLoad + (String(consumer.sanctionedLoad).toLowerCase().includes('kw') ? '' : ' kW') : ''}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. METER INFO -->
      <div class="bill-doc-section">
        <div class="bill-doc-sec-title">
          <span>METER INFO</span>
        </div>
        <div class="bill-doc-grid-2col">
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Meter Number:</th><td><strong class="highlight-mono">${bill.meterNo || ''}</strong></td></tr>
              <tr><th>Previous Reading:</th><td class="num">${bill.previousReading || ''}</td></tr>
              <tr><th>Present Reading:</th><td class="num">${bill.presentReading || ''}</td></tr>
              <tr class="highlight-units-row"><th>Units Consumed:</th><td><strong class="units-display">${bill.unitsConsumed ? bill.unitsConsumed + ' kWh' : ''}</strong></td></tr>
            </tbody>
          </table>
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Reading Date:</th><td>${bill.readingDate || ''}</td></tr>
              <tr><th>Issue Date:</th><td>${bill.issueDate || ''}</td></tr>
              ${bill.multiplyingFactor ? `<tr><th>Multiplying Factor (MF):</th><td>${bill.multiplyingFactor}</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. BILL CHARGES BREAKDOWN -->
      <div class="bill-doc-section">
        <div class="bill-doc-sec-title">
          <span>BILL CHARGES BREAKDOWN</span>
        </div>
        <div class="bill-doc-grid-2col">
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Electricity Charges:</th><td class="num">${formatRs(charges.electricityCharges)}</td></tr>
              ${charges.subsidies && charges.subsidies !== '0' ? `<tr><th>Tariff Subsidies:</th><td class="num discount">- ${formatRs(charges.subsidies)}</td></tr>` : ''}
              <tr><th>Net Electricity Charges:</th><td class="num">${formatRs(charges.netElectricityCharges || charges.electricityCharges)}</td></tr>
              <tr><th>Fuel Price Adjustment (FPA):</th><td class="num">${formatRs(charges.fpa)}</td></tr>
              <tr><th>Government Taxes:</th><td class="num">${formatRs(charges.taxes)}</td></tr>
            </tbody>
          </table>
          <table class="bill-doc-table">
            <tbody>
              <tr><th>Current Month Bill:</th><td class="num">${formatRs(charges.currentBill)}</td></tr>
              <tr><th>Arrears / Previous Dues:</th><td class="num ${charges.arrears && charges.arrears !== '0' ? 'arrears-val' : ''}">${formatRs(charges.arrears)}</td></tr>
              ${charges.installment && charges.installment !== '0' ? `<tr><th>Installment:</th><td class="num">${formatRs(charges.installment)}</td></tr>` : ''}
              ${charges.lateSurcharge && charges.lateSurcharge !== '0' ? `<tr><th>Late Payment Surcharge:</th><td class="num">${formatRs(charges.lateSurcharge)}</td></tr>` : ''}
              <tr class="total-row"><th>Grand Total Payable:</th><td class="num total-val">${formatRs(charges.payableWithinDueDate || charges.totalAmount)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. BILL HISTORY -->
      <div class="bill-doc-section">
        <div class="bill-doc-sec-title">
          <span>BILL HISTORY</span>
        </div>
        ${historyTableHtml}
      </div>

      <!-- 6. BANK-USE COPY -->
      <div class="bill-tear-line">
        <span>✂ TEAR HERE &bull; BANK-USE COPY ✂</span>
      </div>

      <div class="bill-bank-copy-block">
        <div class="bank-copy-header">
          <div class="bank-copy-brand">
            <div class="bill-doc-logo-wrap bank-logo-wrap">
              <img src="${logoSrc}" alt="${discoShort} Logo" class="bill-doc-logo-img">
            </div>
            <div>
              <h3 class="bank-copy-company">${discoFull.toUpperCase()}</h3>
              <div class="bank-copy-slogan">YOUR BETTER SERVICE – OUR PRIDE</div>
              <div class="bank-copy-sub">ELECTRICITY CONSUMER BILL — BANK-USE COPY</div>
            </div>
          </div>
          <div class="bank-copy-status">
            <span class="badge-status ${isPaid ? 'paid' : 'unpaid'}">
              ${isPaid ? 'PAID' : 'UNPAID'}
            </span>
          </div>
        </div>

        <div class="bank-copy-body-grid">
          <table class="bill-doc-table bank-table">
            <tbody>
              <tr><th>Consumer ID:</th><td><strong class="highlight-mono">${consumer.customerId || ''}</strong></td></tr>
              <tr><th>Reference Number:</th><td><strong class="highlight-mono">${res.refNo}</strong></td></tr>
              <tr><th>Bill Month:</th><td><strong>${bill.billMonth || ''}</strong></td></tr>
              <tr><th>Units Consumed:</th><td><strong>${bill.unitsConsumed ? bill.unitsConsumed + ' kWh' : ''}</strong></td></tr>
            </tbody>
          </table>
          <table class="bill-doc-table bank-table">
            <tbody>
              <tr><th>Due Date:</th><td><strong class="due-text">${bill.dueDate || ''}</strong></td></tr>
              <tr><th>Payable Within Due Date:</th><td><strong class="num within-text">${charges.payableWithinDueDate || charges.totalAmount ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : ''}</strong></td></tr>
              <tr><th>Payable After Due Date:</th><td><strong class="num after-text">${isPaid ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : (charges.amountAfterDueDate ? formatRs(charges.amountAfterDueDate) : '')}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div class="bank-copy-footer-row">
          ${barcodeHtml ? `
            <div class="bank-copy-barcode-col">
              ${barcodeHtml}
            </div>
          ` : ''}
          <div class="bank-stamp-box">
            <div class="bank-stamp-title">BANK BRANCH STAMP & SIGNATURE</div>
            ${isPaid ? `
              <div class="stamp-inner paid">
                <div class="stamp-paid-txt">PAID</div>
                <div class="stamp-date-txt">${payment.paymentDate ? 'Cleared on: ' + payment.paymentDate : 'ONLINE VERIFIED'}</div>
              </div>
            ` : `
              <div class="stamp-inner empty">
                <span class="stamp-line">Branch Code & Stamp</span>
                <span class="stamp-line">Cashier Signature</span>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Bottom Action Tools -->
      <div class="bill-actions-bar">
        <button type="button" class="btn-bill-action original-print" onclick="printOriginalBill()">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Original Bill (اصل بل کا پرنٹ)
        </button>
        <button type="button" class="btn-bill-action view-original" onclick="viewOriginalBill()">
          <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View Duplicate Bill in New Tab (مکمل بل)
        </button>
        <button type="button" class="btn-bill-action whatsapp" onclick="shareWhatsApp()">
          <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Share on WhatsApp
        </button>
      </div>

    </div>
  `;
}

// Print Duplicate Bill (Opens 1:1 PITC bill document and triggers print)
function printOriginalBill() {
  if (!state.currentBill) return;
  const ref = state.currentBill.refNo;
  const comp = state.currentBill.company || 'lesco';
  const isPaid = state.currentBill.data?.paymentStatus?.isPaid ? 'true' : 'false';
  const url = `/api/original-bill?refNo=${encodeURIComponent(ref)}&company=${encodeURIComponent(comp)}&autoPrint=true&forcePaid=${isPaid}`;
  window.open(url, '_blank', 'width=950,height=850,menubar=no,toolbar=no');
}

// View Full Bill in New Tab
function viewOriginalBill() {
  if (!state.currentBill) return;
  const ref = state.currentBill.refNo;
  const comp = state.currentBill.company || 'lesco';
  const isPaid = state.currentBill.data?.paymentStatus?.isPaid ? 'true' : 'false';
  const url = `/api/original-bill?refNo=${encodeURIComponent(ref)}&company=${encodeURIComponent(comp)}&forcePaid=${isPaid}`;
  window.open(url, '_blank');
}


// Homepage FAQ Accordion Toggle
function toggleFaqHome(btn) {
  const card = btn.closest('.faq-item-card');
  if (card) {
    card.classList.toggle('open');
  }
}

// WhatsApp Share
function shareWhatsApp() {
  if (!state.currentBill) return;
  const b = state.currentBill;
  const c = b.data?.consumerDetails || {};
  const charges = b.data?.charges || {};
  const bill = b.data?.billDetails || {};
  const isPaid = b.data?.paymentStatus?.isPaid;

  const text = `⚡ *${(b.companyName || b.company || 'ELECTRICITY').toUpperCase()} BILL NOTICE*\n` +
    `👤 Consumer: ${c.name || 'Account'}\n` +
    `🔢 Ref No: ${b.refNo}\n` +
    `📅 Bill Month: ${bill.billMonth || '-'}\n` +
    `📌 Status: ${isPaid ? 'PAID (ادا شدہ) ✓' : 'UNPAID (غیر ادا شدہ) ⚠️'}\n` +
    `💰 Payable Within Due Date: Rs. ${charges.payableWithinDueDate || charges.totalAmount || '-'}\n` +
    `⏰ Due Date: ${bill.dueDate || '-'}\n` +
    `🔴 Payable After Due Date: Rs. ${charges.amountAfterDueDate || '-'}\n` +
    `📊 Units Consumed: ${bill.unitsConsumed || '-'} Units\n\n` +
    `Verified via Bijli Bill Checker: ${window.location.origin}`;

  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

// Copy to Clipboard Toast
function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg));
  } else {
    showToast(successMsg);
  }
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgSpan = document.getElementById('toastMessage');
  if (toast && msgSpan) {
    msgSpan.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

// Global exports for tests and external scripts
if (typeof window !== 'undefined') {
  window.DISCO_CITY_MAP = DISCO_CITY_MAP;
  window.selectCompany = selectCompany;
  window.selectCity = selectCity;
}
