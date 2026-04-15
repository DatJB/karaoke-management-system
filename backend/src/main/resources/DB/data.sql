USE kara_db;

-- ============================================================
-- PHÒNG
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
-- Phòng 01
(1, 'MON', '08:00', '17:00', 80000),
(1, 'MON', '17:00', '23:59', 120000),
(1, 'TUE', '08:00', '17:00', 80000),
(1, 'TUE', '17:00', '23:59', 120000),
(1, 'WED', '08:00', '17:00', 80000),
(1, 'WED', '17:00', '23:59', 120000),
(1, 'THU', '08:00', '17:00', 80000),
(1, 'THU', '17:00', '23:59', 120000),
(1, 'FRI', '08:00', '17:00', 80000),
(1, 'FRI', '17:00', '23:59', 150000),
(1, 'SAT', '08:00', '23:59', 150000),
(1, 'SUN', '08:00', '23:59', 150000),
-- Phòng 02
(2, 'MON', '08:00', '17:00', 80000),
(2, 'MON', '17:00', '23:59', 120000),
(2, 'SAT', '08:00', '23:59', 150000),
(2, 'SUN', '08:00', '23:59', 150000),
-- Phòng 03
(3, 'MON', '08:00', '17:00', 100000),
(3, 'MON', '17:00', '23:59', 150000),
(3, 'SAT', '08:00', '23:59', 180000),
(3, 'SUN', '08:00', '23:59', 180000),
-- Phòng 04
(4, 'MON', '08:00', '17:00', 100000),
(4, 'MON', '17:00', '23:59', 150000),
(4, 'SAT', '08:00', '23:59', 180000),
(4, 'SUN', '08:00', '23:59', 180000),
-- Phòng VIP (5-7)
(5, 'MON', '08:00', '17:00', 200000),
(5, 'MON', '17:00', '23:59', 300000),
(5, 'SAT', '08:00', '23:59', 350000),
(5, 'SUN', '08:00', '23:59', 350000),
(6, 'MON', '08:00', '17:00', 200000),
(6, 'MON', '17:00', '23:59', 300000),
(6, 'SAT', '08:00', '23:59', 350000),
(6, 'SUN', '08:00', '23:59', 350000),
(7, 'MON', '08:00', '17:00', 250000),
(7, 'MON', '17:00', '23:59', 380000),
(7, 'SAT', '08:00', '23:59', 420000),
(7, 'SUN', '08:00', '23:59', 420000);

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
                                                             ('SP001', 'Bia Tiger 330ml',      'DRINK', 25000,  200),
                                                             ('SP002', 'Bia Heineken 330ml',   'DRINK', 30000,  150),
                                                             ('SP003', 'Nước ngọt Pepsi',      'DRINK', 15000,  100),
                                                             ('SP004', 'Nước suối',            'DRINK', 10000,  200),
                                                             ('SP005', 'Rượu Vodka Hà Nội',   'DRINK', 150000,  30),
                                                             ('SP006', 'Lạc rang muối',        'FOOD',  20000,   80),
                                                             ('SP007', 'Khô bò',               'FOOD',  45000,   50),
                                                             ('SP008', 'Mực nướng',            'FOOD',  55000,   40),
                                                             ('SP009', 'Khoai tây chiên',      'FOOD',  35000,   60),
                                                             ('SP010', 'Micro dự phòng',       'EQUIPMENT', 0,    5),
                                                             ('SP011', 'Tambourine',           'EQUIPMENT', 0,    8);

-- ============================================================
-- HÓA ĐƠN
-- ============================================================

INSERT INTO invoice (booking_id, room_price, service_price, discount, total_price, paid_at, status) VALUES
                                                                                                        (1, 360000,  85000,  0,      445000,  '2025-04-14 21:05:00', 'PAID'),
                                                                                                        (2, 450000, 120000, 50000,  520000,  '2025-04-14 22:10:00', 'PAID');

-- Chi tiết tiền phòng
INSERT INTO invoice_room_detail (invoice_id, booking_room_id, hours_used, price_per_hour, total_price) VALUES
                                                                                                           (1, 1, 3.0, 120000, 360000),
                                                                                                           (2, 2, 3.0, 150000, 450000);

-- Chi tiết đồ uống / sản phẩm
INSERT INTO invoice_item (invoice_id, booking_room_id, product_id, quantity, unit_price, total_price) VALUES
                                                                                                          (1, 1, 1, 2, 25000,  50000),
                                                                                                          (1, 1, 3, 1, 15000,  15000),
                                                                                                          (1, 1, 6, 1, 20000,  20000),
                                                                                                          (2, 2, 2, 2, 30000,  60000),
                                                                                                          (2, 2, 7, 1, 45000,  45000),
                                                                                                          (2, 2, 4, 3, 10000,  30000);

-- ============================================================
-- ĐÁNH GIÁ
-- ============================================================

INSERT INTO feedback (invoice_id, rating, comment, sentiment_label, sentiment_score) VALUES
                                                                                         (1, 5, 'Phòng sạch sẽ, nhân viên nhiệt tình, sẽ quay lại!', 'POSITIVE', 0.9500),
                                                                                         (2, 3, 'Ổn nhưng âm thanh hơi nhỏ.',                        'NEUTRAL',  0.5200);

-- ============================================================
-- THƯỞNG & PHẠT
-- ============================================================

INSERT INTO bonus (employee_id, booking_id, invoice_id, type, amount, note, created_by) VALUES
                                                                                            (5, 1, 1, 'SERVICE',      50000,  'Bán thêm được nhiều đồ uống',    2),
                                                                                            (6, 2, 2, 'ROOM_SUPPORT', 30000,  'Phục vụ tốt, khách hài lòng',    2),
                                                                                            (5, NULL, NULL, 'KPI',   100000,  'Đạt KPI tháng 3/2025',           2),
                                                                                            (7, NULL, NULL, 'HOLIDAY',200000, 'Thưởng lễ 30/4',                 1);

INSERT INTO penalty (employee_id, booking_id, invoice_id, type, amount, reason, created_by) VALUES
                                                                                                (8, NULL, NULL, 'ABSENT', 100000, 'Vắng không phép ngày 10/04', 2),
                                                                                                (7, NULL, NULL, 'LATE',    30000, 'Đi trễ 30 phút ca tối 12/04', 2);

-- ============================================================
-- KỲ LƯƠNG & BẢNG LƯƠNG
-- ============================================================

INSERT INTO payroll_period (name, period_start, period_end, status, created_by, approved_by) VALUES
                                                                                                 ('Tháng 3/2025', '2025-03-01', '2025-03-31', 'PAID',  3, 1),
                                                                                                 ('Tháng 4/2025', '2025-04-01', '2025-04-30', 'DRAFT', 3, NULL);

INSERT INTO payroll (payroll_period_id, employee_id, period_start, period_end, total_work_hours, base_salary, salary_from_hours, total_bonus, total_penalty, total_salary, status) VALUES
-- Tháng 3/2025
(1, 2, '2025-03-01', '2025-03-31', 0,    5000000, 0,      200000, 0,      5200000, 'PAID'),
(1, 3, '2025-03-01', '2025-03-31', 0,    4000000, 0,      0,      0,      4000000, 'PAID'),
(1, 4, '2025-03-01', '2025-03-31', 0,    4000000, 0,      0,      0,      4000000, 'PAID'),
(1, 5, '2025-03-01', '2025-03-31', 120,  0,       3000000,100000, 0,      3100000, 'PAID'),
(1, 6, '2025-03-01', '2025-03-31', 110,  0,       2750000,0,      0,      2750000, 'PAID'),
(1, 7, '2025-03-01', '2025-03-31', 100,  0,       2200000,0,      30000,  2170000, 'PAID'),
(1, 8, '2025-03-01', '2025-03-31', 80,   0,       1760000,0,      100000, 1660000, 'PAID'),
-- Tháng 4/2025 (DRAFT)
(2, 2, '2025-04-01', '2025-04-30', 0,    5000000, 0,      0,      0,      5000000, 'DRAFT'),
(2, 3, '2025-04-01', '2025-04-30', 0,    4000000, 0,      0,      0,      4000000, 'DRAFT'),
(2, 5, '2025-04-01', '2025-04-30', 60,   0,       1500000,50000,  0,      1550000, 'DRAFT');

-- ============================================================
-- THÔNG BÁO
-- ============================================================

INSERT INTO notification (account_id, title, body, is_read) VALUES
                                                                (5, 'Phân công phòng mới', 'Bạn được phân công phục vụ Phòng 04 - Booking #3', FALSE),
                                                                (5, 'Phân công phòng mới', 'Bạn được phân công phục vụ Phòng 06 - Booking #4', FALSE),
                                                                (6, 'Phân công phòng mới', 'Bạn được phân công phục vụ Phòng 04 - Booking #3', TRUE),
                                                                (7, 'Phân công phòng mới', 'Bạn được phân công phục vụ Phòng 05 - Booking #4', FALSE),
                                                                (8, 'Thông báo phạt',      'Bạn bị phạt 100,000đ do vắng không phép ngày 10/04', TRUE),
                                                                (5, 'Thưởng KPI',          'Bạn nhận thưởng KPI 100,000đ tháng 3/2025', TRUE);

