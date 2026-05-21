package com.karaoke.backend.security.service;

public interface TwoFactorService
{
    String generateSecret();
    String generateOtpAuthUrl(String username, String secret);
    boolean verifyCode(String secret, String code);
}
