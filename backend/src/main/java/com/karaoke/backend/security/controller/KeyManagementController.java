package com.karaoke.backend.security.controller;

import com.karaoke.backend.entity.Account;
import com.karaoke.backend.entity.Employee;
import com.karaoke.backend.entity.SystemConfig;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.SystemConfigRepository;
import com.karaoke.backend.security.dto.CombineRequestDTO;
import com.karaoke.backend.security.dto.ShareDTO;
import com.karaoke.backend.security.service.KeyManagementService;
import com.karaoke.backend.security.service.TwoFactorService;
import com.karaoke.backend.service.AccountManagementService;
import com.karaoke.backend.util.KeyConverterUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.security.PrivateKey;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/security/keys")
@RequiredArgsConstructor
public class KeyManagementController
{
    private final KeyManagementService keyService;
    private final SimpMessagingTemplate messagingTemplate;
    private final TwoFactorService totpService;
    private final AccountManagementService accountService;
    private final SystemConfigRepository systemConfigRepository;
    public static final Map<String, ShareDTO> pendingSharesCache = new ConcurrentHashMap<>();
    public static final Map<String, List<String>> activeDistributionInfo = new ConcurrentHashMap<>();
    public static boolean isRecoveryActive = false;
    public static final Map<Integer, ShareDTO> collaborativeRecoveryShares = new ConcurrentHashMap<>();
    public static byte[] restoredMasterKeyCache = null;

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

//    @PostMapping("/split-upload")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> splitFromUpload(@RequestParam("file") MultipartFile file)
//    {
//        try {
//            if (file.getSize() > 1024 * 1024)
//            {
//                return ResponseEntity.badRequest().body("File quá lớn!");
//            }
//
//            List<ShareDTO> shares = keyService.splitUploadedPemKey(file);
//
//            return ResponseEntity.ok(shares);
//        } catch (Exception e)
//        {
//            return ResponseEntity.badRequest().body("Lỗi phân rã khóa từ file: " + e.getMessage());
//        }
//    }

    @PostMapping("/split-upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> splitFromUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("managerUsernames") List<String> managerUsernames)
    {
        try {
            if (file.getSize() > 1024 * 1024)
            {
                return ResponseEntity.badRequest().body("File quá lớn!");
            }
            if (managerUsernames == null || managerUsernames.isEmpty())
            {
                return ResponseEntity.badRequest().body("Vui lòng chọn danh sách Quản lý để nhận khóa!");
            }

            List<ShareDTO> shares = keyService.splitUploadedPemKey(file);

            ShareDTO systemShare = shares.stream()
                    .filter(s -> s.getX() == 0)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Lỗi thuật toán: Không tìm thấy mảnh hệ thống (x=0)!"));

            pendingSharesCache.clear();
            activeDistributionInfo.clear();

            pendingSharesCache.put("SYSTEM_P", systemShare);
            activeDistributionInfo.put("managers", new ArrayList<>(managerUsernames));
            activeDistributionInfo.put("downloaded", new ArrayList<>());

            List<ShareDTO> userShares = shares.stream()
                    .filter(s -> s.getX() != 0)
                    .toList();
            if (userShares.size() != managerUsernames.size()) {
                return ResponseEntity.badRequest().body(
                        "Lỗi logic: Thuật toán tạo ra " + userShares.size() +
                                " mảnh nhưng Admin lại chọn " + managerUsernames.size() + " quản lý!"
                );
            }

            for (int i = 0; i < managerUsernames.size(); i++) {
                String targetUsername = managerUsernames.get(i);
                ShareDTO mappedShare = userShares.get(i);

                pendingSharesCache.put(targetUsername, mappedShare);
            }

            Map<String, Object> socketMessage = new HashMap<>();
            socketMessage.put("status", "READY");
            socketMessage.put("message", "Khóa mới đã được phân rã. Vui lòng xác thực Google Authenticator để tải mảnh ghép của bạn!");
            socketMessage.put("managers", managerUsernames);
            socketMessage.put("downloaded", new ArrayList<>());

            messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);

            return ResponseEntity.ok("Phân rã thành công! Đã gửi tín hiệu chờ xác thực đến " + managerUsernames.size() + " Quản lý.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi phân rã khóa: " + e.getMessage());
        }
    }

    @GetMapping("/active-distribution")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getActiveDistribution() {
        Map<String, Object> response = new HashMap<>();
        if (!pendingSharesCache.containsKey("SYSTEM_P") || !activeDistributionInfo.containsKey("managers")) {
            response.put("active", false);
            return ResponseEntity.ok(response);
        }

        response.put("active", true);
        response.put("managers", activeDistributionInfo.get("managers"));
        response.put("downloaded", activeDistributionInfo.get("downloaded"));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/end-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> endDistribution() {
        pendingSharesCache.clear();
        activeDistributionInfo.clear();
        Map<String, Object> socketMessage = new HashMap<>();
        socketMessage.put("status", "ENDED");
        messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);
        return ResponseEntity.ok("Đã kết thúc phân phối khóa.");
    }

    @PostMapping("/start-recovery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> startRecovery() {
        isRecoveryActive = true;
        collaborativeRecoveryShares.clear();
        restoredMasterKeyCache = null;
        Map<String, Object> socketMessage = new HashMap<>();
        socketMessage.put("status", "RECOVERY_READY");
        messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);
        return ResponseEntity.ok("Đã bắt đầu phiên khôi phục.");
    }

    @PostMapping("/end-recovery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> endRecovery() {
        isRecoveryActive = false;
        collaborativeRecoveryShares.clear();
        Map<String, Object> socketMessage = new HashMap<>();
        socketMessage.put("status", "RECOVERY_ENDED");
        messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);
        return ResponseEntity.ok("Đã kết thúc phiên khôi phục.");
    }

    @GetMapping("/active-recovery")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getActiveRecovery() {
        Map<String, Object> response = new HashMap<>();
        response.put("active", isRecoveryActive);
        response.put("count", collaborativeRecoveryShares.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-recovery-shares")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> uploadRecoveryShares(@RequestParam("files") List<MultipartFile> files) {
        try {
            if (!isRecoveryActive) return ResponseEntity.badRequest().body("Phiên khôi phục chưa bắt đầu.");
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                String pemContent = new String(file.getBytes(), StandardCharsets.UTF_8);
                ShareDTO share = KeyConverterUtil.pemContentToShare(pemContent);
                collaborativeRecoveryShares.put(share.getX(), share);
            }
            Map<String, Object> socketMessage = new HashMap<>();
            socketMessage.put("status", "RECOVERY_UPDATE");
            socketMessage.put("count", collaborativeRecoveryShares.size());
            messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);
            return ResponseEntity.ok("Upload thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi upload: " + e.getMessage());
        }
    }

    @PostMapping("/execute-collaborative-recovery")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> executeCollaborativeRecovery() {
        try {
            if (collaborativeRecoveryShares.size() < 3) {
                return ResponseEntity.badRequest().body("Cần ít nhất 3 mảnh khóa để khôi phục!");
            }
            
            List<ShareDTO> shares = new ArrayList<>(collaborativeRecoveryShares.values());

            SystemConfig config = systemConfigRepository.findByConfigKey("SHAMIR_SYSTEM_SHARE_P")
                    .orElseThrow(() -> new ResourceNotFoundException("Lỗi hệ thống: Không tìm thấy tham số P và N trong Database!"));

            String[] parts = config.getConfigValue().split(":");
            if (parts.length != 2) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Dữ liệu cấu hình hệ thống trong Database bị sai định dạng!");
            }

            String pStrHex = parts[0];
            String nStrHex = parts[1];
            ShareDTO systemShare = new ShareDTO(0, pStrHex + ":" + nStrHex);
            shares.add(systemShare);

            PrivateKey key = keyService.restoreMasterKey(shares);

            String restoredPemContent = KeyConverterUtil.exportPrivateKeyToPemString(key);
            restoredMasterKeyCache = restoredPemContent.getBytes(StandardCharsets.UTF_8);

            isRecoveryActive = false;
            collaborativeRecoveryShares.clear();

            Map<String, Object> socketMessage = new HashMap<>();
            socketMessage.put("status", "RECOVERY_SUCCESS");
            messagingTemplate.convertAndSend("/topic/key-distribution", (Object) socketMessage);

            return ResponseEntity.ok("Khôi phục thành công, đang điều hướng tất cả tài khoản...");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Khôi phục thất bại, nguyên nhân: " + e.getMessage());
        }
    }

    @GetMapping("/download-restored-key")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> downloadRestoredKey() {
        if (restoredMasterKeyCache == null) {
            return ResponseEntity.badRequest().body("Không có khóa nào được khôi phục gần đây!");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "restored_master_key.pem");
        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(restoredMasterKeyCache.length)
                .body(restoredMasterKeyCache);
    }

    @PostMapping("/claim-share")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<?> claimMyShare(@RequestBody Map<String, String> request, Principal principal)
    {
        String myUsername = request.get("username");
        if (myUsername == null || myUsername.trim().isEmpty()) {
            myUsername = principal.getName();
        }
        String myOtp = request.get("otpCode");

        if (myOtp == null || myOtp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập mã OTP!");
        }

        Account myAccount = accountService.findByUsername(myUsername);
        if (myAccount == null || myAccount.getTotpSecretKey() == null)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản chưa được cấu hình bảo mật 2FA!");
        }

        String secretKeyFromDb = myAccount.getTotpSecretKey();
        boolean isOtpValid = totpService.verifyCode(secretKeyFromDb, myOtp);
        if (!isOtpValid)
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mã xác thực không đúng hoặc đã hết hạn!");
        }

        ShareDTO myShare = pendingSharesCache.get(myUsername);
        if (myShare == null)
        {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không có mảnh khóa nào được phân bổ cho bạn lúc này hoặc bạn đã tải rồi!");
        }

        ShareDTO systemShare = pendingSharesCache.get("SYSTEM_P");
        if (systemShare == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống: Không tìm thấy tham số P!");
        }
        String pValue = systemShare.getY();

        String pemContent = KeyConverterUtil.shareToPemContent(myShare, pValue);
        byte[] fileBytes = pemContent.getBytes(StandardCharsets.UTF_8);

        pendingSharesCache.remove(myUsername);
        if (activeDistributionInfo.containsKey("downloaded")) {
            activeDistributionInfo.get("downloaded").add(myUsername);
        }

        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("username", myUsername);
        statusUpdate.put("status", "DOWNLOADED");
        statusUpdate.put("timestamp", String.valueOf(System.currentTimeMillis()));
        messagingTemplate.convertAndSend("/topic/key-status", (Object) statusUpdate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "share_" + myUsername + ".pem");

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(fileBytes.length)
                .body(fileBytes);
    }

    @PostMapping("/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> restoreSystem(@RequestParam("files") List<MultipartFile> files)
    {
        try {
            if (files == null || files.size() < 3)
            {
                return ResponseEntity.badRequest().body("Cần ít nhất 3 mảnh khóa để khôi phục!");
            }
            if (files.size() > 4)
            {
                return ResponseEntity.badRequest().body("Chỉ chấp nhận tối đa 4 mảnh khóa!");
            }

            List<ShareDTO> shares = new ArrayList<>();
            for (MultipartFile file : files)
            {
                if (file.isEmpty())
                {
                    return ResponseEntity.badRequest().body("Phát hiện file rỗng được tải lên!");
                }

                String pemContent = new String(file.getBytes(), StandardCharsets.UTF_8);

                ShareDTO share = KeyConverterUtil.pemContentToShare(pemContent);
                shares.add(share);
            }

//            ShareDTO systemShare = pendingSharesCache.get("SYSTEM_P");
//            if (systemShare == null)
//            {
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                        .body("Lỗi cấu hình: Không tìm thấy tham số Hệ thống (P) để làm toán!");
//            }
//            shares.add(systemShare);

            SystemConfig config = systemConfigRepository.findByConfigKey("SHAMIR_SYSTEM_SHARE_P")
                    .orElseThrow(() -> new ResourceNotFoundException("Lỗi hệ thống: Không tìm thấy tham số P và N trong Database!"));

            String[] parts = config.getConfigValue().split(":");
            if (parts.length != 2) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Dữ liệu cấu hình hệ thống trong Database bị sai định dạng!");
            }

            String pStrHex = parts[0];
            String nStrHex = parts[1];
            ShareDTO systemShare = new ShareDTO(0, pStrHex + ":" + nStrHex);
            shares.add(systemShare);

            PrivateKey key = keyService.restoreMasterKey(shares);

            String restoredPemContent = KeyConverterUtil.exportPrivateKeyToPemString(key);
            byte[] fileBytes = restoredPemContent.getBytes(StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "restored_master_key.pem");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(fileBytes.length)
                    .body(fileBytes);

        } catch (Exception e)
        {
            return ResponseEntity.badRequest().body("Khôi phục thất bại, nguyên nhân: " + e.getMessage());
        }
    }
}
