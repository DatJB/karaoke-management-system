package com.karaoke.backend.security.service.impl;

import com.karaoke.backend.entity.SystemConfig;
import com.karaoke.backend.repository.SystemConfigRepository;
import com.karaoke.backend.security.core.ShamirAlgorithm;
import com.karaoke.backend.security.dto.ShareDTO;
import com.karaoke.backend.security.service.KeyManagementService;
import com.karaoke.backend.util.KeyConverterUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KeyManagementServiceImpl implements KeyManagementService
{
    private PublicKey currentPublicKey;
    private final SystemConfigRepository systemConfigRepository;

//    @Override
//    public List<ShareDTO> generateAndSplitMasterKey() throws Exception
//    {
//        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
//        generator.initialize(2048);
//        KeyPair pair = generator.generateKeyPair();
//
//        currentPublicKey = pair.getPublic();
//        PrivateKey privateKey = pair.getPrivate();
//
//        BigInteger secretInt = KeyConverterUtil.privateKeyToBigInt(privateKey);
//        List<ShareDTO> shares = ShamirAlgorithm.split(secretInt, 3, 4);
//
//        System.out.println("Đã sinh khóa và cắt khóa thành công! Khóa gốc đã bị xóa khỏi RAM.");
//        return shares;
//    }

    @Override
    public PrivateKey restoreMasterKey(List<ShareDTO> shares) throws Exception
    {
        if(shares.size() < 4)
        {
            throw new RuntimeException("Chưa đủ ngưỡng đồng thuận! Cần ít nhất 3 mảnh ghép và 1 mảnh P.");
        }

        BigInteger n = null;
        for (ShareDTO s : shares) {
            if (s.getX() == 0 && s.getY() != null && s.getY().contains(":")) {
                String[] parts = s.getY().split(":");
                s.setY(new BigInteger(parts[0], 16).toString());
                n = new BigInteger(parts[1], 16);
            }
        }

        BigInteger restoredInt = ShamirAlgorithm.combine(shares);

        PrivateKey restoredKey;
        if (n != null) {
            java.security.spec.RSAPrivateKeySpec spec = new java.security.spec.RSAPrivateKeySpec(n, restoredInt);
            java.security.KeyFactory factory = java.security.KeyFactory.getInstance("RSA");
            restoredKey = factory.generatePrivate(spec);
        } else {
            restoredKey = KeyConverterUtil.bigIntToPrivateKey(restoredInt);
        }

        System.out.println("Khôi phục thành công Private Key!");
        return restoredKey;
    }

    @Override
    public List<ShareDTO> splitUploadedPemKey(MultipartFile file) throws Exception
    {
        if (file.isEmpty())
        {
            throw new RuntimeException("File rỗng! Vui lòng upload file .pem hợp lệ.");
        }

        String pemContent = new String(file.getBytes(), StandardCharsets.UTF_8);
        PrivateKey privateKey = KeyConverterUtil.parsePemString(pemContent);

        java.security.interfaces.RSAPrivateKey rsa = (java.security.interfaces.RSAPrivateKey) privateKey;
        BigInteger secretInt = rsa.getPrivateExponent();
        BigInteger n = rsa.getModulus();

        List<ShareDTO> shares = ShamirAlgorithm.split(secretInt, 3, 4);

        BigInteger p = ShamirAlgorithm.getP();

        String systemShareValue = p.toString(16) + ":" + n.toString(16);

        SystemConfig pConfig = systemConfigRepository.findByConfigKey("SHAMIR_SYSTEM_SHARE_P")
                .orElse(new SystemConfig());
        pConfig.setConfigKey("SHAMIR_SYSTEM_SHARE_P");
        pConfig.setConfigValue(systemShareValue);
        pConfig.setDescription("Tham số P (Shamir) và Modulus N (RSA) dùng để làm nền toán học khôi phục khóa");
        systemConfigRepository.save(pConfig);

        System.out.println("Đã xử lý file upload và băm thành công 4 mảnh!");
        return shares;
    }
}
