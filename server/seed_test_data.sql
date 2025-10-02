-- Test Data for PalmExitGarage
-- This file adds 2 test customers with vehicles for testing purposes

-- Test Customer 1: John Doe
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code)
VALUES ('John', 'Doe', 'john.doe@example.com', '555-0101', '123 Main St', 'Austin', 'TX', '78701')
ON DUPLICATE KEY UPDATE customer_id=customer_id;

-- Get the customer_id for John Doe
SET @john_customer_id = (SELECT customer_id FROM customers WHERE email = 'john.doe@example.com' LIMIT 1);

-- John's vehicle: 2018 Honda Accord
INSERT INTO vehicles (customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes)
VALUES (@john_customer_id, 2018, 'Honda', 'Accord', '1HGCV1F30JA123456', 'ABC1234', 'Silver', 45000, '2.0L Turbo', 'Automatic', 'Regular maintenance customer')
ON DUPLICATE KEY UPDATE vehicle_id=vehicle_id;

-- Test Customer 2: Jane Smith
INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code)
VALUES ('Jane', 'Smith', 'jane.smith@example.com', '555-0102', '456 Oak Ave', 'Austin', 'TX', '78702')
ON DUPLICATE KEY UPDATE customer_id=customer_id;

-- Get the customer_id for Jane Smith
SET @jane_customer_id = (SELECT customer_id FROM customers WHERE email = 'jane.smith@example.com' LIMIT 1);

-- Jane's vehicle: 2020 Toyota RAV4
INSERT INTO vehicles (customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes)
VALUES (@jane_customer_id, 2020, 'Toyota', 'RAV4', '2T3P1RFV8LC123789', 'XYZ5678', 'Blue', 28000, '2.5L', 'Automatic', 'New customer - first visit')
ON DUPLICATE KEY UPDATE vehicle_id=vehicle_id;

-- Confirmation message
SELECT 'Test data seeded successfully!' AS status;
SELECT COUNT(*) AS total_test_customers FROM customers WHERE email IN ('john.doe@example.com', 'jane.smith@example.com');
SELECT COUNT(*) AS total_test_vehicles FROM vehicles v 
    INNER JOIN customers c ON v.customer_id = c.customer_id 
    WHERE c.email IN ('john.doe@example.com', 'jane.smith@example.com');
