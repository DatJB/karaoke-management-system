package com.karaoke.backend.security.controller;

import com.karaoke.backend.security.dto.CombineRequestDTO;
import com.karaoke.backend.security.dto.ShareDTO;
import com.karaoke.backend.security.service.KeyManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.PrivateKey;
import java.util.List;

@RestController
@RequestMapping("/api/v1/security/keys")
@RequiredArgsConstructor
public class KeyManagementController
{
    private final KeyManagementService keyService;

//    @PostMapping("/setup")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> setupSystemKeys()
//    {
//        try {
//            List<ShareDTO> shares = keyService.generateAndSplitMasterKey();
//            return ResponseEntity.ok(shares);
//        } catch (Exception e)
//        {
//            return ResponseEntity.internalServerError().body("Lỗi sinh khóa: " + e.getMessage());
//        }
//    }

    @PostMapping("/split-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> splitFromUpload(@RequestParam("file") MultipartFile file)
    {
        try {
            if (file.getSize() > 1024 * 1024)
            {
                return ResponseEntity.badRequest().body("File quá lớn!");
            }

            List<ShareDTO> shares = keyService.splitUploadedPemKey(file);

            return ResponseEntity.ok(shares);
        } catch (Exception e)
        {
            return ResponseEntity.badRequest().body("Lỗi phân rã khóa từ file: " + e.getMessage());
        }
    }

    @PostMapping("/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreSystem(@RequestBody CombineRequestDTO request)
    {
        try {
            PrivateKey key = keyService.restoreMasterKey(request.getShares());
            return ResponseEntity.ok("Đồng thuận thành công! Đã khôi phục Master Key.");
        } catch (Exception e)
        {
            return ResponseEntity.badRequest().body("Khôi phục thất bại: " + e.getMessage());
        }
    }
}
