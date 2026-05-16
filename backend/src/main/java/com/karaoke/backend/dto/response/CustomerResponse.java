package com.karaoke.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Integer id;
    private String name;
    private String phone;
    private String identity;
    private String email;
    private String address;
    private LocalDateTime createdAt;
}