package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProfileResponse {
    private String username;
    private String name;
    private String code;
    private String role;
    private String phone;
    private String avatarUrl;
    private Boolean twoFactorEnabled;
    private List<ActivityInfo> recentActivities;

    @Data
    @Builder
    public static class ActivityInfo {
        private String type;
        private String description;
        private LocalDateTime timestamp;
    }
}
