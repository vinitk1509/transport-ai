package com.transportai.backend.repository;

import com.transportai.backend.entity.EmailVerificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerificationEntity, String> {
    Optional<EmailVerificationEntity> findTopByEmailIgnoreCaseAndCodeAndUsedFalseOrderByExpiresAtDesc(String email, String code);
    Optional<EmailVerificationEntity> findTopByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
