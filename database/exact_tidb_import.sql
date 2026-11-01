USE pharmacy_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `saleitem`;
DROP TABLE IF EXISTS `sale`;
DROP TABLE IF EXISTS `prescriptionitem`;
DROP TABLE IF EXISTS `prescription`;
DROP TABLE IF EXISTS `doctor`;
DROP TABLE IF EXISTS `patient`;
DROP TABLE IF EXISTS `medicinebatch`;
DROP TABLE IF EXISTS `medicine`;
DROP TABLE IF EXISTS `category`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `medicine` (
  `medicine_id` int NOT NULL AUTO_INCREMENT,
  `medicine_name` varchar(100) NOT NULL,
  `category_id` int DEFAULT NULL,
  `manufacturer` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`medicine_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `medicine_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `medicinebatch` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `batch_number` varchar(30) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `expiry_date` date NOT NULL,
  PRIMARY KEY (`batch_id`),
  UNIQUE KEY `batch_number` (`batch_number`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `medicinebatch_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`),
  CONSTRAINT `medicinebatch_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `medicinebatch_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `patient` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `patient_name` varchar(100) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `doctor` (
  `doctor_id` int NOT NULL AUTO_INCREMENT,
  `doctor_name` varchar(100) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `prescription` (
  `prescription_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `prescription_date` date NOT NULL,
  PRIMARY KEY (`prescription_id`),
  KEY `patient_id` (`patient_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `prescription_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `prescription_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `prescriptionitem` (
  `prescription_item_id` int NOT NULL AUTO_INCREMENT,
  `prescription_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`prescription_item_id`),
  KEY `prescription_id` (`prescription_id`),
  KEY `medicine_id` (`medicine_id`),
  CONSTRAINT `prescriptionitem_ibfk_1` FOREIGN KEY (`prescription_id`) REFERENCES `prescription` (`prescription_id`),
  CONSTRAINT `prescriptionitem_ibfk_2` FOREIGN KEY (`medicine_id`) REFERENCES `medicine` (`medicine_id`),
  CONSTRAINT `prescriptionitem_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sale` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `sale_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`sale_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `sale_chk_1` CHECK ((`total_amount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `saleitem` (
  `sale_item_id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`sale_item_id`),
  KEY `sale_id` (`sale_id`),
  KEY `batch_id` (`batch_id`),
  CONSTRAINT `saleitem_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sale` (`sale_id`),
  CONSTRAINT `saleitem_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `medicinebatch` (`batch_id`),
  CONSTRAINT `saleitem_chk_1` CHECK ((`quantity` > 0)),
  CONSTRAINT `saleitem_chk_2` CHECK ((`unit_price` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `category` (`category_id`, `category_name`) VALUES
(3, 'Capsules'),
(4, 'Injections'),
(5, 'Ointments'),
(2, 'Syrups'),
(1, 'Tablets');

INSERT INTO `medicine` (`medicine_id`, `medicine_name`, `category_id`, `manufacturer`) VALUES
(1, 'Paracetamol', 1, 'ABC Pharma'),
(2, 'Cetirizine', 1, 'MediCare Labs'),
(3, 'Cough Syrup', 2, 'HealthCare Ltd'),
(4, 'Vitamin Capsules', 3, 'Wellness Pharma'),
(5, 'Antiseptic Ointment', 5, 'LifeCare Ltd');

INSERT INTO `medicinebatch` (`batch_id`, `medicine_id`, `batch_number`, `quantity`, `unit_price`, `expiry_date`) VALUES
(1, 1, 'PAR101', 98, '2.50', '2027-06-29'),
(2, 1, 'PAR102', 50, '2.75', '2027-12-30'),
(3, 2, 'CET101', 80, '3.00', '2027-03-30'),
(4, 3, 'COU101', 40, '85.00', '2027-01-30'),
(5, 4, 'VIT101', 60, '5.50', '2028-05-30'),
(6, 5, 'OIN101', 25, '45.00', '2027-08-30');

INSERT INTO `patient` (`patient_id`, `patient_name`, `phone`) VALUES
(1, 'Rahul Sharma', '9876501234'),
(2, 'Priya Reddy', '9876505678'),
(3, 'Arjun Kumar', '9876512345');

INSERT INTO `doctor` (`doctor_id`, `doctor_name`, `specialization`) VALUES
(1, 'Dr. Anil Kumar', 'General Physician'),
(2, 'Dr. Meera Rao', 'Dermatologist'),
(3, 'Dr. Sandeep Reddy', 'Pediatrician');

INSERT INTO `prescription` (`prescription_id`, `patient_id`, `doctor_id`, `prescription_date`) VALUES
(1, 1, 1, '2026-10-14'),
(2, 2, 2, '2026-10-15'),
(3, 3, 3, '2026-10-16');

INSERT INTO `prescriptionitem` (`prescription_item_id`, `prescription_id`, `medicine_id`, `dosage`, `quantity`) VALUES
(1, 1, 1, 'As directed by doctor', 10),
(2, 1, 2, 'As directed by doctor', 5),
(3, 2, 3, 'As directed by doctor', 1),
(4, 3, 4, 'As directed by doctor', 10);

INSERT INTO `sale` (`sale_id`, `patient_id`, `sale_date`, `total_amount`) VALUES
(1, 1, '2026-10-19', '40.00'),
(2, 2, '2026-10-19', '170.00'),
(3, 3, '2026-10-19', '5.00');

INSERT INTO `saleitem` (`sale_item_id`, `sale_id`, `batch_id`, `quantity`, `unit_price`) VALUES
(1, 1, 1, 10, '2.50'),
(2, 1, 3, 5, '3.00'),
(3, 2, 4, 2, '85.00'),
(4, 3, 1, 2, '2.50');

