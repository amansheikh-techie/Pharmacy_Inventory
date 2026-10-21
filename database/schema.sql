-- =====================================================================
-- Pharmacy Inventory and Prescription Management System
-- Database Schema Script (MySQL 8.0)
-- =====================================================================

-- Step 1: Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- =====================================================================
-- Table 1: Categories
-- Purpose: Groups medicines (e.g., Antibiotics, Painkillers, Vitamins)
-- =====================================================================
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Table 2: Suppliers
-- Purpose: Stores vendor details from whom medicines are purchased
-- =====================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Table 3: Medicines (Inventory)
-- Purpose: Tracks medicine stock, prices, batch numbers, and expiry dates
-- =====================================================================
CREATE TABLE IF NOT EXISTS medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    category_id INT,
    supplier_id INT,
    batch_number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INT NOT NULL DEFAULT 10,  -- Triggers low stock alert when stock <= reorder_level
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints ensure data integrity
    CONSTRAINT fk_medicine_category FOREIGN KEY (category_id) 
        REFERENCES categories(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_medicine_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(supplier_id) ON DELETE SET NULL
);

-- =====================================================================
-- Table 4: Customers (Patients)
-- Purpose: Stores patient/customer profile details
-- =====================================================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    gender ENUM('Male', 'Female', 'Other'),
    age INT CHECK (age > 0 AND age <= 130),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Table 5: Doctors
-- Purpose: Stores prescribing doctors and their medical license numbers
-- =====================================================================
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_name VARCHAR(150) NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- Table 6: Prescriptions (Header)
-- Purpose: Records doctor prescriptions issued to customers
-- =====================================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    doctor_id INT NOT NULL,
    prescription_date DATE NOT NULL,
    notes TEXT,
    status ENUM('Active', 'Fulfilled', 'Cancelled') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_prescription_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE RESTRICT,
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors(doctor_id) ON DELETE RESTRICT
);

-- =====================================================================
-- Table 7: Prescription Items (Details)
-- Purpose: Resolves Many-to-Many relationship between Prescriptions & Medicines
-- Each row specifies a medicine prescribed, dosage, and duration
-- =====================================================================
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(100) NOT NULL,          -- e.g., '500 mg'
    frequency VARCHAR(100) NOT NULL,       -- e.g., 'Twice daily after meals'
    duration_days INT NOT NULL,            -- e.g., 5
    quantity INT NOT NULL CHECK (quantity > 0),
    
    CONSTRAINT fk_item_prescription FOREIGN KEY (prescription_id) 
        REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT
);

-- =====================================================================
-- Table 8: Sales (Billing Master)
-- Purpose: Records financial sales transactions
-- =====================================================================
CREATE TABLE IF NOT EXISTS sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,                  -- NULL allows walk-in customer sales
    prescription_id INT NULL,              -- NULL allows over-the-counter purchases
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_method ENUM('Cash', 'Card', 'UPI') NOT NULL DEFAULT 'Cash',
    
    CONSTRAINT fk_sale_customer FOREIGN KEY (customer_id) 
        REFERENCES customers(customer_id) ON DELETE SET NULL,
    CONSTRAINT fk_sale_prescription FOREIGN KEY (prescription_id) 
        REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
);

-- =====================================================================
-- Table 9: Sale Items (Billing Line Items)
-- Purpose: Details each medicine sold, unit price, quantity, and subtotal
-- =====================================================================
CREATE TABLE IF NOT EXISTS sale_items (
    sale_item_id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    CONSTRAINT fk_saleitem_sale FOREIGN KEY (sale_id) 
        REFERENCES sales(sale_id) ON DELETE CASCADE,
    CONSTRAINT fk_saleitem_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicines(medicine_id) ON DELETE RESTRICT
);
