package com.movesmart.movesmart_backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @Column(name = "id", length = 64, nullable = false, unique = true)
    private String id;

    @Column(name = "type", length = 64, nullable = false)
    private String type;

    @Column(name = "incident_id", length = 32)
    private String incidentId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "timestamp", length = 64, nullable = false)
    private String timestamp;

    @Column(name = "actor", length = 128, nullable = false)
    private String actor;

    @Column(name = "previous_value", length = 128)
    private String previousValue;

    @Column(name = "new_value", length = 128)
    private String newValue;

    public ActivityLog() {}

    public ActivityLog(String id, String type, String incidentId, String title, String description,
                       String timestamp, String actor, String previousValue, String newValue) {
        this.id = id;
        this.type = type;
        this.incidentId = incidentId;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.actor = actor;
        this.previousValue = previousValue;
        this.newValue = newValue;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String previousValue) { this.previousValue = previousValue; }

    public String getNewValue() { return newValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
}
