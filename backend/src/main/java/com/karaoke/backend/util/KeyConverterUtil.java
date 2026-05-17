package com.karaoke.backend.util;

import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Arrays;

public class KeyConverterUtil
{
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
}