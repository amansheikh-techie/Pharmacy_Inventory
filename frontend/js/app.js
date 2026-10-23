/**
 * PharmaCare Clinical Inventory & Prescription Management System
 * Phase 2B: Full Frontend Interactivity with In-Memory Mock Store
 * (All interactions are functional without requiring backend/MySQL in this phase)
 */

// =====================================================================
// 1. Initial In-Memory Clinical Mock Database
// =====================================================================

const INITIAL_MOCK_DATA = {
  categories: [
    { id: 1, name: "Antibiotics", description: "Bacterial infection treatments" },
    { id: 2, name: "Pain Relief & Analgesics", description: "Pain and fever reducers" },
    { id: 3, name: "Antihistamines", description: "Allergy and cold relief" },
    { id: 4, name: "Cardiovascular", description: "Blood pressure and heart care" },
    { id: 5, name: "Gastrointestinal", description: "Antacids and ulcer relief" },
    { id: 6, name: "Vitamins & Supplements", description: "Nutritional health" }
  ],

  medicines: [
    { id: 101, name: "Paracetamol 500mg", generic: "Acetaminophen", categoryId: 2, form: "Tablet", dosage: "500mg" },
    { id: 102, name: "Amoxicillin 250mg", generic: "Amoxicillin Trihydrate", categoryId: 1, form: "Capsule", dosage: "250mg" },
    { id: 103, name: "Cetirizine 10mg", generic: "Cetirizine HCl", categoryId: 3, form: "Tablet", dosage: "10mg" },
    { id: 104, name: "Amlodipine 5mg", generic: "Amlodipine Besylate", categoryId: 4, form: "Tablet", dosage: "5mg" },
    { id: 105, name: "Ibuprofen 400mg", generic: "Ibuprofen", categoryId: 2, form: "Tablet", dosage: "400mg" },
    { id: 106, name: "Azithromycin 500mg", generic: "Azithromycin", categoryId: 1, form: "Tablet", dosage: "500mg" },
    { id: 107, name: "Omeprazole 20mg", generic: "Omeprazole", categoryId: 5, form: "Capsule", dosage: "20mg" },
    { id: 108, name: "Vitamin C 500mg Chewable", generic: "Ascorbic Acid", categoryId: 6, form: "Chewable", dosage: "500mg" }
  ],

  batches: [
    { id: 501, medicineId: 101, batchNumber: "BATCH-PCM-24A", expiryDate: "2027-08-30", purchasePrice: 1.80, sellingPrice: 3.00, stock: 180, reorderLevel: 25 },
    { id: 502, medicineId: 102, batchNumber: "BATCH-AMX-88B", expiryDate: "2026-11-15", purchasePrice: 5.50, sellingPrice: 8.50, stock: 75, reorderLevel: 20 },
    { id: 503, medicineId: 103, batchNumber: "BATCH-CTZ-10C", expiryDate: "2028-02-10", purchasePrice: 2.20, sellingPrice: 4.00, stock: 120, reorderLevel: 20 },
    { id: 504, medicineId: 104, batchNumber: "BATCH-AML-44D", expiryDate: "2027-04-18", purchasePrice: 4.00, sellingPrice: 6.50, stock: 55, reorderLevel: 15 },
    { id: 505, medicineId: 105, batchNumber: "BATCH-IBU-33E", expiryDate: "2027-03-25", purchasePrice: 3.00, sellingPrice: 5.00, stock: 14, reorderLevel: 25 }, // Low stock (14 < 25)
    { id: 506, medicineId: 106, batchNumber: "BATCH-AZI-67F", expiryDate: "2026-10-05", purchasePrice: 12.00, sellingPrice: 18.00, stock: 6, reorderLevel: 15 }, // Expired + Critical!
    { id: 507, medicineId: 107, batchNumber: "BATCH-OMP-40G", expiryDate: "2026-11-20", purchasePrice: 5.00, sellingPrice: 9.00, stock: 40, reorderLevel: 15 }, // Expiring soon (<30 days)
    { id: 508, medicineId: 108, batchNumber: "BATCH-VTC-90H", expiryDate: "2027-12-31", purchasePrice: 1.50, sellingPrice: 3.50, stock: 240, reorderLevel: 30 }
  ],

  patients: [
    { id: 201, name: "Rahul Mehta", phone: "+91 98700 11223", age: 28, gender: "Male", history: "Seasonal Rhinitis" },
    { id: 202, name: "Sneha Rao", phone: "+91 98900 44556", age: 34, gender: "Female", history: "Mild Gastritis" },
    { id: 203, name: "Vikram Joshi", phone: "+91 97655 33221", age: 62, gender: "Male", history: "Essential Hypertension" },
    { id: 204, name: "Ananya Sharma", phone: "+91 98112 34567", age: 45, gender: "Female", history: "Bronchial Sensitivity" }
  ],

  doctors: [
    { id: 301, name: "Dr. Arvind Nair, MD", specialization: "General Medicine", license: "MCI-2015-88941", phone: "+91 98200 98200" },
    { id: 302, name: "Dr. Kavita Kulkarni, DM", specialization: "Cardiology", license: "MCI-2012-44120", phone: "+91 98300 98300" },
    { id: 303, name: "Dr. Rohan Deshmukh, MD", specialization: "Pulmonology", license: "MCI-2018-77211", phone: "+91 98400 98400" }
  ],

  prescriptions: [
    {
      id: 401,
      rxNumber: "RX-2026-9021",
      patientId: 201,
      doctorId: 301,
      date: "2026-10-18",
      diagnosis: "Acute Pharyngitis & Mild Fever",
      status: "Fulfilled",
      items: [
        { medicineId: 101, dosage: "500 mg", frequency: "Thrice daily after food", duration: "3 days", qty: 9 },
        { medicineId: 103, dosage: "10 mg", frequency: "Once daily at bedtime", duration: "5 days", qty: 5 }
      ]
    },
    {
      id: 402,
      rxNumber: "RX-2026-9022",
      patientId: 203,
      doctorId: 302,
      date: "2026-10-20",
      diagnosis: "Primary Hypertension Maintenance",
      status: "Active",
      items: [
        { medicineId: 104, dosage: "5 mg", frequency: "Once daily morning", duration: "30 days", qty: 30 }
      ]
    },
    {
      id: 403,
      rxNumber: "RX-2026-9023",
      patientId: 204,
      doctorId: 303,
      date: "2026-10-21",
      diagnosis: "Post-Viral Bronchospasm",
      status: "Active",
      items: [
        { medicineId: 106, dosage: "500 mg", frequency: "Once daily with food", duration: "3 days", qty: 3 }
      ]
    }
  ],

  sales: [
    {
      id: 601,
      invoiceNumber: "INV-2026-1048",
      date: "2026-10-18 11:30",
      patientId: 201,
      doctorId: 301,
      prescriptionId: 401,
      paymentMethod: "UPI",
      totalAmount: 47.00,
      items: [
        { batchId: 501, medicineName: "Paracetamol 500mg", qty: 9, unitPrice: 3.00, subtotal: 27.00 },
        { batchId: 503, medicineName: "Cetirizine 10mg", qty: 5, unitPrice: 4.00, subtotal: 20.00 }
      ]
    },
    {
      id: 602,
      invoiceNumber: "INV-2026-1049",
      date: "2026-10-20 16:45",
      patientId: 202,
      doctorId: null,
      prescriptionId: null,
      paymentMethod: "Cash",
      totalAmount: 17.50,
      items: [
        { batchId: 508, medicineName: "Vitamin C 500mg Chewable", qty: 5, unitPrice: 3.50, subtotal: 17.50 }
      ]
    }
  ]
};

// Active Working Copy (Deep cloned from initial data)
let MockDB = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));

// =====================================================================
// 2. Clinical Calculation Utilities
// =====================================================================

// Returns days until batch expiry
function getDaysUntil(dateString) {
  const today = new Date("2026-10-21"); // Current system reference date
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Determines batch clinical quality status
function getBatchStatus(batch) {
  const days = getDaysUntil(batch.expiryDate);
  if (days < 0) return { label: "EXPIRED", type: "expired", days };
  if (days <= 30) return { label: `Expiring Soon (${days}d)`, type: "warning", days };
  if (batch.stock <= batch.reorderLevel) return { label: "Low Stock", type: "low-stock", days };
  return { label: "Valid", type: "in-stock", days };
}

// Aggregates total stock units across all batches of a medicine
function getMedicineTotalStock(medicineId) {
  return MockDB.batches
    .filter(b => b.medicineId === medicineId)
    .reduce((sum, b) => sum + b.stock, 0);
}

// =====================================================================
// 3. Application Lifecycle & Event Binding
// =====================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initSearchAndFilters();
  initModalsAndForms();
  refreshAllViews();
  fetchLiveCategories(); // Phase 3D: Fetch real categories from MySQL
  fetchLiveMedicines(); // Phase 3C: Fetch real medicines from MySQL
  fetchLiveBatches(); // Phase 3D: Fetch real inventory batches from MySQL
  fetchLiveReports(); // Phase 4B: Fetch stored procedure reports from MySQL
  fetchLiveSales(); // Phase 4C: Fetch real sales ledger from MySQL
  fetchLivePatients(); // Phase 4C: Fetch real patients from MySQL
  fetchLiveDoctors(); // Phase 4D: Fetch real doctors from MySQL
  fetchLivePrescriptions(); // Phase 4D: Fetch real prescriptions from MySQL
});

// Sidebar Navigation
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = item.getAttribute("data-view");
      if (!targetView) return;

      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      document.querySelectorAll(".view-section").forEach(sec => {
        sec.classList.remove("active");
      });

      const activeSec = document.getElementById(`view-${targetView}`);
      if (activeSec) activeSec.classList.add("active");

      // Phase 3C, 3D, 4B, 4C & 4D: Refresh live records when navigating tabs
      if (targetView === "medicines") {
        fetchLiveMedicines();
      } else if (targetView === "batches") {
        fetchLiveBatches();
      } else if (targetView === "reports") {
        fetchLiveReports();
      } else if (targetView === "sales") {
        fetchLiveSales();
        fetchLivePatients();
      } else if (targetView === "prescriptions") {
        fetchLivePrescriptions();
        fetchLivePatients();
        fetchLiveDoctors();
      } else if (targetView === "patients") {
        fetchLivePatients();
      } else if (targetView === "doctors") {
        fetchLiveDoctors();
      }
    });
  });

  // Global header search input
  const globalSearch = document.getElementById("global-search-input");
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      // If user is on dashboard or medicines, filter medicines
      const medSearchInput = document.getElementById("medicine-search-input");
      if (medSearchInput) {
        medSearchInput.value = q;
        renderMedicinesTable();
      }
      const batchSearchInput = document.getElementById("batch-search-input");
      if (batchSearchInput) {
        batchSearchInput.value = q;
        renderBatchesTable();
      }
    });
  }

  // Reset sample data button
  const resetBtn = document.getElementById("btn-reset-demo-data");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all temporary frontend data back to original state?")) {
        MockDB = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
        refreshAllViews();
        showToast("Sample data reset to default clinical values.", "info");
      }
    });
  }
}

// Search and Filter Listeners
function initSearchAndFilters() {
  // Medicines view search & category filter
  const medSearch = document.getElementById("medicine-search-input");
  const medCat = document.getElementById("medicine-category-filter");
  const medClear = document.getElementById("btn-clear-medicine-filters");

  if (medSearch) medSearch.addEventListener("input", () => renderMedicinesTable());
  if (medCat) medCat.addEventListener("change", () => renderMedicinesTable());
  if (medClear) {
    medClear.addEventListener("click", () => {
      if (medSearch) medSearch.value = "";
      if (medCat) medCat.value = "";
      renderMedicinesTable();
    });
  }

  // Batches view search & status filter
  const batchSearch = document.getElementById("batch-search-input");
  const batchStatus = document.getElementById("batch-status-filter");
  const batchClear = document.getElementById("btn-clear-batch-filters");

  if (batchSearch) batchSearch.addEventListener("input", () => renderBatchesTable());
  if (batchStatus) batchStatus.addEventListener("change", () => renderBatchesTable());
  if (batchClear) {
    batchClear.addEventListener("click", () => {
      if (batchSearch) batchSearch.value = "";
      if (batchStatus) batchStatus.value = "";
      renderBatchesTable();
    });
  }

  // Prescriptions view search & status filter
  const rxSearch = document.getElementById("rx-search-input");
  const rxStatus = document.getElementById("rx-status-filter");
  const rxClear = document.getElementById("btn-clear-rx-filters");

  if (rxSearch) rxSearch.addEventListener("input", () => renderPrescriptionsView());
  if (rxStatus) rxStatus.addEventListener("change", () => renderPrescriptionsView());
  if (rxClear) {
    rxClear.addEventListener("click", () => {
      if (rxSearch) rxSearch.value = "";
      if (rxStatus) rxStatus.value = "";
      renderPrescriptionsView();
    });
  }

  // Sales view search filter
  const saleSearch = document.getElementById("sale-search-input");
  const saleClear = document.getElementById("btn-clear-sale-filters");

  if (saleSearch) saleSearch.addEventListener("input", () => renderSalesHistoryTable());
  if (saleClear) {
    saleClear.addEventListener("click", () => {
      if (saleSearch) saleSearch.value = "";
      renderSalesHistoryTable();
    });
  }

  // Patients view search filter
  const patientSearch = document.getElementById("patient-search-input");
  const patientClear = document.getElementById("btn-clear-patient-filters");

  if (patientSearch) patientSearch.addEventListener("input", () => renderPatientsTable());
  if (patientClear) {
    patientClear.addEventListener("click", () => {
      if (patientSearch) patientSearch.value = "";
      renderPatientsTable();
    });
  }

  // Doctors view search filter
  const doctorSearch = document.getElementById("doctor-search-input");
  const doctorClear = document.getElementById("btn-clear-doctor-filters");

  if (doctorSearch) doctorSearch.addEventListener("input", () => renderDoctorsTable());
  if (doctorClear) {
    doctorClear.addEventListener("click", () => {
      if (doctorSearch) doctorSearch.value = "";
      renderDoctorsTable();
    });
  }
}

// =====================================================================
// 4. View Rendering & Dynamic Updates
// =====================================================================

function refreshAllViews() {
  renderDashboardStats();
  renderCriticalAlerts();
  renderRecentSales();
  renderLowStockAlertList();
  renderMedicinesTable();
  renderBatchesTable();
  renderPrescriptionsView();
  renderSalesHistoryTable();
  renderPatientsTable();
  renderDoctorsTable();
  renderReportsView();
  populateDropdownOptions();
}

// Dashboard Statistics (Recalculates from active MockDB state and live MySQL)
function renderDashboardStats() {
  const totalMeds = liveMedicines.length > 0 ? liveMedicines.length : MockDB.medicines.length;
  const activeBatches = liveBatches.length > 0 ? liveBatches : MockDB.batches;
  
  const totalStock = activeBatches.reduce((sum, b) => sum + (parseInt(b.stock, 10) || 0), 0);
  const lowStockBatches = activeBatches.filter(b => {
    const stock = parseInt(b.stock, 10) || 0;
    const reorder = parseInt(b.reorderLevel, 10) || 30;
    const days = b.daysToExpiry !== undefined ? b.daysToExpiry : getDaysUntil(b.expiryDate);
    return stock <= reorder && days >= 0;
  });
  const expiringBatches = activeBatches.filter(b => {
    const days = b.daysToExpiry !== undefined ? b.daysToExpiry : getDaysUntil(b.expiryDate);
    return days <= 30;
  });

  const elMeds = document.getElementById("stat-total-medicines");
  const elStock = document.getElementById("stat-total-stock");
  const elLow = document.getElementById("stat-low-stock");
  const elExp = document.getElementById("stat-expiring");

  if (elMeds) elMeds.textContent = totalMeds;
  if (elStock) elStock.textContent = totalStock.toLocaleString();
  if (elLow) elLow.textContent = lowStockBatches.length;
  if (elExp) elExp.textContent = expiringBatches.length;

  // Sidebar badge for critical alerts
  const sidebarAlertBadge = document.getElementById("sidebar-alert-badge");
  if (sidebarAlertBadge) {
    const totalAlerts = lowStockBatches.length + expiringBatches.length;
    sidebarAlertBadge.textContent = totalAlerts;
    sidebarAlertBadge.style.display = totalAlerts > 0 ? "inline-block" : "none";
  }
}

// Dashboard Critical Alerts Table
function renderCriticalAlerts() {
  const container = document.getElementById("dashboard-alerts-tbody");
  if (!container) return;

  const urgentBatches = MockDB.batches.filter(b => {
    const days = getDaysUntil(b.expiryDate);
    return days <= 30 || b.stock <= b.reorderLevel;
  });

  if (urgentBatches.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-table-state"><div class="empty-table-title">No Urgent Warnings</div><div class="empty-table-sub">All medication batches currently have optimal stock and valid expiry.</div></td></tr>`;
    return;
  }

  container.innerHTML = urgentBatches.map(b => {
    const med = MockDB.medicines.find(m => m.id === b.medicineId) || { name: "Unknown" };
    const status = getBatchStatus(b);
    let badgeClass = "badge-in-stock";
    if (status.type === "expired") badgeClass = "badge-expired";
    else if (status.type === "warning") badgeClass = "badge-low-stock";
    else if (status.type === "low-stock") badgeClass = "badge-critical";

    return `
      <tr>
        <td><strong>${med.name}</strong></td>
        <td><span class="font-mono">${b.batchNumber}</span></td>
        <td>${b.stock} units</td>
        <td>${b.expiryDate}</td>
        <td><span class="badge-status ${badgeClass}">${status.label}</span></td>
      </tr>
    `;
  }).join("");
}

// Dashboard Recent Sales Table (Connected to live MySQL liveSales)
function renderRecentSales() {
  const container = document.getElementById("dashboard-sales-tbody");
  if (!container) return;

  const sales = (liveSales.length > 0) ? liveSales : MockDB.sales;

  if (sales.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-table-state"><div class="empty-table-title">No Sales Recorded Yet</div><div class="empty-table-sub">Use 'New Dispense / Sale' to record a transaction.</div></td></tr>`;
    return;
  }

  container.innerHTML = sales.slice(0, 5).map(sale => {
    return `
      <tr>
        <td><span class="font-mono font-bold">${sale.invoiceNumber}</span></td>
        <td>${sale.patientName || 'Walk-in Customer'}</td>
        <td>${sale.itemCount !== undefined ? `${sale.itemCount} item(s)` : `${sale.items?.length || 1} item(s)`}</td>
        <td><strong style="color:var(--primary);">₹${parseFloat(sale.totalAmount).toFixed(2)}</strong></td>
        <td><span class="badge-status badge-in-stock">Billed</span></td>
      </tr>
    `;
  }).join("");
}

// Dashboard Low Stock List with Progress Bars
function renderLowStockAlertList() {
  const container = document.getElementById("dashboard-lowstock-list");
  if (!container) return;

  const lowStock = MockDB.batches.filter(b => b.stock <= b.reorderLevel);

  if (lowStock.length === 0) {
    container.innerHTML = `<div class="empty-table-state"><div class="empty-table-title">Stock Levels Safe</div><div class="empty-table-sub">No medicine batches are currently below their reorder threshold.</div></div>`;
    return;
  }

  container.innerHTML = lowStock.map(b => {
    const med = MockDB.medicines.find(m => m.id === b.medicineId);
    const maxReference = Math.max(b.reorderLevel * 2, 1);
    const pct = Math.min(100, Math.round((b.stock / maxReference) * 100));
    const fillClass = b.stock === 0 ? "fill-danger" : "fill-warning";

    return `
      <div class="alert-item">
        <div class="alert-item-info">
          <div class="alert-item-title">${med ? med.name : 'Unknown Medicine'}</div>
          <div class="alert-item-sub">Batch: <span class="font-mono">${b.batchNumber}</span> | Reorder Level: ${b.reorderLevel} units</div>
          <div class="stock-meter">
            <div class="meter-track">
              <div class="meter-fill ${fillClass}" style="width: ${pct}%"></div>
            </div>
            <div class="meter-caption">
              <span>Stock: <strong>${b.stock}</strong></span>
              <span>${pct}% safe</span>
            </div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="quickRestockBatch(${b.id})">Restock +50</button>
      </div>
    `;
  }).join("");
}

// =====================================================================
// Phase 3C, 3D, 4B, 4C & 4D: Live MySQL State & Fetchers
// =====================================================================
let liveMedicines = [];
let liveCategories = [];
let liveBatches = [];
let liveReports = { lowStock: [], expiry: [] };
let liveSales = [];
let livePatients = [];
let liveDoctors = [];
let livePrescriptions = [];
let isMedicinesLoading = false;
let medicinesApiError = null;
let isBatchesLoading = false;
let batchesApiError = null;
let isReportsLoading = false;
let reportsApiError = null;
let isSalesLoading = false;
let salesApiError = null;
let isPrescriptionsLoading = false;
let prescriptionsApiError = null;
let isPatientsLoading = false;
let patientsApiError = null;
let isDoctorsLoading = false;
let doctorsApiError = null;

async function fetchLivePrescriptions() {
  isPrescriptionsLoading = true;
  prescriptionsApiError = null;
  renderPrescriptionsView();

  try {
    const res = await fetch('/api/prescriptions');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach Prescriptions API`);
    }
    const json = await res.json();
    livePrescriptions = json.data || [];
    isPrescriptionsLoading = false;
    renderPrescriptionsView();
  } catch (err) {
    console.error('Phase 4D Prescriptions API Error:', err);
    isPrescriptionsLoading = false;
    prescriptionsApiError = err.message || 'Network / Database Error';
    livePrescriptions = [];
    renderPrescriptionsView();
  }
}

async function fetchLiveDoctors() {
  isDoctorsLoading = true;
  doctorsApiError = null;
  renderDoctorsTable();

  try {
    const res = await fetch('/api/doctors');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach Doctors API`);
    }
    const json = await res.json();
    liveDoctors = json.data || [];
    isDoctorsLoading = false;
    renderDoctorsTable();
    populateDoctorDropdownOptions();
  } catch (err) {
    console.error('Phase 4E Doctors API Error:', err);
    isDoctorsLoading = false;
    doctorsApiError = err.message || 'Database Connection Error';
    liveDoctors = [];
    renderDoctorsTable();
  }
}

async function fetchLiveSales() {
  isSalesLoading = true;
  salesApiError = null;
  renderSalesHistoryTable();

  try {
    const res = await fetch('/api/sales');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach Sales API`);
    }
    const json = await res.json();
    liveSales = json.data || [];
    isSalesLoading = false;
    renderSalesHistoryTable();
    renderRecentSales();
  } catch (err) {
    console.error('Phase 4C Sales API Error:', err);
    isSalesLoading = false;
    salesApiError = err.message || 'Network / Database Error';
    liveSales = [];
    renderSalesHistoryTable();
    renderRecentSales();
  }
}

async function fetchLivePatients() {
  isPatientsLoading = true;
  patientsApiError = null;
  renderPatientsTable();

  try {
    const res = await fetch('/api/patients');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach Patients API`);
    }
    const json = await res.json();
    livePatients = json.data || [];
    isPatientsLoading = false;
    renderPatientsTable();
    populatePatientDropdownOptions();
  } catch (err) {
    console.error('Phase 4E Patients API Error:', err);
    isPatientsLoading = false;
    patientsApiError = err.message || 'Database Connection Error';
    livePatients = [];
    renderPatientsTable();
  }
}

async function fetchLiveReports() {
  isReportsLoading = true;
  reportsApiError = null;
  renderReportsView();

  try {
    const [lowStockRes, expiryRes] = await Promise.all([
      fetch('/api/reports/low-stock'),
      fetch('/api/reports/expiry')
    ]);

    if (!lowStockRes.ok) throw new Error(`HTTP ${lowStockRes.status}: Failed to reach Low Stock API`);
    if (!expiryRes.ok) throw new Error(`HTTP ${expiryRes.status}: Failed to reach Expiry API`);

    const lowStockJson = await lowStockRes.json();
    const expiryJson = await expiryRes.json();

    liveReports.lowStock = lowStockJson.data || (Array.isArray(lowStockJson) ? lowStockJson : []);
    liveReports.expiry = expiryJson.data || (Array.isArray(expiryJson) ? expiryJson : []);
    isReportsLoading = false;
    renderReportsView();
  } catch (err) {
    console.error('Reports API Error:', err);
    isReportsLoading = false;
    reportsApiError = err.message || 'Database / Stored Procedure Error';
    renderReportsView();
  }
}

async function fetchLiveBatches() {
  isBatchesLoading = true;
  batchesApiError = null;
  renderBatchesTable();

  try {
    const res = await fetch('/api/batches');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach API`);
    }
    const json = await res.json();
    liveBatches = json.data || [];
    isBatchesLoading = false;
    renderBatchesTable();
    populateBatchDropdownOptions();
    renderDashboardStats();
  } catch (err) {
    console.error('Phase 3D Batches API Error:', err);
    isBatchesLoading = false;
    batchesApiError = err.message || 'Network / Database Error';
    renderBatchesTable();
  }
}

function populateBatchDropdownOptions() {
  const batchSelect = document.getElementById("sale-batch-select");
  if (!batchSelect) return;

  const activeBatches = liveBatches.length > 0 ? liveBatches : MockDB.batches;
  const currentVal = batchSelect.value;

  batchSelect.innerHTML = `<option value="">-- Choose Medicine Batch --</option>` +
    activeBatches.map(b => {
      const medName = b.medicineName || (MockDB.medicines.find(m => m.id === b.medicineId)?.name) || 'Unknown';
      const days = b.daysToExpiry !== undefined ? b.daysToExpiry : getDaysUntil(b.expiryDate);
      const isExpired = days < 0;
      const stock = b.stock !== undefined ? parseInt(b.stock, 10) : parseInt(b.quantity, 10);
      const price = parseFloat(b.sellingPrice || b.unitPrice || 0);

      return `<option value="${b.id}" data-price="${price}" data-stock="${stock}" data-med="${medName}" data-batch="${b.batchNumber}" ${isExpired || stock === 0 ? 'disabled' : ''}>
        ${medName} | Batch: ${b.batchNumber} | Stock: ${stock} units | ₹${price.toFixed(2)} ${isExpired ? '(EXPIRED)' : stock === 0 ? '(OUT OF STOCK)' : ''}
      </option>`;
    }).join("");

  if (currentVal) batchSelect.value = currentVal;
  updateSaleModalCalculations();
}

function populatePatientDropdownOptions() {
  const patientSelect = document.getElementById("sale-patient-select");
  const newRxPatientSelect = document.getElementById("new-rx-patient");
  const patients = livePatients.length > 0 ? livePatients : MockDB.patients;

  if (patientSelect) {
    const currentVal = patientSelect.value;
    patientSelect.innerHTML = `<option value="">Walk-in Customer (Over-The-Counter)</option>` +
      patients.map(p => `<option value="${p.id}">${p.name} ${p.phone ? `(${p.phone})` : ''}</option>`).join("");
    if (currentVal) patientSelect.value = currentVal;
  }

  if (newRxPatientSelect) {
    const currentVal = newRxPatientSelect.value;
    newRxPatientSelect.innerHTML = `<option value="">-- Choose Patient --</option>` +
      patients.map(p => `<option value="${p.id}">${p.name} ${p.phone ? `(${p.phone})` : ''}</option>`).join("");
    if (currentVal) newRxPatientSelect.value = currentVal;
  }
}

function populateDoctorDropdownOptions() {
  const rxDocSelect = document.getElementById("new-rx-doctor");
  if (!rxDocSelect) return;

  const currentVal = rxDocSelect.value;
  const docs = liveDoctors.length > 0 ? liveDoctors : MockDB.doctors;

  rxDocSelect.innerHTML = `<option value="">-- Choose Prescribing Doctor --</option>` +
    docs.map(d => `<option value="${d.id}">${d.name} (${d.specialization || 'Physician'})</option>`).join("");

  if (currentVal) rxDocSelect.value = currentVal;
}


async function fetchLiveCategories() {
  try {
    const res = await fetch('/api/medicines/categories');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        liveCategories = json.data;
        populateCategoryDropdowns();
      }
    }
  } catch (err) {
    console.warn('Could not fetch categories from MySQL API:', err.message);
  }
}

function populateCategoryDropdowns() {
  const cats = (liveCategories.length > 0) ? liveCategories : MockDB.categories;

  // 1. Add Medicine Modal Category Select
  const newCatSelect = document.getElementById("new-med-category");
  if (newCatSelect) {
    const currentVal = newCatSelect.value;
    newCatSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    if (currentVal) newCatSelect.value = currentVal;
  }

  // 2. Edit Medicine Modal Category Select
  const editCatSelect = document.getElementById("edit-med-category");
  if (editCatSelect) {
    const currentVal = editCatSelect.value;
    editCatSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    if (currentVal) editCatSelect.value = currentVal;
  }

  // 3. Medicine Filter Dropdown in Medicines View
  const catFilter = document.getElementById("medicine-category-filter");
  if (catFilter) {
    const currentVal = catFilter.value;
    catFilter.innerHTML = `<option value="">All Categories</option>` +
      cats.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    if (currentVal) catFilter.value = currentVal;
  }
}

async function fetchLiveMedicines() {
  isMedicinesLoading = true;
  medicinesApiError = null;
  renderMedicinesTable();

  try {
    const res = await fetch('/api/medicines');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to reach API`);
    }
    const json = await res.json();
    liveMedicines = json.data || [];
    isMedicinesLoading = false;
    renderMedicinesTable();
    populateCategoryDropdowns();
    renderDashboardStats();
  } catch (err) {
    console.error('Phase 3C API Error:', err);
    isMedicinesLoading = false;
    medicinesApiError = err.message || 'Network / Database Error';
    renderMedicinesTable();
  }
}

function populateLiveCategoryFilter() {
  populateCategoryDropdowns();
}

// Medicines Master Table with Live MySQL Integration (Phase 3C)
function renderMedicinesTable() {
  const tbody = document.getElementById("medicines-table-tbody");
  if (!tbody) return;

  const countDisplay = document.getElementById("medicine-count-display");

  // State 1: Loading from MySQL API
  if (isMedicinesLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Querying MySQL Database...</div>
          <div class="empty-table-sub">Fetching real medicine records from <code>pharmacy_db.medicine</code></div>
        </td>
      </tr>
    `;
    return;
  }

  // State 2: Error when API / MySQL fails (Never show fake medicines)
  if (medicinesApiError) {
    if (countDisplay) countDisplay.textContent = "Connection Error";
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Unable to Load Medicines from API</div>
          <div class="empty-table-sub">The database or backend API is unreachable (${medicinesApiError}).</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLiveMedicines()" style="margin-top:14px;">
            🔄 Retry Connection
          </button>
        </td>
      </tr>
    `;
    return;
  }

  // State 3: Filter Live MySQL Records
  const searchInput = document.getElementById("medicine-search-input");
  const categoryFilter = document.getElementById("medicine-category-filter");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedCat = categoryFilter ? categoryFilter.value : "";

  let filtered = liveMedicines.filter(med => {
    const medName = (med.name || "").toLowerCase();
    const manufacturer = (med.manufacturer || "").toLowerCase();
    const matchesSearch = query === "" || medName.includes(query) || manufacturer.includes(query);
    const matchesCat = selectedCat === "" || (med.categoryId && med.categoryId.toString() === selectedCat);
    return matchesSearch && matchesCat;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${liveMedicines.length} live medicines from MySQL`;
  }

  // State 4: Empty search / filter results
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div class="empty-table-title">No matching medicines found</div>
          <div class="empty-table-sub">Try searching with a different keyword or select 'All Categories'.</div>
        </td>
      </tr>
    `;
    return;
  }

  // State 5: Render real MySQL rows
  tbody.innerHTML = filtered.map(med => {
    const totalStock = parseInt(med.totalStock, 10) || 0;
    const batchCount = parseInt(med.batchCount, 10) || 0;
    
    let statusBadge = `<span class="badge-status badge-in-stock">In Stock (${totalStock})</span>`;
    if (totalStock === 0) {
      statusBadge = `<span class="badge-status badge-expired">Out of Stock</span>`;
    } else if (totalStock <= 30) {
      statusBadge = `<span class="badge-status badge-low-stock">Low Stock (${totalStock})</span>`;
    }

    return `
      <tr>
        <td><span class="font-mono">#MED-${med.id}</span></td>
        <td>
          <strong>${med.name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">Mfr: ${med.manufacturer || 'Standard'}</div>
        </td>
        <td><span class="badge-status badge-info">${med.categoryName || 'General'}</span></td>
        <td>Clinical Formulation</td>
        <td><strong>${totalStock} units</strong></td>
        <td>${batchCount} batch(es)</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-outline btn-sm" onclick="openViewMedicineModal(${med.id})" title="View Details">
              View
            </button>
            <button class="btn btn-outline btn-sm" onclick="openEditMedicineModal(${med.id})" title="Edit Medicine Formulation">
              Edit
            </button>
            <button class="btn btn-primary btn-sm" onclick="switchView('batches')" title="View Batches">
              Batches
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Inventory & Batches Table with Live MySQL Integration (Phase 3D)
function renderBatchesTable(filterMedicineId = null) {
  const tbody = document.getElementById("batches-table-tbody");
  if (!tbody) return;

  const countDisplay = document.getElementById("batch-count-display");

  // State 1: Loading from MySQL API
  if (isBatchesLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Querying MySQL Database...</div>
          <div class="empty-table-sub">Fetching real inventory batches from <code>pharmacy_db.medicinebatch</code></div>
        </td>
      </tr>
    `;
    return;
  }

  // State 2: Error when API fails
  if (batchesApiError) {
    if (countDisplay) countDisplay.textContent = "Connection Error";
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Unable to Load Batches from API</div>
          <div class="empty-table-sub">The database or backend API is unreachable (${batchesApiError}).</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLiveBatches()" style="margin-top:14px;">
            🔄 Retry Connection
          </button>
        </td>
      </tr>
    `;
    return;
  }

  const searchInput = document.getElementById("batch-search-input");
  const statusFilter = document.getElementById("batch-status-filter");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  let batches = liveBatches.length > 0 ? liveBatches : MockDB.batches;
  if (filterMedicineId) {
    batches = batches.filter(b => b.medicineId === filterMedicineId);
  }

  let filtered = batches.filter(b => {
    const medName = (b.medicineName || (MockDB.medicines.find(m => m.id === b.medicineId)?.name) || "").toLowerCase();
    const batchNum = (b.batchNumber || "").toLowerCase();
    const matchesSearch = query === "" || batchNum.includes(query) || medName.includes(query);

    const days = b.daysToExpiry !== undefined ? b.daysToExpiry : getDaysUntil(b.expiryDate);
    const stock = parseInt(b.stock !== undefined ? b.stock : b.quantity, 10) || 0;
    const reorder = parseInt(b.reorderLevel, 10) || 30;

    let matchesStatus = true;
    if (selectedStatus === "in-stock") matchesStatus = days > 30 && stock > reorder;
    else if (selectedStatus === "low-stock") matchesStatus = stock <= reorder && days >= 0;
    else if (selectedStatus === "warning") matchesStatus = days >= 0 && days <= 30;
    else if (selectedStatus === "expired") matchesStatus = days < 0;

    return matchesSearch && matchesStatus;
  });

  if (countDisplay) {
    const totalCount = liveBatches.length > 0 ? liveBatches.length : MockDB.batches.length;
    countDisplay.textContent = `Showing ${filtered.length} of ${totalCount} live batches from MySQL`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
          <div class="empty-table-title">No batches found</div>
          <div class="empty-table-sub">Try searching with a different batch number or clear the status filter.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const medName = b.medicineName || (MockDB.medicines.find(m => m.id === b.medicineId)?.name) || 'Unknown';
    const days = b.daysToExpiry !== undefined ? b.daysToExpiry : getDaysUntil(b.expiryDate);
    const stock = parseInt(b.stock !== undefined ? b.stock : b.quantity, 10) || 0;
    const price = parseFloat(b.sellingPrice || b.unitPrice || 0);
    const cost = parseFloat(b.purchasePrice || (price * 0.7) || 0);

    let statusType = "in-stock";
    let statusLabel = "Good / Valid";
    let badgeClass = "badge-in-stock";

    if (days < 0) {
      statusType = "expired";
      statusLabel = "Expired Batch";
      badgeClass = "badge-expired";
    } else if (days <= 30) {
      statusType = "warning";
      statusLabel = `Expiring Soon (${days}d)`;
      badgeClass = "badge-low-stock";
    } else if (stock <= 30) {
      statusType = "low-stock";
      statusLabel = `Low Stock (${stock} left)`;
      badgeClass = "badge-critical";
    }

    return `
      <tr>
        <td><span class="font-mono font-bold">${b.batchNumber}</span></td>
        <td><strong>${medName}</strong></td>
        <td>${b.expiryDate ? b.expiryDate.slice(0, 10) : '-'}</td>
        <td>
          <span style="font-weight:600; color:${days < 0 ? 'var(--danger)' : days <= 30 ? 'var(--warning)' : 'inherit'};">
            ${days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`}
          </span>
        </td>
        <td>₹${cost.toFixed(2)}</td>
        <td><strong>₹${price.toFixed(2)}</strong></td>
        <td><strong>${stock}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Min ${b.reorderLevel || 30})</span></td>
        <td><span class="badge-status ${badgeClass}">${b.statusLabel || statusLabel}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-outline btn-sm" onclick="openEditBatchModal(${b.id})" title="Edit Stock / Price">
              Edit
            </button>
            <button class="btn btn-primary btn-sm" onclick="prepareSaleFromBatch(${b.id})" ${statusType === 'expired' || stock === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} title="Dispense Medication">
              Dispense
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Prescriptions View with Search (Connected to live MySQL /api/prescriptions)
function renderPrescriptionsView() {
  const container = document.getElementById("prescriptions-cards-container");
  if (!container) return;

  const searchInput = document.getElementById("rx-search-input");
  const countDisplay = document.getElementById("rx-count-display");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // State 1: Loading from MySQL
  if (isPrescriptionsLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    container.innerHTML = `
      <div class="content-card">
        <div class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Loading Doctor Prescriptions...</div>
          <div class="empty-table-sub">Querying prescription ledger and clinical orders from MySQL <code>pharmacy_db</code></div>
        </div>
      </div>
    `;
    return;
  }

  // State 2: Error (Never display fake data when API fails)
  if (prescriptionsApiError) {
    if (countDisplay) countDisplay.textContent = "Database Error";
    container.innerHTML = `
      <div class="content-card">
        <div class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Failed to Retrieve Prescriptions</div>
          <div class="empty-table-sub">${prescriptionsApiError}</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLivePrescriptions()" style="margin-top:14px;">
            🔄 Retry Database Query
          </button>
        </div>
      </div>
    `;
    return;
  }

  const rxData = livePrescriptions;

  let filtered = rxData.filter(rx => {
    const patientName = (rx.patientName || "").toLowerCase();
    const patientPhone = (rx.patientPhone || "").toLowerCase();
    const doctorName = (rx.doctorName || "").toLowerCase();
    const doctorSpec = (rx.doctorSpecialization || "").toLowerCase();
    const rxNum = (rx.rxNumber || "").toLowerCase();
    const date = (rx.date || "").toLowerCase();

    return query === "" || 
      patientName.includes(query) || 
      patientPhone.includes(query) ||
      doctorName.includes(query) || 
      doctorSpec.includes(query) ||
      rxNum.includes(query) ||
      date.includes(query);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${rxData.length} prescriptions from MySQL`;
  }

  // State 3: Empty State
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="content-card">
        <div class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
          <div class="empty-table-title">${query ? 'No matching prescriptions found' : 'No Prescriptions Recorded in Database'}</div>
          <div class="empty-table-sub">${query ? 'Try searching for a different patient, physician, or Rx number.' : 'Click "+ Issue New Prescription" to record an official doctor prescription.'}</div>
        </div>
      </div>
    `;
    return;
  }

  // State 4: Render Live MySQL Prescriptions
  container.innerHTML = filtered.map(rx => {
    return `
      <div class="content-card" style="margin-bottom: 18px;">
        <div class="card-header">
          <h3>
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Prescription ${rx.rxNumber}
          </h3>
          <span class="badge-status badge-info">${rx.itemCount} Med(s) (${rx.totalQuantity} Units)</span>
        </div>
        <div style="padding: 16px 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 12px; font-size:0.85rem; flex-wrap:wrap; gap:8px;">
            <div><strong>Patient:</strong> ${rx.patientName} ${rx.patientPhone ? `<span style="color:var(--text-muted);">(${rx.patientPhone})</span>` : ''}</div>
            <div><strong>Prescribing Doctor:</strong> ${rx.doctorName} <span style="color:var(--text-muted); font-size:0.8rem;">(${rx.doctorSpecialization || 'Physician'})</span></div>
            <div><strong>Prescription Date:</strong> <span class="font-mono">${rx.date}</span></div>
          </div>
          <div style="margin-top:14px; display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline btn-sm" onclick="showPrescriptionDetails(${rx.id})">
              🔍 View Rx Details & Items
            </button>
            <button class="btn btn-primary btn-sm" onclick="prepareDispenseFromPrescription(${rx.id})">
              💊 Dispense in POS
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Sales History Table with Search (Connected to live MySQL /api/sales)
function renderSalesHistoryTable() {
  const tbody = document.getElementById("sales-table-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("sale-search-input");
  const countDisplay = document.getElementById("sales-count-display");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // State 1: Loading from MySQL
  if (isSalesLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Loading Sales Transactions...</div>
          <div class="empty-table-sub">Querying sales ledger and audit items from MySQL <code>pharmacy_db</code></div>
        </td>
      </tr>
    `;
    return;
  }

  // State 2: Error (Never display fake data when API fails)
  if (salesApiError) {
    if (countDisplay) countDisplay.textContent = "Database Error";
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Failed to Retrieve Sales History</div>
          <div class="empty-table-sub">${salesApiError}</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLiveSales()" style="margin-top:14px;">
            🔄 Retry Database Query
          </button>
        </td>
      </tr>
    `;
    return;
  }

  const salesData = liveSales;

  let filtered = salesData.filter(s => {
    const patientName = (s.patientName || "walk-in").toLowerCase();
    const inv = (s.invoiceNumber || "").toLowerCase();
    const phone = (s.patientPhone || "").toLowerCase();
    const date = (s.date || "").toLowerCase();

    return query === "" || 
      inv.includes(query) || 
      patientName.includes(query) || 
      phone.includes(query) ||
      date.includes(query);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${salesData.length} sales from MySQL`;
  }

  // State 3: Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle></svg>
          <div class="empty-table-title">${query ? 'No matching sales records' : 'No Sales Recorded in Database'}</div>
          <div class="empty-table-sub">${query ? 'Try a different invoice number or patient name.' : 'Click "+ New Sale Transaction" to record your first live transaction.'}</div>
        </td>
      </tr>
    `;
    return;
  }

  // State 4: Render Live MySQL Sales
  tbody.innerHTML = filtered.map(s => {
    return `
      <tr>
        <td><span class="font-mono font-bold">${s.invoiceNumber}</span></td>
        <td><strong>${s.date}</strong></td>
        <td>
          <div style="display:flex; flex-direction:column;">
            <strong>${s.patientName}</strong>
            ${s.patientPhone ? `<span style="font-size:0.75rem; color:var(--text-muted);">${s.patientPhone}</span>` : ''}
          </div>
        </td>
        <td><span style="color:var(--text-muted); font-size:0.83rem;">Dispensary POS</span></td>
        <td><span class="badge-status badge-info">${s.itemCount} item(s) (${s.totalUnits} units)</span></td>
        <td><span class="badge-status badge-in-stock">Billed</span></td>
        <td><strong style="color:var(--primary);">₹${parseFloat(s.totalAmount).toFixed(2)}</strong></td>
        <td><button class="btn btn-outline btn-sm" onclick="showInvoiceDetails(${s.id})">View Invoice</button></td>
      </tr>
    `;
  }).join("");
}

// Patients Table with Search (Connected to live MySQL /api/patients)
function renderPatientsTable() {
  const tbody = document.getElementById("patients-table-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("patient-search-input");
  const countDisplay = document.getElementById("patient-count-display");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // State 1: Loading
  if (isPatientsLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Loading Patient Registry...</div>
          <div class="empty-table-sub">Querying registered patient profiles from MySQL <code>pharmacy_db</code></div>
        </td>
      </tr>
    `;
    return;
  }

  // State 2: Error (Never display fake data when API fails)
  if (patientsApiError) {
    if (countDisplay) countDisplay.textContent = "Database Error";
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Failed to Retrieve Patients</div>
          <div class="empty-table-sub">${patientsApiError}</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLivePatients()" style="margin-top:14px;">
            🔄 Retry Database Query
          </button>
        </td>
      </tr>
    `;
    return;
  }

  const patientData = livePatients;
  const filtered = patientData.filter(p => {
    const name = (p.name || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const id = String(p.id || "");
    return query === "" || name.includes(query) || phone.includes(query) || id.includes(query);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${patientData.length} patients from MySQL`;
  }

  // State 3: Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>
          <div class="empty-table-title">${query ? 'No matching patients found' : 'No Patients Registered in Database'}</div>
          <div class="empty-table-sub">${query ? 'Try searching for a different name or phone number.' : 'Click "+ Register New Patient" to add your first patient profile.'}</div>
        </td>
      </tr>
    `;
    return;
  }

  // State 4: Render Live Patients
  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td><span class="font-mono font-bold">#PAT-${p.id}</span></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.phone ? `<span class="font-mono">${p.phone}</span>` : '<span style="color:var(--text-muted); font-size:0.8rem;">None recorded</span>'}</td>
      <td><span class="badge-status badge-in-stock">Registered Patient</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditPatientModal(${p.id})">
          Edit
        </button>
      </td>
    </tr>
  `).join("");
}

// Doctors Table with Search (Connected to live MySQL /api/doctors)
function renderDoctorsTable() {
  const tbody = document.getElementById("doctors-table-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("doctor-search-input");
  const countDisplay = document.getElementById("doctor-count-display");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // State 1: Loading
  if (isDoctorsLoading) {
    if (countDisplay) countDisplay.textContent = "Connecting to MySQL...";
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Loading Doctor Registry...</div>
          <div class="empty-table-sub">Querying licensed medical practitioners from MySQL <code>pharmacy_db</code></div>
        </td>
      </tr>
    `;
    return;
  }

  // State 2: Error (Never display fake data when API fails)
  if (doctorsApiError) {
    if (countDisplay) countDisplay.textContent = "Database Error";
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Failed to Retrieve Doctors</div>
          <div class="empty-table-sub">${doctorsApiError}</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLiveDoctors()" style="margin-top:14px;">
            🔄 Retry Database Query
          </button>
        </td>
      </tr>
    `;
    return;
  }

  const doctorData = liveDoctors;
  const filtered = doctorData.filter(d => {
    const name = (d.name || "").toLowerCase();
    const spec = (d.specialization || "").toLowerCase();
    const id = String(d.id || "");
    return query === "" || name.includes(query) || spec.includes(query) || id.includes(query);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${doctorData.length} doctors from MySQL`;
  }

  // State 3: Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle></svg>
          <div class="empty-table-title">${query ? 'No matching doctors found' : 'No Doctors Registered in Database'}</div>
          <div class="empty-table-sub">${query ? 'Try searching for a different name or specialization.' : 'Click "+ Register New Doctor" to add a licensed physician.'}</div>
        </td>
      </tr>
    `;
    return;
  }

  // State 4: Render Live Doctors
  tbody.innerHTML = filtered.map(d => `
    <tr>
      <td><span class="font-mono font-bold">#DOC-${d.id}</span></td>
      <td><strong>${d.name}</strong></td>
      <td><span class="badge-status badge-info">${d.specialization || 'General Physician'}</span></td>
      <td><span class="badge-status badge-in-stock">Active Physician</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openEditDoctorModal(${d.id})">
          Edit
        </button>
      </td>
    </tr>
  `).join("");
}

// Stored Procedures Live Reports (Phase 4B: MySQL CALL GetLowStock() & CALL GetExpiryReport())
function renderReportsView() {
  const lowStockTable = document.getElementById("report-lowstock-tbody");
  const expiryTable = document.getElementById("report-expiry-tbody");

  // State 1: Loading from MySQL Stored Procedures
  if (isReportsLoading) {
    const loadingHtml = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <div class="pulse-dot" style="margin:0 auto 12px; width:16px; height:16px;"></div>
          <div class="empty-table-title">Executing Stored Procedure...</div>
          <div class="empty-table-sub">Querying MySQL database routines in <code>pharmacy_db</code></div>
        </td>
      </tr>
    `;
    if (lowStockTable) lowStockTable.innerHTML = loadingHtml;
    if (expiryTable) expiryTable.innerHTML = loadingHtml;
    return;
  }

  // State 2: Error when Stored Procedure / API fails
  if (reportsApiError) {
    const errorHtml = `
      <tr>
        <td colspan="5" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div class="empty-table-title" style="color:var(--danger);">Stored Procedure Call Failed</div>
          <div class="empty-table-sub">${reportsApiError}</div>
          <button class="btn btn-primary btn-sm" onclick="fetchLiveReports()" style="margin-top:14px;">
            🔄 Retry Stored Procedures
          </button>
        </td>
      </tr>
    `;
    if (lowStockTable) lowStockTable.innerHTML = errorHtml;
    if (expiryTable) expiryTable.innerHTML = errorHtml;
    return;
  }

  // Procedure 1 Output: CALL GetLowStock() (Threshold: < 30 units)
  if (lowStockTable) {
    const items = liveReports.lowStock;
    if (!items || items.length === 0) {
      lowStockTable.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-state">
            <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--success);"><circle cx="12" cy="12" r="10"></circle><polyline points="9 11 12 14 22 4"></polyline></svg>
            <div class="empty-table-title">Optimal Stock Levels</div>
            <div class="empty-table-sub">All active medication batches in MySQL meet or exceed the reorder threshold (&ge; 30 units).</div>
          </td>
        </tr>
      `;
    } else {
      lowStockTable.innerHTML = items.map(b => {
        const stock = parseInt(b.stock, 10);
        const reorderLevel = b.reorderLevel || 30;
        const isCritical = stock < 15;

        return `
          <tr>
            <td><strong>${b.medicineName}</strong></td>
            <td><span class="font-mono">${b.batchNumber}</span></td>
            <td><strong style="color:${isCritical ? 'var(--danger)' : 'var(--warning)'};">${stock} units</strong></td>
            <td>${reorderLevel} units</td>
            <td>
              <span class="badge-status ${isCritical ? 'badge-critical' : 'badge-low-stock'}">
                ${isCritical ? 'Critical (< 15)' : 'Below Threshold (< 30)'}
              </span>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // Procedure 2 Output: CALL GetExpiryReport() (90-day window)
  if (expiryTable) {
    const items = liveReports.expiry;
    if (!items || items.length === 0) {
      expiryTable.innerHTML = `
        <tr>
          <td colspan="5" class="empty-table-state">
            <svg viewBox="0 0 24 24" fill="none" style="stroke:var(--success);"><circle cx="12" cy="12" r="10"></circle><polyline points="9 11 12 14 22 4"></polyline></svg>
            <div class="empty-table-title">No Near-Expiry Batches</div>
            <div class="empty-table-sub">No batches in MySQL have expiration dates within the 90-day procedure window.</div>
          </td>
        </tr>
      `;
    } else {
      expiryTable.innerHTML = items.map(b => {
        const days = b.daysRemaining;
        const isExpired = b.isExpired;

        let badgeClass = "badge-in-stock";
        let statusText = "";
        let actionBadge = "";

        if (isExpired) {
          badgeClass = "badge-expired";
          statusText = `EXPIRED (${Math.abs(days)}d ago)`;
          actionBadge = `<span style="color:var(--danger); font-weight:600; font-size:0.8rem;">🚨 Quarantine & Dispose</span>`;
        } else if (days <= 30) {
          badgeClass = "badge-low-stock";
          statusText = `Expiring Soon (${days}d left)`;
          actionBadge = `<span style="color:var(--warning); font-weight:600; font-size:0.8rem;">⚡ Priority FEFO Dispense</span>`;
        } else {
          badgeClass = "badge-info";
          statusText = `Approaching (${days}d left)`;
          actionBadge = `<span style="color:var(--text-muted); font-size:0.8rem;">👁️ Routine Monitor</span>`;
        }

        return `
          <tr>
            <td><strong>${b.medicineName}</strong></td>
            <td><span class="font-mono">${b.batchNumber}</span></td>
            <td><strong>${b.expiryDate}</strong></td>
            <td>${b.stock} units</td>
            <td>
              <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                <span class="badge-status ${badgeClass}">${statusText}</span>
                ${actionBadge}
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }
}

// =====================================================================
// 5. Modals, Forms & Client-Side Validation
// =====================================================================

function initModalsAndForms() {
  // Modal openers
  document.getElementById("btn-add-medicine-top")?.addEventListener("click", () => openModal("modal-add-medicine"));
  document.getElementById("btn-add-medicine-strip")?.addEventListener("click", () => openModal("modal-add-medicine"));
  document.getElementById("btn-record-sale-top")?.addEventListener("click", () => openModal("modal-record-sale"));
  document.getElementById("btn-record-sale-strip")?.addEventListener("click", () => openModal("modal-record-sale"));

  // Close buttons
  document.querySelectorAll(".modal-close-btn, .btn-modal-cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
    });
  });

  // Modal 1: Add Medicine Form
  const formAddMed = document.getElementById("form-add-medicine");
  if (formAddMed) {
    formAddMed.addEventListener("submit", (e) => {
      e.preventDefault();
      saveNewMedicineAndBatch();
    });
  }

  // Modal 2: Record Sale Form
  const formSale = document.getElementById("form-record-sale");
  if (formSale) {
    formSale.addEventListener("submit", (e) => {
      e.preventDefault();
      executeSaleTransaction();
    });
  }

  // Modal 4: Edit Medicine Form
  const formEditMed = document.getElementById("form-edit-medicine");
  if (formEditMed) {
    formEditMed.addEventListener("submit", (e) => {
      e.preventDefault();
      saveEditedMedicine();
    });
  }

  // Modal 5: Edit Batch Form
  const formEditBatch = document.getElementById("form-edit-batch");
  if (formEditBatch) {
    formEditBatch.addEventListener("submit", (e) => {
      e.preventDefault();
      saveEditedBatch();
    });
  }

  // Modal 6: Add Batch Form (Phase 3D)
  const formAddBatch = document.getElementById("form-add-batch");
  if (formAddBatch) {
    formAddBatch.addEventListener("submit", (e) => {
      e.preventDefault();
      saveNewBatch();
    });
  }

  // Sale Modal Dynamic Price Calculation
  const saleBatchSelect = document.getElementById("sale-batch-select");
  const saleQtyInput = document.getElementById("sale-quantity-input");
  if (saleBatchSelect && saleQtyInput) {
    saleBatchSelect.addEventListener("change", updateSaleModalCalculations);
    saleQtyInput.addEventListener("input", updateSaleModalCalculations);
  }

  // Modal 7: Create Prescription Form (Phase 4D)
  const formCreateRx = document.getElementById("form-create-prescription");
  if (formCreateRx) {
    formCreateRx.addEventListener("submit", (e) => {
      e.preventDefault();
      saveNewPrescription();
    });
  }

  // Modal 8: Patient Form (Phase 4E)
  const formPatient = document.getElementById("form-patient");
  if (formPatient) {
    formPatient.addEventListener("submit", (e) => {
      e.preventDefault();
      savePatient();
    });
  }

  // Modal 9: Doctor Form (Phase 4E)
  const formDoctor = document.getElementById("form-doctor");
  if (formDoctor) {
    formDoctor.addEventListener("submit", (e) => {
      e.preventDefault();
      saveDoctor();
    });
  }

  // View modal "Edit Formulation" button shortcut
  const btnViewMedEdit = document.getElementById("btn-view-med-edit");
  if (btnViewMedEdit) {
    btnViewMedEdit.addEventListener("click", () => {
      const currentMedId = btnViewMedEdit.getAttribute("data-medicine-id");
      closeModal("modal-view-medicine");
      if (currentMedId) openEditMedicineModal(parseInt(currentMedId));
    });
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("open");
}

function populateDropdownOptions() {
  populateCategoryDropdowns();
  populateBatchDropdownOptions();
  populatePatientDropdownOptions();
  populateDoctorDropdownOptions();
}

// Dynamic Bill Calculator in POS Modal (Derived from MySQL live batches)
function updateSaleModalCalculations() {
  const batchSelect = document.getElementById("sale-batch-select");
  const qtyInput = document.getElementById("sale-quantity-input");
  const priceEl = document.getElementById("sale-unit-price-display");
  const subtotalEl = document.getElementById("sale-subtotal-display");
  const stockAlertEl = document.getElementById("sale-stock-warning");

  if (!batchSelect || !qtyInput) return;

  const batchId = parseInt(batchSelect.value, 10);
  const qty = parseInt(qtyInput.value, 10) || 0;

  const liveBatch = liveBatches.find(b => b.id === batchId);
  const mockBatch = MockDB.batches.find(b => b.id === batchId);
  const batch = liveBatch || mockBatch;

  if (!batch) {
    if (priceEl) priceEl.textContent = "₹0.00";
    if (subtotalEl) subtotalEl.textContent = "₹0.00";
    if (stockAlertEl) stockAlertEl.textContent = "";
    return;
  }

  const unitPrice = parseFloat(batch.unitPrice || batch.sellingPrice || 0);
  const availableStock = batch.stock !== undefined ? parseInt(batch.stock, 10) : parseInt(batch.quantity, 10);

  if (priceEl) priceEl.textContent = `₹${unitPrice.toFixed(2)}`;
  const total = Math.max(0, qty * unitPrice);
  if (subtotalEl) subtotalEl.textContent = `₹${total.toFixed(2)}`;

  if (stockAlertEl) {
    if (qty > availableStock) {
      stockAlertEl.textContent = `⚠️ Error: Requested quantity (${qty}) exceeds available stock (${availableStock} units)!`;
      stockAlertEl.style.color = "var(--danger)";
    } else if (qty <= 0) {
      stockAlertEl.textContent = `⚠️ Quantity must be at least 1 unit.`;
      stockAlertEl.style.color = "var(--danger)";
    } else if (availableStock <= 15) {
      stockAlertEl.textContent = `⚡ Low Stock: Only ${availableStock} units available in this batch.`;
      stockAlertEl.style.color = "var(--warning)";
    } else {
      stockAlertEl.textContent = `✓ Stock available: ${availableStock} units ready for dispensing.`;
      stockAlertEl.style.color = "var(--success)";
    }
  }
}

// =====================================================================
// 6. Action Handlers (Add, Edit, View, Sale, Restock)
// =====================================================================

// Action: Save New Medicine and Batch (Connected to MySQL POST /api/medicines)
async function saveNewMedicineAndBatch() {
  const form = document.getElementById("form-add-medicine");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save to Inventory";

  const nameInput = document.getElementById("new-med-name");
  const genericInput = document.getElementById("new-med-generic");
  const catInput = document.getElementById("new-med-category");
  const formInput = document.getElementById("new-med-form");
  const dosageInput = document.getElementById("new-med-dosage");

  const batchNumInput = document.getElementById("new-batch-number");
  const expiryInput = document.getElementById("new-batch-expiry");
  const purchaseInput = document.getElementById("new-batch-purchase");
  const sellingInput = document.getElementById("new-batch-selling");
  const stockInput = document.getElementById("new-batch-stock");
  const reorderInput = document.getElementById("new-batch-reorder");

  // Reset error displays
  document.querySelectorAll("#modal-add-medicine .field-error").forEach(el => el.classList.remove("active"));

  let isValid = true;

  const name = nameInput.value.trim();
  if (!name) {
    document.getElementById("err-new-med-name").classList.add("active");
    isValid = false;
  }

  const batchNumber = batchNumInput.value.trim();
  if (!batchNumber) {
    document.getElementById("err-new-batch-number").classList.add("active");
    isValid = false;
  }

  const expiryDate = expiryInput.value;
  if (!expiryDate) {
    document.getElementById("err-new-batch-expiry").classList.add("active");
    isValid = false;
  }

  const purchasePrice = parseFloat(purchaseInput.value);
  if (isNaN(purchasePrice) || purchasePrice < 0) {
    document.getElementById("err-new-batch-purchase").classList.add("active");
    isValid = false;
  }

  const sellingPrice = parseFloat(sellingInput.value);
  if (isNaN(sellingPrice) || sellingPrice <= 0) {
    document.getElementById("err-new-batch-selling").classList.add("active");
    isValid = false;
  }

  const stock = parseInt(stockInput.value, 10);
  if (isNaN(stock) || stock < 0) {
    document.getElementById("err-new-batch-stock").classList.add("active");
    isValid = false;
  }

  const reorderLevel = parseInt(reorderInput.value, 10);
  if (isNaN(reorderLevel) || reorderLevel < 1) {
    document.getElementById("err-new-batch-reorder").classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct the validation errors highlighted in the form.", "error");
    return;
  }

  const categoryId = catInput && catInput.value ? parseInt(catInput.value, 10) : null;
  const genericVal = genericInput ? genericInput.value.trim() : "";

  // Prevent accidental duplicate submissions while request is in progress
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Saving to MySQL...
    `;
  }

  try {
    const payload = {
      name: name,
      medicine_name: name,
      generic: genericVal,
      manufacturer: genericVal || "Standard Dispensary",
      categoryId: categoryId,
      category_id: categoryId,
      batchNumber: batchNumber,
      batch_number: batchNumber,
      expiryDate: expiryDate,
      expiry_date: expiryDate,
      unitPrice: sellingPrice,
      sellingPrice: sellingPrice,
      purchasePrice: purchasePrice,
      quantity: stock,
      stock: stock,
      reorderLevel: reorderLevel
    };

    const response = await fetch("/api/medicines", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to register medicine`);
    }

    // Keep MockDB in sync for secondary views (e.g. Batches view)
    const createdId = result.data ? result.data.id : (100 + MockDB.medicines.length + 1);
    MockDB.medicines.push({
      id: createdId,
      name,
      generic: genericVal || name,
      categoryId: categoryId || 1,
      form: formInput ? formInput.value : "Tablet",
      dosage: (dosageInput && dosageInput.value.trim()) || "Standard"
    });

    if (result.data && result.data.initialBatch) {
      MockDB.batches.push({
        id: result.data.initialBatch.id,
        medicineId: createdId,
        batchNumber,
        expiryDate,
        purchasePrice,
        sellingPrice,
        stock,
        reorderLevel
      });
    }

    closeModal("modal-add-medicine");
    form.reset();
    showToast(`Medicine "${name}" and Batch #${batchNumber} saved to MySQL successfully!`, "success");

    // Refresh real medicines from MySQL
    await fetchLiveMedicines();
    refreshAllViews();
  } catch (err) {
    console.error("Error adding medicine to MySQL:", err);
    showToast(err.message || "Failed to register medicine in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Action: View Medicine Formulation Details (Phase 3C)
function openViewMedicineModal(medId) {
  const liveMed = liveMedicines.find(m => m.id === medId);
  const mockMed = MockDB.medicines.find(m => m.id === medId);
  const med = liveMed || mockMed;
  if (!med) return;

  const totalStock = med.totalStock !== undefined ? med.totalStock : getMedicineTotalStock(med.id);
  const batches = MockDB.batches.filter(b => b.medicineId === med.id);

  document.getElementById("view-med-name").textContent = med.name;
  document.getElementById("view-med-generic").textContent = med.generic || (med.manufacturer ? `Manufacturer: ${med.manufacturer}` : med.name);
  document.getElementById("view-med-category").textContent = med.categoryName || "General";
  document.getElementById("view-med-form").textContent = med.form ? `${med.form} (${med.dosage || 'Standard'})` : "Clinical Formulation";
  document.getElementById("view-med-stock").textContent = `${totalStock} units`;
  document.getElementById("view-med-batches-count").textContent = `${med.batchCount || batches.length} batch(es)`;

  const editBtn = document.getElementById("btn-view-med-edit");
  if (editBtn) editBtn.setAttribute("data-medicine-id", med.id);

  const tbody = document.getElementById("view-med-batches-tbody");
  if (tbody) {
    if (batches.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">Active batch records linked in MySQL <code>medicinebatch</code> table.</td></tr>`;
    } else {
      tbody.innerHTML = batches.map(b => {
        const status = getBatchStatus(b);
        let badgeClass = "badge-in-stock";
        if (status.type === "expired") badgeClass = "badge-expired";
        else if (status.type === "warning") badgeClass = "badge-low-stock";
        else if (status.type === "low-stock") badgeClass = "badge-critical";

        return `
          <tr>
            <td><span class="font-mono">${b.batchNumber}</span></td>
            <td>${b.expiryDate}</td>
            <td><strong>${b.stock}</strong> units</td>
            <td>₹${b.sellingPrice.toFixed(2)}</td>
            <td><span class="badge-status ${badgeClass}">${status.label}</span></td>
          </tr>
        `;
      }).join("");
    }
  }

  openModal("modal-view-medicine");
}

// Action: Open Edit Medicine Modal (Populates from MySQL liveMedicines)
function openEditMedicineModal(medId) {
  const liveMed = liveMedicines.find(m => m.id === medId);
  const mockMed = MockDB.medicines.find(m => m.id === medId);
  const med = liveMed || mockMed;
  if (!med) {
    showToast("Medicine record not found.", "error");
    return;
  }

  document.getElementById("edit-med-id").value = med.id;
  document.getElementById("edit-med-name").value = med.name || "";
  document.getElementById("edit-med-generic").value = med.manufacturer || med.generic || "";

  const editCatSelect = document.getElementById("edit-med-category");
  if (editCatSelect && med.categoryId) {
    editCatSelect.value = med.categoryId;
  }

  if (document.getElementById("edit-med-form")) {
    document.getElementById("edit-med-form").value = med.form || "Tablet";
  }
  if (document.getElementById("edit-med-dosage")) {
    document.getElementById("edit-med-dosage").value = med.dosage || "Standard";
  }

  document.querySelectorAll("#modal-edit-medicine .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-edit-medicine");
}

// Action: Save Edited Medicine Formulation (Connected to MySQL PUT /api/medicines/:id)
async function saveEditedMedicine() {
  const form = document.getElementById("form-edit-medicine");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Update Medicine";

  const medId = parseInt(document.getElementById("edit-med-id").value, 10);
  const name = document.getElementById("edit-med-name").value.trim();
  const generic = document.getElementById("edit-med-generic").value.trim();
  const catSelect = document.getElementById("edit-med-category");
  const categoryId = catSelect && catSelect.value ? parseInt(catSelect.value, 10) : null;
  const formVal = document.getElementById("edit-med-form") ? document.getElementById("edit-med-form").value : "Tablet";
  const dosageVal = document.getElementById("edit-med-dosage") ? document.getElementById("edit-med-dosage").value.trim() : "Standard";

  document.querySelectorAll("#modal-edit-medicine .field-error").forEach(el => el.classList.remove("active"));

  if (!name) {
    const errEl = document.getElementById("err-edit-med-name");
    if (errEl) errEl.classList.add("active");
    showToast("Medicine name cannot be empty.", "error");
    return;
  }

  // Prevent accidental duplicate submissions while request is in progress
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Updating MySQL...
    `;
  }

  try {
    const response = await fetch(`/api/medicines/${medId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        medicine_name: name,
        categoryId: categoryId,
        category_id: categoryId,
        manufacturer: generic || "Standard Dispensary",
        generic: generic
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to update medicine`);
    }

    // Keep MockDB synchronized for secondary views
    const mockMed = MockDB.medicines.find(m => m.id === medId);
    if (mockMed) {
      mockMed.name = name;
      mockMed.generic = generic;
      mockMed.categoryId = categoryId;
      mockMed.form = formVal;
      mockMed.dosage = dosageVal;
    }

    closeModal("modal-edit-medicine");
    showToast(`Medicine "#MED-${medId} (${name})" updated in MySQL successfully!`, "success");

    // Refresh real medicines from MySQL
    await fetchLiveMedicines();
    refreshAllViews();
  } catch (err) {
    console.error("Error updating medicine in MySQL:", err);
    showToast(err.message || "Failed to update medicine in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Action: Open Add Batch Modal (Phase 3D)
function openAddBatchModal(preselectedMedId = null) {
  const medSelect = document.getElementById("add-batch-medicine-select");
  if (medSelect) {
    const meds = liveMedicines.length > 0 ? liveMedicines : MockDB.medicines;
    medSelect.innerHTML = `<option value="">-- Select Registered Medicine --</option>` +
      meds.map(m => `<option value="${m.id}" ${preselectedMedId === m.id ? 'selected' : ''}>${m.name} (${m.categoryName || 'General'})</option>`).join("");
  }

  document.querySelectorAll("#modal-add-batch .field-error").forEach(el => el.classList.remove("active"));
  document.getElementById("add-batch-number").value = "";
  document.getElementById("add-batch-expiry").value = "";
  document.getElementById("add-batch-price").value = "5.00";
  document.getElementById("add-batch-stock").value = "100";

  openModal("modal-add-batch");
}

// Action: Save New Batch to MySQL (Phase 3D)
async function saveNewBatch() {
  const form = document.getElementById("form-add-batch");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save Batch to MySQL";

  const medSelect = document.getElementById("add-batch-medicine-select");
  const numInput = document.getElementById("add-batch-number");
  const expInput = document.getElementById("add-batch-expiry");
  const priceInput = document.getElementById("add-batch-price");
  const stockInput = document.getElementById("add-batch-stock");

  document.querySelectorAll("#modal-add-batch .field-error").forEach(el => el.classList.remove("active"));

  let isValid = true;
  const medicineId = medSelect ? parseInt(medSelect.value, 10) : null;
  if (!medicineId) {
    document.getElementById("err-add-batch-med").classList.add("active");
    isValid = false;
  }

  const batchNumber = numInput ? numInput.value.trim().toUpperCase() : "";
  if (!batchNumber) {
    document.getElementById("err-add-batch-number").classList.add("active");
    isValid = false;
  }

  const expiryDate = expInput ? expInput.value : "";
  if (!expiryDate) {
    document.getElementById("err-add-batch-expiry").classList.add("active");
    isValid = false;
  }

  const unitPrice = priceInput ? parseFloat(priceInput.value) : 0;
  if (isNaN(unitPrice) || unitPrice < 0) {
    document.getElementById("err-add-batch-price").classList.add("active");
    isValid = false;
  }

  const stock = stockInput ? parseInt(stockInput.value, 10) : 0;
  if (isNaN(stock) || stock < 0) {
    document.getElementById("err-add-batch-stock").classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct the validation errors in the form.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Saving to MySQL...
    `;
  }

  try {
    const response = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId,
        batchNumber,
        expiryDate,
        unitPrice,
        quantity: stock
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to register batch`);
    }

    closeModal("modal-add-batch");
    form.reset();
    showToast(`Batch #${batchNumber} saved to MySQL database successfully!`, "success");

    // Refresh real batches, medicines & reports from MySQL
    await fetchLiveBatches();
    await fetchLiveMedicines();
    await fetchLiveReports();
    refreshAllViews();
  } catch (err) {
    console.error("Error creating batch in MySQL:", err);
    showToast(err.message || "Failed to register batch in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Action: Open Edit Batch Modal (Populates from MySQL liveBatches)
function openEditBatchModal(batchId) {
  const liveBatch = liveBatches.find(b => b.id === batchId);
  const mockBatch = MockDB.batches.find(b => b.id === batchId);
  const batch = liveBatch || mockBatch;
  if (!batch) {
    showToast("Batch record not found.", "error");
    return;
  }

  document.getElementById("edit-batch-id").value = batch.id;
  document.getElementById("edit-batch-number").value = batch.batchNumber;
  document.getElementById("edit-batch-expiry").value = batch.expiryDate ? batch.expiryDate.slice(0, 10) : "";
  document.getElementById("edit-batch-selling").value = parseFloat(batch.sellingPrice || batch.unitPrice || 0).toFixed(2);
  document.getElementById("edit-batch-stock").value = batch.stock !== undefined ? batch.stock : batch.quantity;
  document.getElementById("edit-batch-reorder").value = batch.reorderLevel || 30;

  document.querySelectorAll("#modal-edit-batch .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-edit-batch");
}

// Action: Save Edited Batch Details (Connected to MySQL PUT /api/batches/:id)
async function saveEditedBatch() {
  const form = document.getElementById("form-edit-batch");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save Batch Changes";

  const batchId = parseInt(document.getElementById("edit-batch-id").value, 10);
  const batchNumber = document.getElementById("edit-batch-number").value;
  const expiryDate = document.getElementById("edit-batch-expiry").value;
  const sellingPrice = parseFloat(document.getElementById("edit-batch-selling").value);
  const stock = parseInt(document.getElementById("edit-batch-stock").value, 10);
  const reorderLevel = parseInt(document.getElementById("edit-batch-reorder").value, 10);

  document.querySelectorAll("#modal-edit-batch .field-error").forEach(el => el.classList.remove("active"));

  let isValid = true;
  if (isNaN(sellingPrice) || sellingPrice <= 0) {
    document.getElementById("err-edit-batch-price").classList.add("active");
    isValid = false;
  }
  if (isNaN(stock) || stock < 0) {
    document.getElementById("err-edit-batch-stock").classList.add("active");
    isValid = false;
  }
  if (!expiryDate) {
    isValid = false;
  }

  if (!isValid) {
    showToast("Please enter valid prices and non-negative stock numbers.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Updating MySQL...
    `;
  }

  try {
    const response = await fetch(`/api/batches/${batchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchNumber,
        expiryDate,
        unitPrice: sellingPrice,
        quantity: stock
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to update batch`);
    }

    // Keep MockDB in sync
    const mockBatch = MockDB.batches.find(b => b.id === batchId);
    if (mockBatch) {
      mockBatch.expiryDate = expiryDate;
      mockBatch.sellingPrice = sellingPrice;
      mockBatch.stock = stock;
      mockBatch.reorderLevel = reorderLevel || 10;
    }

    closeModal("modal-edit-batch");
    showToast(`Batch #${batchNumber} updated in MySQL successfully!`, "success");

    // Refresh real batches, medicines & reports from MySQL
    await fetchLiveBatches();
    await fetchLiveMedicines();
    await fetchLiveReports();
    refreshAllViews();
  } catch (err) {
    console.error("Error updating batch in MySQL:", err);
    showToast(err.message || "Failed to update batch in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Action: Quick Restock (+50 Units)
function quickRestockBatch(batchId) {
  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) return;

  const restockQty = 50;
  batch.stock += restockQty;
  refreshAllViews();
  showToast(`Restocked +${restockQty} units for Batch ${batch.batchNumber}. Total stock: ${batch.stock}.`, "success");
}

// Action: Record Sale Transaction (POS) - Connected to MySQL POST /api/sales
async function executeSaleTransaction() {
  const form = document.getElementById("form-record-sale");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Confirm & Print Bill";

  const batchId = parseInt(document.getElementById("sale-batch-select").value, 10);
  const qty = parseInt(document.getElementById("sale-quantity-input").value, 10);
  const patientIdVal = document.getElementById("sale-patient-select").value;
  const patientId = patientIdVal ? parseInt(patientIdVal, 10) : null;

  document.querySelectorAll("#modal-record-sale .field-error").forEach(el => el.classList.remove("active"));

  let isValid = true;
  if (isNaN(batchId) || batchId <= 0) {
    document.getElementById("err-sale-batch").classList.add("active");
    isValid = false;
  }

  if (isNaN(qty) || qty <= 0) {
    document.getElementById("err-sale-qty").classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct the validation errors in the sales form.", "error");
    return;
  }

  // Pre-validate stock with live batches if present
  const liveBatch = liveBatches.find(b => b.id === batchId);
  if (liveBatch) {
    const available = parseInt(liveBatch.stock, 10);
    if (qty > available) {
      showToast(`Transaction Blocked: Requested ${qty} units, but only ${available} units are available!`, "error");
      return;
    }
    if (liveBatch.daysToExpiry !== undefined && liveBatch.daysToExpiry < 0) {
      showToast("Clinical Safety Block: This batch is EXPIRED and cannot be dispensed!", "error");
      return;
    }
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Processing Sale in MySQL...
    `;
  }

  try {
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patientId,
        items: [{ batchId: batchId, quantity: qty }]
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Sale transaction failed`);
    }

    closeModal("modal-record-sale");
    form.reset();
    showToast(`Bill ${result.data.invoiceNumber} recorded! Total: ₹${parseFloat(result.data.totalAmount).toFixed(2)}.`, "success");

    // Refresh live sales, batches, medicines and reports
    await fetchLiveSales();
    await fetchLiveBatches();
    await fetchLiveMedicines();
    await fetchLiveReports();
    refreshAllViews();

    // Show full invoice receipt from MySQL
    showInvoiceDetails(result.data.saleId);

  } catch (err) {
    console.error("Sale transaction error:", err);
    showToast(err.message || "Failed to process sale in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// =====================================================================
// Phase 4D: Prescription Management Action Handlers
// =====================================================================

// Open Prescription Modal
function openNewPrescriptionModal() {
  const form = document.getElementById("form-create-prescription");
  if (form) form.reset();

  document.querySelectorAll("#modal-create-prescription .field-error").forEach(el => el.classList.remove("active"));

  // Default date to today (YYYY-MM-DD)
  const dateInput = document.getElementById("new-rx-date");
  if (dateInput) {
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;
  }

  // Populate patient and doctor dropdowns
  populatePatientDropdownOptions();
  populateDoctorDropdownOptions();

  // Reset items container and add 1 initial item row
  const itemsContainer = document.getElementById("rx-items-container");
  if (itemsContainer) {
    itemsContainer.innerHTML = "";
    addPrescriptionItemRow();
  }

  openModal("modal-create-prescription");
}

// Add medication row to prescription form
function addPrescriptionItemRow() {
  const container = document.getElementById("rx-items-container");
  if (!container) return;

  const rowId = "rx-item-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const meds = liveMedicines.length > 0 ? liveMedicines : MockDB.medicines;
  const medOptions = meds.map(m => 
    `<option value="${m.id}">${m.name} ${m.dosage ? `(${m.dosage})` : ''}</option>`
  ).join("");

  const row = document.createElement("div");
  row.className = "rx-item-row";
  row.id = rowId;
  row.style.cssText = "display:grid; grid-template-columns: 2fr 1.5fr 1fr 40px; gap:8px; align-items:center; background:#f8fafc; padding:8px 10px; border-radius:var(--radius-sm); border:1px solid var(--border);";
  row.innerHTML = `
    <div>
      <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Medicine *</label>
      <select class="rx-item-medicine filter-input" style="width:100%; font-size:0.82rem; padding:6px 8px;" required>
        <option value="">-- Select Medicine --</option>
        ${medOptions}
      </select>
    </div>
    <div>
      <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Dosage *</label>
      <input type="text" class="rx-item-dosage filter-input" placeholder="e.g. 500mg twice daily" style="width:100%; font-size:0.82rem; padding:6px 8px;" required>
    </div>
    <div>
      <label style="font-size:0.72rem; color:var(--text-muted); display:block; margin-bottom:2px;">Quantity *</label>
      <input type="number" class="rx-item-qty filter-input" min="1" value="10" style="width:100%; font-size:0.82rem; padding:6px 8px;" required>
    </div>
    <div style="padding-top:16px;">
      <button type="button" class="btn btn-outline btn-sm" onclick="removePrescriptionItemRow('${rowId}')" title="Remove medication" style="padding:6px; color:var(--danger); border-color:#fecaca;">
        ✕
      </button>
    </div>
  `;
  container.appendChild(row);
}

// Remove medication row
function removePrescriptionItemRow(rowId) {
  const container = document.getElementById("rx-items-container");
  if (!container) return;
  const row = document.getElementById(rowId);
  if (row) {
    if (container.querySelectorAll(".rx-item-row").length <= 1) {
      showToast("Prescription must include at least one medication.", "warning");
      return;
    }
    row.remove();
  }
}

// Save Prescription to MySQL POST /api/prescriptions
async function saveNewPrescription() {
  const form = document.getElementById("form-create-prescription");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save Prescription";

  const patientSelect = document.getElementById("new-rx-patient");
  const doctorSelect = document.getElementById("new-rx-doctor");
  const dateInput = document.getElementById("new-rx-date");

  // Reset errors
  document.querySelectorAll("#modal-create-prescription .field-error").forEach(el => el.classList.remove("active"));

  let isValid = true;
  const patientId = patientSelect ? parseInt(patientSelect.value, 10) : NaN;
  if (isNaN(patientId) || patientId <= 0) {
    document.getElementById("err-new-rx-patient").classList.add("active");
    isValid = false;
  }

  const doctorId = doctorSelect ? parseInt(doctorSelect.value, 10) : NaN;
  if (isNaN(doctorId) || doctorId <= 0) {
    document.getElementById("err-new-rx-doctor").classList.add("active");
    isValid = false;
  }

  const prescriptionDate = dateInput ? dateInput.value.trim() : "";
  if (!prescriptionDate) {
    document.getElementById("err-new-rx-date").classList.add("active");
    isValid = false;
  }

  // Parse items
  const itemRows = document.querySelectorAll("#rx-items-container .rx-item-row");
  const items = [];
  if (itemRows.length === 0) {
    document.getElementById("err-new-rx-items").classList.add("active");
    isValid = false;
  } else {
    itemRows.forEach(row => {
      const medSelect = row.querySelector(".rx-item-medicine");
      const dosageInput = row.querySelector(".rx-item-dosage");
      const qtyInput = row.querySelector(".rx-item-qty");

      const medId = medSelect ? parseInt(medSelect.value, 10) : NaN;
      const dosage = dosageInput ? dosageInput.value.trim() : "";
      const quantity = qtyInput ? parseInt(qtyInput.value, 10) : NaN;

      if (isNaN(medId) || medId <= 0 || !dosage || isNaN(quantity) || quantity <= 0) {
        isValid = false;
      } else {
        items.push({
          medicineId: medId,
          dosage: dosage,
          quantity: quantity
        });
      }
    });

    if (items.length !== itemRows.length) {
      document.getElementById("err-new-rx-items").classList.add("active");
      isValid = false;
    }
  }

  if (!isValid) {
    showToast("Please correct the highlighted validation errors.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Saving in MySQL...
    `;
  }

  try {
    const response = await fetch("/api/prescriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: patientId,
        doctorId: doctorId,
        prescriptionDate: prescriptionDate,
        items: items
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to create prescription`);
    }

    closeModal("modal-create-prescription");
    if (form) form.reset();
    showToast(`Prescription ${result.data.rxNumber} issued successfully in MySQL!`, "success");

    // Refresh live prescriptions
    await fetchLivePrescriptions();

    // View created prescription details
    showPrescriptionDetails(result.data.id);

  } catch (err) {
    console.error("Prescription save error:", err);
    showToast(err.message || "Failed to issue prescription in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// View Prescription Details Modal (Connected to live MySQL GET /api/prescriptions/:id)
async function showPrescriptionDetails(rxId) {
  try {
    const res = await fetch(`/api/prescriptions/${rxId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch prescription details`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || "Prescription not found");

    const rx = json.data;
    const modalBody = document.getElementById("view-rx-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--border); padding-bottom:14px; margin-bottom:14px;">
          <div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--primary); letter-spacing:-0.02em;">PHARMACARE CLINICAL DISPENSARY</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Official Medical Prescription & Orders Record</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Registry ID #${rx.id} | MySQL Transaction Audit Verified</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:1.1rem; font-weight:800; color:var(--text);">${rx.rxNumber}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Date: <strong>${rx.date}</strong></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px; background:#f8fafc; padding:12px 14px; border-radius:var(--radius-sm); font-size:0.83rem; border:1px solid var(--border-light);">
          <div>
            <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Patient Details:</span><br>
            <strong>${rx.patientName}</strong> (ID: #PAT-${rx.patientId})
            ${rx.patientPhone ? `<br><span style="color:var(--text-muted); font-size:0.75rem;">Phone: ${rx.patientPhone}</span>` : ''}
          </div>
          <div>
            <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Prescribing Physician:</span><br>
            <strong>${rx.doctorName}</strong> (ID: #DOC-${rx.doctorId})<br>
            <span style="color:var(--primary); font-weight:600; font-size:0.78rem;">${rx.doctorSpecialization || 'General Physician'}</span>
          </div>
        </div>

        <div style="font-size:0.78rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:8px;">
          Prescribed Medications & Line Items (${rx.items.length})
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:0.83rem; margin-bottom:16px;">
          <thead>
            <tr style="border-bottom:1.5px solid var(--border); text-align:left; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">
              <th style="padding:6px 4px;">#</th>
              <th style="padding:6px 4px;">Medication</th>
              <th style="padding:6px 4px;">Manufacturer</th>
              <th style="padding:6px 4px;">Prescribed Dosage</th>
              <th style="padding:6px 4px; text-align:center;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${rx.items.map((item, idx) => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:8px 4px; color:var(--text-muted);">${idx + 1}</td>
                <td style="padding:8px 4px;"><strong>${item.medicineName}</strong></td>
                <td style="padding:8px 4px; color:var(--text-muted); font-size:0.78rem;">${item.manufacturer || '-'}</td>
                <td style="padding:8px 4px;"><span class="badge-status badge-info" style="font-size:0.78rem;">${item.dosage}</span></td>
                <td style="padding:8px 4px; text-align:center; font-weight:700;">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top:2px solid var(--border); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
          <div>
            Note: Prescriptions document medical orders; inventory is deducted only when batches are dispensed at POS.
          </div>
          <div style="font-weight:700;">
            Total Units: ${rx.items.reduce((s, it) => s + (it.quantity || 0), 0)}
          </div>
        </div>
      </div>
    `;

    openModal("modal-view-prescription");
  } catch (err) {
    console.error("Error fetching prescription details:", err);
    showToast(err.message || "Failed to load prescription details.", "error");
  }
}

// Prepare dispense from prescription in POS (navigates without auto-deducting inventory)
function prepareDispenseFromPrescription(rxId) {
  const rx = livePrescriptions.find(r => r.id === rxId);
  switchView('sales');
  openModal('modal-record-sale');
  if (rx && rx.patientId) {
    const pSelect = document.getElementById('sale-patient-select');
    if (pSelect) pSelect.value = rx.patientId;
    showToast(`Prescription ${rx.rxNumber} loaded for patient ${rx.patientName}. Select available batch to dispense.`, "info");
  }
}

// Quick prepare sale modal from batch
function prepareSaleFromBatch(batchId) {
  openModal("modal-record-sale");
  const select = document.getElementById("sale-batch-select");
  if (select) {
    select.value = batchId;
    updateSaleModalCalculations();
  }
}

// Tab Switcher Helper
function switchView(viewName, filterMedicineId = null) {
  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navItem) navItem.click();

  if (viewName === "batches" && filterMedicineId) {
    renderBatchesTable(filterMedicineId);
  }
}

// Full Invoice Receipt Modal (Connected to live MySQL GET /api/sales/:id)
async function showInvoiceDetails(saleId) {
  try {
    const res = await fetch(`/api/sales/${saleId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sale details`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(json.error || "Sale not found");

    const sale = json.data;
    const modalBody = document.getElementById("invoice-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="background:#ffffff; border:1px solid var(--border); border-radius:var(--radius-md); padding:20px; font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid var(--border); padding-bottom:14px; margin-bottom:14px;">
          <div>
            <div style="font-size:1.15rem; font-weight:800; color:var(--primary); letter-spacing:-0.02em;">PHARMACARE DISPENSARY</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Clinical Pharmacy & Prescription Registry</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Tax / Reg #PH-2024-91 | MySQL Audit Verified</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:1rem; font-weight:800; color:var(--text);">${sale.invoiceNumber}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Date: <strong>${sale.date}</strong></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px; background:#f8fafc; padding:10px 14px; border-radius:var(--radius-sm); font-size:0.82rem;">
          <div>
            <span style="color:var(--text-muted);">Customer / Patient:</span><br>
            <strong>${sale.patientName || 'Walk-in Customer'}</strong>
            ${sale.patientPhone ? `<br><span style="color:var(--text-muted); font-size:0.75rem;">Phone: ${sale.patientPhone}</span>` : ''}
          </div>
          <div>
            <span style="color:var(--text-muted);">Transaction Status:</span><br>
            <span class="badge-status badge-in-stock">✓ Settled & Stock Deducted</span>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:0.83rem; margin-bottom:16px;">
          <thead>
            <tr style="border-bottom:1.5px solid var(--border); text-align:left; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase;">
              <th style="padding:6px 4px;">Medication</th>
              <th style="padding:6px 4px;">Batch #</th>
              <th style="padding:6px 4px; text-align:center;">Qty</th>
              <th style="padding:6px 4px; text-align:right;">Price</th>
              <th style="padding:6px 4px; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:8px 4px;"><strong>${item.medicineName}</strong></td>
                <td style="padding:8px 4px;"><span class="font-mono" style="font-size:0.78rem;">${item.batchNumber}</span></td>
                <td style="padding:8px 4px; text-align:center;">${item.quantity}</td>
                <td style="padding:8px 4px; text-align:right;">₹${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td style="padding:8px 4px; text-align:right; font-weight:600;">₹${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top:2px solid var(--border); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.75rem; color:var(--text-muted);">
            Items: <strong>${sale.itemsCount}</strong> | Stock Triggers Enforced
          </div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--primary);">
            Total: ₹${parseFloat(sale.totalAmount).toFixed(2)}
          </div>
        </div>
      </div>
    `;

    openModal("modal-view-invoice");
  } catch (err) {
    console.error("Error fetching invoice:", err);
    showToast(err.message || "Failed to load receipt details.", "error");
  }
}

// =====================================================================
// Phase 4E: Patient & Doctor Management Action Handlers
// =====================================================================

function openNewPatientModal() {
  const form = document.getElementById("form-patient");
  if (form) form.reset();
  const idInput = document.getElementById("patient-id-input");
  if (idInput) idInput.value = "";
  const title = document.getElementById("modal-patient-title");
  if (title) title.innerHTML = `
    <svg style="width:20px; height:20px; stroke:var(--primary); fill:none; stroke-width:2;" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
    Register New Patient
  `;
  document.querySelectorAll("#modal-patient .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-patient");
}

function openEditPatientModal(patientId) {
  const patient = livePatients.find(p => p.id === patientId);
  if (!patient) return;

  const form = document.getElementById("form-patient");
  if (form) form.reset();
  document.querySelectorAll("#modal-patient .field-error").forEach(el => el.classList.remove("active"));

  const idInput = document.getElementById("patient-id-input");
  const nameInput = document.getElementById("patient-name-input");
  const phoneInput = document.getElementById("patient-phone-input");
  const title = document.getElementById("modal-patient-title");

  if (idInput) idInput.value = patient.id;
  if (nameInput) nameInput.value = patient.name;
  if (phoneInput) phoneInput.value = patient.phone || "";
  if (title) title.innerHTML = `
    <svg style="width:20px; height:20px; stroke:var(--primary); fill:none; stroke-width:2;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    Edit Patient #PAT-${patient.id}
  `;

  openModal("modal-patient");
}

async function savePatient() {
  const idInput = document.getElementById("patient-id-input");
  const nameInput = document.getElementById("patient-name-input");
  const phoneInput = document.getElementById("patient-phone-input");
  const submitBtn = document.getElementById("btn-save-patient");
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save Patient";

  document.querySelectorAll("#modal-patient .field-error").forEach(el => el.classList.remove("active"));

  const patientId = idInput && idInput.value ? parseInt(idInput.value, 10) : null;
  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";

  let isValid = true;
  if (!name || name.length < 2 || name.length > 100) {
    document.getElementById("err-patient-name")?.classList.add("active");
    isValid = false;
  }
  if (phone && phone.length > 15) {
    document.getElementById("err-patient-phone")?.classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct the validation errors in the form.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Saving in MySQL...
    `;
  }

  try {
    const isEdit = !!patientId;
    const url = isEdit ? `/api/patients/${patientId}` : `/api/patients`;
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to save patient.`);
    }

    closeModal("modal-patient");
    showToast(isEdit ? `Patient #${patientId} updated successfully!` : `Patient "${name}" registered successfully!`, "success");

    // Refresh live patients list and update prescription/sale dropdowns
    await fetchLivePatients();
    populatePatientDropdownOptions();

  } catch (err) {
    console.error("Patient save error:", err);
    showToast(err.message || "Failed to save patient record in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

function openNewDoctorModal() {
  const form = document.getElementById("form-doctor");
  if (form) form.reset();
  const idInput = document.getElementById("doctor-id-input");
  if (idInput) idInput.value = "";
  const title = document.getElementById("modal-doctor-title");
  if (title) title.innerHTML = `
    <svg style="width:20px; height:20px; stroke:var(--primary); fill:none; stroke-width:2;" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
    Register Prescribing Doctor
  `;
  document.querySelectorAll("#modal-doctor .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-doctor");
}

function openEditDoctorModal(doctorId) {
  const doctor = liveDoctors.find(d => d.id === doctorId);
  if (!doctor) return;

  const form = document.getElementById("form-doctor");
  if (form) form.reset();
  document.querySelectorAll("#modal-doctor .field-error").forEach(el => el.classList.remove("active"));

  const idInput = document.getElementById("doctor-id-input");
  const nameInput = document.getElementById("doctor-name-input");
  const specInput = document.getElementById("doctor-specialization-input");
  const title = document.getElementById("modal-doctor-title");

  if (idInput) idInput.value = doctor.id;
  if (nameInput) nameInput.value = doctor.name;
  if (specInput) specInput.value = doctor.specialization || "";
  if (title) title.innerHTML = `
    <svg style="width:20px; height:20px; stroke:var(--primary); fill:none; stroke-width:2;" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
    Edit Doctor #DOC-${doctor.id}
  `;

  openModal("modal-doctor");
}

async function saveDoctor() {
  const idInput = document.getElementById("doctor-id-input");
  const nameInput = document.getElementById("doctor-name-input");
  const specInput = document.getElementById("doctor-specialization-input");
  const submitBtn = document.getElementById("btn-save-doctor");
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "Save Doctor";

  document.querySelectorAll("#modal-doctor .field-error").forEach(el => el.classList.remove("active"));

  const doctorId = idInput && idInput.value ? parseInt(idInput.value, 10) : null;
  const name = nameInput ? nameInput.value.trim() : "";
  const specialization = specInput ? specInput.value.trim() : "";

  let isValid = true;
  if (!name || name.length < 2 || name.length > 100) {
    document.getElementById("err-doctor-name")?.classList.add("active");
    isValid = false;
  }
  if (specialization && specialization.length > 100) {
    document.getElementById("err-doctor-specialization")?.classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct the validation errors in the form.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="pulse-dot" style="width:10px; height:10px; margin-right:6px; display:inline-block;"></span>
      Saving in MySQL...
    `;
  }

  try {
    const isEdit = !!doctorId;
    const url = isEdit ? `/api/doctors/${doctorId}` : `/api/doctors`;
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, specialization })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || `HTTP ${response.status}: Failed to save doctor.`);
    }

    closeModal("modal-doctor");
    showToast(isEdit ? `Doctor #${doctorId} updated successfully!` : `Doctor "${name}" registered successfully!`, "success");

    // Refresh live doctors list and update prescription dropdown
    await fetchLiveDoctors();
    populateDoctorDropdownOptions();

  } catch (err) {
    console.error("Doctor save error:", err);
    showToast(err.message || "Failed to save doctor record in MySQL.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// =====================================================================
// 7. Toast Notification Utility
// =====================================================================

function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
  toast.innerHTML = `
    <svg style="width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:2;" viewBox="0 0 24 24">
      ${type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' : '<polyline points="20 6 9 17 4 12"></polyline>'}
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
