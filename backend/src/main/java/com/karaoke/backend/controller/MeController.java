package com.karaoke.backend.controller;

import com.karaoke.backend.dto.response.ServingRoomResponse;
import com.karaoke.backend.service.MeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
public class MeController {

    private final MeService meService;

    @GetMapping("/serving-rooms")
    @PreAuthorize("hasAnyAuthority('ROLE_STAFF', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<List<ServingRoomResponse>> getServingRooms(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(meService.getServingRooms(userDetails.getUsername()));
    }
}
