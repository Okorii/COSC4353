USE queuesmart;

DELETE FROM queue_entries;

INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
VALUES
('Coco', 'Maria Garcia', 1, NOW(), 'WAITING'),
('Rocky', 'Luis Perez', 2, NOW(), 'WAITING'),
('Luna', 'Billy Jones', 3, NOW(), 'WAITING'),
('Chucho', 'Manuel Avila', 4, NOW(), 'WAITING');

SELECT * FROM queue_entries;