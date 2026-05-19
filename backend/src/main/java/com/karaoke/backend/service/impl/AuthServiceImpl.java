package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.LoginRequest;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.exception.BusinessException;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.security.JwtService;
import com.karaoke.backend.service.AuthService;
import com.karaoke.backend.security.service.TwoFactorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService
{
    private final AuthenticationManager authManager;
    private final TwoFactorService twoFactorService;
    private final JwtService jwtService;
    private final AccountRepository repo;

    @Override
    public Map<String, Object> login(LoginRequest request)
    {
        Account acc = repo.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Lỗi hệ thống: Không lấy được thông tin tài khoản!"));

        if ("INACTIVE".equals(acc.getStatus().name()))
        {
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

        if (Boolean.TRUE.equals(acc.getTwoFactorEnabled()))
        {
            return Map.of(
                "requires2FA", true,
                "username", acc.getUsername()
            );
        }

        return buildLoginSuccessResponse(acc);
    }

    @Override
    @Transactional
    public Map<String, String> setup2fa(String username)
    {
        Account acc = repo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        String secret = twoFactorService.generateSecret();

        acc.setTotpSecretKey(secret);
        acc.setTwoFactorEnabled(false);
        repo.save(acc);

        String otpAuthUrl = twoFactorService.generateOtpAuthUrl(acc.getUsername(), secret);

        return Map.of("otpAuthUrl", otpAuthUrl);
    }

    @Override
    @Transactional
    public Map<String, String> enable2fa(String username, String code) {
        Account acc = repo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Lỗi hệ thống: Không lấy được thông tin tài khoản!"));

        if (!twoFactorService.verifyCode(acc.getTotpSecretKey(), code))
        {
            throw new BadCredentialsException("Mã 2FA không đúng");
        }

        acc.setTwoFactorEnabled(true);
        repo.save(acc);

        return Map.of("message", "Đã bật 2FA");
    }

    @Override
    public Map<String, Object> verify2faLogin(String username, String code)
    {
        Account acc = repo.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        if (!Boolean.TRUE.equals(acc.getTwoFactorEnabled()))
        {
            throw new BadCredentialsException("Tài khoản chưa bật 2FA");
        }

        if (!twoFactorService.verifyCode(acc.getTotpSecretKey(), code))
        {
            throw new BadCredentialsException("Mã xác thực 2FA không chính xác");
        }

        return buildLoginSuccessResponse(acc);
    }

    private Map<String, Object> buildLoginSuccessResponse(Account acc)
    {
        acc.setLastLoginAt(LocalDateTime.now());
        repo.save(acc);

        Integer employeeId = acc.getEmployee() != null ? acc.getEmployee().getId() : null;

        String token = jwtService.generateToken(
            acc.getId(),
            acc.getUsername(),
            acc.getRole().name(),
            employeeId
        );

        String name = acc.getEmployee() != null && acc.getEmployee().getName() != null
            ? acc.getEmployee().getName()
            : acc.getUsername();

        return Map.of(
            "requires2FA", false,
            "token", token,
            "role", acc.getRole().name(),
            "name", name,
            "avatarUrl", acc.getAvatarUrl() != null ? acc.getAvatarUrl() : ""
        );
    }
}
