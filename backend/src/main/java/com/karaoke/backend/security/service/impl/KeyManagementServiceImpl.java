package com.karaoke.backend.security.service.impl;

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

        BigInteger restoredInt = ShamirAlgorithm.combine(shares);
        PrivateKey restoredKey = KeyConverterUtil.bigIntToPrivateKey(restoredInt);

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

        BigInteger secretInt = KeyConverterUtil.privateKeyToBigInt(privateKey);
        List<ShareDTO> shares = ShamirAlgorithm.split(secretInt, 3, 4);

        System.out.println("Đã xử lý file upload và băm thành công 4 mảnh!");
        return shares;
    }
}
