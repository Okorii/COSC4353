CREATE DATABASE IF NOT EXISTS railway;
USE railway;

CREATE TABLE IF NOT EXISTS services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queue_entries (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  service_id INT NOT NULL,
  groomer_id VARCHAR(20),
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('WAITING', 'SERVING', 'REMOVED', 'SERVED') NOT NULL DEFAULT 'WAITING',
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE IF NOT EXISTS history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_name VARCHAR(100) NOT NULL,
  groomer_id VARCHAR(20),
  service_id INT NOT NULL,
  outcome VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

INSERT INTO services (service_id, name, description, duration_minutes, priority, active)
VALUES
(1, 'Nail trimming', 'Basic nail trimming service', 10, 'low', TRUE),
(2, 'Haircut', 'Pet haircut service', 30, 'medium', TRUE),
(3, 'Full Groom (Bath + Haircut + Nails)', 'Complete grooming package', 60, 'high', TRUE),
(4, 'Bath + Dry', 'Bath and drying service', 35, 'medium', TRUE)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  duration_minutes = VALUES(duration_minutes),
  priority = VALUES(priority),
  active = VALUES(active);

DELETE FROM queue_entries;

INSERT INTO queue_entries (pet_name, owner_name, service_id, groomer_id, joined_at, status)
VALUES
('Coco', 'Maria Garcia', 1,'g1', NOW(), 'WAITING'),
('Rocky', 'Luis Perez', 2,'g2', NOW(), 'WAITING'),
('Luna', 'Billy Jones', 3,'g3', NOW(), 'WAITING'),
('Chucho', 'Manuel Avila', 4,'g4', NOW(), 'WAITING');

DELETE FROM history;
INSERT INTO history (history_id, pet_name, groomer_id, service_id, outcome, date)
VALUES
(1, 'Kochi', 'g1', 3, 'completed', CURDATE()),
(2, 'Cake', 'g2', 1, 'removed', CURDATE()),
(3, 'Sam', 'g3', 2, 'removed', CURDATE()),
(4, 'Chucho', 'g1', 4, 'completed', CURDATE())
ON DUPLICATE KEY UPDATE
  pet_name = VALUES(pet_name),
  groomer_id = VALUES(groomer_id),
  service_id = VALUES(service_id),
  outcome = VALUES(outcome),
  date = VALUES(date);

SELECT * FROM services;
SELECT * FROM queue_entries;
SELECT * FROM history;