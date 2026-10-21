# Entity-Relationship (ER) Design Notes

This document explains the database design for your **Pharmacy Inventory and Prescription Management System**. It is designed to help you prepare your project report and answer DBMS viva questions.

---

## 1. Entities & Their Role

| Entity | Primary Key | Description |
| :--- | :--- | :--- |
| **`categories`** | `category_id` | Types of medicines (Antibiotics, Analgesics, etc.) |
| **`suppliers`** | `supplier_id` | Medicine wholesale vendors / distributors |
| **`medicines`** | `medicine_id` | Inventory stock of each medicine |
| **`customers`** | `customer_id` | Patients / retail buyers |
| **`doctors`** | `doctor_id` | Medical practitioners issuing prescriptions |
| **`prescriptions`** | `prescription_id` | Header document representing a medical prescription |
| **`prescription_items`**| `item_id` | Specific medicines prescribed (resolves M:N relationship) |
| **`sales`** | `sale_id` | Billing transaction header |
| **`sale_items`** | `sale_item_id` | Line items of each medicine bought in a bill |

---

## 2. Relationships Explained Simply

1. **Category to Medicine (1 : N - One to Many)**
   - One category can have multiple medicines.
   - Each medicine belongs to exactly one category.

2. **Supplier to Medicine (1 : N - One to Many)**
   - One supplier can supply multiple medicines.
   - Each medicine record is tracked to its primary supplier.

3. **Doctor to Prescription (1 : N - One to Many)**
   - One doctor can write many prescriptions.
   - Each prescription is issued by one doctor.

4. **Customer to Prescription (1 : N - One to Many)**
   - One customer/patient can have multiple prescriptions over time.
   - Each prescription belongs to one customer.

5. **Prescription to Medicine (M : N - Many to Many)**
   - A prescription can contain multiple medicines.
   - A medicine can appear in multiple prescriptions.
   - *DBMS Concept*: In relational databases, Many-to-Many relationships cannot be stored cleanly in a single table. We break it into two 1:N relationships using an **associative/junction table**: **`prescription_items`**.

6. **Sale to Medicine (M : N - Many to Many)**
   - One customer sale/bill can contain multiple medicines.
   - One medicine can be sold across multiple customer bills.
   - Broken down using the junction table **`sale_items`**.

---

## 3. Key DBMS Concepts in this Design

* **Primary Key (PK)**: Uniquely identifies each record (e.g., `medicine_id`).
* **Foreign Key (FK)**: Enforces referential integrity by pointing to a primary key in another table (e.g., `category_id` in `medicines` references `category_id` in `categories`).
* **Normalization (3NF)**: Redundant data is removed. For example, instead of repeating doctor addresses in every prescription row, we store doctors once in the `doctors` table and link via `doctor_id`.
* **Triggers / Business Logic**:
  - Deduct stock from `medicines.stock_quantity` whenever a sale is completed.
  - Low stock warning triggered whenever `stock_quantity <= reorder_level`.
