package com.movesmart.movesmart_backend.controller;

import com.movesmart.movesmart_backend.config.DataSeeder;
import com.movesmart.movesmart_backend.dto.*;
import com.movesmart.movesmart_backend.service.ActivityService;
import com.movesmart.movesmart_backend.service.FileStorageService;
import com.movesmart.movesmart_backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;
    private final DataSeeder dataSeeder;
    private final ActivityService activityService;
    private final FileStorageService fileStorageService;

    @Value("${movesmart.demo-reset.enabled:true}")
    private boolean demoResetEnabled;

    public IncidentController(IncidentService incidentService,
                              DataSeeder dataSeeder,
                              ActivityService activityService,
                              FileStorageService fileStorageService) {
        this.incidentService = incidentService;
        this.dataSeeder = dataSeeder;
        this.activityService = activityService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentDto>> getIncidents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {
        List<IncidentDto> list = incidentService.getAllIncidents(category, priority, status, search, sortBy);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDto> getIncidentById(@PathVariable String id) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<IncidentDto>> getMyReports(@org.springframework.security.core.annotation.AuthenticationPrincipal com.movesmart.movesmart_backend.model.User currentUser) {
        List<IncidentDto> list = incidentService.getMyReports(currentUser);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<IncidentDto> createIncident(
            @Valid @RequestBody CreateIncidentRequest req,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.movesmart.movesmart_backend.model.User currentUser) {
        IncidentDto created = incidentService.createIncident(req, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhoto(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No file selected"));
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid file format. Only JPEG, PNG, and WebP are allowed"));
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "File size exceeds 5MB limit"));
        }
        try {
            FileStorageService.StoredFile stored = fileStorageService.store(file);
            return ResponseEntity.ok(Map.of("url", stored.url(), "filename", stored.filename()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to save file: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDto> updateIncident(
            @PathVariable String id,
            @RequestBody UpdateIncidentRequest req) {
        return incidentService.updateIncident(id, req)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/track/{trackingId}")
    public ResponseEntity<IncidentDto> trackIncident(
            @PathVariable String trackingId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.movesmart.movesmart_backend.model.User currentUser) {
        return incidentService.getIncidentByTrackingId(trackingId)
                .map(dto -> {
                    boolean isOwner = currentUser != null && (
                        (dto.getReporterUserId() != null && dto.getReporterUserId().equals(currentUser.getId())) ||
                        (dto.getReporter() != null && dto.getReporter().getEmail() != null && dto.getReporter().getEmail().equalsIgnoreCase(currentUser.getEmail()))
                    );
                    boolean isOps = currentUser != null && (
                        currentUser.getRole() == com.movesmart.movesmart_backend.model.Role.ROLE_OPERATIONS ||
                        currentUser.getRole() == com.movesmart.movesmart_backend.model.Role.ROLE_ADMIN
                    );
                    if (!isOwner && !isOps && dto.getReporter() != null) {
                        dto.getReporter().setPhone(null);
                        dto.getReporter().setEmail(null);
                    }
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentDto> updateIncidentStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateStatusRequest req,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.movesmart.movesmart_backend.model.User currentUser) {
        return incidentService.updateIncidentStatus(id, req, currentUser)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable String id) {
        boolean deleted = incidentService.deleteIncident(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<StatisticsDto> getStatistics() {
        StatisticsDto stats = incidentService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetToDemoData() {
        if (!demoResetEnabled) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Demo reset is disabled in production environment"));
        }
        dataSeeder.seedAll();
        activityService.log(
            "DEMO_DATA_RESET",
            null,
            "Demo Environment Reset",
            "All backend database records were restored to default Mumbai sample incidents.",
            "System Admin",
            null,
            null
        );
        return ResponseEntity.ok(Collections.singletonMap("message", "Demo data reset successfully"));
    }
}
