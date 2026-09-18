package com.redcinema.mrs.service.auth;

import com.redcinema.mrs.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class JWTService {

    private final SecretKey secretKey;
    private final long expiryMillis;

    public JWTService(@Value("${jwt.expiry-minutes:60}") long expiryMinutes) {
        this.expiryMillis = expiryMinutes * 60 * 1_000L;
        try {
            KeyGenerator kg = KeyGenerator.getInstance("HmacSHA256");
            kg.init(256);
            this.secretKey = kg.generateKey();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Could not initialise JWT secret key", e);
        }
    }

    // ── Token Generation ─────────────────────────────────────────────────────

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claims(Map.of(
                        "ROLES", List.of(Map.of("authority", user.getUserRole().name())),
                        "userId", user.getUserId()
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMillis))
                .signWith(secretKey)
                .compact();
    }

    // ── Token Parsing ────────────────────────────────────────────────────────

    public Claims extractAllClaims(String token) {
        return (Claims) Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parse(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
