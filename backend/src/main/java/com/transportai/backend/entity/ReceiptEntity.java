package com.transportai.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "receipts")
public class ReceiptEntity {

    @Id
    private String id;

    private LocalDateTime uploadedAt;
    
    private LocalDateTime processedAt;
    
    private String uploadedBy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private UserEntity ownerUser;

    private String company;

    // These fields are populated from extraction for easy querying/display
    private String grNumber;
    private String consignor;
    private String consignee;
    private String source;
    private String destination;
    private String biltyDate;
    private String privateMarka;
    private int packages;
    private String material;
    private String description;
    private double charges;
    private double amount;
    
    private int confidenceOverall;

    private String originalFilename;

    private String storedFilename;

    private String contentType;

    private String rejectionReason;

    private String truckNumber;

    @Column(columnDefinition = "text")
    private String extractedJson; // Stores the raw ReceiptData object as JSON

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = "RCP-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
        }
    }

    public ReceiptEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public UserEntity getOwnerUser() { return ownerUser; }
    public void setOwnerUser(UserEntity ownerUser) { this.ownerUser = ownerUser; }

    @com.fasterxml.jackson.annotation.JsonProperty("ownerUserId")
    public String getOwnerUserId() {
        return ownerUser != null ? ownerUser.getId() : null;
    }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getConsignor() { return consignor; }
    public void setConsignor(String consignor) { this.consignor = consignor; }

    public String getGrNumber() { return grNumber; }
    public void setGrNumber(String grNumber) { this.grNumber = grNumber; }

    public String getConsignee() { return consignee; }
    public void setConsignee(String consignee) { this.consignee = consignee; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getBiltyDate() { return biltyDate; }
    public void setBiltyDate(String biltyDate) { this.biltyDate = biltyDate; }

    public String getPrivateMarka() { return privateMarka; }
    public void setPrivateMarka(String privateMarka) { this.privateMarka = privateMarka; }

    public int getPackages() { return packages; }
    public void setPackages(int packages) { this.packages = packages; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getCharges() { return charges; }
    public void setCharges(double charges) { this.charges = charges; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public int getConfidenceOverall() { return confidenceOverall; }
    public void setConfidenceOverall(int confidenceOverall) { this.confidenceOverall = confidenceOverall; }

    public String getExtractedJson() { return extractedJson; }
    public void setExtractedJson(String extractedJson) { this.extractedJson = extractedJson; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getStoredFilename() { return storedFilename; }
    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getTruckNumber() { return truckNumber; }
    public void setTruckNumber(String truckNumber) { this.truckNumber = truckNumber; }
}
