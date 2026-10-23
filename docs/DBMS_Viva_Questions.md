# 🎓 DBMS Viva & Project Defense Guide

**Institution**: Geethanjali College of Engineering and Technology  
**Department**: Computer Science and Engineering  
**Course**: Database Management Systems (Course Code: 25CS21003)  
**Project**: Pharmacy Inventory and Prescription Management System  

---

## 1. Primary Keys and Foreign Keys

### Q1: What are Primary Keys and Foreign Keys, and what are they in your schema?
* **Primary Key (PK)**: A column or set of columns that uniquely identifies each row in a table. A PK enforces entity integrity, must contain unique values, and cannot contain `NULL`.
* **Foreign Key (FK)**: A column in one table that references the Primary Key of another table, enforcing referential integrity.
* **In `pharmacy_db`**:
  | Table | Primary Key | Foreign Key(s) | Referenced Table |
  | :--- | :--- | :--- | :--- |
  | `category` | `category_id` | *None* | — |
  | `medicine` | `medicine_id` | `category_id` | `category(category_id)` |
  | `medicinebatch` | `batch_id` | `medicine_id` | `medicine(medicine_id)` |
  | `patient` | `patient_id` | *None* | — |
  | `doctor` | `doctor_id` | *None* | — |
  | `prescription` | `prescription_id` | `patient_id`<br>`doctor_id` | `patient(patient_id)`<br>`doctor(doctor_id)` |
  | `prescriptionitem` | `prescription_item_id` | `prescription_id`<br>`medicine_id` | `prescription(prescription_id)`<br>`medicine(medicine_id)` |
  | `sale` | `sale_id` | `patient_id` | `patient(patient_id)` |
  | `saleitem` | `sale_item_id` | `sale_id`<br>`batch_id` | `sale(sale_id)`<br>`medicinebatch(batch_id)` |

---

## 2. Entity-Relationship (ER) Diagrams and Cardinality

### Q2: What are the relationships and cardinalities in your ER design?
* **One-to-Many (1:N)**:
  - `category` to `medicine`: One therapeutic category (e.g. Antibiotics) contains multiple medicines. Each medicine belongs to exactly one category.
  - `medicine` to `medicinebatch`: One medicine formulation has multiple physical shipment batches. Each batch is for one medicine.
  - `patient` to `prescription`: One patient can receive multiple prescriptions over time.
  - `doctor` to `prescription`: One doctor issues multiple prescriptions.
  - `patient` to `sale`: One patient can make multiple purchases.
* **Many-to-Many (M:N) Resolved by Junction Tables**:
  - `prescription` and `medicine`: A prescription contains multiple medicines; a medicine appears in multiple prescriptions. Resolved via **`prescriptionitem`** (`prescription_id` FK, `medicine_id` FK).
  - `sale` and `medicinebatch`: A sale includes multiple batches; a batch can be dispensed across multiple sales. Resolved via **`saleitem`** (`sale_id` FK, `batch_id` FK).

---

## 3. Database Normalization (1NF, 2NF, 3NF)

### Q3: What is Normalization and how does your database achieve 3NF?
* **Definition**: Normalization is the systematic technique of structuring relational schemas to minimize data redundancy and eliminate insert, update, and delete anomalies.
* **First Normal Form (1NF)**:
  - All attribute values are atomic (e.g., patient phone numbers and prescription dosage instructions are stored as single values; no comma-separated arrays).
  - Each record is uniquely identifiable by a Primary Key.
* **Second Normal Form (2NF)**:
  - In 1NF and contains no partial dependencies (every non-key attribute is fully functionally dependent on the entire Primary Key).
  - In `prescriptionitem` and `saleitem`, synthetic surrogate PKs (`prescription_item_id`, `sale_item_id`) are used, and line item attributes (`quantity`, `dosage`, `unit_price`) depend directly on their respective row PK.
* **Third Normal Form (3NF)**:
  - In 2NF and contains no transitive dependencies (non-key attributes depend only on the Primary Key, and not on other non-key attributes).
  - Example: `category_name` is stored in `category`, not repeated in `medicine`. `doctor_name` and `specialization` are stored in `doctor`, not repeated in `prescription`. `unit_price` of a batch is stored in `medicinebatch`, eliminating redundant price duplication across the catalog.

---

## 4. SQL Joins

### Q4: Which SQL joins are used in the application and why?
* **`INNER JOIN`**:
  - Used when both tables must have matching records.
  - *Example*: In `GetLowStock()`, joining `medicinebatch b JOIN medicine m ON b.medicine_id = m.medicine_id` to retrieve the formulation name for low-stock batches.
  - *Example*: In `GET /api/prescriptions/:id`, joining `prescriptionitem` with `medicine` to display prescribed medicine names.
* **`LEFT JOIN`**:
  - Used when the left table records should be preserved even if related records do not exist.
  - *Example*: In `GET /api/sales`, `sale LEFT JOIN patient` ensures walk-in customer purchases without a registered patient ID are displayed with `'Walk-in Customer'`.
  - *Example*: In `GET /api/medicines`, `medicine LEFT JOIN medicinebatch` ensures newly created medicines without any batches yet still appear in the catalog with 0 stock units.
* **Aggregation Joins (`GROUP BY`)**:
  - Used with `SUM(quantity)` and `COUNT(*)` to calculate total stock units across batches without corrupting individual batch records.

---

## 5. Database Triggers

### Q5: What are Triggers and which triggers are active in `pharmacy_db`?
* **Definition**: A Trigger is a procedural SQL program stored in the database that automatically executes (fires) in response to a specified DML event (`INSERT`, `UPDATE`, or `DELETE`) on a particular table.
* **1. `check_sale_stock` (BEFORE INSERT on `saleitem`)**:
  - Validates business constraints before data is committed.
  - Checks if `NEW.quantity > available_stock`. If true, raises `SIGNAL SQLSTATE '45000'` with message `'Insufficient stock for this batch'`.
  - Checks if `batch_exp < CURDATE()`. If true, raises `'Cannot sell expired medicine'`.
* **2. `after_saleitem_insert` (AFTER INSERT on `saleitem`)**:
  - Executes automatic state synchronization across related tables.
  - Decrements physical batch stock: `UPDATE medicinebatch SET quantity = quantity - NEW.quantity WHERE batch_id = NEW.batch_id`.
  - Accumulates gross sale amount: `UPDATE sale SET total_amount = total_amount + (NEW.quantity * NEW.unit_price) WHERE sale_id = NEW.sale_id`.

---

## 6. Stored Procedures

### Q6: What are Stored Procedures and what procedures exist in your project?
* **Definition**: A Stored Procedure is a prepared SQL code block compiled and stored on the database server that can be executed repeatedly with `CALL ProcedureName()`. It reduces network traffic and centralizes business reporting logic on the database engine.
* **1. `GetLowStock()`**:
  - Audits all batches whose inventory is below the critical threshold of 30 units:
    ```sql
    CREATE PROCEDURE GetLowStock()
    BEGIN
        SELECT m.medicine_name, b.batch_number, b.quantity
        FROM medicinebatch b
        JOIN medicine m ON b.medicine_id = m.medicine_id
        WHERE b.quantity < 30;
    END;
    ```
* **2. `GetExpiryReport()`**:
  - Audits all batches nearing expiration within a 90-day window (`expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)`):
    ```sql
    CREATE PROCEDURE GetExpiryReport()
    BEGIN
        SELECT m.medicine_name, b.batch_number, b.quantity, b.expiry_date
        FROM medicinebatch b
        JOIN medicine m ON b.medicine_id = m.medicine_id
        WHERE b.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY);
    END;
    ```

---

## 7. Transactions and Rollback (ACID Properties)

### Q7: How does your application ensure ACID properties and rollback?
* **ACID Properties**:
  1. **Atomicity**: In multi-item sales, all `saleitem` inserts and inventory deductions must succeed together. If any item is out of stock, `connection.rollback()` reverts the entire transaction.
  2. **Consistency**: Database constraints (`quantity >= 0`, foreign key checks) are never violated.
  3. **Isolation**: When dispensing, referenced batch rows are locked using `SELECT ... FOR UPDATE`, preventing race conditions between concurrent billing counters.
  4. **Durability**: Once `connection.commit()` finishes, MySQL InnoDB engine writes changes to redologs, ensuring survival against sudden crashes or power cuts.

---

## 8. Stock Validation and Automatic Stock Deduction

### Q8: How is duplicate stock deduction avoided?
* In some naive implementations, developers write an `UPDATE medicinebatch SET quantity = ...` in the Node.js backend while also having an `AFTER INSERT` trigger on MySQL, causing stock to be deducted twice.
* In our architecture, **stock deduction is delegated exclusively to the MySQL trigger (`after_saleitem_insert`)**.
* The Node.js server only performs input validation and inserts `saleitem` records inside a transaction. The database trigger handles the subtraction atomically.
* Automated tests in `backend/test_all_workflows.js` (Workflow 7) explicitly verify that selling 4 units from 60 units leaves exactly 56 units.

---

## 9. Why MySQL is Used

### Q9: Why was MySQL chosen over NoSQL (like MongoDB) for this project?
1. **Relational Rigor & Integrity**: A pharmacy system requires strict foreign key relationships between medicines, batches, prescriptions, and sales. Relational RDBMS guarantees referential integrity.
2. **ACID Compliance**: Financial billing and inventory deduction cannot afford "eventual consistency" common in NoSQL systems. MySQL InnoDB provides full ACID guarantees.
3. **Trigger & Procedure Capabilities**: Complex business rules (preventing expired medicine sales, auto-decrementing inventory, generating regulatory reports) can be enforced directly within the database engine via Triggers and Stored Procedures.
4. **Structured Query Language (SQL)**: Powerful relational joins (`INNER JOIN`, `LEFT JOIN`, `GROUP BY`) allow instant generation of compliance reports and inventory audits.
