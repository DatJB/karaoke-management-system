package com.karaoke.backend.service.impl;

import com.karaoke.backend.service.TwoFactorService;
import org.jboss.aerogear.security.otp.Totp;
import org.jboss.aerogear.security.otp.api.Base32;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TwoFactorServiceImpl implements TwoFactorService
{
    private static final String ISSUER = "KaraokeKTV";

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

    @Override
    public boolean verifyCode(String secret, String code)
    {
        if (secret == null || code == null || !code.matches("\\d{6}")) {
            return false;
        }

        Totp totp = new Totp(secret);
        return totp.verify(code);
    }
}
