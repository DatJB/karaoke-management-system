package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.PasswordRequest;
import com.karaoke.backend.dto.response.ProfileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProfileService {
    ProfileResponse getProfile(String username);
    void changePassword(String username, PasswordRequest request);
    String updateAvatar(String username, MultipartFile file) throws IOException;
}
