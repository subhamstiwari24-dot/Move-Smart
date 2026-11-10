package com.movesmart.movesmart_backend.security;

import com.movesmart.movesmart_backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // Default secret for development (must be >= 256 bits)
    private static final String DEFAULT_SECRET = "MoveSmartSecureOperationsSecretKey2026UrbanMobilityEnterpriseHMAC256";
    private static final long DEFAULT_EXPIRATION_MS = 86400000L; // 24 hours

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${movesmart.jwt.secret:" + DEFAULT_SECRET + "}") String secret,
            @Value("${movesmart.jwt.expiration-ms:" + DEFAULT_EXPIRATION_MS + "}") long expirationMs) {
        String effectiveSecret = (secret == null || secret.length() < 32) ? DEFAULT_SECRET : secret;
        this.key = Keys.hmacShaKeyFor(effectiveSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getFullName())
                .claim("uid", user.getId())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims validateAndExtractClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String getRoleFromToken(String token) {
        Claims claims = validateAndExtractClaims(token);
        return claims != null ? claims.get("role", String.class) : null;
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
