package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.PasswordRequest;
import com.karaoke.backend.dto.response.ProfileResponse;
import com.karaoke.backend.entity.Account;
import com.karaoke.backend.entity.Booking;
import com.karaoke.backend.entity.BookingRoomEmployee;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.AccountRepository;
import com.karaoke.backend.repository.BookingRepository;
import com.karaoke.backend.repository.BookingRoomEmployeeRepository;
import com.karaoke.backend.service.CloudinaryService;
import com.karaoke.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final AccountRepository accountRepository;
    private final BookingRepository bookingRepository;
    private final BookingRoomEmployeeRepository bookingRoomEmployeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + username));

        List<ProfileResponse.ActivityInfo> activities = new ArrayList<>();

        if (account.getRole() == Account.Role.STAFF) {
            if (account.getEmployee() != null) {
                List<BookingRoomEmployee> assignments = bookingRoomEmployeeRepository.findByEmployeeId(account.getEmployee().getId());
                activities = assignments.stream()
                        .map(a -> ProfileResponse.ActivityInfo.builder()
                                .type("ASSIGNMENT")
                                .description("Được phân công phục vụ phòng " + a.getBookingRoom().getRoom().getName())
                                .timestamp(a.getBookingRoom().getBooking().getCreatedAt()) // Use booking creation as ref
                                .build())
                        .limit(10)
                        .collect(Collectors.toList());
            }
        } else if (account.getRole() == Account.Role.RECEPTIONIST || account.getRole() == Account.Role.ADMIN || account.getRole() == Account.Role.MANAGER) {
            List<Booking> bookings = bookingRepository.findTop5ByOrderByCreatedAtDesc();
            activities = bookings.stream()
                    .map(b -> ProfileResponse.ActivityInfo.builder()
                            .type("BOOKING")
                            .description("Đơn đặt phòng mới: " + (b.getCustomer() != null ? b.getCustomer().getName() : "Khách vãng lai"))
                            .timestamp(b.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
        }

        return ProfileResponse.builder()
                .username(account.getUsername())
                .name(account.getEmployee() != null ? account.getEmployee().getName() : account.getUsername())
                .code(account.getEmployee() != null ? account.getEmployee().getCode() : "")
                .role(account.getRole().name())
                .phone(account.getEmployee() != null ? account.getEmployee().getPhone() : "")
                .avatarUrl(account.getAvatarUrl())
                .twoFactorEnabled(Boolean.TRUE.equals(account.getTwoFactorEnabled()))
                .recentActivities(activities.stream().limit(3).toList())
                .build();
    }

    @Override
    @Transactional
    public void changePassword(String username, PasswordRequest request) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + username));

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    @Override
    @Transactional
    public String updateAvatar(String username, MultipartFile file) throws IOException
    {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + username));

        String newAvatarUrl = cloudinaryService.uploadImage(file);
        account.setAvatarUrl(newAvatarUrl);
        accountRepository.save(account);
        return newAvatarUrl;
    }
}
