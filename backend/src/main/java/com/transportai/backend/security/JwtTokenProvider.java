package com.transportai.backend.security;

import com.transportai.backend.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @org.springframework.beans.factory.annotation.Value("${app.jwt.secret}")
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
                .claim("company", user.getCompany())
                .claim("firstName", user.getFirstName())
                .claim("lastName", user.getLastName())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims getClaimsFromJWT(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserIdFromJWT(String token) {
        return getClaimsFromJWT(token).getSubject();
    }

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JwtTokenProvider.class);

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).clockSkewSeconds(60).build().parseSignedClaims(authToken);
            return true;
        } catch (Exception ex) {
            logger.error("JWT Validation Error: {}", ex.getMessage(), ex);
        }
        return false;
    }
}
