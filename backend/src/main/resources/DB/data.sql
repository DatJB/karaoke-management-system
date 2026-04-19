
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
                                                    ('Phòng VIP 1', 20, 'VIP', 'AVAILABLE');

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