package com.karaoke.backend.security.service.impl;

import com.karaoke.backend.security.service.TwoFactorService;
import org.jboss.aerogear.security.otp.Totp;
import org.jboss.aerogear.security.otp.api.Base32;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TwoFactorServiceImpl implements TwoFactorService
{
    private static final String ISSUER = "KaraokeKTV";
    private final Map<String, Long> usedCodesCache = new ConcurrentHashMap<>();

    @Override
    public String generateSecret()
    {
        return Base32.random();
    }

    @Override
    public String generateOtpAuthUrl(String username, String secret)
    {
        String label = ISSUER + ":" + username;

        return "otpauth://totp/"
                + URLEncoder.encode(label, StandardCharsets.UTF_8)
                + "?secret=" + URLEncoder.encode(secret, StandardCharsets.UTF_8)
                + "&issuer=" + URLEncoder.encode(ISSUER, StandardCharsets.UTF_8)
                + "&algorithm=SHA1"
                + "&digits=6"
                + "&period=30";
    }

//    @Override
//    public boolean verifyCode(String secret, String code)
//    {
//        if (secret == null || code == null || !code.matches("\\d{6}")) {
//            return false;
//        }
//
//        Totp totp = new Totp(secret);
//        return totp.verify(code);
//    }

    @Override
    public boolean verifyCode(String secret, String code)
    {
        if (secret == null || code == null || !code.matches("\\d{6}"))
        {
            return false;
        }
        String cacheKey = secret + ":" + code;

        if (usedCodesCache.containsKey(cacheKey))
        {
            System.out.println("Cảnh báo: Phát hiện Replay Attack hoặc người dùng double-click!");
            return false;
        }

        Totp totp = new Totp(secret);
        boolean isValid = totp.verify(code);

        if (isValid)
        {
            usedCodesCache.put(cacheKey, System.currentTimeMillis());
        }

        return isValid;
    }
}
