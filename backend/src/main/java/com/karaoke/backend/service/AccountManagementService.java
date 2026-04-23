package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.UpdateAccountRequest;
import com.karaoke.backend.dto.request.UpdateAccountStatusRequest;
import com.karaoke.backend.dto.response.AccountResponse;
import com.karaoke.backend.dto.response.PageResponse;

public interface AccountManagementService
{
    PageResponse<AccountResponse> getAccounts(int page, int size, String search);

    AccountResponse updateAccount(Integer id, UpdateAccountRequest request);

    AccountResponse updateStatus(Integer id, UpdateAccountStatusRequest request);

    void deleteAccount(Integer id);
}
