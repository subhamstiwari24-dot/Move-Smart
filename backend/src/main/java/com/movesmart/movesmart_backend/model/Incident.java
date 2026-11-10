package com.movesmart.movesmart_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(name = "id", length = 32, nullable = false, unique = true)
    private String id;

    @Column(name = "tracking_id", length = 64, unique = true)
    private String trackingId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "category", nullable = false, length = 64)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "location", nullable = false, length = 255)
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "created_at", nullable = false, length = 64)
    private String createdAt;

    @Column(name = "updated_at", nullable = false, length = 64)
    private String updatedAt;

    @Column(name = "reporter_name", length = 128)
    private String reporterName;

    @Column(name = "reporter_phone", length = 64)
    private String reporterPhone;

    @Column(name = "reporter_email", length = 128)
    private String reporterEmail;

    @Column(name = "reporter_user_id", length = 64)
    private String reporterUserId;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @Column(name = "estimated_impact", length = 255)
    private String estimatedImpact;

    @Column(name = "assigned_unit", length = 128)
    private String assignedUnit;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @Column(name = "public_update", columnDefinition = "TEXT")
    private String publicUpdate;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    public Incident() {}

    public Incident(String id, String title, String category, String description, String location,
                    Double latitude, Double longitude, String priority, String status,
                    String createdAt, String updatedAt, String reporterName, String reporterPhone,
                    String reporterEmail, Boolean isAnonymous, String estimatedImpact,
                    String assignedUnit, String adminNotes) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.description = description;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.reporterName = reporterName;
        this.reporterPhone = reporterPhone;
        this.reporterEmail = reporterEmail;
        this.isAnonymous = isAnonymous;
        this.estimatedImpact = estimatedImpact;
        this.assignedUnit = assignedUnit;
        this.adminNotes = adminNotes;
    }

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

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterUserId() { return reporterUserId; }
    public void setReporterUserId(String reporterUserId) { this.reporterUserId = reporterUserId; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }

    public String getEstimatedImpact() { return estimatedImpact; }
    public void setEstimatedImpact(String estimatedImpact) { this.estimatedImpact = estimatedImpact; }

    public String getAssignedUnit() { return assignedUnit; }
    public void setAssignedUnit(String assignedUnit) { this.assignedUnit = assignedUnit; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getPublicUpdate() { return publicUpdate; }
    public void setPublicUpdate(String publicUpdate) { this.publicUpdate = publicUpdate; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
