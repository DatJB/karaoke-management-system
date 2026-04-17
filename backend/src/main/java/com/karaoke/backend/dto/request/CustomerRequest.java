package com.karaoke.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest
{
    private String name;
    private String phone;
    private String identity;
    private String email;
    private String address;
}
