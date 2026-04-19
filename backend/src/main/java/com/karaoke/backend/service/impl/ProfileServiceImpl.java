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
import com.karaoke.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + username));

        List<ProfileResponse.ActivityInfo> activities = new ArrayList<>();

        if (account.getRole() == Account.Role.STAFF) {
            // Staff activities: assigned rooms
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
            // Receptionist/Admin/Manager activities: recent bookings
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
                .role(account.getRole().name())
                .phone(account.getEmployee() != null ? account.getEmployee().getPhone() : "")
                .avatarUrl(account.getEmployee() != null ? account.getEmployee().getAvatarUrl() : "")
                .recentActivities(activities)
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
}
