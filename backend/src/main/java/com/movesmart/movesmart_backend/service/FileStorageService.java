package com.movesmart.movesmart_backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Storage abstraction for incident photo evidence.
 * Supports local filesystem storage (development/single-instance) and
 * can be extended with S3-compatible cloud object storage (AWS S3, Cloudflare R2, Supabase).
 */
public interface FileStorageService {

    /**
     * Stores an uploaded multipart photo and returns the storage reference.
     * @param file the multipart file
     * @return StoredFile record with public access url and saved filename
     */
    StoredFile store(MultipartFile file);

    /**
     * Stored file metadata record.
     */
    record StoredFile(String url, String filename) {}
}
