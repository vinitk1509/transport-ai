package com.transportai.backend.repository;

import com.transportai.backend.entity.ReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ReceiptRepository extends JpaRepository<ReceiptEntity, String> {
    List<ReceiptEntity> findByCompanyOrderByUploadedAtDesc(String company);
    Page<ReceiptEntity> findByCompanyOrderByUploadedAtDesc(String company, Pageable pageable);
    Optional<ReceiptEntity> findByIdAndCompany(String id, String company);
    @Query("SELECT r FROM ReceiptEntity r WHERE r.company = :company " +
           "AND (:source IS NULL OR :source = '' OR r.source = :source) " +
           "AND (:dateFilter IS NULL OR :dateFilter = '' OR (r.biltyDate IS NOT NULL AND r.biltyDate LIKE CONCAT(:dateFilter, '%')) OR (r.uploadedAt IS NOT NULL AND CAST(r.uploadedAt AS string) LIKE CONCAT(:dateFilter, '%'))) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(r.id) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.grNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.consignor) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.consignee) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.source) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.destination) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.privateMarka) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ReceiptEntity> searchReceipts(
            @org.springframework.data.repository.query.Param("company") String company,
            @org.springframework.data.repository.query.Param("source") String source,
            @org.springframework.data.repository.query.Param("dateFilter") String dateFilter,
            @org.springframework.data.repository.query.Param("search") String search,
            Pageable pageable);
            
    List<ReceiptEntity> findByIdInAndCompany(List<String> ids, String company);
}
