package com.karaoke.backend.util;

import com.karaoke.backend.security.dto.ShareDTO;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Arrays;
import java.util.Base64;

public class KeyConverterUtil
{
    private static final String PEM_HEADER = "-----BEGIN SHAMIR SHARE-----";
    private static final String PEM_FOOTER = "-----END SHAMIR SHARE-----";

    public static BigInteger privateKeyToBigInt(PrivateKey privateKey)
    {
        byte[] keyBytes = privateKey.getEncoded();
        return new BigInteger(1, keyBytes);
    }

    public static PrivateKey bigIntToPrivateKey(BigInteger secretInt) throws Exception
    {
        byte[] intBytes = secretInt.toByteArray();

        byte[] keyBytes;
        if (intBytes[0] == 0)
        {
            keyBytes = Arrays.copyOfRange(intBytes, 1, intBytes.length);
        } else
        {
            keyBytes = intBytes;
        }

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return keyFactory.generatePrivate(keySpec);
    }

    public static PrivateKey parsePemString(String keyContent) throws Exception
    {
        keyContent = keyContent.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] keyBytes = java.util.Base64.getDecoder().decode(keyContent);

        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return keyFactory.generatePrivate(keySpec);
    }

    public static String exportPrivateKeyToPemString(PrivateKey privateKey)
    {
        byte[] encodedKey = privateKey.getEncoded();

        String base64Key = Base64.getEncoder().encodeToString(encodedKey);

        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PRIVATE KEY-----\n");

        int index = 0;
        while (index < base64Key.length())
        {
            int end = Math.min(index + 64, base64Key.length());
            pem.append(base64Key.substring(index, end)).append("\n");
            index += 64;
        }

        pem.append("-----END PRIVATE KEY-----");
        return pem.toString();
    }


    public static String shareToPemContent(ShareDTO share, String pValue)
    {
        String rawData = share.getX() + ":" + share.getY() + ":" + pValue;

        String base64Encoded = Base64.getEncoder().encodeToString(rawData.getBytes());

        StringBuilder pemBody = new StringBuilder();
        for (int i = 0; i < base64Encoded.length(); i += 64)
        {
            pemBody.append(base64Encoded, i, Math.min(i + 64, base64Encoded.length())).append("\n");
        }

        return PEM_HEADER + "\n" +
                pemBody.toString() +
                PEM_FOOTER;
    }

    public static ShareDTO pemContentToShare(String pemContent)
    {
        try {
            String base64Data = pemContent
                    .replace(PEM_HEADER, "")
                    .replace(PEM_FOOTER, "")
                    .replaceAll("\\s+", ""); // Xóa mọi khoảng trắng và dấu xuống dòng

            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
            String rawData = new String(decodedBytes);

            String[] parts = rawData.split(":");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Định dạng dữ liệu trong file PEM bị hỏng!");
            }

            int x = Integer.parseInt(parts[0]);
            String y = parts[1];

            return new ShareDTO(x, y);

        } catch (Exception e)
        {
            throw new RuntimeException("Không thể đọc file khóa: " + e.getMessage());
        }
    }
}