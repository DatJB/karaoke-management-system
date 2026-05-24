package com.karaoke.backend.security;

import com.karaoke.backend.entity.AuditLog;
import com.karaoke.backend.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AuditLogInterceptor implements HandlerInterceptor {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        String url = request.getRequestURI();
        
        // Log all data-altering requests (POST, PUT, DELETE, PATCH)
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method)) {
            String username = "Anonymous";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                username = auth.getName();
            }

            // Friendly action description
            String action = getActionDescription(method, url, request);
            
            // Get client IP
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }

            AuditLog log = AuditLog.builder()
                    .action(action)
                    .ipAddress(ip)
                    .method(method)
                    .status(response.getStatus())
                    .timestamp(LocalDateTime.now())
                    .url(url)
                    .username(username)
                    .build();

            auditLogRepository.save(log);
        }
    }

    private String getActionDescription(String method, String url, HttpServletRequest request) {
        String action = method + " " + url;
        if (url.startsWith("/api/v1/auth/login")) {
            action = "Đăng nhập hệ thống";
        } else if (url.startsWith("/api/v1/auth/2fa/verify-login")) {
            action = "Xác thực 2FA đăng nhập";
        } else if (url.contains("/invoices") && url.contains("/confirm-payment")) {
            action = "Xác nhận thanh toán hóa đơn";
        } else if (url.startsWith("/api/v1/payroll-periods") && url.contains("/status")) {
            String status = request.getParameter("status");
            action = "Cập nhật trạng thái kỳ lương thành: " + (status != null ? status : "N/A");
        } else if (url.startsWith("/api/v1/payroll-periods") && url.contains("/calculate")) {
            action = "Chạy tính lương cho kỳ lương";
        } else if (url.startsWith("/api/v1/payroll-periods") && url.contains("/payrolls")) {
            action = "Cập nhật chi tiết bảng lương nhân viên: " + method;
        } else if (url.startsWith("/api/v1/customers")) {
            action = "Thao tác trên danh sách Khách hàng VIP: " + method;
        } else if (url.startsWith("/api/v1/employees")) {
            action = "Quản lý nhân viên: " + method;
        } else if (url.startsWith("/api/v1/accounts")) {
            action = "Quản lý tài khoản: " + method;
        } else if (url.startsWith("/api/v1/rooms")) {
            action = "Quản lý phòng hát: " + method;
        } else if (url.startsWith("/api/v1/products")) {
            action = "Quản lý sản phẩm: " + method;
        } else if (url.startsWith("/api/v1/settings")) {
            action = "Thay đổi cài đặt giá phòng: " + method;
        }
        return action;
    }
}

