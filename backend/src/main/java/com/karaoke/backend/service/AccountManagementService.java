package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.UpdateAccountRequest;
import com.karaoke.backend.dto.request.UpdateAccountStatusRequest;
import com.karaoke.backend.dto.response.AccountResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.entity.Account;

public interface AccountManagementService
{
    NewPageResponse<AccountResponse> getAccounts(int page, int size, String search);

    AccountResponse updateAccount(Integer id, UpdateAccountRequest request);

    AccountResponse updateStatus(Integer id, UpdateAccountStatusRequest request);

    void deleteAccount(Integer id);

    String updateAccountAvatar(Integer id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;

    Account findByUsername(String myUsername);
}
