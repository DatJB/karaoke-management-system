package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.UpdateAccountRequest;
import com.karaoke.backend.dto.request.UpdateAccountStatusRequest;
import com.karaoke.backend.dto.response.AccountResponse;
import com.karaoke.backend.dto.response.NewPageResponse;
import com.karaoke.backend.dto.response.PageResponse;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.repository.NotificationRepository;
import com.karaoke.backend.service.AccountManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountManagementServiceImpl implements AccountManagementService
{
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.karaoke.backend.service.CloudinaryService cloudinaryService;

    @Override
    public NewPageResponse<AccountResponse> getAccounts(int page, int size, String search)
    {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page accountPage = accountRepository.search(search, pageable)
                .map(this::toResponse);

        return NewPageResponse.from(accountPage);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(Integer id, UpdateAccountRequest request)
    {
        Account account = getAccount(id);
        validateUsername(request.getUsername(), id);

        account.setUsername(request.getUsername());
        account.setRole(request.getRole());

        if (request.getPassword() != null && !request.getPassword().isBlank())
        {
            account.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getStatus() != null)
        {
            account.setStatus(request.getStatus());
        }

        return toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public AccountResponse updateStatus(Integer id, UpdateAccountStatusRequest request)
    {
        Account account = getAccount(id);
        account.setStatus(request.getStatus());

        return toResponse(accountRepository.save(account));
    }

    @Override
    @Transactional
    public void deleteAccount(Integer id)
    {
        Account account = getAccount(id);
        notificationRepository.deleteByAccountId(id);
        accountRepository.delete(account);
    }

    @Override
    @Transactional
    public String updateAccountAvatar(Integer id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Account account = getAccount(id);
        String newAvatarUrl = cloudinaryService.uploadImage(file);
        account.setAvatarUrl(newAvatarUrl);
        accountRepository.save(account);
        return newAvatarUrl;
    }

    @Override
    public Account findByUsername(String myUsername)
    {
        return accountRepository.findByUsername(myUsername).orElse(null);
    }

    private Account getAccount(Integer id)
    {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với id = " + id));
    }

    private void validateUsername(String username, Integer accountId)
    {
        if (accountRepository.existsByUsernameAndIdNot(username, accountId))
        {
            throw new IllegalArgumentException("Tài khoản đã tồn tại");
        }
    }

    private AccountResponse toResponse(Account account)
    {
        if (account == null)
        {
            return null;
        }

        Employee employee = account.getEmployee();
        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .role(account.getRole())
                .status(account.getStatus())
                .employeeId(employee != null ? employee.getId() : null)
                .employeeName(employee != null ? employee.getName() : null)
                .lastLoginAt(account.getLastLoginAt())
                .avatarUrl(account.getAvatarUrl())
                .build();
    }
}
