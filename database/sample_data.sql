-- =====================================================================
-- Pharmacy Inventory and Prescription Management System
-- Sample / Demo Data (MySQL 8.0)
-- =====================================================================

USE pharmacy_db;

-- 1. Insert Categories
INSERT INTO categories (category_name, description) VALUES
('Antibiotics', 'Medicines that inhibit the growth of or destroy microorganisms'),
('Painkillers & Analgesics', 'Medicines used to achieve analgesia (relief from pain)'),
('Antihistamines', 'Medicines for allergy relief and cold symptoms'),
('Cardiovascular', 'Medications for heart and blood pressure management'),
('Vitamins & Supplements', 'Nutritional and dietary supplements');

-- 2. Insert Suppliers
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address) VALUES
('MedTech Pharma Distributors', 'Rajesh Sharma', '+91 9876543210', 'sales@medtechpharma.com', '12 Industrial Area, Phase 1, Mumbai'),
('Apex Health Logistics', 'Priya Patel', '+91 9823456781', 'orders@apexhealth.in', '44 Ring Road, Pune'),
('Sunrise Life Sciences', 'Amit Verma', '+91 9811223344', 'contact@sunriselife.com', '78 Sector 18, Gurugram');

-- 3. Insert Medicines
INSERT INTO medicines (name, generic_name, category_id, supplier_id, batch_number, expiry_date, unit_price, stock_quantity, reorder_level) VALUES
('Paracetamol 500mg', 'Acetaminophen', 2, 1, 'BATCH-PCM-2024A', '2027-05-30', 2.50, 150, 20),
('Amoxicillin 250mg', 'Amoxicillin Trihydrate', 1, 1, 'BATCH-AMX-8801', '2026-11-15', 8.00, 80, 15),
('Cetirizine 10mg', 'Cetirizine Hydrochloride', 3, 2, 'BATCH-CTZ-1022', '2028-01-20', 4.00, 120, 25),
('Amlodipine 5mg', 'Amlodipine Besylate', 4, 3, 'BATCH-AML-4490', '2027-08-10', 6.50, 60, 20),
('Vitamin C 500mg (Chewable)', 'Ascorbic Acid', 5, 2, 'BATCH-VTC-9003', '2026-12-31', 3.00, 200, 30),
('Ibuprofen 400mg', 'Ibuprofen', 2, 1, 'BATCH-IBU-3321', '2027-03-25', 5.00, 15, 20), -- Intentionally low stock (15 < 20) for demonstration!
('Azithromycin 500mg', 'Azithromycin', 1, 3, 'BATCH-AZI-6701', '2027-09-18', 18.00, 45, 10);

-- 4. Insert Customers / Patients
INSERT INTO customers (full_name, phone, email, gender, age, address) VALUES
('Rahul Mehta', '+91 9870011223', 'rahul.mehta@example.com', 'Male', 28, 'Flat 302, Green Park, Delhi'),
('Sneha Rao', '+91 9890044556', 'sneha.rao@example.com', 'Female', 34, 'Villa 8, Palm Meadows, Bengaluru'),
('Vikram Joshi', '+91 9765533221', 'vikram.j@example.com', 'Male', 62, '14 Station Road, Nagpur');

-- 5. Insert Doctors
INSERT INTO doctors (doctor_name, specialization, phone, license_number) VALUES
('Dr. Arvind Nair', 'General Physician', '+91 9820098200', 'MCI-2015-88941'),
('Dr. Kavita Kulkarni', 'Cardiologist', '+91 9830098300', 'MCI-2012-44120');

-- 6. Insert Prescriptions
INSERT INTO prescriptions (customer_id, doctor_id, prescription_date, notes, status) VALUES
(1, 1, '2026-10-18', 'Patient reported mild fever and headache.', 'Fulfilled'),
(3, 2, '2026-10-20', 'Hypertension follow-up routine prescription.', 'Active');

-- 7. Insert Prescription Items
INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration_days, quantity) VALUES
(1, 1, '500 mg', '3 times a day after food', 3, 9),
(1, 3, '10 mg', 'Once daily at bedtime', 5, 5),
(2, 4, '5 mg', 'Once daily in the morning', 30, 30);

-- 8. Insert a Completed Sale (for Bill demonstration)
INSERT INTO sales (customer_id, prescription_id, sale_date, total_amount, payment_method) VALUES
(1, 1, '2026-10-18 11:30:00', 42.50, 'UPI');

INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, subtotal) VALUES
(1, 1, 9, 2.50, 22.50),
(1, 3, 5, 4.00, 20.00);
