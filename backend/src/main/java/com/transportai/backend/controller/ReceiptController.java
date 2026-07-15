package com.transportai.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.transportai.backend.entity.ReceiptEntity;
import com.transportai.backend.entity.UserEntity;
import com.transportai.backend.model.ReceiptData;
import com.transportai.backend.repository.ReceiptRepository;
import com.transportai.backend.service.AuthService;
import com.transportai.backend.service.ExcelGeneratorService;
import com.transportai.backend.service.ExtractionService;
import com.transportai.backend.service.StorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/v1/receipts")
public class ReceiptController {

    private final StorageService storageService;
    private final AuthService authService;
    private final ExtractionService extractionService;
    private final ExcelGeneratorService excelGeneratorService;
    private final ReceiptRepository receiptRepository;
    private final ObjectMapper objectMapper;

    public ReceiptController(StorageService storageService,
                             AuthService authService,
                             ExtractionService extractionService,
                             ExcelGeneratorService excelGeneratorService,
                             ReceiptRepository receiptRepository) {
        this.storageService = storageService;
        this.authService = authService;
        this.extractionService = extractionService;
        this.excelGeneratorService = excelGeneratorService;
        this.receiptRepository = receiptRepository;
        this.objectMapper = new ObjectMapper();
    }

    @GetMapping
    public ResponseEntity<?> getAllReceipts(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String dateFilter) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        
        // If size is 0, return all (for backward compatibility with reports that expect all data)
        if (size == 0) {
            return ResponseEntity.ok(receiptRepository.findByCompanyOrderByUploadedAtDesc(user.getCompany()));
        }
        
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "uploadedAt"));
        return ResponseEntity.ok(receiptRepository.searchReceipts(user.getCompany(), source, dateFilter, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptEntity> getReceiptById(@RequestHeader(value = "Authorization", required = false) String authorization, @PathVariable String id) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        return receiptRepository.findByIdAndCompany(id, user.getCompany())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public CompletableFuture<ResponseEntity<ReceiptEntity>> uploadReceipt(
            @RequestHeader(value = "X-Transporter-ID", required = false, defaultValue = "1") String transporterId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        return processUploadedFileAsync(transporterId, user, file).thenApply(ResponseEntity::ok);
    }

    @PostMapping("/upload/batch")
    public CompletableFuture<ResponseEntity<List<ReceiptEntity>>> uploadReceiptsBatch(
            @RequestHeader(value = "X-Transporter-ID", required = false, defaultValue = "1") String transporterId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("files") List<MultipartFile> files) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        List<CompletableFuture<ReceiptEntity>> futures = new ArrayList<>();
        for (MultipartFile file : files) {
            futures.add(processUploadedFileAsync(transporterId, user, file));
        }
        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream().map(CompletableFuture::join).collect(Collectors.toList()))
                .thenApply(ResponseEntity::ok);
    }

    @PostMapping("/manual")
    public ResponseEntity<ReceiptEntity> createManualReceipt(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody java.util.Map<String, Object> requestBody) {
        JsonNode request = objectMapper.valueToTree(requestBody);
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        ReceiptEntity entity = new ReceiptEntity();
        entity.setUploadedBy(displayName(user));
        entity.setOwnerUserId(user.getId());
        entity.setCompany(user.getCompany());
        entity.setProcessedAt(LocalDateTime.now());
        applyUpdate(entity, request);
        if (!request.has("amount") && request.has("charges")) {
            entity.setAmount(request.path("charges").asDouble());
        }
        if (!request.has("charges") && request.has("amount")) {
            entity.setCharges(request.path("amount").asDouble());
        }
        entity.setConfidenceOverall(0);
        try {
            entity.setExtractedJson(objectMapper.writeValueAsString(toReceiptData(entity)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize manual receipt data", e);
        }
        return ResponseEntity.ok(receiptRepository.save(entity));
    }

    private CompletableFuture<ReceiptEntity> processUploadedFileAsync(String transporterId, UserEntity user, MultipartFile file) {
        System.out.println("Processing receipt upload for Transporter ID: " + transporterId);
        ReceiptEntity entity = new ReceiptEntity();
        entity.setUploadedBy(displayName(user));
        entity.setOwnerUserId(user.getId());
        entity.setCompany(user.getCompany());
        // Removed duplicate premature save

        File imageFile;
        try {
            imageFile = storageService.store(file);
            entity.setOriginalFilename(file.getOriginalFilename());
            entity.setStoredFilename(imageFile.getName());
            entity.setContentType(file.getContentType());
        } catch (Exception e) {
            entity.setProcessedAt(LocalDateTime.now());
            entity.setRejectionReason(errorMessage(e));
            return CompletableFuture.completedFuture(receiptRepository.save(entity));
        }

        return extractionService.extractDataFromImage(imageFile).handle((extractedData, throwable) -> {
            if (throwable != null) {
                entity.setProcessedAt(LocalDateTime.now());
                if (throwable.getCause() instanceof ExtractionService.NonBiltyDocumentException) {
                    entity.setRejectionReason(throwable.getCause().getMessage());
                } else {
                    entity.setRejectionReason(errorMessage(new Exception(throwable)));
                }
            } else {
                entity.setProcessedAt(LocalDateTime.now());
                entity.setGrNumber(valueOrMissing(extractedData.documentNo()));
                entity.setBiltyDate(valueOrMissing(extractedData.date()));
                entity.setConsignor(extractedData.consignor() != null ? extractedData.consignor().name() : "");
                entity.setConsignee(extractedData.consignee() != null ? extractedData.consignee().name() : "");
                entity.setSource(extractedData.origin());
                entity.setDestination(extractedData.destination());
                entity.setPrivateMarka(extractedData.privateMarka());
                double totalCharges = extractedData.freight() != null ? extractedData.freight().totalAmount() : -1.0;
                entity.setCharges(totalCharges);
                entity.setAmount(totalCharges);
                
                int packages = 0;
                if (extractedData.items() != null) {
                    packages = extractedData.items().stream().mapToInt(ReceiptData.Item::quantity).sum();
                    if(!extractedData.items().isEmpty()) {
                        String material = extractedData.items().stream()
                                .map(ReceiptData.Item::description)
                                .filter(description -> description != null && !description.isBlank())
                                .distinct()
                                .reduce((left, right) -> left + ", " + right)
                                .orElse("MISSING");
                        entity.setMaterial(material);
                        entity.setDescription(material);
                    }
                }
                entity.setPackages(packages);
                entity.setConfidenceOverall(0);
                
                try {
                    entity.setExtractedJson(objectMapper.writeValueAsString(extractedData));
                } catch (Exception ignored) {}
            }
            return receiptRepository.save(entity);
        });
    }

    private String errorMessage(Exception e) {
        String message = e.getMessage();
        if (message == null || message.isBlank()) {
            return "Error processing receipt image.";
        }
        if (message.length() > 240) {
            return message.substring(0, 240);
        }
        return message;
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getReceiptFile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "token", required = false) String token,
            @PathVariable String id) {
        if (authorization != null && !authorization.isBlank()) {
            authService.requireAuthenticatedUser(authorization);
        } else {
            authService.requireAuthenticatedToken(token);
        }
        UserEntity user = authorization != null && !authorization.isBlank()
                ? authService.requireAuthenticatedUser(authorization)
                : authService.requireAuthenticatedToken(token);
        ReceiptEntity receipt = receiptRepository.findByIdAndCompany(id, user.getCompany()).orElseThrow(() -> new RuntimeException("Receipt not found"));
        if (receipt.getStoredFilename() == null || receipt.getStoredFilename().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path file = storageService.load(receipt.getStoredFilename());
            InputStreamResource resource = new InputStreamResource(Files.newInputStream(file));
            String contentType = receipt.getContentType() != null ? receipt.getContentType() : Files.probeContentType(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Unable to read stored receipt file", e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceiptEntity> updateReceipt(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody java.util.Map<String, Object> updateBody) {
        JsonNode update = objectMapper.valueToTree(updateBody);
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        return receiptRepository.findByIdAndCompany(id, user.getCompany())
                .map(existing -> {
                    applyUpdate(existing, update);
                    return ResponseEntity.ok(receiptRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceipt(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        ReceiptEntity receipt = receiptRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new RuntimeException("Receipt not found"));
        receiptRepository.delete(receipt);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/delete-bulk")
    public ResponseEntity<Void> deleteReceipts(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody BulkReceiptRequest request) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        List<ReceiptEntity> receipts = receiptRepository.findByIdInAndCompany(request.ids(), user.getCompany());
        receiptRepository.deleteAll(receipts);
        return ResponseEntity.noContent().build();
    }

    private void applyUpdate(ReceiptEntity existing, JsonNode update) {
        if (update.has("uploadedBy")) existing.setUploadedBy(textValue(update, "uploadedBy"));
        if (update.has("processedAt")) existing.setProcessedAt(objectMapper.convertValue(update.get("processedAt"), LocalDateTime.class));
        if (update.has("grNumber")) existing.setGrNumber(textValue(update, "grNumber"));
        if (update.has("consignor")) existing.setConsignor(textValue(update, "consignor"));
        if (update.has("consignee")) existing.setConsignee(textValue(update, "consignee"));
        if (update.has("source")) existing.setSource(textValue(update, "source"));
        if (update.has("destination")) existing.setDestination(textValue(update, "destination"));
        if (update.has("biltyDate")) existing.setBiltyDate(textValue(update, "biltyDate"));
        if (update.has("privateMarka")) existing.setPrivateMarka(textValue(update, "privateMarka"));
        if (update.has("packages")) existing.setPackages(update.path("packages").asInt());
        if (update.has("material")) existing.setMaterial(textValue(update, "material"));
        if (update.has("description")) existing.setDescription(textValue(update, "description"));
        if (update.has("charges")) existing.setCharges(update.path("charges").asDouble());
        if (update.has("amount")) existing.setAmount(update.path("amount").asDouble());
        if (update.has("confidenceOverall")) existing.setConfidenceOverall(update.path("confidenceOverall").asInt());
        if (update.has("extractedJson")) existing.setExtractedJson(textValue(update, "extractedJson"));
        if (update.has("rejectionReason")) existing.setRejectionReason(textValue(update, "rejectionReason"));
    }

    private String textValue(JsonNode update, String field) {
        JsonNode value = update.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private String displayName(UserEntity user) {
        String firstName = user.getFirstName() != null ? user.getFirstName() : "";
        String lastName = user.getLastName() != null ? user.getLastName() : "";
        String name = (firstName + " " + lastName).trim();
        return name.isBlank() ? user.getEmail() : name;
    }

    private String valueOrMissing(String value) {
        return value == null || value.isBlank() ? "MISSING" : value;
    }

    @PostMapping("/export")
    public ResponseEntity<Resource> exportToExcel(
            @RequestHeader(value = "X-Transporter-ID", required = false, defaultValue = "1") String transporterId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody ReceiptData receiptData) {
        authService.requireAuthenticatedUser(authorization);
        
        System.out.println("Generating Excel export for Transporter ID: " + transporterId);

        // Generate Excel based on the data
        ByteArrayInputStream in = excelGeneratorService.generateExcel(receiptData);

        InputStreamResource resource = new InputStreamResource(in);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"receipt_data.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<Resource> exportReceiptById(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        ReceiptEntity receipt = receiptRepository.findByIdAndCompany(id, user.getCompany())
                .orElseThrow(() -> new RuntimeException("Receipt not found"));

        ByteArrayInputStream in = excelGeneratorService.generateExcel(toReceiptData(receipt));
        InputStreamResource resource = new InputStreamResource(in);

        String filename = receipt.getGrNumber() != null && !receipt.getGrNumber().isBlank()
                ? "receipt_" + receipt.getGrNumber().replaceAll("[^a-zA-Z0-9._-]", "_") + ".xlsx"
                : "receipt_" + receipt.getId() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    @PostMapping("/export/bulk")
    public ResponseEntity<Resource> exportReceiptsBulk(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody BulkReceiptRequest request) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        List<ReceiptEntity> receipts = receiptRepository.findByIdInAndCompany(request.ids(), user.getCompany());
        if (receipts.isEmpty()) {
            throw new RuntimeException("No receipts found to export.");
        }

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (ZipOutputStream zip = new ZipOutputStream(out)) {
                for (ReceiptEntity receipt : receipts) {
                    ByteArrayInputStream excel = excelGeneratorService.generateExcel(toReceiptData(receipt));
                    String filename = receipt.getGrNumber() != null && !receipt.getGrNumber().isBlank()
                            ? "receipt_" + receipt.getGrNumber().replaceAll("[^a-zA-Z0-9._-]", "_") + ".xlsx"
                            : "receipt_" + receipt.getId() + ".xlsx";
                    zip.putNextEntry(new ZipEntry(filename));
                    excel.transferTo(zip);
                    zip.closeEntry();
                }
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"receipts_export.zip\"")
                    .contentType(MediaType.parseMediaType("application/zip"))
                    .body(new InputStreamResource(new ByteArrayInputStream(out.toByteArray())));
        } catch (Exception e) {
            throw new RuntimeException("Failed to export receipts", e);
        }
    }

    @GetMapping("/export/all")
    public ResponseEntity<Resource> exportAllReceipts(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        UserEntity user = authService.requireAuthenticatedUser(authorization);
        List<ReceiptEntity> receipts = receiptRepository.findByCompanyOrderByUploadedAtDesc(user.getCompany());
        ByteArrayInputStream in = excelGeneratorService.generateConsolidatedExcel(receipts);
        InputStreamResource resource = new InputStreamResource(in);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"all_bilties.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resource);
    }

    private ReceiptData toReceiptData(ReceiptEntity receipt) {
        ReceiptData existing = parseExtractedData(receipt.getExtractedJson());
        ReceiptData.Item item = new ReceiptData.Item(
                firstPresent(receipt.getMaterial(), receipt.getDescription(), "MISSING"),
                receipt.getPackages() > 0 ? receipt.getPackages() : -1,
                existing.items() != null && !existing.items().isEmpty() ? existing.items().get(0).weight() : -1
        );

        ReceiptData.FreightDetails existingFreight = existing.freight();
        double charges = receipt.getCharges() != 0 ? receipt.getCharges() : receipt.getAmount();
        ReceiptData.FreightDetails freight = new ReceiptData.FreightDetails(
                existingFreight != null ? existingFreight.baseFreight() : charges,
                existingFreight != null ? existingFreight.labourCharges() : 0,
                existingFreight != null ? existingFreight.cartage() : 0,
                charges != 0 ? charges : -1,
                existingFreight != null ? firstPresent(existingFreight.paymentTerms(), "MISSING") : "MISSING"
        );

        return new ReceiptData(
                firstPresent(existing.companyName(), "MISSING"),
                firstPresent(receipt.getGrNumber(), existing.documentNo(), "MISSING"),
                firstPresent(receipt.getBiltyDate(), existing.date(), "MISSING"),
                firstPresent(existing.privateMarka(), "MISSING"),
                firstPresent(receipt.getSource(), existing.origin(), "MISSING"),
                firstPresent(receipt.getDestination(), existing.destination(), "MISSING"),
                new ReceiptData.Party(firstPresent(receipt.getConsignor(), existing.consignor() != null ? existing.consignor().name() : null, "MISSING"),
                        existing.consignor() != null ? firstPresent(existing.consignor().gstin(), "MISSING") : "MISSING"),
                new ReceiptData.Party(firstPresent(receipt.getConsignee(), existing.consignee() != null ? existing.consignee().name() : null, "MISSING"),
                        existing.consignee() != null ? firstPresent(existing.consignee().gstin(), "MISSING") : "MISSING"),
                List.of(item),
                freight
        );
    }

    private ReceiptData parseExtractedData(String extractedJson) {
        if (extractedJson == null || extractedJson.isBlank()) {
            return emptyReceiptData();
        }
        try {
            return objectMapper.readValue(extractedJson, ReceiptData.class);
        } catch (Exception e) {
            return emptyReceiptData();
        }
    }

    private ReceiptData emptyReceiptData() {
        return new ReceiptData("MISSING", "MISSING", "MISSING", "MISSING", "MISSING", "MISSING",
                new ReceiptData.Party("MISSING", "MISSING"),
                new ReceiptData.Party("MISSING", "MISSING"),
                List.of(new ReceiptData.Item("MISSING", -1, -1)),
                new ReceiptData.FreightDetails(-1, -1, -1, -1, "MISSING"));
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "MISSING";
    }

    public record BulkReceiptRequest(List<String> ids) {}
}
