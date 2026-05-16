package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.LoginRequest;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.security.JwtService;
import com.karaoke.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AccountRepository repo;

    @Override
    public Map<String, String> login(LoginRequest request)
    {
        Account acc = repo.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Lỗi hệ thống: Không lấy được thông tin tài khoản!"));

        if ("INACTIVE".equals(acc.getStatus().name())) {
            throw new BusinessException("Tài khoản của bạn đã bị khóa.\n Vui lòng liên hệ Quản lý!");
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác!");
        }

        acc.setLastLoginAt(LocalDateTime.now());
        repo.save(acc);

        Integer employeeId = (acc.getEmployee() != null)
                ? acc.getEmployee().getId()
                : null;


        String token = jwtService.generateToken(
                acc.getId(),
                acc.getUsername(),
                acc.getRole().name(),
                employeeId
        );

        String employeeName = (acc.getEmployee() != null && acc.getEmployee().getName() != null) ? acc.getEmployee().getName() : acc.getUsername();
        String avatarUrl = acc.getAvatarUrl() != null ? acc.getAvatarUrl() : "";

        return Map.of(
            "token", token,
            "role", acc.getRole().name(),
            "name", employeeName,
            "avatarUrl", avatarUrl
        );
    }
}
