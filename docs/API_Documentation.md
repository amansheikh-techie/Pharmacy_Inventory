# PharmaCare Rx — REST API Documentation

This document describes the backend RESTful API endpoints for the **Pharmacy Inventory and Prescription Management System**.

---

## Base URL
```text
http://localhost:5000/api
```

---

## 1. System Health
### `GET /health`
Returns the operational status of the server.

* **Response (`200 OK`)**:
  ```json
  {
    "status": "online",
    "timestamp": "2026-10-21T08:26:28.817Z",
    "system": "PharmaCare Clinical Inventory & Prescription Management"
  }
  ```

---

## 2. Medicines & Batches

### `GET /medicines`
Retrieves all medicine formulations with aggregated total stock units and batch counts from MySQL.
* **Query Parameters**:
  - `search` (optional): Filter by medicine name or manufacturer (case-insensitive LIKE search)
  - `category` (optional): Filter by `category_id`

* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      {
        "id": 1,
        "name": "Paracetamol",
        "manufacturer": "ABC Pharma",
        "categoryId": 1,
        "categoryName": "Tablets",
        "totalStock": 148,
        "batchCount": 2
      }
    ]
  }
  ```

### `GET /medicines/categories`
Retrieves all active categories from the MySQL `category` table.

* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 5,
    "data": [
      { "id": 1, "name": "Tablets" },
      { "id": 2, "name": "Syrups" },
      { "id": 3, "name": "Capsules" },
      { "id": 4, "name": "Injections" },
      { "id": 5, "name": "Ointments" }
    ]
  }
  ```

### `GET /medicines/:id`
Retrieves a single medicine record with its category details and linked active batches from `medicinebatch`.

* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Paracetamol",
      "manufacturer": "ABC Pharma",
      "categoryId": 1,
      "categoryName": "Tablets",
      "totalStock": 148,
      "batchCount": 2,
      "batches": [
        {
          "id": 1,
          "batchNumber": "PAR101",
          "quantity": 98,
          "unitPrice": "2.50",
          "expiryDate": "2027-06-30"
        }
      ]
    }
  }
  ```

### `POST /medicines`
Registers a new medicine in the MySQL `medicine` table.
Optionally accepts initial batch details, which are atomically inserted into `medicinebatch` using a database transaction.

* **Request Body (Pure Medicine)**:
  ```json
  {
    "name": "Amoxicillin 500mg",
    "categoryId": 3,
    "manufacturer": "GlaxoSmithKline"
  }
  ```
* **Request Body (With Initial Batch)**:
  ```json
  {
    "name": "Augmentin 625mg",
    "categoryId": 1,
    "manufacturer": "GSK Pharma",
    "batchNumber": "BATCH-AUG-991",
    "expiryDate": "2028-05-30",
    "quantity": 100,
    "unitPrice": 7.50
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Medicine and initial batch registered successfully.",
    "data": {
      "id": 6,
      "name": "Augmentin 625mg",
      "categoryId": 1,
      "categoryName": "Tablets",
      "totalStock": 100,
      "batchCount": 1,
      "initialBatch": {
        "id": 7,
        "batchNumber": "BATCH-AUG-991",
        "quantity": 100,
        "unitPrice": 7.5,
        "expiryDate": "2028-05-30"
      }
    }
  }
  ```

### `PUT /medicines/:id`
Updates an existing medicine record in the MySQL `medicine` table using parameterized queries.

* **URL Parameters**:
  - `id`: Unique medicine identifier (integer)
* **Request Body**:
  ```json
  {
    "name": "Paracetamol 650mg",
    "categoryId": 1,
    "manufacturer": "Apex Pharma Ltd"
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Medicine updated successfully.",
    "data": {
      "id": 1,
      "name": "Paracetamol 650mg",
      "manufacturer": "Apex Pharma Ltd",
      "categoryId": 1,
      "categoryName": "Tablets",
      "totalStock": 148,
      "batchCount": 2
    }
  }
  ```
* **Error Responses**:
  - `400 Bad Request`: Empty name, invalid ID, or non-existent category reference.
  - `404 Not Found`: Medicine ID does not exist in MySQL.
  - `409 Conflict`: Unique constraint violation.


---

## 3. Inventory & Batches (FEFO Traceability)

### `GET /batches`
Retrieves all medicine inventory batches sorted by earliest expiry date (**First-Expiry, First-Out**).
* **Query Parameters**:
  - `search` (optional): Filter by batch number, medicine name, or manufacturer.
  - `medicineId` (optional): Filter batches for a specific medicine.
  - `status` (optional): `in-stock`, `low-stock`, `warning` (≤ 30d), `expired` (< 0d).

* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "count": 6,
    "data": [
      {
        "id": 4,
        "medicineId": 3,
        "medicineName": "Cough Syrup",
        "manufacturer": "HealthCare Ltd",
        "categoryName": "Syrups",
        "batchNumber": "COU101",
        "stock": 40,
        "unitPrice": "85.00",
        "sellingPrice": "85.00",
        "expiryDate": "2027-01-31",
        "daysToExpiry": 100,
        "reorderLevel": 30,
        "statusType": "in-stock",
        "statusLabel": "Good / In Stock"
      }
    ]
  }
  ```

### `GET /batches/:id`
Retrieves a single batch record by its primary key (`batch_id`).

### `POST /batches`
Registers a new batch for an existing medicine record.
* **Request Body**:
  ```json
  {
    "medicineId": 1,
    "batchNumber": "PAR-2027-X",
    "expiryDate": "2028-06-30",
    "unitPrice": 3.50,
    "quantity": 100
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Batch #PAR-2027-X registered successfully.",
    "data": {
      "id": 8,
      "medicineId": 1,
      "medicineName": "Paracetamol",
      "batchNumber": "PAR-2027-X",
      "stock": 100,
      "unitPrice": "3.50",
      "expiryDate": "2028-06-30",
      "daysToExpiry": 615,
      "statusType": "in-stock",
      "statusLabel": "Good / In Stock"
    }
  }
  ```

### `PUT /batches/:id`
Updates an existing batch's stock quantity, selling price, and expiry date.
* **Request Body**:
  ```json
  {
    "batchNumber": "PAR-2027-X",
    "expiryDate": "2028-07-31",
    "unitPrice": 3.75,
    "quantity": 120
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Batch #PAR-2027-X updated successfully.",
    "data": { ... }
  }
  ```

### `DELETE /batches/:id`
Deletes a batch if no sales transactions have been recorded for it.

---

## 4. Sales & Billing (POS)

### `GET /sales`
Retrieves the historical sales audit ledger with customer and prescribing doctor records.

### `POST /sales`
Processes a dispensary sale transaction.
* Locks the batch row to prevent race conditions.
* Validates that requested quantity is in stock.
* Verifies that the batch is not expired.
* Creates `Sale` and `SaleItem` records.
* Decrements stock in `MedicineBatch`.
* Marks associated `Prescription` as `Fulfilled`.

* **Request Body**:
  ```json
  {
    "patientId": 201,
    "prescriptionId": 401,
    "paymentMethod": "UPI",
    "batchId": 501,
    "quantity": 2
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "message": "Sale completed successfully",
    "saleId": 603,
    "totalAmount": 6.00,
    "remainingStock": 178
  }
  ```

---

## 4. Prescriptions

### `GET /prescriptions`
Retrieves doctor prescriptions with patient details and status.

### `PUT /prescriptions/:id/dispense`
Updates prescription status to `Fulfilled`.

---

## 5. Stored Procedures & Audit Reports

### `GET /reports/low-stock`
Calls MySQL stored procedure `CALL GetLowStock()` returning batches where `QuantityInStock <= ReorderLevel`.

### `GET /reports/expiry`
Calls MySQL stored procedure `CALL GetExpiryReport()` returning batches expiring within 60 days or already expired.
