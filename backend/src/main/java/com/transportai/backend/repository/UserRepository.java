package com.transportai.backend.repository;

import com.transportai.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    Optional<UserEntity> findBySessionToken(String sessionToken);
    boolean existsByEmailIgnoreCase(String email);
}
