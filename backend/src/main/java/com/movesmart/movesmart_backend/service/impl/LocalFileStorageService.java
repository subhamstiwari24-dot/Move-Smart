package com.movesmart.movesmart_backend.service.impl;

import com.movesmart.movesmart_backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local filesystem implementation of FileStorageService.
 * Stores uploaded incident evidence in a configurable directory (default: 'uploads').
 */
@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path uploadDir;

    public LocalFileStorageService(@Value("${movesmart.storage.location:uploads}") String uploadPath) {
        this.uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            if (!Files.exists(this.uploadDir)) {
                Files.createDirectories(this.uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload storage directory at: " + uploadPath, e);
        }
    }

    @Override
    public StoredFile store(MultipartFile file) {
        String contentType = file.getContentType();
        String extension = ".jpg";
        if ("image/png".equalsIgnoreCase(contentType)) {
            extension = ".png";
        } else if ("image/webp".equalsIgnoreCase(contentType)) {
            extension = ".webp";
        }

        String filename = "evidence-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path destination = this.uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/" + filename;
            return new StoredFile(url, filename);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file: " + filename, e);
        }
    }
}
