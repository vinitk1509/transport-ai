package com.transportai.backend.repository;

import com.transportai.backend.entity.ReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<ReceiptEntity, String> {
    List<ReceiptEntity> findByCompanyOrderByUploadedAtDesc(String company);
    Optional<ReceiptEntity> findByIdAndCompany(String id, String company);
    List<ReceiptEntity> findByIdInAndCompany(List<String> ids, String company);
}
