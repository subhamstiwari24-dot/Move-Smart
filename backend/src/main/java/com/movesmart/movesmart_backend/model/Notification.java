package com.movesmart.movesmart_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(name = "id", length = 64, nullable = false, unique = true)
    private String id;

    @Column(name = "user_id", length = 64, nullable = false)
    private String userId;

    @Column(name = "incident_id", length = 64)
    private String incidentId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "type", length = 64, nullable = false)
    private String type; // SUBMITTED, VERIFIED, REJECTED, STATUS_UPDATED, INFO_REQUESTED, RESOLVED

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", length = 64, nullable = false)
    private String createdAt;

    public Notification() {}

    public Notification(String id, String userId, String incidentId, String title, String message, String type, boolean read, String createdAt) {
        this.id = id;
        this.userId = userId;
        this.incidentId = incidentId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
