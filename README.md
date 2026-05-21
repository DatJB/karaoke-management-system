# Karaoke Management System

Hệ thống quản lý quán karaoke fullstack gồm:
- Backend: Spring Boot + JWT + Spring Security + JPA + MySQL
- Frontend: ReactJS (Vite) + Axios + TailwindCSS + Context API

---

# Tech Stack

## Backend
- Java 21
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Lombok

## Frontend
- ReactJS (Vite)
- React Router DOM
- Axios
- TailwindCSS

---

# Project Structure

## Backend
backend/src/main/java/com/karaoke/backend
- config
- controller
- entity
- repository
- service
- security
- dto

## Frontend
frontend/src
- api
- context
- pages
- layouts
- components

---

# Role System

- ADMIN → full system
- MANAGER → dashboard + reports
- STAFF → rooms + invoices
- RECEPTIONIST → booking + customers

---

# Frontend Routing

- If no token → redirect /login
- ADMIN/MANAGER → /dashboard
- Others → /rooms

---

# Backend Setup

## application.properties
server.port=8081

spring.datasource.url=jdbc:mysql://localhost:3306/karaoke
spring.datasource.username=root
spring.datasource.password=123456

spring.jpa.hibernate.ddl-auto=update

jwt.secret=your_secret
jwt.expiration=86400000

---

## Run backend
mvn spring-boot:run

---

# Frontend Setup

npm install
npm run dev

---

# Security & Usecase 4 Defense

Hệ thống được thiết kế theo mô hình **Zero Trust** và tích hợp các cơ chế bảo mật nâng cao để phòng chống tấn công nội bộ (Usecase 4 - Nhân viên trộm danh sách khách hàng VIP):
- **Mã hóa HTTPS (SSL/TLS):** Bảo vệ đường truyền nội bộ khỏi hành vi nghe lén (Sniffing/Wireshark).
- **Cloudflare Tunnel (Outbound connection):** Định tuyến lưu lượng an toàn mà không cần mở port modem (Port Forwarding), ẩn giấu Public IP thực của máy chủ.
- **Cloudflare WAF / Rate Limiting:** Chặn đứng các hành vi cào dữ liệu tự động (Web Scraping/Bot) ngay tại Edge Server.

---

# Hướng dẫn cấu hình môi trường & Chạy Test

## 1. Cấu hình file `.env` cho Frontend
Để gọi API chính xác, bạn cần tạo file `.env` tại thư mục `frontend/` (file này đã được đưa vào `.gitignore` để tránh xung đột trên Git):

* **Cách 1: Chạy hoàn toàn dưới localhost (Mặc định cho nhóm):**
  Bạn không cần làm gì cả hoặc tạo file `frontend/.env` với nội dung:
  ```env
  VITE_API_BASE_URL=http://localhost:8081/api/v1
  ```
* **Cách 2: Chạy qua Cloudflare Tunnel của riêng bạn:**
  Tạo file `frontend/.env` và trỏ URL sang subdomain API của bạn:
  ```env
  VITE_API_BASE_URL=https://api.domain-cua-ban.vn/api/v1
  ```

---

## 2. Thiết lập Cloudflare Tunnel (Cho demo tên miền riêng)

Nếu bạn muốn cấu hình chạy tên miền riêng qua Cloudflare Tunnel:
1. Tải và cài đặt công cụ CLI `cloudflared` trên máy của bạn.
2. Đăng nhập và ủy quyền domain:
   ```bash
   cloudflared tunnel login
   ```
3. Tạo tunnel mới:
   ```bash
   cloudflared tunnel create <ten-tunnel>
   ```
4. Cấu hình DNS cho domain và subdomain của bạn trỏ về tunnel:
   ```bash
   cloudflared tunnel route dns <ten-tunnel> domain-cua-ban.vn
   cloudflared tunnel route dns <ten-tunnel> api.domain-cua-ban.vn
   ```
5. Cấu hình file `~/.cloudflared/config.yml` trên máy bạn:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /home/<USER>/.cloudflared/<TUNNEL_ID>.json

   ingress:
     - hostname: api.domain-cua-ban.vn
       service: http://localhost:8081
     - hostname: domain-cua-ban.vn
       service: http://localhost:5173
     - service: http_status:404
   ```
6. Khởi chạy tunnel:
   ```bash
   cloudflared tunnel run <ten-tunnel>
   ```

---

## 3. Quy trình 5 bước chạy thử nghiệm thực tế (Mô phỏng tấn công)

Mở các terminal khác nhau và thực hiện theo thứ tự:

1. **Khởi động Database:**
   ```bash
   docker start kara-db
   ```
2. **Khởi động Backend Spring Boot:**
   ```bash
   cd backend && ./mvnw spring-boot:run
   ```
3. **Khởi động Frontend React:**
   ```bash
   cd frontend && npm run dev
   ```
4. **Chạy Tunnel (Nếu dùng tên miền):**
   ```bash
   cloudflared tunnel run <ten-tunnel>
   ```
5. **Chạy Script test cào dữ liệu (Usecase 4):**
   Mở file `test-rate-limit.py` ở thư mục gốc, cập nhật biến `BASE_URL` trỏ về API của bạn (localhost hoặc domain Cloudflare) rồi chạy lệnh:
   ```bash
   python3 test-rate-limit.py
   ```
   *Kết quả:* Script đăng nhập thành công và spam 15 request liên tục. 10 request đầu tiên lấy dữ liệu thành công (`200 OK`), các request sau bị chặn đứng và trả về lỗi `429 Too Many Requests`.

