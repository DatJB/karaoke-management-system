package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.PasswordRequest;
import com.karaoke.backend.dto.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse getProfile(String username);
    void changePassword(String username, PasswordRequest request);
}
