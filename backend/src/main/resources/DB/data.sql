
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notification;
TRUNCATE TABLE payroll;
TRUNCATE TABLE payroll_period;
TRUNCATE TABLE penalty;
TRUNCATE TABLE bonus;
TRUNCATE TABLE feedback;
TRUNCATE TABLE invoice_item;
TRUNCATE TABLE invoice_room_detail;
TRUNCATE TABLE invoice;
TRUNCATE TABLE product;
TRUNCATE TABLE booking_room_employee;
TRUNCATE TABLE booking_room;
TRUNCATE TABLE booking;
TRUNCATE TABLE customer;
TRUNCATE TABLE employee_shift;
TRUNCATE TABLE shift;
TRUNCATE TABLE account;
TRUNCATE TABLE employee;
TRUNCATE TABLE room_price_special;
TRUNCATE TABLE room_price;
TRUNCATE TABLE room;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- PHÒNG & SẢN PHẨM (Dữ liệu cơ bản)
-- ============================================================
INSERT INTO room (name, size, category, status) VALUES
                                                    ('Phòng 01', 10, 'STANDARD', 'AVAILABLE'),
                                                    ('Phòng 02', 10, 'STANDARD', 'AVAILABLE'),
                                                    ('Phòng 03', 15, 'STANDARD', 'AVAILABLE'),
                                                    ('Phòng 04', 15, 'STANDARD', 'OCCUPIED'),
                                                    ('Phòng 05', 20, 'VIP',      'AVAILABLE'),
                                                    ('Phòng 06', 20, 'VIP',      'OCCUPIED'),
                                                    ('Phòng 07', 30, 'VIP',      'AVAILABLE'),
                                                    ('Phòng 08', 10, 'STANDARD', 'MAINTENANCE');

-- ============================================================
-- GIÁ PHÒNG THEO NGÀY & KHUNG GIỜ
-- ============================================================

-- Phòng STANDARD (1-4): ngày thường giờ thấp điểm vs cao điểm
INSERT INTO room_price (room_id, day_of_week, start_time, end_time, price_per_hour) VALUES
(1, 'MON', '08:00', '12:00', 72000),
(1, 'MON', '12:00', '17:00', 81000),
(1, 'MON', '17:00', '22:00', 117000),
(1, 'MON', '22:00', '02:00', 108000),
(1, 'MON', '02:00', '08:00', 63000),
(1, 'TUE', '08:00', '12:00', 72000),
(1, 'TUE', '12:00', '17:00', 81000),
(1, 'TUE', '17:00', '22:00', 117000),
(1, 'TUE', '22:00', '02:00', 108000),
(1, 'TUE', '02:00', '08:00', 63000),
(1, 'WED', '08:00', '12:00', 72000),
(1, 'WED', '12:00', '17:00', 81000),
(1, 'WED', '17:00', '22:00', 117000),
(1, 'WED', '22:00', '02:00', 108000),
(1, 'WED', '02:00', '08:00', 63000),
(1, 'THU', '08:00', '12:00', 72000),
(1, 'THU', '12:00', '17:00', 81000),
(1, 'THU', '17:00', '22:00', 117000),
(1, 'THU', '22:00', '02:00', 108000),
(1, 'THU', '02:00', '08:00', 63000),
(1, 'FRI', '08:00', '12:00', 72000),
(1, 'FRI', '12:00', '17:00', 81000),
(1, 'FRI', '17:00', '22:00', 117000),
(1, 'FRI', '22:00', '02:00', 108000),
(1, 'FRI', '02:00', '08:00', 63000),
(1, 'SAT', '08:00', '12:00', 94000),
(1, 'SAT', '12:00', '17:00', 105000),
(1, 'SAT', '17:00', '22:00', 152000),
(1, 'SAT', '22:00', '02:00', 140000),
(1, 'SAT', '02:00', '08:00', 82000),
(1, 'SUN', '08:00', '12:00', 94000),
(1, 'SUN', '12:00', '17:00', 105000),
(1, 'SUN', '17:00', '22:00', 152000),
(1, 'SUN', '22:00', '02:00', 140000),
(1, 'SUN', '02:00', '08:00', 82000),
(2, 'MON', '08:00', '12:00', 72000),
(2, 'MON', '12:00', '17:00', 81000),
(2, 'MON', '17:00', '22:00', 117000),
(2, 'MON', '22:00', '02:00', 108000),
(2, 'MON', '02:00', '08:00', 63000),
(2, 'TUE', '08:00', '12:00', 72000),
(2, 'TUE', '12:00', '17:00', 81000),
(2, 'TUE', '17:00', '22:00', 117000),
(2, 'TUE', '22:00', '02:00', 108000),
(2, 'TUE', '02:00', '08:00', 63000),
(2, 'WED', '08:00', '12:00', 72000),
(2, 'WED', '12:00', '17:00', 81000),
(2, 'WED', '17:00', '22:00', 117000),
(2, 'WED', '22:00', '02:00', 108000),
(2, 'WED', '02:00', '08:00', 63000),
(2, 'THU', '08:00', '12:00', 72000),
(2, 'THU', '12:00', '17:00', 81000),
(2, 'THU', '17:00', '22:00', 117000),
(2, 'THU', '22:00', '02:00', 108000),
(2, 'THU', '02:00', '08:00', 63000),
(2, 'FRI', '08:00', '12:00', 72000),
(2, 'FRI', '12:00', '17:00', 81000),
(2, 'FRI', '17:00', '22:00', 117000),
(2, 'FRI', '22:00', '02:00', 108000),
(2, 'FRI', '02:00', '08:00', 63000),
(2, 'SAT', '08:00', '12:00', 94000),
(2, 'SAT', '12:00', '17:00', 105000),
(2, 'SAT', '17:00', '22:00', 152000),
(2, 'SAT', '22:00', '02:00', 140000),
(2, 'SAT', '02:00', '08:00', 82000),
(2, 'SUN', '08:00', '12:00', 94000),
(2, 'SUN', '12:00', '17:00', 105000),
(2, 'SUN', '17:00', '22:00', 152000),
(2, 'SUN', '22:00', '02:00', 140000),
(2, 'SUN', '02:00', '08:00', 82000),
(3, 'MON', '08:00', '12:00', 72000),
(3, 'MON', '12:00', '17:00', 81000),
(3, 'MON', '17:00', '22:00', 117000),
(3, 'MON', '22:00', '02:00', 108000),
(3, 'MON', '02:00', '08:00', 63000),
(3, 'TUE', '08:00', '12:00', 72000),
(3, 'TUE', '12:00', '17:00', 81000),
(3, 'TUE', '17:00', '22:00', 117000),
(3, 'TUE', '22:00', '02:00', 108000),
(3, 'TUE', '02:00', '08:00', 63000),
(3, 'WED', '08:00', '12:00', 72000),
(3, 'WED', '12:00', '17:00', 81000),
(3, 'WED', '17:00', '22:00', 117000),
(3, 'WED', '22:00', '02:00', 108000),
(3, 'WED', '02:00', '08:00', 63000),
(3, 'THU', '08:00', '12:00', 72000),
(3, 'THU', '12:00', '17:00', 81000),
(3, 'THU', '17:00', '22:00', 117000),
(3, 'THU', '22:00', '02:00', 108000),
(3, 'THU', '02:00', '08:00', 63000),
(3, 'FRI', '08:00', '12:00', 72000),
(3, 'FRI', '12:00', '17:00', 81000),
(3, 'FRI', '17:00', '22:00', 117000),
(3, 'FRI', '22:00', '02:00', 108000),
(3, 'FRI', '02:00', '08:00', 63000),
(3, 'SAT', '08:00', '12:00', 94000),
(3, 'SAT', '12:00', '17:00', 105000),
(3, 'SAT', '17:00', '22:00', 152000),
(3, 'SAT', '22:00', '02:00', 140000),
(3, 'SAT', '02:00', '08:00', 82000),
(3, 'SUN', '08:00', '12:00', 94000),
(3, 'SUN', '12:00', '17:00', 105000),
(3, 'SUN', '17:00', '22:00', 152000),
(3, 'SUN', '22:00', '02:00', 140000),
(3, 'SUN', '02:00', '08:00', 82000),
(4, 'MON', '08:00', '12:00', 72000),
(4, 'MON', '12:00', '17:00', 81000),
(4, 'MON', '17:00', '22:00', 117000),
(4, 'MON', '22:00', '02:00', 108000),
(4, 'MON', '02:00', '08:00', 63000),
(4, 'TUE', '08:00', '12:00', 72000),
(4, 'TUE', '12:00', '17:00', 81000),
(4, 'TUE', '17:00', '22:00', 117000),
(4, 'TUE', '22:00', '02:00', 108000),
(4, 'TUE', '02:00', '08:00', 63000),
(4, 'WED', '08:00', '12:00', 72000),
(4, 'WED', '12:00', '17:00', 81000),
(4, 'WED', '17:00', '22:00', 117000),
(4, 'WED', '22:00', '02:00', 108000),
(4, 'WED', '02:00', '08:00', 63000),
(4, 'THU', '08:00', '12:00', 72000),
(4, 'THU', '12:00', '17:00', 81000),
(4, 'THU', '17:00', '22:00', 117000),
(4, 'THU', '22:00', '02:00', 108000),
(4, 'THU', '02:00', '08:00', 63000),
(4, 'FRI', '08:00', '12:00', 72000),
(4, 'FRI', '12:00', '17:00', 81000),
(4, 'FRI', '17:00', '22:00', 117000),
(4, 'FRI', '22:00', '02:00', 108000),
(4, 'FRI', '02:00', '08:00', 63000),
(4, 'SAT', '08:00', '12:00', 94000),
(4, 'SAT', '12:00', '17:00', 105000),
(4, 'SAT', '17:00', '22:00', 152000),
(4, 'SAT', '22:00', '02:00', 140000),
(4, 'SAT', '02:00', '08:00', 82000),
(4, 'SUN', '08:00', '12:00', 94000),
(4, 'SUN', '12:00', '17:00', 105000),
(4, 'SUN', '17:00', '22:00', 152000),
(4, 'SUN', '22:00', '02:00', 140000),
(4, 'SUN', '02:00', '08:00', 82000),
(5, 'MON', '08:00', '12:00', 120000),
(5, 'MON', '12:00', '17:00', 135000),
(5, 'MON', '17:00', '22:00', 195000),
(5, 'MON', '22:00', '02:00', 180000),
(5, 'MON', '02:00', '08:00', 105000),
(5, 'TUE', '08:00', '12:00', 120000),
(5, 'TUE', '12:00', '17:00', 135000),
(5, 'TUE', '17:00', '22:00', 195000),
(5, 'TUE', '22:00', '02:00', 180000),
(5, 'TUE', '02:00', '08:00', 105000),
(5, 'WED', '08:00', '12:00', 120000),
(5, 'WED', '12:00', '17:00', 135000),
(5, 'WED', '17:00', '22:00', 195000),
(5, 'WED', '22:00', '02:00', 180000),
(5, 'WED', '02:00', '08:00', 105000),
(5, 'THU', '08:00', '12:00', 120000),
(5, 'THU', '12:00', '17:00', 135000),
(5, 'THU', '17:00', '22:00', 195000),
(5, 'THU', '22:00', '02:00', 180000),
(5, 'THU', '02:00', '08:00', 105000),
(5, 'FRI', '08:00', '12:00', 120000),
(5, 'FRI', '12:00', '17:00', 135000),
(5, 'FRI', '17:00', '22:00', 195000),
(5, 'FRI', '22:00', '02:00', 180000),
(5, 'FRI', '02:00', '08:00', 105000),
(5, 'SAT', '08:00', '12:00', 156000),
(5, 'SAT', '12:00', '17:00', 176000),
(5, 'SAT', '17:00', '22:00', 254000),
(5, 'SAT', '22:00', '02:00', 234000),
(5, 'SAT', '02:00', '08:00', 137000),
(5, 'SUN', '08:00', '12:00', 156000),
(5, 'SUN', '12:00', '17:00', 176000),
(5, 'SUN', '17:00', '22:00', 254000),
(5, 'SUN', '22:00', '02:00', 234000),
(5, 'SUN', '02:00', '08:00', 137000),
(6, 'MON', '08:00', '12:00', 120000),
(6, 'MON', '12:00', '17:00', 135000),
(6, 'MON', '17:00', '22:00', 195000),
(6, 'MON', '22:00', '02:00', 180000),
(6, 'MON', '02:00', '08:00', 105000),
(6, 'TUE', '08:00', '12:00', 120000),
(6, 'TUE', '12:00', '17:00', 135000),
(6, 'TUE', '17:00', '22:00', 195000),
(6, 'TUE', '22:00', '02:00', 180000),
(6, 'TUE', '02:00', '08:00', 105000),
(6, 'WED', '08:00', '12:00', 120000),
(6, 'WED', '12:00', '17:00', 135000),
(6, 'WED', '17:00', '22:00', 195000),
(6, 'WED', '22:00', '02:00', 180000),
(6, 'WED', '02:00', '08:00', 105000),
(6, 'THU', '08:00', '12:00', 120000),
(6, 'THU', '12:00', '17:00', 135000),
(6, 'THU', '17:00', '22:00', 195000),
(6, 'THU', '22:00', '02:00', 180000),
(6, 'THU', '02:00', '08:00', 105000),
(6, 'FRI', '08:00', '12:00', 120000),
(6, 'FRI', '12:00', '17:00', 135000),
(6, 'FRI', '17:00', '22:00', 195000),
(6, 'FRI', '22:00', '02:00', 180000),
(6, 'FRI', '02:00', '08:00', 105000),
(6, 'SAT', '08:00', '12:00', 156000),
(6, 'SAT', '12:00', '17:00', 176000),
(6, 'SAT', '17:00', '22:00', 254000),
(6, 'SAT', '22:00', '02:00', 234000),
(6, 'SAT', '02:00', '08:00', 137000),
(6, 'SUN', '08:00', '12:00', 156000),
(6, 'SUN', '12:00', '17:00', 176000),
(6, 'SUN', '17:00', '22:00', 254000),
(6, 'SUN', '22:00', '02:00', 234000),
(6, 'SUN', '02:00', '08:00', 137000),
(7, 'MON', '08:00', '12:00', 120000),
(7, 'MON', '12:00', '17:00', 135000),
(7, 'MON', '17:00', '22:00', 195000),
(7, 'MON', '22:00', '02:00', 180000),
(7, 'MON', '02:00', '08:00', 105000),
(7, 'TUE', '08:00', '12:00', 120000),
(7, 'TUE', '12:00', '17:00', 135000),
(7, 'TUE', '17:00', '22:00', 195000),
(7, 'TUE', '22:00', '02:00', 180000),
(7, 'TUE', '02:00', '08:00', 105000),
(7, 'WED', '08:00', '12:00', 120000),
(7, 'WED', '12:00', '17:00', 135000),
(7, 'WED', '17:00', '22:00', 195000),
(7, 'WED', '22:00', '02:00', 180000),
(7, 'WED', '02:00', '08:00', 105000),
(7, 'THU', '08:00', '12:00', 120000),
(7, 'THU', '12:00', '17:00', 135000),
(7, 'THU', '17:00', '22:00', 195000),
(7, 'THU', '22:00', '02:00', 180000),
(7, 'THU', '02:00', '08:00', 105000),
(7, 'FRI', '08:00', '12:00', 120000),
(7, 'FRI', '12:00', '17:00', 135000),
(7, 'FRI', '17:00', '22:00', 195000),
(7, 'FRI', '22:00', '02:00', 180000),
(7, 'FRI', '02:00', '08:00', 105000),
(7, 'SAT', '08:00', '12:00', 156000),
(7, 'SAT', '12:00', '17:00', 176000),
(7, 'SAT', '17:00', '22:00', 254000),
(7, 'SAT', '22:00', '02:00', 234000),
(7, 'SAT', '02:00', '08:00', 137000),
(7, 'SUN', '08:00', '12:00', 156000),
(7, 'SUN', '12:00', '17:00', 176000),
(7, 'SUN', '17:00', '22:00', 254000),
(7, 'SUN', '22:00', '02:00', 234000),
(7, 'SUN', '02:00', '08:00', 137000),
(8, 'MON', '08:00', '12:00', 72000),
(8, 'MON', '12:00', '17:00', 81000),
(8, 'MON', '17:00', '22:00', 117000),
(8, 'MON', '22:00', '02:00', 108000),
(8, 'MON', '02:00', '08:00', 63000),
(8, 'TUE', '08:00', '12:00', 72000),
(8, 'TUE', '12:00', '17:00', 81000),
(8, 'TUE', '17:00', '22:00', 117000),
(8, 'TUE', '22:00', '02:00', 108000),
(8, 'TUE', '02:00', '08:00', 63000),
(8, 'WED', '08:00', '12:00', 72000),
(8, 'WED', '12:00', '17:00', 81000),
(8, 'WED', '17:00', '22:00', 117000),
(8, 'WED', '22:00', '02:00', 108000),
(8, 'WED', '02:00', '08:00', 63000),
(8, 'THU', '08:00', '12:00', 72000),
(8, 'THU', '12:00', '17:00', 81000),
(8, 'THU', '17:00', '22:00', 117000),
(8, 'THU', '22:00', '02:00', 108000),
(8, 'THU', '02:00', '08:00', 63000),
(8, 'FRI', '08:00', '12:00', 72000),
(8, 'FRI', '12:00', '17:00', 81000),
(8, 'FRI', '17:00', '22:00', 117000),
(8, 'FRI', '22:00', '02:00', 108000),
(8, 'FRI', '02:00', '08:00', 63000),
(8, 'SAT', '08:00', '12:00', 94000),
(8, 'SAT', '12:00', '17:00', 105000),
(8, 'SAT', '17:00', '22:00', 152000),
(8, 'SAT', '22:00', '02:00', 140000),
(8, 'SAT', '02:00', '08:00', 82000),
(8, 'SUN', '08:00', '12:00', 94000),
(8, 'SUN', '12:00', '17:00', 105000),
(8, 'SUN', '17:00', '22:00', 152000),
(8, 'SUN', '22:00', '02:00', 140000),
(8, 'SUN', '02:00', '08:00', 82000);

-- Giá ngày lễ
INSERT INTO room_price_special (room_id, special_date, start_time, end_time, price_per_hour, note) VALUES
                                                                                                       (1, '2025-04-30', '08:00', '23:59', 180000, '30/4'),
                                                                                                       (2, '2025-04-30', '08:00', '23:59', 180000, '30/4'),
                                                                                                       (3, '2025-04-30', '08:00', '23:59', 220000, '30/4'),
                                                                                                       (5, '2025-04-30', '08:00', '23:59', 420000, '30/4'),
                                                                                                       (6, '2025-04-30', '08:00', '23:59', 420000, '30/4'),
                                                                                                       (7, '2025-04-30', '08:00', '23:59', 500000, '30/4'),
                                                                                                       (1, '2025-01-01', '08:00', '23:59', 180000, 'Tết Dương lịch'),
                                                                                                       (5, '2025-01-01', '08:00', '23:59', 420000, 'Tết Dương lịch');

-- ============================================================
-- NHÂN VIÊN
-- ============================================================

INSERT INTO employee (code, name, phone, base_salary, salary_per_hour, status) VALUES
                                                                                   ('NV001', 'Nguyễn Văn Admin',   '0901000001', 0,         0,      'AVAILABLE'),
                                                                                   ('NV002', 'Trần Thị Manager',   '0901000002', 5000000,   0,      'AVAILABLE'),
                                                                                   ('NV003', 'Lê Văn Receptionist','0901000003', 4000000,   0,      'AVAILABLE'),
                                                                                   ('NV004', 'Phạm Thị Lễ Tân',   '0901000004', 4000000,   0,      'AVAILABLE'),
                                                                                   ('NV005', 'Hoàng Văn Staff',    '0901000005', 0,         25000,  'AVAILABLE'),
                                                                                   ('NV006', 'Ngô Thị Staff',      '0901000006', 0,         25000,  'BUSY'),
                                                                                   ('NV007', 'Đỗ Văn Phục Vụ',    '0901000007', 0,         22000,  'AVAILABLE'),
                                                                                   ('NV008', 'Vũ Thị Phục Vụ',    '0901000008', 0,         22000,  'OFF');

-- ============================================================
-- TÀI KHOẢN
-- ============================================================

-- password: 'password123' đã hash bcrypt (chỉ mẫu, thay bằng hash thật khi deploy)
INSERT INTO account (username, password, role, employee_id, status) VALUES
                                                                        ('admin',        '$2b$10$examplehashADMIN000000000000000000000000000', 'ADMIN',        1, 'ACTIVE'),
                                                                        ('manager01',    '$2b$10$examplehashMANAGER0000000000000000000000000', 'MANAGER',      2, 'ACTIVE'),
                                                                        ('receptionist01','$2b$10$examplehashRECEP00000000000000000000000000', 'RECEPTIONIST', 3, 'ACTIVE'),
                                                                        ('receptionist02','$2b$10$examplehashRECEP20000000000000000000000000', 'RECEPTIONIST', 4, 'ACTIVE'),
                                                                        ('staff01',      '$2b$10$examplehashSTAFF0000000000000000000000000000','STAFF',        5, 'ACTIVE'),
                                                                        ('staff02',      '$2b$10$examplehashSTAFF2000000000000000000000000000','STAFF',        6, 'ACTIVE'),
                                                                        ('staff03',      '$2b$10$examplehashSTAFF3000000000000000000000000000','STAFF',        7, 'ACTIVE'),
                                                                        ('staff04',      '$2b$10$examplehashSTAFF4000000000000000000000000000','STAFF',        8, 'INACTIVE');

-- ============================================================
-- CA LÀM VIỆC
-- ============================================================

INSERT INTO shift (name, start_time, end_time) VALUES
                                                   ('Ca sáng',   '08:00', '14:00'),
                                                   ('Ca chiều',  '14:00', '20:00'),
                                                   ('Ca tối',    '20:00', '23:59'),
                                                   ('Ca full',   '08:00', '23:59');

INSERT INTO employee_shift (employee_id, shift_id, work_date, note) VALUES
                                                                        (3, 1, '2025-04-14', NULL),
                                                                        (4, 2, '2025-04-14', NULL),
                                                                        (5, 2, '2025-04-14', NULL),
                                                                        (6, 2, '2025-04-14', NULL),
                                                                        (7, 3, '2025-04-14', NULL),
                                                                        (3, 2, '2025-04-15', NULL),
                                                                        (4, 3, '2025-04-15', NULL),
                                                                        (5, 1, '2025-04-15', NULL),
                                                                        (6, 3, '2025-04-15', 'Tăng ca thêm 1 tiếng'),
                                                                        (7, 2, '2025-04-15', NULL),
                                                                        (8, 1, '2025-04-15', 'Xin nghỉ phép');

-- ============================================================
-- KHÁCH HÀNG
-- ============================================================

INSERT INTO customer (name, phone, identity, email, address) VALUES
                                                                 ('Nguyễn Minh Tuấn',  '0911111111', '001099012345', 'tuan.nguyen@gmail.com',  'Hà Nội'),
                                                                 ('Trần Thị Hoa',      '0922222222', '001099023456', 'hoa.tran@gmail.com',     'Hà Nội'),
                                                                 ('Lê Quốc Bảo',       '0933333333', NULL,           NULL,                     NULL),
                                                                 ('Phạm Văn Hùng',     '0944444444', NULL,           NULL,                     NULL),
                                                                 ('Hoàng Thị Lan',     '0955555555', '001099045678', 'lan.hoang@gmail.com',    'TP.HCM'),
                                                                 ('Đặng Văn Khoa',     '0966666666', NULL,           NULL,                     NULL),
                                                                 ('Bùi Thị Thu',       '0977777777', NULL,           'thu.bui@gmail.com',      'Hà Nội'),
                                                                 ('Vũ Mạnh Cường',     '0988888888', '001099078901', NULL,                     NULL);

-- ============================================================
-- BOOKING
-- ============================================================

INSERT INTO booking (customer_id, status, note) VALUES
                                                    (1, 'CHECKED_OUT', NULL),
                                                    (2, 'CHECKED_OUT', 'Khách yêu cầu phòng yên tĩnh'),
                                                    (3, 'CHECKED_IN',  NULL),
                                                    (4, 'CHECKED_IN',  'Sinh nhật, chuẩn bị thêm bánh'),
                                                    (5, 'BOOKED',      NULL),
                                                    (6, 'CANCELLED',   'Khách huỷ do bận');

-- ============================================================
-- BOOKING ROOM
-- ============================================================

INSERT INTO booking_room (booking_id, room_id, status, checkin_time, checkout_time) VALUES
                                                                                        (1, 1, 'DONE',      '2025-04-14 18:00:00', '2025-04-14 21:00:00'),
                                                                                        (2, 3, 'DONE',      '2025-04-14 19:00:00', '2025-04-14 22:00:00'),
                                                                                        (3, 4, 'PLAYING',   '2025-04-15 17:30:00', NULL),
                                                                                        (4, 6, 'PLAYING',   '2025-04-15 18:00:00', NULL),
                                                                                        (4, 5, 'PLAYING',   '2025-04-15 18:00:00', NULL),
                                                                                        (5, 7, 'PLAYING',   NULL,                  NULL),
                                                                                        (6, 2, 'CANCELLED', NULL,                  NULL);

-- ============================================================
-- BOOKING ROOM EMPLOYEE
-- ============================================================

INSERT INTO booking_room_employee (booking_room_id, employee_id) VALUES
                                                                     (1, 5),
                                                                     (2, 6),
                                                                     (3, 6),
                                                                     (4, 5),
                                                                     (5, 7);

-- ============================================================
-- SẢN PHẨM
-- ============================================================

INSERT INTO product (code, name, category, price, stock) VALUES
                                                             ('SP01', 'Bia Heineken', 'DRINK', 30000, 100),
                                                             ('SP02', 'Đĩa trái cây lớn', 'FOOD', 150000, 20);

-- ============================================================
-- NHÂN VIÊN & TÀI KHOẢN
-- Lưu ý: Mật khẩu mặc định là 'password123' (đã hash)
-- ============================================================
INSERT INTO employee (id, code, name, phone, base_salary, salary_per_hour, status) VALUES
                                                                                       (1, 'NV001', 'Nguyễn Văn Admin', '0901111111', 10000000, 0, 'AVAILABLE'),
                                                                                       (2, 'NV002', 'Trần Thị Manager', '0902222222', 8000000, 0, 'AVAILABLE'),
                                                                                       (3, 'NV003', 'Lê Lễ Tân', '0903333333', 5000000, 0, 'AVAILABLE'),
                                                                                       (4, 'NV004', 'Phạm Phục Vụ 1', '0904444444', 0, 30000, 'AVAILABLE'),
                                                                                       (5, 'NV005', 'Hoàng Phục Vụ 2', '0905555555', 0, 30000, 'AVAILABLE');

INSERT INTO account (username, password, role, employee_id, status) VALUES
                                                                        ('admin', '$2a$10$fvcB0C0Mvj4/R7V7Awfgqu1PpO4CwXddRt3Z55ouAwyfayzus4Pv6', 'ADMIN', 1, 'ACTIVE'),
                                                                        ('manager01', '$2a$10$6or8cumVSunCW/ovcjVRxe3dvDdAvCdioLLyUZgfKIVWWLYSpwDXe', 'MANAGER', 2, 'ACTIVE'),
                                                                        ('letan01', '$2a$10$bDRXOccoeeqNkLQZCWW.fO2lyuJm0pkuWTw54w5T6V1s9EnT7Bisa', 'RECEPTIONIST', 3, 'ACTIVE'),
                                                                        ('staff01', '$2a$10$n/Jc4Y/AGu16aoQZEpB9DucxiLWt773F8fZ1BbujAvQFiWH8/rLEu', 'STAFF', 4, 'ACTIVE'),
                                                                        ('staff02', '$2a$10$22F0teoJK5FagYlHSqbCouXYUu7jY6sN8AZaFHi9WqUTU2jA3kEeO', 'STAFF', 5, 'ACTIVE');

-- ============================================================
-- KỲ LƯƠNG (Payroll Periods)
-- ============================================================
INSERT INTO payroll_period (id, name, period_start, period_end, status, created_by, approved_by) VALUES
                                                                                                     (1, 'Tháng 02/2026', '2026-02-01', '2026-02-28', 'PAID', 2, 1),
                                                                                                     (2, 'Tháng 03/2026', '2026-03-01', '2026-03-31', 'APPROVED', 2, 1),
                                                                                                     (3, 'Tháng 04/2026', '2026-04-01', '2026-04-30', 'DRAFT', 2, NULL);

-- ============================================================
-- LỊCH SỬ HOẠT ĐỘNG (Tháng 4/2026 - Đang DRAFT)
-- Tạo 1 booking để Staff 01 có giờ làm việc
-- ============================================================
INSERT INTO customer (id, name, phone) VALUES (1, 'Khách VVIP', '0999999999');

INSERT INTO booking (id, customer_id, status, reservation_time, expected_checkout_time) VALUES
    (1, 1, 'CHECKED_OUT', '2026-04-10 19:00:00', '2026-04-10 22:00:00');

-- Khách hát 3 tiếng (từ 19:00 đến 22:00)
INSERT INTO booking_room (id, booking_id, room_id, status, checkin_time, checkout_time) VALUES
    (1, 1, 2, 'DONE', '2026-04-10 19:00:00', '2026-04-10 22:00:00');

-- Phân công Nhân viên 4 (Staff 01) phục vụ phòng này (sẽ được tính 3 tiếng * 30k = 90k)
INSERT INTO booking_room_employee (booking_room_id, employee_id) VALUES (1, 4);

-- ============================================================
-- THƯỞNG & PHẠT (Đa dạng các tháng)
-- ============================================================
-- Tháng 2 (Đã PAID)
INSERT INTO bonus (employee_id, type, amount, note, created_by, created_at) VALUES
    (3, 'KPI', 500000, 'Lễ tân xuất sắc T2', 2, '2026-02-28 10:00:00');

-- Tháng 3 (Đã APPROVED)
INSERT INTO penalty (employee_id, type, amount, reason, created_by, created_at) VALUES
    (4, 'LATE', 50000, 'Đi muộn 3 lần', 2, '2026-03-30 09:00:00');

-- Tháng 4 (Đang DRAFT - Thể hiện trên UI hiện tại)
INSERT INTO bonus (employee_id, type, amount, note, created_by, created_at) VALUES
                                                                                (4, 'TIP', 200000, 'Khách bo trực tiếp', 2, '2026-04-10 22:30:00'),
                                                                                (5, 'SERVICE', 100000, 'Bán combo rượu', 2, '2026-04-12 20:00:00');

-- Phạt dính liền với Booking (Nhân viên 4 đánh vỡ ly trong ca làm ngày 10/4)
INSERT INTO penalty (employee_id, booking_id, type, amount, reason, created_by, created_at) VALUES
    (4, 1, 'MISCONDUCT', 150000, 'Vỡ ly thủy tinh', 2, '2026-04-10 21:00:00');

-- ============================================================
-- BẢNG LƯƠNG CHỐT (Của các tháng trước)
-- ============================================================
-- Lương Tháng 2
INSERT INTO payroll (payroll_period_id, employee_id, period_start, period_end, total_work_hours, base_salary, salary_from_hours, total_bonus, total_penalty, total_salary, status) VALUES
                                                                                                                                                                                       (1, 2, '2026-02-01', '2026-02-28', 0, 8000000, 0, 0, 0, 8000000, 'PAID'),
                                                                                                                                                                                       (1, 3, '2026-02-01', '2026-02-28', 0, 5000000, 0, 500000, 0, 5500000, 'PAID'),
                                                                                                                                                                                       (1, 4, '2026-02-01', '2026-02-28', 100, 0, 3000000, 0, 0, 3000000, 'PAID');

-- Lương Tháng 3
INSERT INTO payroll (payroll_period_id, employee_id, period_start, period_end, total_work_hours, base_salary, salary_from_hours, total_bonus, total_penalty, total_salary, status) VALUES
                                                                                                                                                                                       (2, 2, '2026-03-01', '2026-03-31', 0, 8000000, 0, 0, 0, 8000000, 'APPROVED'),
                                                                                                                                                                                       (2, 3, '2026-03-01', '2026-03-31', 0, 5000000, 0, 0, 0, 5000000, 'APPROVED'),
                                                                                                                                                                                       (2, 4, '2026-03-01', '2026-03-31', 120, 0, 3600000, 0, 50000, 3550000, 'APPROVED');

-- *Lưu ý: Không insert lương Tháng 4. Hãy lên giao diện bấm "Chạy tính lương" để hệ thống tự sinh ra!*
-----------------------------------------------------
-----------------------------------------------------
-----------------------------------------------------

-- =========================================================================
-- CA LÀM VIỆC & LỊCH TRỰC (Đã fix lỗi ID)
-- =========================================================================

INSERT INTO employee_shift (employee_id, shift_id, work_date, note) VALUES
                                                                        (3, 1, '2026-05-17', 'Lễ tân trực sáng'),
                                                                        (4, 2, '2026-05-17', 'Staff 1 trực chiều'),
                                                                        (5, 3, '2026-05-17', 'Staff 2 trực tối'),
                                                                        (4, 3, '2026-05-17', 'Staff 1 tăng ca (thay cho nhân viên số 6)');

-- =========================================================================
-- DỮ LIỆU TRANSACTION LÕI (Booking, Chạy Phòng, Hóa Đơn)
-- =========================================================================

-- KỊCH BẢN 1: BOOKING ĐÃ HOÀN THÀNH & ĐÃ THANH TOÁN (Tháng 4/2026)
INSERT INTO booking (id, customer_id, status, note, created_at, expected_checkout_time) VALUES
    (1, 1, 'CHECKED_OUT', 'Khách quen, giảm 10%', '2026-04-15 19:00:00', '2026-04-15 22:00:00');

INSERT INTO booking_room (id, booking_id, room_id, status, checkin_time, checkout_time) VALUES
    (1, 1, 1, 'DONE', '2026-04-15 19:00:00', '2026-04-15 22:00:00');

INSERT INTO booking_room_employee (booking_room_id, employee_id) VALUES (1, 4), (1, 5);

INSERT INTO invoice (id, booking_id, room_price, service_price, discount, total_price, status, created_at, paid_at) VALUES
    (1, 1, 300000, 480000, 78000, 702000, 'PAID', '2026-04-15 22:05:00', '2026-04-15 22:06:00');

INSERT INTO invoice_room_detail (invoice_id, booking_room_id, hours_used, price_per_hour, total_price) VALUES
    (1, 1, 3.0, 100000, 300000);

INSERT INTO invoice_item (invoice_id, booking_room_id, product_id, quantity, unit_price, total_price) VALUES
                                                                                                          (1, 1, 1, 10, 35000, 350000),
                                                                                                          (1, 1, 6, 1, 250000, 250000),
                                                                                                          (1, 1, 9, 4, 5000, 20000);

INSERT INTO feedback (invoice_id, rating, comment, sentiment_label, sentiment_score, created_at) VALUES
    (1, 5, 'Phòng sạch sẽ, âm thanh rất hay, nhân viên nhiệt tình.', 'POSITIVE', 0.95, '2026-04-16 08:00:00');

-- KỊCH BẢN 2: BOOKING COMBO 2 PHÒNG ĐÃ HOÀN THÀNH (Lễ 30/4/2026)
INSERT INTO booking (id, customer_id, status, note, created_at) VALUES
    (2, 2, 'CHECKED_OUT', 'Sự kiện công ty', '2026-04-30 20:00:00');

INSERT INTO booking_room (id, booking_id, room_id, status, checkin_time, checkout_time) VALUES
                                                                                            (2, 2, 5, 'DONE', '2026-04-30 20:00:00', '2026-04-30 23:30:00'),
                                                                                            (3, 2, 6, S'DONE', '2026-04-30 20:00:00', '2026-04-30 23:30:00');

INSERT INTO invoice (id, booking_id, room_price, service_price, discount, total_price, status, created_at, paid_at) VALUES
    (2, 2, 2940000, 2500000, 0, 5440000, 'PAID', '2026-04-30 23:35:00', '2026-04-30 23:40:00');

INSERT INTO feedback (invoice_id, rating, comment, sentiment_label, sentiment_score, created_at) VALUES
    (2, 3, 'Giá ngày lễ hơi cao, gọi bia mang ra hơi chậm.', 'NEUTRAL', 0.50, '2026-05-01 10:00:00');

-- KỊCH BẢN 3: BOOKING ĐANG HÁT (HIỆN TẠI)
INSERT INTO booking (id, customer_id, status, note, created_at) VALUES
    (3, 4, 'CHECKED_IN', 'Đang tổ chức sinh nhật', '2026-05-17 18:00:00');

INSERT INTO booking_room (id, booking_id, room_id, status, checkin_time) VALUES
    (4, 3, 3, 'PLAYING', '2026-05-17 18:15:00');

INSERT INTO booking_room_employee (booking_room_id, employee_id) VALUES (4, 5); -- Gán cho Staff 2 (ID=5)

INSERT INTO invoice (id, booking_id, room_price, service_price, discount, total_price, status, created_at) VALUES
    (3, 3, 0, 350000, 0, 350000, 'UNPAID', '2026-05-17 18:15:00');

INSERT INTO invoice_item (invoice_id, booking_room_id, product_id, quantity, unit_price, total_price) VALUES
    (3, 4, 10, 1, 350000, 350000);

-- KỊCH BẢN 4: BOOKING ĐẶT TRƯỚC (Tương lai)
INSERT INTO booking (id, customer_id, status, note, created_at, reservation_time) VALUES
    (4, 5, 'BOOKED', 'Khách đã cọc 500k', '2026-05-17 10:00:00', '2026-05-18 20:00:00');

INSERT INTO booking_room (id, booking_id, room_id, status) VALUES
    (5, 4, 4, 'PLAYING');

-- KỊCH BẢN 5: BOOKING BỊ HỦY
INSERT INTO booking (id, customer_id, status, note, created_at) VALUES
    (5, 3, 'CANCELLED', 'Khách báo bận đột xuất', '2026-05-01 09:00:00');

INSERT INTO booking_room (id, booking_id, room_id, status) VALUES
    (6, 5, 2, 'CANCELLED');

-- =========================================================================
-- DỮ LIỆU NHÂN SỰ (Lương, Thưởng, Phạt, Thông báo)
-- =========================================================================

INSERT INTO bonus (employee_id, booking_id, invoice_id, type, amount, note, created_by, created_at) VALUES
                                                                                                        (4, 1, 1, 'TIP', 100000, 'Khách bàn 101 tip', 2, '2026-04-15 22:30:00'),
                                                                                                        (5, 2, 2, 'SERVICE', 200000, 'Thưởng bán combo rượu Chivas', 2, '2026-04-30 23:50:00'), -- Gán cho Staff 2 (ID=5)
                                                                                                        (3, NULL, NULL, 'KPI', 500000, 'Lễ tân xuất sắc tháng 4', 1, '2026-04-30 18:00:00');

INSERT INTO penalty (employee_id, booking_id, invoice_id, type, amount, reason, created_by, created_at) VALUES
                                                                                                            (5, 1, 1, 'MISCONDUCT', 50000, 'Làm vỡ ly phòng 101', 2, '2026-04-15 21:00:00'),
                                                                                                            (4, NULL, NULL, 'LATE', 100000, 'Đi làm muộn 45 phút', 2, '2026-05-02 08:45:00');

INSERT INTO payroll_period (id, name, period_start, period_end, status, created_by, approved_by, created_at) VALUES
                                                                                                                 (1, 'Lương Tháng 03/2026', '2026-03-01', '2026-03-31', 'PAID', 2, 1, '2026-04-01 10:00:00'),
                                                                                                                 (2, 'Lương Tháng 04/2026', '2026-04-01', '2026-04-30', 'APPROVED', 2, 1, '2026-05-01 10:00:00'),
                                                                                                                 (3, 'Lương Tháng 05/2026', '2026-05-01', '2026-05-31', 'DRAFT', 2, NULL, '2026-05-01 08:00:00');

INSERT INTO payroll (payroll_period_id, employee_id, period_start, period_end, total_work_hours, base_salary, salary_from_hours, total_bonus, total_penalty, total_salary, status) VALUES
                                                                                                                                                                                       (2, 3, '2026-04-01', '2026-04-30', 208, 5000000, 0, 500000, 0, 5500000, 'APPROVED'),
                                                                                                                                                                                       (2, 4, '2026-04-01', '2026-04-30', 180, 0, 5400000, 100000, 50000, 5450000, 'APPROVED'),
                                                                                                                                                                                       (2, 5, '2026-04-01', '2026-04-30', 150, 0, 4500000, 0, 50000, 4450000, 'APPROVED');

INSERT INTO notification (account_id, title, body, is_read, created_at) VALUES
                                                                            (1, 'Báo cáo doanh thu', 'Doanh thu ngày lễ 30/4 đạt chỉ tiêu. Vui lòng xem chi tiết.', FALSE, '2026-05-01 08:00:00'),
                                                                            (2, 'Hủy phòng', 'Khách Lê Quốc Bảo vừa hủy phòng đặt trước.', TRUE, '2026-05-01 09:05:00');