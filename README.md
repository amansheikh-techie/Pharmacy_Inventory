# 🏥 PharmaCare Rx — Pharmacy Inventory and Prescription Management System

[![Database](https://img.shields.io/badge/Database-MySQL%208.0-blue?style=flat&logo=mysql)](https://www.mysql.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green?style=flat&logo=node.js)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange?style=flat&logo=javascript)](https://developer.mozilla.org/)
[![License](https://img.shields.io/badge/License-Academic%20DBMS%20PBL-emerald?style=flat)]()

A comprehensive, full-stack database management system (DBMS) project designed for hospital pharmacies and retail dispensaries. Manages medicine formulations, batch-level expiry tracking, doctor prescriptions, patient registries, and point-of-sale (POS) billing with automated stock deduction triggers.

---

## 🌟 Key Highlights & DBMS Features

* **3NF Normalized Relational Database (MySQL 8.0)**:
  - 9 normalized entities eliminating redundancy and anomalies.
  - Resolves Many-to-Many relationships via associative junction tables (`PrescriptionItem`, `SaleItem`).
* **Batch-Level Traceability (FEFO)**:
  - Tracks individual shipments with unique batch numbers, expiry dates, purchase costs, and reorder levels.
  - Prioritizes dispensing using **First-Expiry, First-Out (FEFO)** principles.
* **Database Triggers**:
  - `check_sale_stock`: Prevents overselling and dispensing expired medication (`SIGNAL SQLSTATE '45000'`).
  - `after_saleitem_insert`: Automatically synchronizes and deducts inventory stock.
* **Stored Procedures**:
  - `CALL GetLowStock()`: Reports batches at or below their reorder threshold.
  - `CALL GetExpiryReport()`: Flags batches nearing expiry (within 30/60 days) or already expired.
* **Clinical Pharmacy Dashboard UI**:
  - Bespoke modern clinical theme (emerald primary, deep forest-green navigation, soft mint background).
  - Real-time search, category dropdowns, quality status filters, and interactive prescription fulfillment.

---

## 📁 Repository Structure

```text
Pharmacy_Inventory/
├── database/                   # MySQL 8.0 Relational Database Scripts
│   ├── schema.sql              # Table definitions (DDL), primary & foreign keys, constraints
│   ├── sample_data.sql         # Demo records for clinical medicines, doctors, and prescriptions
│   └── test_queries.sql        # Verification queries, joins, FEFO audits, and procedure calls
│
├── backend/                    # Node.js + Express API Server
│   ├── config/
│   │   └── db.js               # MySQL2 connection pool with async/await
│   ├── routes/
│   │   ├── medicineRoutes.js   # Medicine catalog & batch inventory endpoints
│   │   ├── salesRoutes.js      # POS billing transaction endpoints
│   │   ├── prescriptionRoutes.js # Doctor prescription management
│   │   └── reportRoutes.js     # Stored procedure report endpoints
│   ├── .env.example            # Environment variables template (keeps passwords safe)
│   ├── package.json            # Dependencies (express, mysql2, dotenv)
│   └── server.js               # Express application entry point
│
├── frontend/                   # Clinical User Interface
│   ├── css/
│   │   └── style.css           # Bespoke emerald & forest-green clinical theme
│   ├── js/
│   │   └── app.js              # Vanilla JS interactivity, search/filters, modals & validation
│   └── index.html              # Clinical dispensary single-page application shell
│
├── docs/                       # Project Defense & College Submission Materials
│   ├── API_Documentation.md    # REST API endpoints, schemas, and request/response samples
│   ├── DBMS_Viva_Questions.md  # 3NF normalization, ACID properties, and viva answers
│   └── ER_Diagram_notes.md     # Entities, attributes, and cardinality documentation
│
├── .gitignore                  # Excludes node_modules and .env secrets from Git
└── README.md                   # Comprehensive project documentation
```

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: 8.0 or higher
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/amansheikh-techie/Pharmacy_Inventory.git
cd Pharmacy_Inventory
```

### 3. Database Setup (MySQL)
Open MySQL Workbench or your terminal:
```sql
SOURCE database/schema.sql;
SOURCE database/sample_data.sql;
```

### 4. Backend Configuration
Navigate to the `backend/` folder and install dependencies:
```bash
cd backend
npm install
```

Copy the environment template and add your local MySQL credentials:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pharmacy_db
DB_PORT=3306
```

### 5. Run the Application
```bash
node server.js
```
Open your browser at:
👉 **`http://localhost:5000`**

### 6. Run Automated Test Suites
Run the comprehensive automated test suites to verify database integrity, stored procedures, triggers, and APIs:
```bash
# Dashboard & Reports Verification (Phase 5A)
node backend/test_dashboard_reports_api.js

# Medicine Inventory & Batches Verification
node backend/test_medicine_api.js

# Sales & Billing POS Verification (Triggers & Stock Deductions)
node backend/test_sales_api.js

# Prescription Management Verification
node backend/test_prescription_api.js

# Patient & Doctor Management Verification
node backend/test_patient_doctor_api.js
```

---

## 📚 Project Documentation

* [API Documentation](docs/API_Documentation.md)
* [DBMS Viva Questions & Defense Notes](docs/DBMS_Viva_Questions.md)
* [Entity-Relationship (ER) Architecture](docs/ER_Diagram_notes.md)
* [SQL Verification Queries](database/test_queries.sql)

---

## 👨‍💻 Author
**Aman Sheikh**  
GitHub: [@amansheikh-techie](https://github.com/amansheikh-techie)
