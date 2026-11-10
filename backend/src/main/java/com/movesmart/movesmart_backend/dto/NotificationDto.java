package com.movesmart.movesmart_backend.dto;

import com.movesmart.movesmart_backend.model.Notification;

public class NotificationDto {

    private String id;
    private String userId;
    private String incidentId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String createdAt;

    public NotificationDto() {}

    public NotificationDto(String id, String userId, String incidentId, String title, String message, String type, boolean read, String createdAt) {
        this.id = id;
        this.userId = userId;
        this.incidentId = incidentId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationDto fromEntity(Notification entity) {
        if (entity == null) return null;
        return new NotificationDto(
                entity.getId(),
                entity.getUserId(),
                entity.getIncidentId(),
                entity.getTitle(),
                entity.getMessage(),
                entity.getType(),
                entity.isRead(),
                entity.getCreatedAt()
        );
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
