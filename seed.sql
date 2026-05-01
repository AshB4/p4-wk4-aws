INSERT INTO Driver (name, license_type) VALUES
('Neo Anderson', 'Class A'),
('Trinity', 'Class B'),
('Tony Stark', 'Class C');

INSERT INTO Vehicle (license_plate, model, driver_id) VALUES
('MTRX-001', 'Motorcycle', 1),
('RED-007', 'Sports Car', 2),
('IRON-3000', 'Tesla Model S', 3);

INSERT INTO Routes (date, service_zone, driver_id) VALUES
('2026-05-01', 'Downtown Grid', 1),
('2026-05-02', 'Cyber District', 2),
('2026-05-03', 'Stark Tower Zone', 3);

INSERT INTO Packages (description, weight, route_id) VALUES
('Encrypted Data Drive', 1.2, 1),
('Quantum Chip', 0.8, 2),
('Arc Reactor Core', 5.5, 3);