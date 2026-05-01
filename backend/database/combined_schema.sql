CREATE DATABASE IF NOT EXISTS railway;
USE railway;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS queue_entries;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS user_credentials;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user_credentials (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_credentials(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    duration_minutes INT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE queue_entries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_name VARCHAR(30) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    service_id INT NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('WAITING', 'SERVING', 'SERVED', 'REMOVED') NOT NULL DEFAULT 'WAITING',
    FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pet_name VARCHAR(30) NOT NULL,
    owner_name VARCHAR(100),
    service_id INT NOT NULL,
    outcome VARCHAR(100) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

INSERT INTO services (name, description, duration_minutes, priority, active)
VALUES
('Nail trimming', 'Quick nail trim to keep your pet''s nails neat and comfortable.', 10, 'low', 1),
('Haircut', 'Professional haircut tailored to your pet''s breed and style preference.', 30, 'medium', 1),
('Full Groom', 'Complete grooming package including bath, haircut, and nail trim.', 60, 'high', 1),
('Bath + Dry', 'Bath, shampoo, blow dry, and brushing.', 35, 'medium', 1);
('Teeth Cleaning', 'Basic teeth cleaning service.', 20, 'low', 1);

INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
VALUES
('Coco', 'maria@email.com', 1, NOW(), 'WAITING'),
('Rocky', 'luis@email.com', 2, NOW(), 'WAITING'),
('Luna', 'billy@email.com', 3, NOW(), 'WAITING'),
('Chucho', 'manuel@email.com', 4, NOW(), 'WAITING');
('Mochi', 'ana@email.com', 5, NOW(), 'WAITING');

INSERT INTO history (date, pet_name, owner_name, service_id, outcome)
VALUES
(NOW(), 'Bella', 'sofia@email.com', 2, 'completed'),
(NOW(), 'Charlie', 'charlie@email.com', 1, 'completed'),
(NOW(), 'Milo', 'ana@email.com', 4, 'removed');
