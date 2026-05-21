import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

public class TestShamir {
    public static class ShareDTO {
        private int x;
        private String y;
        public ShareDTO(int x, String y) { this.x = x; this.y = y; }
        public int getX() { return x; }
        public String getY() { return y; }
        public void setY(String y) { this.y = y; }
    }

    public static BigInteger p;
    private static final SecureRandom random = new SecureRandom();

    public static List<ShareDTO> split(BigInteger secret, int k, int n) {
        p = BigInteger.probablePrime(secret.bitLength() + 1, random);
        BigInteger[] coefficients = new BigInteger[k - 1];
        for (int i = 0; i < k - 1; i++) {
            BigInteger c;
            do { c = new BigInteger(p.bitLength(), random).mod(p); } while (c.equals(BigInteger.ZERO));
            coefficients[i] = c;
        }

        List<ShareDTO> shares = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            BigInteger bx = BigInteger.valueOf(i);
            BigInteger y = secret;
            for (int j = 0; j < k - 1; j++) {
                BigInteger exp = bx.pow(j + 1).mod(p);
                BigInteger term = coefficients[j].multiply(exp).mod(p);
                y = y.add(term).mod(p);
            }
            shares.add(new ShareDTO(i, y.toString()));
        }
        shares.add(0, new ShareDTO(0, p.toString()));
        return shares;
    }

    public static BigInteger combine(List<ShareDTO> shares) {
        BigInteger currentP = null;
        List<ShareDTO> validShares = new ArrayList<>();
        for (ShareDTO s : shares) {
            if (s.getX() == 0) currentP = new BigInteger(s.getY());
            else validShares.add(s);
        }
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

    public static void main(String[] args) {
        BigInteger d = new BigInteger("1234567890123456789012345678901234567890");
        List<ShareDTO> shares = split(d, 3, 4);
        
        List<ShareDTO> toCombine = new ArrayList<>();
        toCombine.add(shares.get(0)); // P
        toCombine.add(shares.get(1)); // share 1
        toCombine.add(shares.get(2)); // share 2
        toCombine.add(shares.get(3)); // share 3
        
        BigInteger d3 = combine(toCombine);
        System.out.println("3 shares equals? " + d.equals(d3) + " (Expected: true)");
        
        List<ShareDTO> toCombine4 = new ArrayList<>();
        toCombine4.add(shares.get(0)); // P
        toCombine4.add(shares.get(1)); // share 1
        toCombine4.add(shares.get(2)); // share 2
        toCombine4.add(shares.get(3)); // share 3
        toCombine4.add(shares.get(4)); // share 4
        
        BigInteger d4 = combine(toCombine4);
        System.out.println("4 shares equals? " + d.equals(d4) + " (Expected: false due to (-1) bug)");
    }
}
