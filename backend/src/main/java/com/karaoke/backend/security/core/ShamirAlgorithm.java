package com.karaoke.backend.security.core;

import com.karaoke.backend.security.dto.ShareDTO;
import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class ShamirAlgorithm
{
    private static final SecureRandom random = new SecureRandom();

    public static List<ShareDTO> split(BigInteger secret, int k, int n)
    {
        BigInteger p = BigInteger.probablePrime(secret.bitLength() + 2, random);

        BigInteger[] coefficients = new BigInteger[k - 1];
        for (int i = 0; i < k - 1; i++) {
            coefficients[i] = new BigInteger(p.bitLength() - 1, random).mod(p);
        }

        List<ShareDTO> shares = new ArrayList<>();
        for (int x = 1; x <= n; x++)
        {
            BigInteger bx = BigInteger.valueOf(x);
            BigInteger y = secret;

            for (int i = 0; i < k - 1; i++)
            {
                BigInteger exp = bx.pow(i + 1).mod(p);
                BigInteger term = coefficients[i].multiply(exp).mod(p);
                y = y.add(term).mod(p);
            }
            shares.add(new ShareDTO(x, y.toString()));
        }

        shares.add(0, new ShareDTO(0, p.toString()));
        return shares;
    }

    public static BigInteger combine(List<ShareDTO> shares)
    {
        BigInteger currentP = null;
        List<ShareDTO> validShares = new ArrayList<>();

        for(ShareDTO s : shares) {
            if(s.getX() == 0) currentP = new BigInteger(s.getY());
            else validShares.add(s);
        }

        if(currentP == null) throw new RuntimeException("Thiếu tham số hệ thống (Số nguyên tố P)!");

        BigInteger secret = BigInteger.ZERO;

        for (int i = 0; i < validShares.size(); i++) {
            BigInteger xi = BigInteger.valueOf(validShares.get(i).getX());
            BigInteger yi = new BigInteger(validShares.get(i).getY());

            BigInteger num = BigInteger.ONE;
            BigInteger den = BigInteger.ONE;

            for (int j = 0; j < validShares.size(); j++) {
                if (i != j) {
                    BigInteger xj = BigInteger.valueOf(validShares.get(j).getX());
                    num = num.multiply(xj).mod(currentP);
                    BigInteger diff = xj.subtract(xi);
                    den = den.multiply(diff).mod(currentP);
                }
            }

            BigInteger denInverse = den.modInverse(currentP);
            BigInteger li = num.multiply(denInverse).mod(currentP);
            secret = secret.add(yi.multiply(li)).mod(currentP);
        }
        return secret.mod(currentP);
    }
}