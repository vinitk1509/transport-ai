package com.transportai.backend.security;

import com.transportai.backend.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @org.springframework.beans.factory.annotation.Value("${app.jwt.secret:defaultSecretKeyWithAtLeast32CharactersForHS256Signing1234567890}")
    private String jwtSecret;

    private SecretKey key;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    // 12 hours in milliseconds
    private final long jwtExpirationInMs = 43200000;

    public String generateToken(UserEntity user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).clockSkewSeconds(60).build().parseSignedClaims(authToken);
            return true;
        } catch (Exception ex) {
            System.err.println("JWT Validation Error: " + ex.getMessage());
            ex.printStackTrace();
        }
        return false;
    }
}
