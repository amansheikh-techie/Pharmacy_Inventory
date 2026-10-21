# DBMS Viva & Project Defense Guide

Essential database concepts and answers for the **Pharmacy Inventory and Prescription Management System** project examination.

---

## 1. Relational Database Concepts

### Q1: What is Normalization and what normal form does this database achieve?
* **Answer**: Normalization is the systematic process of organizing data in a database to reduce redundancy and eliminate undesirable update, insert, and delete anomalies.
* **Our Project**: Achieves **Third Normal Form (3NF)**:
  - **1NF**: All columns contain atomic (indivisible) values. No repeating groups.
  - **2NF**: In 1NF and all non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
  - **3NF**: In 2NF and no non-key attribute is transitively dependent on the primary key. For example, Category and Doctor details are separated into their own tables (`Category`, `Doctor`) rather than repeated in `Medicine` or `Prescription`.

### Q2: Why is `MedicineBatch` separated from `Medicine`?
* **Answer**: In real-world clinical pharmacies, one medicine (e.g. Paracetamol 500mg) arrives in multiple shipments over time. Each shipment has a distinct **Batch Number**, **Manufacturing Date**, **Expiry Date**, and **Purchase Cost**. Storing these directly in `Medicine` would violate 2NF and cause massive data duplication. A 1:N relationship between `Medicine` and `MedicineBatch` cleanly tracks inventory at the batch level.

### Q3: How is the Many-to-Many relationship between `Prescription` and `Medicine` handled?
* **Answer**: A prescription can include multiple medicines, and a medicine can appear in multiple prescriptions (M:N). In relational database theory, M:N relationships cannot be modeled directly with foreign keys in either table. We decompose it into two 1:N relationships using an associative junction table: **`PrescriptionItem`**.

---

## 2. Integrity Constraints & Business Logic

### Q4: What are the primary keys and foreign keys in this system?
* **Category**: `CategoryID` (PK)
* **Medicine**: `MedicineID` (PK), `CategoryID` (FK)
* **MedicineBatch**: `BatchID` (PK), `MedicineID` (FK)
* **Patient**: `PatientID` (PK)
* **Doctor**: `DoctorID` (PK)
* **Prescription**: `PrescriptionID` (PK), `PatientID` (FK), `DoctorID` (FK)
* **PrescriptionItem**: `ItemID` (PK), `PrescriptionID` (FK), `MedicineID` (FK)
* **Sale**: `SaleID` (PK), `PatientID` (FK), `PrescriptionID` (FK)
* **SaleItem**: `SaleItemID` (PK), `SaleID` (FK), `BatchID` (FK)

### Q5: What is the purpose of the `check_sale_stock` Trigger?
* **Answer**: A `BEFORE INSERT ON SaleItem` trigger verifies that the requested purchase quantity is $\le$ available batch stock and that the batch expiry date is $> \text{CURDATE()}$. If violated, it uses `SIGNAL SQLSTATE '45000'` to reject the transaction and prevent overselling or dispensing expired medicines.

### Q6: What does the `after_saleitem_insert` Trigger do?
* **Answer**: An `AFTER INSERT ON SaleItem` trigger automatically executes an `UPDATE MedicineBatch SET QuantityInStock = QuantityInStock - NEW.Quantity WHERE BatchID = NEW.BatchID` to keep inventory counts synchronized.

---

## 3. Transaction Management (ACID Properties)

### Q7: How does the billing process satisfy ACID properties?
1. **Atomicity**: The bill creation (`INSERT INTO Sale`), item logging (`INSERT INTO SaleItem`), and inventory decrement (`UPDATE MedicineBatch`) are wrapped in `START TRANSACTION; ... COMMIT;`. If any step fails, `ROLLBACK;` reverts all changes.
2. **Consistency**: Database constraints (e.g. `QuantityInStock >= 0`) are never violated.
3. **Isolation**: Row locking (`SELECT ... FOR UPDATE`) prevents two cashiers from simultaneously selling the same last remaining units of a batch.
4. **Durability**: Once `COMMIT;` completes, records are written to MySQL transaction logs and survive power failures.
