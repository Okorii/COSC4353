CREATE DATABASE IF NOT EXISTS queuesmart;
USE queuesmart;

CREATE TABLE services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE queue_entries (
  entry_id INT AUTO_INCREMENT PRIMARY KEY,
  pet_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  service_id INT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('WAITING', 'SERVING', 'REMOVED', 'SERVED') NOT NULL DEFAULT 'WAITING',
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

CREATE TABLE history (
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
(1, 'Nail trimming', 'Quick nail trim to keep your pet comfortable.', 10, 'low', TRUE),
(2, 'Haircut', 'Professional haircut tailored to your pet.', 30, 'medium', TRUE),
(3, 'Full Groom (Bath + Haircut + Nails)', 'Complete grooming package.', 60, 'high', TRUE),
(4, 'Bath + Dry', 'Bath, shampoo, dry, and brushing.', 35, 'medium', TRUE);

INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
VALUES
('Coco', 'Maria Garcia', 2, NOW(), 'WAITING'),
('Max', 'Luis Perez', 1, NOW(), 'WAITING'),
('Luna', 'Billy Jones', 3, NOW(), 'WAITING');

INSERT INTO history (pet_name, groomer_id, service_id, outcome, date)
VALUES
('Kochi', 'g1', 3, 'completed', '2026-02-10'),
('Cake', 'g2', 1, 'canceled', '2026-02-12'),
('Sam', 'g3', 2, 'no show', '2026-02-18'),
('Chucho', 'g1', 4, 'completed', '2026-02-19');