CREATE DATABASE IF NOT EXISTS kara_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE kara_db;

-- ============================================================
-- PHÒNG
-- ============================================================

CREATE TABLE room (
                      id       INT PRIMARY KEY AUTO_INCREMENT,
                      name     VARCHAR(100) NOT NULL,
                      size     INT NOT NULL,
                      category ENUM('STANDARD','VIP') DEFAULT 'STANDARD',
                      status   ENUM('AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE') DEFAULT 'AVAILABLE'
);

-- Giá theo ngày trong tuần + khung giờ
CREATE TABLE room_price (
                            id             INT PRIMARY KEY AUTO_INCREMENT,
                            room_id        INT NOT NULL,
                            day_of_week    ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
                            start_time     TIME NOT NULL,
                            end_time       TIME NOT NULL,
                            price_per_hour DECIMAL(12,2) NOT NULL,

                            FOREIGN KEY (room_id) REFERENCES room(id)
);

-- Giá đặc biệt cho ngày lễ / sự kiện
CREATE TABLE room_price_special (
                                    id             INT PRIMARY KEY AUTO_INCREMENT,
                                    room_id        INT NOT NULL,
                                    special_date   DATE NOT NULL,
                                    start_time     TIME NOT NULL,
                                    end_time       TIME NOT NULL,
                                    price_per_hour DECIMAL(12,2) NOT NULL,
                                    note           VARCHAR(255),

                                    FOREIGN KEY (room_id) REFERENCES room(id)
);

-- ============================================================
-- NHÂN VIÊN & TÀI KHOẢN
-- ============================================================

CREATE TABLE employee (
                          id               INT PRIMARY KEY AUTO_INCREMENT,
                          code             VARCHAR(20) UNIQUE,
                          name             VARCHAR(100) NOT NULL,
                          phone            VARCHAR(20),
                          base_salary      DECIMAL(12,2) DEFAULT 0,
                          salary_per_hour  DECIMAL(12,2) NOT NULL,
                          status           ENUM('AVAILABLE','BUSY','OFF') DEFAULT 'AVAILABLE',
                          avatar_url VARCHAR(255)
);

CREATE TABLE account (
                         id          INT PRIMARY KEY AUTO_INCREMENT,
                         username    VARCHAR(50) UNIQUE NOT NULL,
                         password    VARCHAR(255) NOT NULL,
                         role        ENUM('MANAGER', 'STAFF', 'RECEPTIONIST', 'ADMIN') NOT NULL,
                         employee_id INT NULL,
                         status      ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                         totp_secret_key VARCHAR(64) NULL,
                         is_2fa_enabled BOOLEAN NOT NULL DEFAULT FALSE,

                         FOREIGN KEY (employee_id) REFERENCES employee(id)
);

-- ============================================================
-- CA LÀM VIỆC
-- ============================================================

CREATE TABLE shift (
                       id         INT PRIMARY KEY AUTO_INCREMENT,
                       name       VARCHAR(50),
                       start_time TIME,
                       end_time   TIME
);

CREATE TABLE employee_shift (
                                id          INT PRIMARY KEY AUTO_INCREMENT,
                                employee_id INT NOT NULL,
                                shift_id    INT NOT NULL,
                                work_date   DATE NOT NULL,
                                note VARCHAR(255) NULL,

                                FOREIGN KEY (employee_id) REFERENCES employee(id),
                                FOREIGN KEY (shift_id)    REFERENCES shift(id)
);

-- ============================================================
-- KHÁCH HÀNG
-- ============================================================

CREATE TABLE customer (
                          id         INT PRIMARY KEY AUTO_INCREMENT,
                          name       VARCHAR(100),
                          phone      VARCHAR(20) UNIQUE,
                          identity   VARCHAR(50),
                          email      VARCHAR(255),
                          address    VARCHAR(255),
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ĐẶT PHÒNG
-- ============================================================

-- 1 booking có thể gồm nhiều phòng (combo)
CREATE TABLE booking (
                         id            INT PRIMARY KEY AUTO_INCREMENT,
                         customer_id   INT,
                         status ENUM('BOOKED','CHECKED_IN','CHECKED_OUT','CANCELLED') DEFAULT 'BOOKED',
                         note          VARCHAR(255),

                         created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
                         reservation_time       DATETIME,
                         expected_checkout_time DATETIME,

                         FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Chi tiết từng phòng trong booking
CREATE TABLE booking_room (
                              id            INT PRIMARY KEY AUTO_INCREMENT,
                              booking_id    INT NOT NULL,
                              room_id       INT NOT NULL,
                              status        ENUM('PLAYING','DONE','CANCELLED') DEFAULT 'PLAYING',
                              checkin_time  DATETIME,
                              checkout_time DATETIME,

                              FOREIGN KEY (booking_id) REFERENCES booking(id),
                              FOREIGN KEY (room_id)    REFERENCES room(id)
);

-- Nhân viên phục vụ booking
CREATE TABLE booking_room_employee (
                                       id               INT PRIMARY KEY AUTO_INCREMENT,
                                       booking_room_id  INT NOT NULL,
                                       employee_id      INT NOT NULL,
                                       start_time       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                       end_time         DATETIME NULL,

                                       FOREIGN KEY (booking_room_id) REFERENCES booking_room(id),
                                       FOREIGN KEY (employee_id)     REFERENCES employee(id)
);

-- ============================================================
-- SẢN PHẨM / DỊCH VỤ
-- ============================================================

CREATE TABLE product (
                         id       INT PRIMARY KEY AUTO_INCREMENT,
                         code     VARCHAR(20) UNIQUE,
                         name     VARCHAR(100),
                         category ENUM('FOOD','DRINK','EQUIPMENT','OTHER') DEFAULT 'OTHER',
                         price    DECIMAL(12,2) NOT NULL,
                         stock    INT DEFAULT 0
);

-- ============================================================
-- HÓA ĐƠN
-- ============================================================

CREATE TABLE invoice (
                         id            INT PRIMARY KEY AUTO_INCREMENT,
                         booking_id    INT UNIQUE NOT NULL,
                         room_price    DECIMAL(12,2) DEFAULT 0,   -- tổng tiền phòng
                         service_price DECIMAL(12,2) DEFAULT 0,   -- tổng tiền dịch vụ
                         discount      DECIMAL(12,2) DEFAULT 0,   -- giảm giá (nếu có)
                         total_price   DECIMAL(12,2) DEFAULT 0,   -- = room_price + service_price - discount
                         created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                         paid_at       DATETIME,
                         status        ENUM('UNPAID','PAID') DEFAULT 'UNPAID',
                         hash_value    VARCHAR(255) NULL,
                         encrypted_amount VARCHAR(1000) NULL,

                         FOREIGN KEY (booking_id) REFERENCES booking(id)
);

-- Chi tiết tiền từng phòng trong invoice (truy vết được giá từng phòng)
CREATE TABLE invoice_room_detail (
                                     id              INT PRIMARY KEY AUTO_INCREMENT,
                                     invoice_id      INT NOT NULL,
                                     booking_room_id INT NOT NULL,
                                     hours_used      DECIMAL(10,2),           -- số giờ thực tế
                                     price_per_hour  DECIMAL(12,2),           -- giá tại thời điểm thanh toán
                                     total_price     DECIMAL(12,2),

                                     FOREIGN KEY (invoice_id)      REFERENCES invoice(id),
                                     FOREIGN KEY (booking_room_id) REFERENCES booking_room(id)
);

-- Dịch vụ / đồ uống trong invoice
CREATE TABLE invoice_item (
                              id              INT PRIMARY KEY AUTO_INCREMENT,
                              invoice_id      INT NOT NULL,
                              booking_room_id INT NULL,
                              product_id      INT NOT NULL,
                              quantity        INT NOT NULL DEFAULT 1,
                              unit_price      DECIMAL(12,2) NOT NULL,
                              total_price     DECIMAL(12,2) NOT NULL,

                              FOREIGN KEY (invoice_id)      REFERENCES invoice(id),
                              FOREIGN KEY (booking_room_id) REFERENCES booking_room(id),
                              FOREIGN KEY (product_id)      REFERENCES product(id)
);

-- ============================================================
-- ĐÁNH GIÁ
-- ============================================================

CREATE TABLE feedback (
                          id              INT PRIMARY KEY AUTO_INCREMENT,
                          invoice_id      INT UNIQUE NOT NULL,
                          rating          INT CHECK (rating BETWEEN 1 AND 5),
                          comment         TEXT,
                          sentiment_label ENUM('POSITIVE','NEUTRAL','NEGATIVE'),
                          sentiment_score DECIMAL(5,4),
                          created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

                          FOREIGN KEY (invoice_id) REFERENCES invoice(id)
);

-- ============================================================
-- LƯƠNG & THƯỞNG
-- ============================================================

--Bonus
CREATE TABLE bonus (
                       id           INT PRIMARY KEY AUTO_INCREMENT,
                       employee_id  INT NOT NULL,
                       booking_id   INT NULL,
                       invoice_id   INT NULL,
                       type ENUM(
        'SERVICE',       -- thưởng bán đồ
        'ROOM_SUPPORT',  -- phục vụ phòng
        'TEAMWORK',      -- hỗ trợ team
        'KPI',           -- đạt chỉ tiêu
        'TIP',           -- khách tip
        'HOLIDAY',       -- thưởng lễ
        'OTHER'
    ) NOT NULL,
                       amount       DECIMAL(12,2) NOT NULL,
                       note         VARCHAR(255),
                       created_by   INT NULL,
                       created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

                       FOREIGN KEY (employee_id) REFERENCES employee(id),
                       FOREIGN KEY (booking_id)  REFERENCES booking(id),
                       FOREIGN KEY (invoice_id)  REFERENCES invoice(id),
                       FOREIGN KEY (created_by)  REFERENCES account(id)
);

CREATE TABLE penalty (
                         id           INT PRIMARY KEY AUTO_INCREMENT,
                         employee_id  INT NOT NULL,
                         booking_id   INT NULL,
                         invoice_id   INT NULL,
                         type ENUM(
        'LATE',          -- đi trễ
        'ABSENT',        -- vắng không phép
        'MISCONDUCT',    -- vi phạm nội quy
        'BOOKING',       -- liên quan booking
        'GENERAL'
    ) NOT NULL,
                         amount       DECIMAL(12,2) NOT NULL,
                         reason       VARCHAR(255),
                         created_by   INT NULL,
                         created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

                         FOREIGN KEY (employee_id) REFERENCES employee(id),
                         FOREIGN KEY (booking_id)  REFERENCES booking(id),
                         FOREIGN KEY (invoice_id)  REFERENCES invoice(id),
                         FOREIGN KEY (created_by)  REFERENCES account(id)
);


– Kỳ lương
CREATE TABLE payroll_period (
                                id           INT PRIMARY KEY AUTO_INCREMENT,
                                name         VARCHAR(100),        -- vd: "Tháng 4/2025"
                                period_start DATE NOT NULL,
                                period_end   DATE NOT NULL,
                                status       ENUM('DRAFT','APPROVED','PAID') DEFAULT 'DRAFT',
                                created_by   INT NULL,
                                approved_by  INT NULL,
                                created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

                                FOREIGN KEY (created_by)  REFERENCES account(id),
                                FOREIGN KEY (approved_by) REFERENCES account(id)
);

-- Bảng lương theo kỳ
CREATE TABLE payroll (
                         id               INT PRIMARY KEY AUTO_INCREMENT,
                         employee_id      INT NOT NULL,
                         period_start     DATE NOT NULL,
                         period_end       DATE NOT NULL,
                         total_work_hours DECIMAL(10,2) DEFAULT 0,
                         base_salary      DECIMAL(12,2) DEFAULT 0,
                         salary_from_hours DECIMAL(12,2) DEFAULT 0,
                         total_penalty    DECIMAL(12,2) DEFAULT 0,
                         total_bonus            DECIMAL(12,2) DEFAULT 0,
                         total_salary     DECIMAL(12,2) DEFAULT 0,   -- = base + hours + bonus - penalty
                         status           ENUM('DRAFT','APPROVED','PAID') DEFAULT 'DRAFT',
                         created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
                         payroll_period_id INT NOT NULL,
                         FOREIGN KEY (payroll_period_id) REFERENCES payroll_period(id),


                         FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE notification (
                              id          INT PRIMARY KEY AUTO_INCREMENT,
                              account_id  INT NOT NULL,
                              title       VARCHAR(100),
                              body        VARCHAR(255),
                              is_read     BOOLEAN DEFAULT FALSE,
                              created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

                              FOREIGN KEY (account_id) REFERENCES account(id)
);


