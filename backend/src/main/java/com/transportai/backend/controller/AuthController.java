package com.transportai.backend.controller;

import com.transportai.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/verification/request")
    public ResponseEntity<VerificationResponse> requestVerification(@Valid @RequestBody VerificationRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.requestVerification(request.email(), httpRequest.getRemoteAddr()));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.signup(request, httpRequest.getRemoteAddr()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
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

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdatePasswordRequest request) {
        authService.updatePassword(authorization, request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserResponse> updateProfile(@RequestHeader("Authorization") String authorization, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(authorization, request));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> updateAvatar(@RequestHeader("Authorization") String authorization, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(authService.updateAvatar(authorization, file));
    }

    @GetMapping("/avatar/{filename}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        return authService.getAvatar(filename);
    }

    public record VerificationRequest(@NotBlank @Email String email) {}
    public record VerificationResponse(String message) {}
    public record SignupRequest(
            @NotBlank String firstName, 
            @NotBlank String lastName, 
            @NotBlank String company, 
            @NotBlank @Email String email, 
            @NotBlank @Size(min = 6) String password, 
            @NotBlank String code
    ) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record UpdatePasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min = 6) String newPassword) {}
    public record UpdateProfileRequest(@NotBlank String company, @NotBlank String firstName, @NotBlank String lastName) {}
    public record AuthResponse(String token, UserResponse user) {}
    public record UserResponse(String id, String name, String email, String role, String avatar, String company) {}
}
