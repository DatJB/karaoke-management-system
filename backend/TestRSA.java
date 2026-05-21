import java.math.BigInteger;
import java.security.*;
import java.security.spec.RSAPrivateKeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;

public class TestRSA {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair kp = kpg.generateKeyPair();
        
        java.security.interfaces.RSAPrivateKey priv = (java.security.interfaces.RSAPrivateKey) kp.getPrivate();
        BigInteger n = priv.getModulus();
        BigInteger d = priv.getPrivateExponent();
        
        // Reconstruct non-CRT private key
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PrivateKey restoredKey = kf.generatePrivate(new RSAPrivateKeySpec(n, d));
        
        // Export to PKCS8 byte array
        byte[] pkcs8Bytes = restoredKey.getEncoded();
        
        // Import from PKCS8 byte array
        PrivateKey parsedKey = kf.generatePrivate(new PKCS8EncodedKeySpec(pkcs8Bytes));
        
        // Encrypt with Public Key
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, kp.getPublic());
        byte[] encrypted = cipher.doFinal("HelloWorld".getBytes(StandardCharsets.UTF_8));
        
        // Decrypt with parsed non-CRT Private Key
        cipher.init(Cipher.DECRYPT_MODE, parsedKey);
        byte[] decrypted = cipher.doFinal(encrypted);
        
        System.out.println("Decrypted: " + new String(decrypted, StandardCharsets.UTF_8));
    }
}
