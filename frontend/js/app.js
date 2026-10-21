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
  fetchLiveMedicines(); // Phase 3C: Fetch real medicines from MySQL
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

      // Phase 3C: When navigating to medicines tab, fetch latest records from MySQL
      if (targetView === "medicines") {
        fetchLiveMedicines();
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

// Dashboard Statistics (Recalculates from active MockDB state)
function renderDashboardStats() {
  const totalMeds = MockDB.medicines.length;
  const totalStock = MockDB.batches.reduce((sum, b) => sum + b.stock, 0);
  
  const lowStockBatches = MockDB.batches.filter(b => b.stock <= b.reorderLevel && getDaysUntil(b.expiryDate) >= 0);
  const expiringBatches = MockDB.batches.filter(b => getDaysUntil(b.expiryDate) <= 30);

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

// Dashboard Recent Sales Table
function renderRecentSales() {
  const container = document.getElementById("dashboard-sales-tbody");
  if (!container) return;

  if (MockDB.sales.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="empty-table-state"><div class="empty-table-title">No Sales Recorded Yet</div><div class="empty-table-sub">Use 'New Dispense / Sale' to record a transaction.</div></td></tr>`;
    return;
  }

  container.innerHTML = MockDB.sales.slice(-5).reverse().map(sale => {
    const patient = MockDB.patients.find(p => p.id === sale.patientId);
    return `
      <tr>
        <td><span class="font-mono">${sale.invoiceNumber}</span></td>
        <td>${patient ? patient.name : 'Walk-in Customer'}</td>
        <td>${sale.items.length} item(s)</td>
        <td><strong>₹${sale.totalAmount.toFixed(2)}</strong></td>
        <td><span class="badge-status badge-info">${sale.paymentMethod}</span></td>
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

// Medicines Master Table with Search & Category Filter
function renderMedicinesTable() {
  const tbody = document.getElementById("medicines-table-tbody");
  if (!tbody) return;

// =====================================================================
// Phase 3C: Live MySQL Medicines State & Fetcher
// =====================================================================
let liveMedicines = [];
let isMedicinesLoading = false;
let medicinesApiError = null;

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
    populateLiveCategoryFilter();
  } catch (err) {
    console.error('Phase 3C API Error:', err);
    isMedicinesLoading = false;
    medicinesApiError = err.message || 'Network / Database Error';
    renderMedicinesTable();
  }
}

function populateLiveCategoryFilter() {
  const catFilter = document.getElementById("medicine-category-filter");
  if (!catFilter || liveMedicines.length === 0) return;

  // Extract unique categories from live medicines
  const categoriesMap = new Map();
  liveMedicines.forEach(m => {
    if (m.categoryId && m.categoryName) {
      categoriesMap.set(m.categoryId, m.categoryName);
    }
  });

  const currentVal = catFilter.value;
  catFilter.innerHTML = `<option value="">All Categories</option>` +
    Array.from(categoriesMap.entries()).map(([id, name]) => `<option value="${id}">${name}</option>`).join("");
  catFilter.value = currentVal;
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
            <button class="btn btn-primary btn-sm" onclick="switchView('batches')" title="View Batches">
              Batches
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Inventory & Batches Table with Search & Status Filter
function renderBatchesTable(filterMedicineId = null) {
  const tbody = document.getElementById("batches-table-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("batch-search-input");
  const statusFilter = document.getElementById("batch-status-filter");
  const countDisplay = document.getElementById("batch-count-display");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  let batches = MockDB.batches;
  if (filterMedicineId) {
    batches = batches.filter(b => b.medicineId === filterMedicineId);
  }

  let filtered = batches.filter(b => {
    const med = MockDB.medicines.find(m => m.id === b.medicineId);
    const medName = med ? med.name.toLowerCase() : "";
    const matchesSearch = query === "" || 
      b.batchNumber.toLowerCase().includes(query) || 
      medName.includes(query);

    const status = getBatchStatus(b);
    let matchesStatus = true;
    if (selectedStatus === "in-stock") matchesStatus = status.type === "in-stock";
    else if (selectedStatus === "low-stock") matchesStatus = b.stock <= b.reorderLevel;
    else if (selectedStatus === "warning") matchesStatus = status.type === "warning";
    else if (selectedStatus === "expired") matchesStatus = status.type === "expired";

    return matchesSearch && matchesStatus;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${MockDB.batches.length} batches`;
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
    const med = MockDB.medicines.find(m => m.id === b.medicineId);
    const status = getBatchStatus(b);

    let badgeClass = "badge-in-stock";
    if (status.type === "expired") badgeClass = "badge-expired";
    else if (status.type === "warning") badgeClass = "badge-low-stock";
    else if (status.type === "low-stock") badgeClass = "badge-critical";

    return `
      <tr>
        <td><span class="font-mono font-bold">${b.batchNumber}</span></td>
        <td><strong>${med ? med.name : 'Unknown'}</strong></td>
        <td>${b.expiryDate}</td>
        <td>
          <span style="font-weight:600; color:${status.days < 0 ? 'var(--danger)' : status.days <= 30 ? 'var(--warning)' : 'inherit'};">
            ${status.days < 0 ? `Expired ${Math.abs(status.days)}d ago` : `${status.days}d remaining`}
          </span>
        </td>
        <td>₹${b.purchasePrice.toFixed(2)}</td>
        <td><strong>₹${b.sellingPrice.toFixed(2)}</strong></td>
        <td><strong>${b.stock}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Min ${b.reorderLevel})</span></td>
        <td><span class="badge-status ${badgeClass}">${status.label}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn btn-outline btn-sm" onclick="openEditBatchModal(${b.id})" title="Edit Stock / Price">
              Edit
            </button>
            <button class="btn btn-primary btn-sm" onclick="prepareSaleFromBatch(${b.id})" ${status.type === 'expired' || b.stock === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} title="Dispense Medication">
              Dispense
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// Prescriptions View with Search & Status Filter
function renderPrescriptionsView() {
  const container = document.getElementById("prescriptions-cards-container");
  if (!container) return;

  const searchInput = document.getElementById("rx-search-input");
  const statusFilter = document.getElementById("rx-status-filter");

  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  let filtered = MockDB.prescriptions.filter(rx => {
    const patient = MockDB.patients.find(p => p.id === rx.patientId);
    const doctor = MockDB.doctors.find(d => d.id === rx.doctorId);
    const patientName = patient ? patient.name.toLowerCase() : "";
    const doctorName = doctor ? doctor.name.toLowerCase() : "";
    const diag = rx.diagnosis.toLowerCase();
    const rxNum = rx.rxNumber.toLowerCase();

    const matchesSearch = query === "" || 
      patientName.includes(query) || 
      doctorName.includes(query) || 
      diag.includes(query) ||
      rxNum.includes(query);

    const matchesStatus = selectedStatus === "" || rx.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="content-card">
        <div class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
          <div class="empty-table-title">No prescriptions found</div>
          <div class="empty-table-sub">Try searching for a different patient, physician, or status.</div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(rx => {
    const patient = MockDB.patients.find(p => p.id === rx.patientId);
    const doctor = MockDB.doctors.find(d => d.id === rx.doctorId);

    const itemsList = rx.items.map(item => {
      const med = MockDB.medicines.find(m => m.id === item.medicineId);
      return `
        <li style="padding: 6px 0; border-bottom: 1px dashed var(--border-light); font-size:0.83rem;">
          <strong>${med ? med.name : 'Medicine'}</strong> — ${item.dosage} | ${item.frequency} | Qty: <strong>${item.qty}</strong>
        </li>
      `;
    }).join("");

    return `
      <div class="content-card" style="margin-bottom: 18px;">
        <div class="card-header">
          <h3>
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Prescription ${rx.rxNumber}
          </h3>
          <span class="badge-status ${rx.status === 'Fulfilled' ? 'badge-in-stock' : 'badge-low-stock'}">${rx.status}</span>
        </div>
        <div style="padding: 16px 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 12px; font-size:0.85rem; flex-wrap:wrap; gap:8px;">
            <div><strong>Patient:</strong> ${patient ? patient.name : 'Unknown'} (${patient ? patient.age : '-'}y, ${patient ? patient.gender : '-'})</div>
            <div><strong>Doctor:</strong> ${doctor ? doctor.name : 'Unknown'} (${doctor ? doctor.specialization : ''})</div>
            <div><strong>Date:</strong> ${rx.date}</div>
          </div>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom: 12px;"><strong>Diagnosis:</strong> ${rx.diagnosis}</p>
          <div style="background-color:#f8fafc; padding:12px 16px; border-radius:var(--radius-md); border:1px solid var(--border);">
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-muted); margin-bottom:6px;">Rx Medications:</div>
            <ul style="list-style:none; padding:0; margin:0;">
              ${itemsList}
            </ul>
          </div>
          <div style="margin-top:14px; display:flex; justify-content:flex-end; gap:10px;">
            ${rx.status === 'Active' ? `
              <button class="btn btn-primary btn-sm" onclick="dispensePrescription(${rx.id})">
                Dispense Prescription
              </button>
            ` : `
              <span style="font-size:0.8rem; color:var(--success); font-weight:600;">✓ Fully Dispensed & Billed</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Sales History Table with Search
function renderSalesHistoryTable() {
  const tbody = document.getElementById("sales-table-tbody");
  if (!tbody) return;

  const searchInput = document.getElementById("sale-search-input");
  const countDisplay = document.getElementById("sales-count-display");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

  let filtered = MockDB.sales.filter(s => {
    const patient = MockDB.patients.find(p => p.id === s.patientId);
    const patientName = patient ? patient.name.toLowerCase() : "walk-in";
    const inv = s.invoiceNumber.toLowerCase();
    const pay = s.paymentMethod.toLowerCase();

    return query === "" || 
      inv.includes(query) || 
      patientName.includes(query) || 
      pay.includes(query);
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${MockDB.sales.length} sales`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-table-state">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle></svg>
          <div class="empty-table-title">No sales records found</div>
          <div class="empty-table-sub">Try searching with a different invoice number or patient name.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const patient = MockDB.patients.find(p => p.id === s.patientId);
    const doctor = MockDB.doctors.find(d => d.id === s.doctorId);
    const itemsSummary = s.items.map(i => `${i.medicineName} (${i.qty})`).join(", ");

    return `
      <tr>
        <td><span class="font-mono font-bold">${s.invoiceNumber}</span></td>
        <td>${s.date}</td>
        <td>${patient ? patient.name : 'Walk-in Cash Customer'}</td>
        <td>${doctor ? doctor.name : 'OTC Self-Medication'}</td>
        <td style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${itemsSummary}">${itemsSummary}</td>
        <td><span class="badge-status badge-info">${s.paymentMethod}</span></td>
        <td><strong>₹${s.totalAmount.toFixed(2)}</strong></td>
        <td><button class="btn btn-outline btn-sm" onclick="showInvoiceDetails(${s.id})">Print Receipt</button></td>
      </tr>
    `;
  }).join("");
}

// Patients Table
function renderPatientsTable() {
  const tbody = document.getElementById("patients-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = MockDB.patients.map(p => `
    <tr>
      <td><span class="font-mono">#PAT-${p.id}</span></td>
      <td><strong>${p.name}</strong></td>
      <td>${p.phone}</td>
      <td>${p.age} yrs, ${p.gender}</td>
      <td>${p.history}</td>
    </tr>
  `).join("");
}

// Doctors Table
function renderDoctorsTable() {
  const tbody = document.getElementById("doctors-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = MockDB.doctors.map(d => `
    <tr>
      <td><span class="font-mono">#DOC-${d.id}</span></td>
      <td><strong>${d.name}</strong></td>
      <td>${d.specialization}</td>
      <td><span class="font-mono">${d.license}</span></td>
      <td>${d.phone}</td>
    </tr>
  `).join("");
}

// Stored Procedures Simulation Reports
function renderReportsView() {
  const lowStockTable = document.getElementById("report-lowstock-tbody");
  const expiryTable = document.getElementById("report-expiry-tbody");

  if (lowStockTable) {
    const lowStock = MockDB.batches.filter(b => b.stock <= b.reorderLevel);
    if (lowStock.length === 0) {
      lowStockTable.innerHTML = `<tr><td colspan="5" class="empty-table-state"><div class="empty-table-title">No Low Stock Items</div></td></tr>`;
    } else {
      lowStockTable.innerHTML = lowStock.map(b => {
        const med = MockDB.medicines.find(m => m.id === b.medicineId);
        return `
          <tr>
            <td>${med ? med.name : 'Unknown'}</td>
            <td><span class="font-mono">${b.batchNumber}</span></td>
            <td><strong>${b.stock} units</strong></td>
            <td>${b.reorderLevel} units</td>
            <td><span class="badge-status badge-critical">Below Minimum</span></td>
          </tr>
        `;
      }).join("");
    }
  }

  if (expiryTable) {
    const expiringBatches = MockDB.batches.filter(b => getDaysUntil(b.expiryDate) <= 60);
    if (expiringBatches.length === 0) {
      expiryTable.innerHTML = `<tr><td colspan="5" class="empty-table-state"><div class="empty-table-title">No Batches Expiring in Next 60 Days</div></td></tr>`;
    } else {
      expiryTable.innerHTML = expiringBatches.map(b => {
        const med = MockDB.medicines.find(m => m.id === b.medicineId);
        const days = getDaysUntil(b.expiryDate);
        return `
          <tr>
            <td>${med ? med.name : 'Unknown'}</td>
            <td><span class="font-mono">${b.batchNumber}</span></td>
            <td>${b.expiryDate}</td>
            <td>${b.stock} units</td>
            <td><span class="badge-status ${days < 0 ? 'badge-expired' : 'badge-low-stock'}">${days < 0 ? 'EXPIRED' : `${days}d left`}</span></td>
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

  // Sale Modal Dynamic Price Calculation
  const saleBatchSelect = document.getElementById("sale-batch-select");
  const saleQtyInput = document.getElementById("sale-quantity-input");
  if (saleBatchSelect && saleQtyInput) {
    saleBatchSelect.addEventListener("change", updateSaleModalCalculations);
    saleQtyInput.addEventListener("input", updateSaleModalCalculations);
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
  // Category dropdown in Add Medicine
  const catSelect = document.getElementById("new-med-category");
  if (catSelect) {
    catSelect.innerHTML = MockDB.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  // Category filter dropdown in Medicines View
  const catFilter = document.getElementById("medicine-category-filter");
  if (catFilter) {
    const currentVal = catFilter.value;
    catFilter.innerHTML = `<option value="">All Categories</option>` +
      MockDB.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    catFilter.value = currentVal;
  }

  // Category dropdown in Edit Medicine Modal
  const editCatSelect = document.getElementById("edit-med-category");
  if (editCatSelect) {
    editCatSelect.innerHTML = MockDB.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  // Batch dropdown in Record Sale
  const batchSelect = document.getElementById("sale-batch-select");
  if (batchSelect) {
    batchSelect.innerHTML = `<option value="">-- Choose Medicine Batch --</option>` +
      MockDB.batches.map(b => {
        const med = MockDB.medicines.find(m => m.id === b.medicineId);
        const status = getBatchStatus(b);
        const isExpired = status.type === "expired";
        return `<option value="${b.id}" ${isExpired || b.stock === 0 ? 'disabled' : ''}>
          ${med ? med.name : 'Unknown'} | Batch: ${b.batchNumber} | Stock: ${b.stock} | ₹${b.sellingPrice.toFixed(2)} ${isExpired ? '(EXPIRED)' : ''}
        </option>`;
      }).join("");
  }

  // Patient dropdown in Record Sale
  const patientSelect = document.getElementById("sale-patient-select");
  if (patientSelect) {
    patientSelect.innerHTML = `<option value="0">Walk-in Customer (Over-The-Counter)</option>` +
      MockDB.patients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join("");
  }
}

// Dynamic Bill Calculator in POS Modal
function updateSaleModalCalculations() {
  const batchId = parseInt(document.getElementById("sale-batch-select").value);
  const qty = parseInt(document.getElementById("sale-quantity-input").value) || 0;
  const batch = MockDB.batches.find(b => b.id === batchId);

  const priceEl = document.getElementById("sale-unit-price-display");
  const subtotalEl = document.getElementById("sale-subtotal-display");
  const stockAlertEl = document.getElementById("sale-stock-warning");

  if (!batch) {
    priceEl.textContent = "₹0.00";
    subtotalEl.textContent = "₹0.00";
    stockAlertEl.textContent = "";
    return;
  }

  priceEl.textContent = `₹${batch.sellingPrice.toFixed(2)}`;
  const total = batch.sellingPrice * qty;
  subtotalEl.textContent = `₹${total.toFixed(2)}`;

  if (qty > batch.stock) {
    stockAlertEl.textContent = `⚠️ Error: Requested quantity (${qty}) exceeds available stock (${batch.stock})!`;
    stockAlertEl.style.color = "var(--danger)";
  } else if (qty <= 0) {
    stockAlertEl.textContent = `⚠️ Quantity must be at least 1 unit.`;
    stockAlertEl.style.color = "var(--danger)";
  } else {
    stockAlertEl.textContent = `✓ Stock available: ${batch.stock} units in batch`;
    stockAlertEl.style.color = "var(--success)";
  }
}

// =====================================================================
// 6. Action Handlers (Add, Edit, View, Sale, Restock)
// =====================================================================

// Action: Save New Medicine and Batch (With Client-Side Validation)
function saveNewMedicineAndBatch() {
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
  document.querySelectorAll(".field-error").forEach(el => el.classList.remove("active"));

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

  const stock = parseInt(stockInput.value);
  if (isNaN(stock) || stock < 0) {
    document.getElementById("err-new-batch-stock").classList.add("active");
    isValid = false;
  }

  const reorderLevel = parseInt(reorderInput.value);
  if (isNaN(reorderLevel) || reorderLevel < 1) {
    document.getElementById("err-new-batch-reorder").classList.add("active");
    isValid = false;
  }

  if (!isValid) {
    showToast("Please correct validation errors highlighted in the form.", "error");
    return;
  }

  // Create new unique IDs
  const newMedId = 100 + MockDB.medicines.length + 1;
  const newBatchId = 500 + MockDB.batches.length + 1;

  MockDB.medicines.push({
    id: newMedId,
    name,
    generic: genericInput.value.trim() || name,
    categoryId: parseInt(catInput.value),
    form: formInput.value,
    dosage: dosageInput.value.trim() || "Standard"
  });

  MockDB.batches.push({
    id: newBatchId,
    medicineId: newMedId,
    batchNumber,
    expiryDate,
    purchasePrice,
    sellingPrice,
    stock,
    reorderLevel
  });

  closeModal("modal-add-medicine");
  document.getElementById("form-add-medicine").reset();
  refreshAllViews();
  showToast(`Medicine "${name}" and Batch #${batchNumber} added successfully to inventory!`, "success");
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

// Action: Open Edit Medicine Modal
function openEditMedicineModal(medId) {
  const med = MockDB.medicines.find(m => m.id === medId);
  if (!med) return;

  document.getElementById("edit-med-id").value = med.id;
  document.getElementById("edit-med-name").value = med.name;
  document.getElementById("edit-med-generic").value = med.generic;
  document.getElementById("edit-med-category").value = med.categoryId;
  document.getElementById("edit-med-form").value = med.form;
  document.getElementById("edit-med-dosage").value = med.dosage;

  document.querySelectorAll("#modal-edit-medicine .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-edit-medicine");
}

// Action: Save Edited Medicine Formulation
function saveEditedMedicine() {
  const medId = parseInt(document.getElementById("edit-med-id").value);
  const name = document.getElementById("edit-med-name").value.trim();
  const generic = document.getElementById("edit-med-generic").value.trim();
  const categoryId = parseInt(document.getElementById("edit-med-category").value);
  const form = document.getElementById("edit-med-form").value;
  const dosage = document.getElementById("edit-med-dosage").value.trim();

  document.querySelectorAll("#modal-edit-medicine .field-error").forEach(el => el.classList.remove("active"));

  if (!name) {
    document.getElementById("err-edit-med-name").classList.add("active");
    return;
  }
  if (!generic) {
    document.getElementById("err-edit-med-generic").classList.add("active");
    return;
  }

  const med = MockDB.medicines.find(m => m.id === medId);
  if (!med) return;

  med.name = name;
  med.generic = generic;
  med.categoryId = categoryId;
  med.form = form;
  med.dosage = dosage || "Standard";

  closeModal("modal-edit-medicine");
  refreshAllViews();
  showToast(`Medicine formulation "#MED-${medId}" updated successfully!`, "success");
}

// Action: Open Edit Batch Modal
function openEditBatchModal(batchId) {
  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) return;

  document.getElementById("edit-batch-id").value = batch.id;
  document.getElementById("edit-batch-number").value = batch.batchNumber;
  document.getElementById("edit-batch-expiry").value = batch.expiryDate;
  document.getElementById("edit-batch-selling").value = batch.sellingPrice.toFixed(2);
  document.getElementById("edit-batch-stock").value = batch.stock;
  document.getElementById("edit-batch-reorder").value = batch.reorderLevel;

  document.querySelectorAll("#modal-edit-batch .field-error").forEach(el => el.classList.remove("active"));
  openModal("modal-edit-batch");
}

// Action: Save Edited Batch Details
function saveEditedBatch() {
  const batchId = parseInt(document.getElementById("edit-batch-id").value);
  const expiryDate = document.getElementById("edit-batch-expiry").value;
  const sellingPrice = parseFloat(document.getElementById("edit-batch-selling").value);
  const stock = parseInt(document.getElementById("edit-batch-stock").value);
  const reorderLevel = parseInt(document.getElementById("edit-batch-reorder").value);

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

  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) return;

  batch.expiryDate = expiryDate;
  batch.sellingPrice = sellingPrice;
  batch.stock = stock;
  batch.reorderLevel = reorderLevel || 10;

  closeModal("modal-edit-batch");
  refreshAllViews();
  showToast(`Batch "${batch.batchNumber}" updated. Dashboard metrics recalculated.`, "success");
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

// Action: Record Sale Transaction (POS)
function executeSaleTransaction() {
  const batchId = parseInt(document.getElementById("sale-batch-select").value);
  const qty = parseInt(document.getElementById("sale-quantity-input").value);
  const patientId = parseInt(document.getElementById("sale-patient-select").value) || null;
  const paymentMethod = document.getElementById("sale-payment-method").value;

  document.querySelectorAll("#modal-record-sale .field-error").forEach(el => el.classList.remove("active"));

  if (!batchId) {
    document.getElementById("err-sale-batch").classList.add("active");
    return;
  }

  if (isNaN(qty) || qty <= 0) {
    document.getElementById("err-sale-qty").classList.add("active");
    return;
  }

  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) {
    showToast("Selected batch was not found.", "error");
    return;
  }

  // Prevent overselling
  if (qty > batch.stock) {
    showToast(`Transaction Blocked: Requested ${qty} units, but only ${batch.stock} are available!`, "error");
    return;
  }

  // Prevent selling expired medicine
  if (getDaysUntil(batch.expiryDate) < 0) {
    showToast("Clinical Safety Warning: This batch is EXPIRED and cannot be dispensed!", "error");
    return;
  }

  // Deduct inventory stock
  batch.stock -= qty;

  const med = MockDB.medicines.find(m => m.id === batch.medicineId);
  const subtotal = batch.sellingPrice * qty;
  const invoiceNum = `INV-2026-${1050 + MockDB.sales.length}`;

  MockDB.sales.push({
    id: 600 + MockDB.sales.length + 1,
    invoiceNumber: invoiceNum,
    date: "2026-10-21 13:58",
    patientId: patientId,
    doctorId: null,
    prescriptionId: null,
    paymentMethod,
    totalAmount: subtotal,
    items: [
      { batchId: batch.id, medicineName: med ? med.name : 'Medicine', qty, unitPrice: batch.sellingPrice, subtotal }
    ]
  });

  closeModal("modal-record-sale");
  document.getElementById("form-record-sale").reset();
  refreshAllViews();
  showToast(`Bill ${invoiceNum} generated! Deducted ${qty} units from Batch ${batch.batchNumber}.`, "success");
}

// Action: Dispense Doctor Prescription
function dispensePrescription(rxId) {
  const rx = MockDB.prescriptions.find(r => r.id === rxId);
  if (!rx) return;

  rx.status = "Fulfilled";
  refreshAllViews();
  showToast(`Prescription ${rx.rxNumber} dispensed and marked as Fulfilled.`, "success");
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

// Receipt Alert Pop-up
function showInvoiceDetails(saleId) {
  const sale = MockDB.sales.find(s => s.id === saleId);
  if (!sale) return;
  alert(
    `========================================\n` +
    `  PHARMACARE CLINICAL SALES RECEIPT     \n` +
    `========================================\n` +
    `Invoice: ${sale.invoiceNumber}\n` +
    `Date:    ${sale.date}\n` +
    `Payment: ${sale.paymentMethod}\n` +
    `----------------------------------------\n` +
    `Items Dispensed:\n` +
    sale.items.map(i => `  • ${i.medicineName} x ${i.qty} = ₹${i.subtotal.toFixed(2)}`).join("\n") + "\n" +
    `----------------------------------------\n` +
    `TOTAL AMOUNT: ₹${sale.totalAmount.toFixed(2)}\n` +
    `========================================\n` +
    `Thank you for choosing PharmaCare Rx!`
  );
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
