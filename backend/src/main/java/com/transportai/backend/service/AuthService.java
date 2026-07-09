package com.transportai.backend.service;

import com.transportai.backend.controller.AuthController;
import com.transportai.backend.entity.EmailVerificationEntity;
import com.transportai.backend.entity.UserEntity;
import com.transportai.backend.exception.UnauthorizedException;
import com.transportai.backend.repository.EmailVerificationRepository;
import com.transportai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final EmailVerificationRepository verificationRepository;
    private final PasswordService passwordService;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final StorageService storageService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.auth.session-hours:12}")
    private int sessionHours;

    @Value("${app.auth.verification-cooldown-seconds:60}")
    private int verificationCooldownSeconds;

    @Value("${app.auth.max-verification-attempts:5}")
    private int maxVerificationAttempts;

    public AuthService(UserRepository userRepository, EmailVerificationRepository verificationRepository, PasswordService passwordService, EmailService emailService, RateLimitService rateLimitService, StorageService storageService) {
        this.userRepository = userRepository;
        this.verificationRepository = verificationRepository;
        this.passwordService = passwordService;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
        this.storageService = storageService;
    }

    public AuthController.VerificationResponse requestVerification(String email, String remoteAddress) {
        rateLimitService.check("verify:" + remoteAddress, 5, Duration.ofMinutes(10));
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new RuntimeException("An account already exists for this email.");
        }
        verificationRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(normalizedEmail)
                .filter(last -> last.getCreatedAt() != null && last.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(verificationCooldownSeconds)))
                .ifPresent(last -> {
                    throw new RuntimeException("Please wait before requesting another verification code.");
                });

        String code = String.valueOf(100000 + secureRandom.nextInt(900000));
        EmailVerificationEntity verification = new EmailVerificationEntity();
        verification.setEmail(normalizedEmail);
        verification.setCode(code);
        verification.setCreatedAt(LocalDateTime.now());
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        verificationRepository.save(verification);

        emailService.sendVerificationCode(normalizedEmail, code);
        return new AuthController.VerificationResponse("Verification code sent.");
    }

    public AuthController.AuthResponse signup(AuthController.SignupRequest request, String remoteAddress) {
        rateLimitService.check("signup:" + remoteAddress, 10, Duration.ofHours(1));
        validateSignup(request);
        String email = normalizeEmail(request.email());
        EmailVerificationEntity verification = verificationRepository
                .findTopByEmailIgnoreCaseAndCodeAndUsedFalseOrderByExpiresAtDesc(email, request.code())
                .orElseThrow(() -> new RuntimeException("Invalid verification code."));

        verification.setAttempts(verification.getAttempts() + 1);
        if (verification.getAttempts() > maxVerificationAttempts) {
            verification.setUsed(true);
            verificationRepository.save(verification);
            throw new RuntimeException("Too many verification attempts. Request a new code.");
        }
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationRepository.save(verification);
            throw new RuntimeException("Verification code has expired.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("An account already exists for this email.");
        }

        verification.setUsed(true);
        verificationRepository.save(verification);

        UserEntity user = new UserEntity();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setCompany(request.company());
        user.setEmail(email);
        user.setPasswordHash(passwordService.hash(request.password()));
        user.setRole("Admin");
        user.setEmailVerified(true);
        issueSession(user);
        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthController.AuthResponse login(AuthController.LoginRequest request, String remoteAddress) {
        rateLimitService.check("login:" + remoteAddress + ":" + normalizeEmail(request.email()), 8, Duration.ofMinutes(15));
        UserEntity user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));
        if (!user.isEmailVerified() || !passwordService.verify(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password.");
        }
        issueSession(user);
        user = userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthController.UserResponse currentUser(String authorizationHeader) {
        return toUserResponse(requireUser(authorizationHeader));
    }

    public UserEntity requireAuthenticatedUser(String authorizationHeader) {
        return requireUser(authorizationHeader);
    }

    public UserEntity requireAuthenticatedToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Unauthorized.");
        }
        UserEntity user = userRepository.findBySessionToken(token).orElseThrow(() -> new UnauthorizedException("Unauthorized."));
        ensureSessionValid(user);
        return user;
    }

    public void logout(String authorizationHeader) {
        UserEntity user = requireUser(authorizationHeader);
        user.setSessionToken(null);
        userRepository.save(user);
    }

    public void updatePassword(String authorizationHeader, String currentPassword, String newPassword) {
        UserEntity user = requireUser(authorizationHeader);
        if (!passwordService.verify(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Incorrect current password.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters.");
        }
        user.setPasswordHash(passwordService.hash(newPassword));
        userRepository.save(user);
    }

    public AuthController.UserResponse updateAvatar(String authorizationHeader, MultipartFile file) {
        UserEntity user = requireUser(authorizationHeader);
        try {
            File imageFile = storageService.store(file);
            user.setAvatar("/api/v1/auth/avatar/" + imageFile.getName());
            user = userRepository.save(user);
            return toUserResponse(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload avatar.", e);
        }
    }

    public ResponseEntity<Resource> getAvatar(String filename) {
        try {
            Path file = storageService.load(filename);
            InputStreamResource resource = new InputStreamResource(Files.newInputStream(file));
            String contentType = Files.probeContentType(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UserEntity requireUser(String authorizationHeader) {
        String token = bearerToken(authorizationHeader);
        UserEntity user = userRepository.findBySessionToken(token).orElseThrow(() -> new UnauthorizedException("Unauthorized."));
        ensureSessionValid(user);
        return user;
    }

    private AuthController.AuthResponse toAuthResponse(UserEntity user) {
        return new AuthController.AuthResponse(user.getSessionToken(), toUserResponse(user));
    }

    private AuthController.UserResponse toUserResponse(UserEntity user) {
        return new AuthController.UserResponse(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatar() != null ? user.getAvatar() : initials(user),
                user.getCompany()
        );
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) throw new RuntimeException("Email is required.");
        return email.trim().toLowerCase();
    }

    private String bearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Unauthorized.");
        }
        return authorizationHeader.substring("Bearer ".length()).trim();
    }

    private String newToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private void issueSession(UserEntity user) {
        user.setSessionToken(newToken());
        user.setSessionExpiresAt(LocalDateTime.now().plusHours(sessionHours));
    }

    private void ensureSessionValid(UserEntity user) {
        if (user.getSessionExpiresAt() == null || user.getSessionExpiresAt().isBefore(LocalDateTime.now())) {
            user.setSessionToken(null);
            user.setSessionExpiresAt(null);
            userRepository.save(user);
            throw new RuntimeException("Session expired.");
        }
    }

    private void validateSignup(AuthController.SignupRequest request) {
        if (isBlank(request.firstName()) || isBlank(request.lastName()) || isBlank(request.company())) {
            throw new RuntimeException("Name and company are required.");
        }
        if (request.password() == null || request.password().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters.");
        }
        if (request.code() == null || !request.code().matches("\\d{6}")) {
            throw new RuntimeException("A valid verification code is required.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String initials(UserEntity user) {
        String first = user.getFirstName() != null && !user.getFirstName().isBlank() ? user.getFirstName().substring(0, 1) : "";
        String last = user.getLastName() != null && !user.getLastName().isBlank() ? user.getLastName().substring(0, 1) : "";
        return (first + last).toUpperCase();
    }
}
