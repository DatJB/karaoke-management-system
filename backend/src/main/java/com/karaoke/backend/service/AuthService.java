package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.LoginRequest;

import java.util.Map;

public interface AuthService
{
    Map<String, Object> login(LoginRequest request);

    Map<String, String> setup2fa(String username);

    Map<String, String> enable2fa(String username, String code);

    Map<String, Object> verify2faLogin(String username, String code);
}