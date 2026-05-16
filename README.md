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

# Security

- JWT authentication
- Stateless session
- CORS enabled for React (5173)
- Role-based authorization

---

# Quick Start

Backend:
mvn spring-boot:run

Frontend:
npm run dev
