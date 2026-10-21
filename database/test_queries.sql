-- =====================================================================
-- Pharmacy Inventory and Prescription Management System
-- Database Verification & SQL Testing Queries
-- =====================================================================

USE pharmacy_db;

-- ---------------------------------------------------------------------
-- 1. Inventory Summary with Category and Supplier Joins
-- ---------------------------------------------------------------------
SELECT 
    m.MedicineID,
    m.MedicineName,
    m.GenericName,
    c.CategoryName,
    COUNT(b.BatchID) AS TotalBatches,
    COALESCE(SUM(b.QuantityInStock), 0) AS TotalUnitsInStock,
    CASE 
        WHEN COALESCE(SUM(b.QuantityInStock), 0) = 0 THEN 'OUT OF STOCK'
        WHEN COALESCE(SUM(b.QuantityInStock), 0) <= 20 THEN 'LOW STOCK WARNING'
        ELSE 'OPTIMAL'
    END AS StockStatus
FROM Medicine m
LEFT JOIN Category c ON m.CategoryID = c.CategoryID
LEFT JOIN MedicineBatch b ON m.MedicineID = b.MedicineID
GROUP BY m.MedicineID, m.MedicineName, m.GenericName, c.CategoryName
ORDER BY m.MedicineName ASC;

-- ---------------------------------------------------------------------
-- 2. FEFO (First-Expiry, First-Out) Priority Batch Query
-- ---------------------------------------------------------------------
SELECT 
    b.BatchID,
    b.BatchNumber,
    m.MedicineName,
    b.ExpiryDate,
    DATEDIFF(b.ExpiryDate, CURDATE()) AS DaysRemaining,
    b.QuantityInStock,
    b.SellingPrice,
    CASE 
        WHEN b.ExpiryDate < CURDATE() THEN 'EXPIRED - DO NOT DISPENSE'
        WHEN b.ExpiryDate <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'EXPIRING SOON'
        ELSE 'VALID STOCK'
    END AS QualityStatus
FROM MedicineBatch b
JOIN Medicine m ON b.MedicineID = m.MedicineID
WHERE b.QuantityInStock > 0
ORDER BY b.ExpiryDate ASC;

-- ---------------------------------------------------------------------
-- 3. Doctor Prescription Fulfillment Analysis
-- ---------------------------------------------------------------------
SELECT 
    pr.PrescriptionID,
    pr.PrescriptionDate,
    p.PatientName,
    d.DoctorName,
    d.Specialization,
    pr.Status,
    COUNT(pi.ItemID) AS PrescribedMedicationsCount
FROM Prescription pr
JOIN Patient p ON pr.PatientID = p.PatientID
JOIN Doctor d ON pr.DoctorID = d.DoctorID
LEFT JOIN PrescriptionItem pi ON pr.PrescriptionID = pi.PrescriptionID
GROUP BY pr.PrescriptionID, pr.PrescriptionDate, p.PatientName, d.DoctorName, d.Specialization, pr.Status
ORDER BY pr.PrescriptionDate DESC;

-- ---------------------------------------------------------------------
-- 4. Point-of-Sale (POS) Revenue Audit
-- ---------------------------------------------------------------------
SELECT 
    s.SaleID,
    s.SaleDate,
    COALESCE(p.PatientName, 'Walk-in Cash Customer') AS Customer,
    s.PaymentMethod,
    s.TotalAmount,
    COUNT(si.SaleItemID) AS LineItemsCount
FROM Sale s
LEFT JOIN Patient p ON s.PatientID = p.PatientID
LEFT JOIN SaleItem si ON s.SaleID = si.SaleID
GROUP BY s.SaleID, s.SaleDate, p.PatientName, s.PaymentMethod, s.TotalAmount
ORDER BY s.SaleDate DESC;

-- ---------------------------------------------------------------------
-- 5. Stored Procedure Executions
-- ---------------------------------------------------------------------
-- CALL GetLowStock();
-- CALL GetExpiryReport();
