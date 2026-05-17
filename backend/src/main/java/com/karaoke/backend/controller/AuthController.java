package com.karaoke.backend.controller;

import com.karaoke.backend.config.PasswordConfig;
import com.karaoke.backend.dto.request.LoginRequest;
import com.karaoke.backend.dto.request.TwoFactorEnableRequest;
import com.karaoke.backend.dto.request.TwoFactorVerifyRequest;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.service.AuthService;
import com.karaoke.backend.service.TwoFactorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController
{
    private final AuthService authService;
    private final PasswordConfig passwordConfig;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody @Valid LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<Map<String, String>> setup2fa(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(authService.setup2fa(userDetails.getUsername()));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<Map<String, String>> enable2fa(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid TwoFactorEnableRequest request
    ) {
        return ResponseEntity.ok(
                authService.enable2fa(userDetails.getUsername(), request.getCode())
        );
    }

    @PostMapping("/2fa/verify-login")
    public ResponseEntity<Map<String, Object>> verify2faLogin(
            @RequestBody @Valid TwoFactorVerifyRequest request
    ) {
        return ResponseEntity.ok(
                authService.verify2faLogin(request.getUsername(), request.getCode())
        );
    }
}