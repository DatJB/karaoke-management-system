package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.LoginRequest;

import java.util.Map;

public interface AuthService {

    Map<String, String> login(LoginRequest request);
}