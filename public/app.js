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

// Application State
const state = {
  selectedCompany: localStorage.getItem('bijli_company') || 'lesco',
  selectedCity: localStorage.getItem('bijli_city') || 'Lahore',
  currentBill: null,
  theme: localStorage.getItem('bijli_theme') || 'light'
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

  // 2. Initialize and render city dropdown
  initCityDropdown();

  // 3. Set initial active company & city
  selectCompany(state.selectedCompany, false);

  // 4. Synchronize company select dropdown in search bar
  if (companySelectDropdown) {
    companySelectDropdown.value = state.selectedCompany;
    companySelectDropdown.addEventListener('change', (e) => {
      selectCompany(e.target.value, false);
    });
  }

  // 5. Input formatting (removes invalid chars, allows digits and optional U/R suffix)
  if (refInput) {
    refInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
      if (val.length > 15) val = val.slice(0, 15);
      e.target.value = val;
    });
  }

  // 6. Form submit listener
  if (billForm) {
    billForm.addEventListener('submit', handleBillSubmit);
  }

  // 7. Theme toggle listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
});

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
  state.selectedCompany = code;
  localStorage.setItem('bijli_company', code);

  // 1. Update Company Select Dropdown in Search Bar
  if (companySelectDropdown) {
    companySelectDropdown.value = code;
  }

  // 2. Update Submit Button Text
  if (btnSubmitText) {
    btnSubmitText.textContent = `Check ${code.toUpperCase()} Bill`;
  }

  // 3. Update Popular Providers Pills
  document.querySelectorAll('.provider-pill').forEach(pill => {
    const disco = pill.dataset.disco || pill.textContent.trim().toLowerCase();
    if (disco === code) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // 4. Update 7 DISCO Cards Highlight
  document.querySelectorAll('.disco-card').forEach(card => {
    card.classList.remove('active');
  });
  const activeCard = document.getElementById(`disco-card-${code}`);
  if (activeCard) {
    activeCard.classList.add('active');
  }

  // 5. Update City in Header if not already matched
  const discoObj = DISCOS.find(d => d.code === code);
  if (discoObj) {
    // If current selected city does not belong to this disco, update to default city of this disco
    const currentCityMatch = PAKISTAN_CITIES.find(c => c.city === state.selectedCity && c.disco === code);
    if (!currentCityMatch) {
      state.selectedCity = discoObj.defaultCity;
      localStorage.setItem('bijli_city', discoObj.defaultCity);
      if (selectedCityText) {
        selectedCityText.textContent = discoObj.defaultCity;
      }
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

// Loading Spinner State
function setLoading(isLoading, customText = 'Verifying Bill & Payment Status...') {
  if (!btnSubmit) return;
  if (isLoading) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <div style="width: 14px; height: 14px; border: 2px solid #ffffff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;"></div>
      <span>${customText}</span>
    `;
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

// Render Bill Details Result Voucher
function renderBillResult(res) {
  const data = res.data || {};
  const consumer = data.consumerDetails || {};
  const bill = data.billDetails || {};
  const charges = data.charges || {};
  const history = data.history || [];
  const payment = data.paymentStatus || {};
  const isPaid = Boolean(payment.isPaid);

  const formatRs = (val) => {
    if (!val && val !== 0) return '-';
    const num = Number(String(val).replace(/,/g, ''));
    return isNaN(num) ? `Rs. ${val}` : `Rs. ${num.toLocaleString()}`;
  };

  // 12-Month History Bars
  let chartBarsHtml = '';
  if (history.length > 0) {
    const maxVal = Math.max(...history.map(h => h.units || 100), 100);
    chartBarsHtml = `
      <div class="chart-container-wrap">
        <div class="chart-header-row">
          <div class="chart-title">12-Month Electricity Consumption History (Units)</div>
          <div style="font-size: 11px; color: var(--text-muted);">Blue = Current Month</div>
        </div>
        <div class="chart-bars-row">
          ${history.map((h, i) => {
            const heightPct = Math.max(14, Math.round((h.units / maxVal) * 100));
            const isCurrent = i === 0;
            return `
              <div class="chart-bar-col" title="${h.month}: ${h.units} Units | Rs. ${Number(h.billAmount || 0).toLocaleString()}">
                <div class="bar-units-tag">${h.units}</div>
                <div class="bar-fill ${isCurrent ? 'current' : ''}" style="height: ${heightPct}%;"></div>
                <div class="bar-label">${h.month.split(' ')[0]}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Pre-result Payment Status Verification Banner
  const statusBannerHtml = `
    <div class="payment-status-banner ${isPaid ? 'paid' : 'unpaid'}" id="paymentStatusBanner">
      <div class="status-banner-badge">
        ${isPaid ? '✓ PAID (ادا شدہ)' : '⚠️ UNPAID (غیر ادا شدہ)'}
      </div>
      <div class="status-banner-content">
        <div class="status-banner-title">
          ${isPaid ? 'Bill Payment Verified ✓ (بل ادا ہو چکا ہے)' : `Payment Due: ${charges.payableWithinDueDate || charges.totalAmount ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : '-'} (بل غیر ادا شدہ ہے)`}
        </div>
        <div class="status-banner-desc">
          ${isPaid 
            ? `Official electricity billing records confirm this bill is <strong>PAID</strong>. ${payment.paymentDate ? `Payment Cleared: <strong>${payment.paymentDate}</strong> &bull; ` : ''}${payment.amountPaid ? `Paid Amount: <strong>Rs. ${Number(payment.amountPaid).toLocaleString()}</strong> &bull; ` : ''}Verified via PITC Live Database Feed.`
            : `Payable within due date: <strong>${charges.payableWithinDueDate || charges.totalAmount ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : '-'}</strong> &bull; Due Date: <strong>${bill.dueDate || 'N/A'}</strong>.<br><span style="display: inline-block; margin-top: 4px; font-size: 11.5px; opacity: 0.9;">⚡ <em>اگر آپ نے حال ہی میں بینک، ایزی پیسہ یا جاز کیش سے بل جمع کرایا ہے تو سنٹرل ریکارڈ میں اپڈیٹ ہونے میں 24 سے 48 گھنٹے لگ سکتے ہیں۔</em></span>`
          }
        </div>
      </div>
    </div>
  `;

  resultsArea.innerHTML = `
    ${statusBannerHtml}

    <div class="bill-card-wrapper" id="printableBillArea">
      
      <!-- Authentic Bank PAID Stamp on Voucher (Shown if bill is paid) -->
      ${isPaid ? `
        <div class="voucher-paid-stamp" id="voucherPaidStamp">
          <span>PAID</span>
          <small>ONLINE VERIFIED &bull; ادا شدہ</small>
        </div>
      ` : ''}

      <!-- Card Header -->
      <div class="bill-card-header">
        <div>
          <div class="bill-disco-pill">
            <span class="disco-dot"></span>
            <span>${(res.companyName || res.company || 'DISCO').toUpperCase()}</span>
          </div>
          <h2 class="bill-consumer-title">${consumer.name || 'Electricity Bill Statement'}</h2>
          <div class="bill-meta-tags">
            <span class="badge-ref" onclick="copyToClipboard('${res.refNo}', 'Reference Number copied!')" title="Click to copy">
              REF: ${res.refNo} 📋
            </span>
            ${bill.billMonth ? `<span class="badge-month">${bill.billMonth}</span>` : ''}
            ${consumer.category ? `<span class="badge-category">${consumer.category}</span>` : ''}
            <span class="badge-status ${isPaid ? 'paid' : 'unpaid'}" id="billStatusBadge">
              ${isPaid ? '✓ PAID (ادا شدہ)' : '⚠️ UNPAID / DUE (غیر ادا شدہ)'}
            </span>
          </div>
          <div class="bill-address-text">${consumer.address || ''}</div>
        </div>

        <div class="bill-header-right">
          <div class="consumer-id-box">
            <span class="id-label">Consumer ID</span>
            <span class="id-number">${consumer.customerId || '-'}</span>
          </div>
          <div style="font-size: 11.5px; color: ${isPaid ? '#059669' : '#0066ff'}; font-weight: 700; margin-top: 4px;">
            ${isPaid ? '✓ Official Bank Stamped Paid' : '⚡ Official PITC Live Record'}
          </div>
        </div>
      </div>

      <!-- 3 Key Metric KPI Blocks -->
      <div class="bill-kpi-grid">
        <div class="kpi-box due-within">
          <div class="kpi-top">
            <span class="kpi-title">${isPaid ? 'Amount Paid' : 'Payable Within Due Date'}</span>
          </div>
          <div class="kpi-val" style="${isPaid ? 'color: #059669;' : ''}">${charges.payableWithinDueDate || charges.totalAmount ? formatRs(charges.payableWithinDueDate || charges.totalAmount) : '-'}</div>
          <div class="kpi-footer">
            <span>${isPaid ? 'Status:' : 'Due Date:'}</span>
            <strong class="highlight-date" style="${isPaid ? 'color: #059669;' : ''}">${isPaid ? 'PAID ✓ (ادا شدہ)' : (bill.dueDate || 'N/A')}</strong>
          </div>
        </div>

        <div class="kpi-box due-after">
          <div class="kpi-top">
            <span class="kpi-title">${isPaid ? 'Late Surcharge' : 'Payable After Due Date'}</span>
          </div>
          <div class="kpi-val">${isPaid ? 'Rs. 0' : (charges.amountAfterDueDate ? formatRs(charges.amountAfterDueDate) : '-')}</div>
          <div class="kpi-footer">
            <span>${isPaid ? 'Penalty Waived:' : 'Late Surcharge:'}</span>
            <strong>${isPaid ? 'Cleared ✓' : '+ ' + (charges.lateSurcharge ? formatRs(charges.lateSurcharge) : 'Rs. 0')}</strong>
          </div>
        </div>

        <div class="kpi-box">
          <div class="kpi-top">
            <span class="kpi-title">Units Consumed</span>
          </div>
          <div class="kpi-val">${bill.unitsConsumed || '0'} <span style="font-size: 16px; font-weight: 600; color: var(--text-muted);">kWh</span></div>
          <div class="kpi-footer">
            <span>Meter: <strong>${bill.meterNo || 'Standard'}</strong></span>
            <span>Tariff: <strong>${bill.tariff || 'A-1A'}</strong></span>
          </div>
        </div>
      </div>

      <!-- Details Split Table -->
      <div class="bill-details-grid">
        <div class="details-pane">
          <div class="pane-header">
            <h4>Billing & Meter Details</h4>
          </div>
          <table class="detail-table">
            <tbody>
              <tr><td>Consumer Name:</td><td>${consumer.name || '-'}</td></tr>
              <tr><td>Connection Category:</td><td>${consumer.category || 'Domestic'}</td></tr>
              <tr><td>Tariff Code:</td><td>${bill.tariff || '-'}</td></tr>
              <tr><td>Sanctioned Load:</td><td>${consumer.sanctionedLoad ? consumer.sanctionedLoad + ' kW' : '-'}</td></tr>
              <tr><td>Feeder / Sub-Division:</td><td>${consumer.subDivision || consumer.feeder || '-'}</td></tr>
              <tr><td>Previous Reading:</td><td>${bill.previousReading || '-'}</td></tr>
              <tr><td>Present Reading:</td><td>${bill.presentReading || '-'}</td></tr>
              <tr><td>Issue / Reading Date:</td><td>${bill.issueDate || '-'} / ${bill.readingDate || '-'}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="details-pane">
          <div class="pane-header">
            <h4>Charges & Taxes Breakdown</h4>
          </div>
          <table class="detail-table">
            <tbody>
              <tr><td>Electricity Charges:</td><td>${formatRs(charges.electricityCharges)}</td></tr>
              <tr><td>Tariff Subsidies:</td><td style="color: #059669;">${charges.subsidies ? '- ' + formatRs(charges.subsidies) : 'Rs. 0'}</td></tr>
              <tr><td>Net Electricity Charges:</td><td>${formatRs(charges.netElectricityCharges)}</td></tr>
              <tr><td>Fuel Price Adjustment (FPA):</td><td>${formatRs(charges.fpa)}</td></tr>
              <tr><td>Government Taxes:</td><td>${formatRs(charges.taxes)}</td></tr>
              <tr><td>Current Month Bill:</td><td>${formatRs(charges.currentBill)}</td></tr>
              <tr><td>Arrears / Previous Dues:</td><td>${formatRs(charges.arrears || '0')}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Historical Consumption Bar Chart -->
      ${chartBarsHtml}

      <!-- Bottom Action Tools -->
      <div class="bill-actions-bar">
        <!-- 1. Print Original Official Bill (Opens official 1:1 bill layout) -->
        <button type="button" class="btn-bill-action original-print" onclick="printOriginalBill()">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print Original Bill (اصل بل کا پرنٹ)
        </button>

        <!-- 2. View Official Full Bill in New Tab -->
        <button type="button" class="btn-bill-action view-original" onclick="viewOriginalBill()">
          <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View Official Bill (مکمل اصل بل)
        </button>

        <!-- 3. WhatsApp Share -->
        <button type="button" class="btn-bill-action whatsapp" onclick="shareWhatsApp()">
          <svg style="width: 15px; height: 15px;" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Share on WhatsApp
        </button>
      </div>

    </div>
  `;
}

// Print Original Official Bill (Opens official 1:1 PITC bill document and triggers print)
function printOriginalBill() {
  if (!state.currentBill) return;
  const ref = state.currentBill.refNo;
  const comp = state.currentBill.company || 'lesco';
  const isPaid = state.currentBill.data?.paymentStatus?.isPaid ? 'true' : 'false';
  const url = `/api/original-bill?refNo=${encodeURIComponent(ref)}&company=${encodeURIComponent(comp)}&autoPrint=true&forcePaid=${isPaid}`;
  window.open(url, '_blank', 'width=950,height=850,menubar=no,toolbar=no');
}

// View Official Full Bill in New Tab
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
