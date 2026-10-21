/**
 * PharmaCare Clinical Inventory & Prescription Management System
 * Vanilla JavaScript Frontend Logic & Clinical Mock Data Store
 */

// =====================================================================
// 1. Initial Mock Clinical Database State (Matches 9-Table Schema)
// =====================================================================

const MockDB = {
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
      doctorId: null, // OTC Walk-in
      prescriptionId: null,
      paymentMethod: "Cash",
      totalAmount: 17.50,
      items: [
        { batchId: 508, medicineName: "Vitamin C 500mg Chewable", qty: 5, unitPrice: 3.50, subtotal: 17.50 }
      ]
    }
  ]
};

// =====================================================================
// 2. Helper Utilities & Calculation Functions
// =====================================================================

// Returns days difference between current date and target date
function getDaysUntil(dateString) {
  const today = new Date("2026-10-21"); // Synchronized with system date
  const target = new Date(dateString);
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getBatchStatus(batch) {
  const days = getDaysUntil(batch.expiryDate);
  if (days < 0) return { label: "EXPIRED", type: "expired", days };
  if (days <= 30) return { label: `Expiring Soon (${days}d)`, type: "warning", days };
  if (batch.stock <= batch.reorderLevel) return { label: "Low Stock", type: "low-stock", days };
  return { label: "Valid", type: "in-stock", days };
}

function getMedicineTotalStock(medicineId) {
  return MockDB.batches
    .filter(b => b.medicineId === medicineId)
    .reduce((sum, b) => sum + b.stock, 0);
}

// =====================================================================
// 3. Application Initialization & Navigation
// =====================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initModals();
  refreshAllViews();
});

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
    });
  });

  // Global search handler
  const globalSearch = document.getElementById("global-search-input");
  if (globalSearch) {
    globalSearch.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      filterGlobalSearch(q);
    });
  }
}

// =====================================================================
// 4. View Rendering Functions
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
  renderReportsView();
  populateDropdownOptions();
}

// Dashboard Stat Cards
function renderDashboardStats() {
  const totalMeds = MockDB.medicines.length;
  const totalStock = MockDB.batches.reduce((sum, b) => sum + b.stock, 0);
  
  const lowStockBatches = MockDB.batches.filter(b => b.stock <= b.reorderLevel && getDaysUntil(b.expiryDate) >= 0);
  const expiringBatches = MockDB.batches.filter(b => getDaysUntil(b.expiryDate) <= 30);

  document.getElementById("stat-total-medicines").textContent = totalMeds;
  document.getElementById("stat-total-stock").textContent = totalStock.toLocaleString();
  document.getElementById("stat-low-stock").textContent = lowStockBatches.length;
  document.getElementById("stat-expiring").textContent = expiringBatches.length;

  // Sidebar badge for critical items
  const sidebarAlertBadge = document.getElementById("sidebar-alert-badge");
  if (sidebarAlertBadge) {
    const totalAlerts = lowStockBatches.length + expiringBatches.length;
    sidebarAlertBadge.textContent = totalAlerts;
    sidebarAlertBadge.style.display = totalAlerts > 0 ? "inline-block" : "none";
  }
}

// Critical Alerts Table on Dashboard
function renderCriticalAlerts() {
  const container = document.getElementById("dashboard-alerts-tbody");
  if (!container) return;

  const urgentBatches = MockDB.batches.filter(b => {
    const days = getDaysUntil(b.expiryDate);
    return days <= 30 || b.stock <= b.reorderLevel;
  });

  if (urgentBatches.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">No urgent expiry or stock warnings. All batches optimal.</td></tr>`;
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

// Recent Sales on Dashboard
function renderRecentSales() {
  const container = document.getElementById("dashboard-sales-tbody");
  if (!container) return;

  container.innerHTML = MockDB.sales.slice(-5).reverse().map(sale => {
    const patient = MockDB.patients.find(p => p.id === sale.patientId);
    return `
      <tr>
        <td><span class="font-mono">${sale.invoiceNumber}</span></td>
        <td>${patient ? patient.name : 'Walk-in Customer'}</td>
        <td>${sale.items.length} items</td>
        <td><strong>$${sale.totalAmount.toFixed(2)}</strong></td>
        <td><span class="badge-status badge-info">${sale.paymentMethod}</span></td>
      </tr>
    `;
  }).join("");
}

// Low Stock List with Progress Bar on Dashboard
function renderLowStockAlertList() {
  const container = document.getElementById("dashboard-lowstock-list");
  if (!container) return;

  const lowStock = MockDB.batches.filter(b => b.stock <= b.reorderLevel);

  if (lowStock.length === 0) {
    container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted);">Inventory levels healthy. No low stock alerts.</div>`;
    return;
  }

  container.innerHTML = lowStock.map(b => {
    const med = MockDB.medicines.find(m => m.id === b.medicineId);
    const pct = Math.min(100, Math.round((b.stock / (b.reorderLevel * 2)) * 100));
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
        <button class="btn btn-outline btn-sm" onclick="openRestockModal(${b.id})">Restock</button>
      </div>
    `;
  }).join("");
}

// Medicines Master Table View
function renderMedicinesTable() {
  const tbody = document.getElementById("medicines-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = MockDB.medicines.map(med => {
    const cat = MockDB.categories.find(c => c.id === med.categoryId);
    const totalStock = getMedicineTotalStock(med.id);
    const medBatches = MockDB.batches.filter(b => b.medicineId === med.id);
    
    let statusBadge = `<span class="badge-status badge-in-stock">In Stock (${totalStock})</span>`;
    if (totalStock === 0) {
      statusBadge = `<span class="badge-status badge-expired">Out of Stock</span>`;
    } else if (medBatches.some(b => b.stock <= b.reorderLevel)) {
      statusBadge = `<span class="badge-status badge-low-stock">Low Stock (${totalStock})</span>`;
    }

    return `
      <tr>
        <td><span class="font-mono">#MED-${med.id}</span></td>
        <td>
          <strong>${med.name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${med.generic}</div>
        </td>
        <td><span class="badge-status badge-info">${cat ? cat.name : 'Uncategorized'}</span></td>
        <td>${med.form} (${med.dosage})</td>
        <td><strong>${totalStock} units</strong></td>
        <td>${medBatches.length} batch(es)</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="switchView('batches', ${med.id})">View Batches</button>
        </td>
      </tr>
    `;
  }).join("");
}

// Batches & Inventory View
function renderBatchesTable(filterMedicineId = null) {
  const tbody = document.getElementById("batches-table-tbody");
  if (!tbody) return;

  let batches = MockDB.batches;
  if (filterMedicineId) {
    batches = batches.filter(b => b.medicineId === filterMedicineId);
  }

  tbody.innerHTML = batches.map(b => {
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
            ${status.days < 0 ? `Expired ${Math.abs(status.days)} days ago` : `${status.days} days remaining`}
          </span>
        </td>
        <td>$${b.purchasePrice.toFixed(2)}</td>
        <td><strong>$${b.sellingPrice.toFixed(2)}</strong></td>
        <td><strong>${b.stock}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(Min ${b.reorderLevel})</span></td>
        <td><span class="badge-status ${badgeClass}">${status.label}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="prepareSaleFromBatch(${b.id})" ${status.type === 'expired' || b.stock === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
            Dispense
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// Prescriptions View
function renderPrescriptionsView() {
  const container = document.getElementById("prescriptions-cards-container");
  if (!container) return;

  container.innerHTML = MockDB.prescriptions.map(rx => {
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
          <div style="display:flex; justify-content:space-between; margin-bottom: 12px; font-size:0.85rem;">
            <div><strong>Patient:</strong> ${patient ? patient.name : 'Unknown'} (${patient ? patient.age : '-'}y, ${patient ? patient.gender : '-'})</div>
            <div><strong>Doctor:</strong> ${doctor ? doctor.name : 'Unknown'}</div>
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

// Sales History Table
function renderSalesHistoryTable() {
  const tbody = document.getElementById("sales-table-tbody");
  if (!tbody) return;

  tbody.innerHTML = MockDB.sales.map(s => {
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
        <td><strong>$${s.totalAmount.toFixed(2)}</strong></td>
        <td><button class="btn btn-outline btn-sm" onclick="showInvoiceDetails(${s.id})">Print Slip</button></td>
      </tr>
    `;
  }).join("");
}

// Reports & Procedures Simulation View
function renderReportsView() {
  const lowStockTable = document.getElementById("report-lowstock-tbody");
  const expiryTable = document.getElementById("report-expiry-tbody");

  if (lowStockTable) {
    const lowStock = MockDB.batches.filter(b => b.stock <= b.reorderLevel);
    lowStockTable.innerHTML = lowStock.map(b => {
      const med = MockDB.medicines.find(m => m.id === b.medicineId);
      return `
        <tr>
          <td>${med ? med.name : 'Unknown'}</td>
          <td><span class="font-mono">${b.batchNumber}</span></td>
          <td><strong>${b.stock}</strong></td>
          <td>${b.reorderLevel}</td>
          <td><span class="badge-status badge-critical">Below Minimum</span></td>
        </tr>
      `;
    }).join("");
  }

  if (expiryTable) {
    const expiringBatches = MockDB.batches.filter(b => getDaysUntil(b.expiryDate) <= 60);
    expiryTable.innerHTML = expiringBatches.map(b => {
      const med = MockDB.medicines.find(m => m.id === b.medicineId);
      const days = getDaysUntil(b.expiryDate);
      return `
        <tr>
          <td>${med ? med.name : 'Unknown'}</td>
          <td><span class="font-mono">${b.batchNumber}</span></td>
          <td>${b.expiryDate}</td>
          <td>${b.stock} units</td>
          <td><span class="badge-status ${days < 0 ? 'badge-expired' : 'badge-low-stock'}">${days < 0 ? 'EXPIRED' : `${days} days left`}</span></td>
        </tr>
      `;
    }).join("");
  }
}

// =====================================================================
// 5. Interactive Modals & Forms
// =====================================================================

function initModals() {
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

  // Add Medicine Form Submission
  const formAddMed = document.getElementById("form-add-medicine");
  if (formAddMed) {
    formAddMed.addEventListener("submit", (e) => {
      e.preventDefault();
      saveNewMedicineAndBatch();
    });
  }

  // Record Sale Form Submission
  const formSale = document.getElementById("form-record-sale");
  if (formSale) {
    formSale.addEventListener("submit", (e) => {
      e.preventDefault();
      executeSaleTransaction();
    });
  }

  // Dynamic price calculation on sale modal batch selection
  const saleBatchSelect = document.getElementById("sale-batch-select");
  const saleQtyInput = document.getElementById("sale-quantity-input");
  if (saleBatchSelect && saleQtyInput) {
    saleBatchSelect.addEventListener("change", updateSaleModalCalculations);
    saleQtyInput.addEventListener("input", updateSaleModalCalculations);
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

  // Batch dropdown in Record Sale
  const batchSelect = document.getElementById("sale-batch-select");
  if (batchSelect) {
    batchSelect.innerHTML = `<option value="">-- Choose Medicine Batch --</option>` +
      MockDB.batches.map(b => {
        const med = MockDB.medicines.find(m => m.id === b.medicineId);
        const status = getBatchStatus(b);
        const isExpired = status.type === "expired";
        return `<option value="${b.id}" ${isExpired || b.stock === 0 ? 'disabled' : ''}>
          ${med ? med.name : 'Unknown'} | Batch: ${b.batchNumber} | Stock: ${b.stock} | $${b.sellingPrice.toFixed(2)} ${isExpired ? '(EXPIRED)' : ''}
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

function updateSaleModalCalculations() {
  const batchId = parseInt(document.getElementById("sale-batch-select").value);
  const qty = parseInt(document.getElementById("sale-quantity-input").value) || 0;
  const batch = MockDB.batches.find(b => b.id === batchId);

  const priceEl = document.getElementById("sale-unit-price-display");
  const subtotalEl = document.getElementById("sale-subtotal-display");
  const stockAlertEl = document.getElementById("sale-stock-warning");

  if (!batch) {
    priceEl.textContent = "$0.00";
    subtotalEl.textContent = "$0.00";
    stockAlertEl.textContent = "";
    return;
  }

  priceEl.textContent = `$${batch.sellingPrice.toFixed(2)}`;
  const total = batch.sellingPrice * qty;
  subtotalEl.textContent = `$${total.toFixed(2)}`;

  if (qty > batch.stock) {
    stockAlertEl.textContent = `⚠️ Error: Requested quantity (${qty}) exceeds available stock (${batch.stock})!`;
    stockAlertEl.style.color = "var(--danger)";
  } else {
    stockAlertEl.textContent = `✓ Stock available: ${batch.stock} units in batch`;
    stockAlertEl.style.color = "var(--success)";
  }
}

// =====================================================================
// 6. Action Handlers (Add Medicine, Record Sale, Dispense Rx)
// =====================================================================

function saveNewMedicineAndBatch() {
  const name = document.getElementById("new-med-name").value.trim();
  const generic = document.getElementById("new-med-generic").value.trim();
  const categoryId = parseInt(document.getElementById("new-med-category").value);
  const formType = document.getElementById("new-med-form").value;
  const dosage = document.getElementById("new-med-dosage").value.trim();

  const batchNumber = document.getElementById("new-batch-number").value.trim();
  const expiryDate = document.getElementById("new-batch-expiry").value;
  const purchasePrice = parseFloat(document.getElementById("new-batch-purchase").value);
  const sellingPrice = parseFloat(document.getElementById("new-batch-selling").value);
  const stock = parseInt(document.getElementById("new-batch-stock").value);
  const reorderLevel = parseInt(document.getElementById("new-batch-reorder").value);

  if (!name || !batchNumber || !expiryDate || isNaN(stock)) {
    showToast("Please fill all required clinical medicine and batch fields.", "error");
    return;
  }

  const newMedId = 100 + MockDB.medicines.length + 1;
  const newBatchId = 500 + MockDB.batches.length + 1;

  MockDB.medicines.push({
    id: newMedId,
    name,
    generic: generic || name,
    categoryId,
    form: formType,
    dosage: dosage || "Standard"
  });

  MockDB.batches.push({
    id: newBatchId,
    medicineId: newMedId,
    batchNumber,
    expiryDate,
    purchasePrice: purchasePrice || 0,
    sellingPrice: sellingPrice || 0,
    stock,
    reorderLevel: reorderLevel || 10
  });

  closeModal("modal-add-medicine");
  document.getElementById("form-add-medicine").reset();
  refreshAllViews();
  showToast(`Medicine "${name}" and Batch #${batchNumber} added successfully!`, "success");
}

function executeSaleTransaction() {
  const batchId = parseInt(document.getElementById("sale-batch-select").value);
  const qty = parseInt(document.getElementById("sale-quantity-input").value);
  const patientId = parseInt(document.getElementById("sale-patient-select").value) || null;
  const paymentMethod = document.getElementById("sale-payment-method").value;

  if (!batchId || isNaN(qty) || qty <= 0) {
    showToast("Please choose a valid medicine batch and quantity > 0.", "error");
    return;
  }

  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) {
    showToast("Selected batch not found.", "error");
    return;
  }

  // Trigger check simulation: Prevent overselling
  if (qty > batch.stock) {
    showToast(`Transaction Rejected: Insufficient stock (${batch.stock} available).`, "error");
    return;
  }

  // Trigger check simulation: Prevent selling expired items
  if (getDaysUntil(batch.expiryDate) < 0) {
    showToast("Transaction Blocked: This batch is EXPIRED and cannot be sold!", "error");
    return;
  }

  // Deduct inventory stock (after_saleitem_insert simulation)
  batch.stock -= qty;

  const med = MockDB.medicines.find(m => m.id === batch.medicineId);
  const subtotal = batch.sellingPrice * qty;
  const invoiceNum = `INV-2026-${1050 + MockDB.sales.length}`;

  MockDB.sales.push({
    id: 600 + MockDB.sales.length + 1,
    invoiceNumber: invoiceNum,
    date: "2026-10-21 13:45",
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
  showToast(`Sale completed! Invoice ${invoiceNum} generated. Stock updated.`, "success");
}

function dispensePrescription(rxId) {
  const rx = MockDB.prescriptions.find(r => r.id === rxId);
  if (!rx) return;

  rx.status = "Fulfilled";
  refreshAllViews();
  showToast(`Prescription ${rx.rxNumber} marked as Fulfilled and dispensed to patient.`, "success");
}

function prepareSaleFromBatch(batchId) {
  openModal("modal-record-sale");
  const select = document.getElementById("sale-batch-select");
  if (select) {
    select.value = batchId;
    updateSaleModalCalculations();
  }
}

function openRestockModal(batchId) {
  const batch = MockDB.batches.find(b => b.id === batchId);
  if (!batch) return;

  const added = 50;
  batch.stock += added;
  refreshAllViews();
  showToast(`Received restock shipment of +${added} units for batch ${batch.batchNumber}.`, "success");
}

function switchView(viewName, filterMedicineId = null) {
  const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
  if (navItem) navItem.click();

  if (viewName === "batches" && filterMedicineId) {
    renderBatchesTable(filterMedicineId);
  }
}

function showInvoiceDetails(saleId) {
  const sale = MockDB.sales.find(s => s.id === saleId);
  if (!sale) return;
  alert(`=== CLINICAL PHARMACY SALES RECEIPT ===\nInvoice: ${sale.invoiceNumber}\nDate: ${sale.date}\nPayment: ${sale.paymentMethod}\nTotal Paid: $${sale.totalAmount.toFixed(2)}\nItems:\n${sale.items.map(i => `- ${i.medicineName} x ${i.qty} = $${i.subtotal.toFixed(2)}`).join("\n")}`);
}

function filterGlobalSearch(term) {
  if (!term) {
    refreshAllViews();
    return;
  }
  // Filter medicines table
  const tbody = document.getElementById("medicines-table-tbody");
  if (tbody) {
    const filtered = MockDB.medicines.filter(m => 
      m.name.toLowerCase().includes(term) || 
      m.generic.toLowerCase().includes(term)
    );
    tbody.innerHTML = filtered.map(med => {
      const cat = MockDB.categories.find(c => c.id === med.categoryId);
      const totalStock = getMedicineTotalStock(med.id);
      return `
        <tr>
          <td><span class="font-mono">#MED-${med.id}</span></td>
          <td><strong>${med.name}</strong><div style="font-size:0.75rem; color:var(--text-muted);">${med.generic}</div></td>
          <td><span class="badge-status badge-info">${cat ? cat.name : '-'}</span></td>
          <td>${med.form} (${med.dosage})</td>
          <td><strong>${totalStock} units</strong></td>
          <td>-</td>
          <td><span class="badge-status badge-in-stock">Available</span></td>
          <td><button class="btn btn-outline btn-sm" onclick="switchView('batches', ${med.id})">Batches</button></td>
        </tr>
      `;
    }).join("");
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
