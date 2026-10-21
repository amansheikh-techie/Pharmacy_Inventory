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
Retrieves all medicine formulations with aggregated total stock units and batch counts.

* **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 101,
      "name": "Paracetamol 500mg",
      "generic": "Acetaminophen",
      "categoryName": "Pain Relief & Analgesics",
      "totalStock": 180,
      "batchCount": 1
    }
  ]
  ```

### `GET /medicines/batches`
Retrieves all inventory batches with calculated days remaining until expiry.

* **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 501,
      "batchNumber": "BATCH-PCM-24A",
      "medicineName": "Paracetamol 500mg",
      "expiryDate": "2027-08-30",
      "purchasePrice": "1.80",
      "sellingPrice": "3.00",
      "stock": 180,
      "reorderLevel": 25,
      "daysToExpiry": 313
    }
  ]
  ```

### `POST /medicines`
Inserts a new medicine and its initial batch within an atomic database transaction.

* **Request Body**:
  ```json
  {
    "name": "Augmentin 625mg",
    "generic": "Amoxicillin + Clavulanic Acid",
    "categoryId": 1,
    "batchNumber": "BATCH-AUG-991",
    "expiryDate": "2028-05-30",
    "purchasePrice": 4.50,
    "sellingPrice": 7.00,
    "stock": 100,
    "reorderLevel": 20
  }
  ```
* **Response (`201 Created`)**:
  ```json
  {
    "message": "Medicine and Batch created successfully",
    "medicineId": 109
  }
  ```

---

## 3. Sales & Billing (POS)

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
