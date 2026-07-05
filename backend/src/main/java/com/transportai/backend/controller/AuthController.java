package com.transportai.backend.controller;

import com.transportai.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/verification/request")
    public ResponseEntity<VerificationResponse> requestVerification(@RequestBody VerificationRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.requestVerification(request.email(), httpRequest.getRemoteAddr()));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.signup(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, httpRequest.getRemoteAddr()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(authService.currentUser(authorization));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authorization) {
        authService.logout(authorization);
        return ResponseEntity.noContent().build();
    }

    public record VerificationRequest(String email) {}
    public record VerificationResponse(String message) {}
    public record SignupRequest(String firstName, String lastName, String company, String email, String password, String code) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, UserResponse user) {}
    public record UserResponse(String id, String name, String email, String role, String avatar, String company) {}
}
