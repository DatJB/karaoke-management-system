package com.karaoke.backend.controller;

import com.karaoke.backend.dto.request.UpdateAccountRequest;
import com.karaoke.backend.dto.request.UpdateAccountStatusRequest;
import com.karaoke.backend.dto.response.AccountResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.service.AccountManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/accounts")
public class AccountController
{
    private final AccountManagementService accountManagementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public NewPageResponse<AccountResponse> getAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        return accountManagementService.getAccounts(page, size, search);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public AccountResponse updateAccount(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAccountRequest request
    ) {
        return accountManagementService.updateAccount(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public AccountResponse updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateAccountStatusRequest request
    ) {
        return accountManagementService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public Map<String, String> deleteAccount(
            @PathVariable Integer id
    ) {
        accountManagementService.deleteAccount(id);
        return Map.of("message", "Xóa tài khoản thành công");
    }

    @PostMapping("/{id}/avatar")
    @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
    public Map<String, String> updateAccountAvatar(
            @PathVariable Integer id,
            @RequestParam("image") org.springframework.web.multipart.MultipartFile file
    ) throws java.io.IOException
    {
        String url = accountManagementService.updateAccountAvatar(id, file);
        return Map.of("avatar_url", url);
    }
}
