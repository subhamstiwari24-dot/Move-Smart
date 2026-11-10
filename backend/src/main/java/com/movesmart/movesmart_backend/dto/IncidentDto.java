package com.movesmart.movesmart_backend.dto;

import com.movesmart.movesmart_backend.model.Incident;

public class IncidentDto {
    private String id;
    private String title;
    private String category;
    private String description;
    private String location;
    private Double latitude;
    private Double longitude;
    private String priority;
    private String status;
    private String createdAt;
    private String updatedAt;
    private ReporterDto reporter;
    private String estimatedImpact;
    private String assignedUnit;
    private String adminNotes;
    private String reporterUserId;
    private String trackingId;
    private String photoUrl;
    private String publicUpdate;

    public IncidentDto() {}

    public static IncidentDto fromEntity(Incident entity) {
        if (entity == null) return null;
        IncidentDto dto = new IncidentDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setCategory(entity.getCategory());
        dto.setDescription(entity.getDescription());
        dto.setLocation(entity.getLocation());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setEstimatedImpact(entity.getEstimatedImpact());
        dto.setAssignedUnit(entity.getAssignedUnit());
        dto.setAdminNotes(entity.getAdminNotes());
        dto.setReporterUserId(entity.getReporterUserId());
        dto.setTrackingId(entity.getTrackingId());
        dto.setPhotoUrl(entity.getPhotoUrl());
        dto.setPublicUpdate(entity.getPublicUpdate());

        ReporterDto rep = new ReporterDto(
            entity.getReporterName() != null ? entity.getReporterName() : "Anonymous Citizen",
            entity.getReporterPhone(),
            entity.getReporterEmail(),
            entity.getIsAnonymous() != null ? entity.getIsAnonymous() : false
        );
        dto.setReporter(rep);
        return dto;
    }

    public Incident toEntity() {
        Incident entity = new Incident();
        entity.setId(this.id);
        entity.setTitle(this.title);
        entity.setCategory(this.category);
        entity.setDescription(this.description);
        entity.setLocation(this.location);
        entity.setLatitude(this.latitude);
        entity.setLongitude(this.longitude);
        entity.setPriority(this.priority);
        entity.setStatus(this.status);
        entity.setCreatedAt(this.createdAt);
        entity.setUpdatedAt(this.updatedAt);
        entity.setEstimatedImpact(this.estimatedImpact);
        entity.setAssignedUnit(this.assignedUnit);
        entity.setAdminNotes(this.adminNotes);
        entity.setTrackingId(this.trackingId);
        entity.setPhotoUrl(this.photoUrl);
        entity.setPublicUpdate(this.publicUpdate);

        if (this.reporter != null) {
            entity.setReporterName(this.reporter.getName());
            entity.setReporterPhone(this.reporter.getPhone());
            entity.setReporterEmail(this.reporter.getEmail());
            entity.setIsAnonymous(this.reporter.getIsAnonymous());
        }
        entity.setReporterUserId(this.reporterUserId);
        return entity;
    }

    public String getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(String reporterUserId) { this.reporterUserId = reporterUserId; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public ReporterDto getReporter() { return reporter; }
    public void setReporter(ReporterDto reporter) { this.reporter = reporter; }

    public String getEstimatedImpact() { return estimatedImpact; }
    public void setEstimatedImpact(String estimatedImpact) { this.estimatedImpact = estimatedImpact; }

    public String getAssignedUnit() { return assignedUnit; }
    public void setAssignedUnit(String assignedUnit) { this.assignedUnit = assignedUnit; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getPublicUpdate() { return publicUpdate; }
    public void setPublicUpdate(String publicUpdate) { this.publicUpdate = publicUpdate; }
}
