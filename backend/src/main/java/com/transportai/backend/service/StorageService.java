package com.transportai.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class StorageService {
    private final Path rootLocation;

    public StorageService(@Value("${app.upload-dir:${UPLOAD_DIR:upload-dir}}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public File store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "receipt";
            String safeOriginalName = Paths.get(originalFilename).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
            String filename = UUID.randomUUID() + "_" + safeOriginalName;
            Path destinationFile = this.rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            file.transferTo(destinationFile);
            return destinationFile.toFile();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    public Path load(String storedFilename) {
        Path file = rootLocation.resolve(storedFilename).normalize().toAbsolutePath();
        if (!file.getParent().equals(rootLocation.toAbsolutePath())) {
            throw new RuntimeException("Cannot read file outside current directory.");
        }
        if (!Files.exists(file)) {
            throw new RuntimeException("Stored file not found.");
        }
        return file;
    }
}
