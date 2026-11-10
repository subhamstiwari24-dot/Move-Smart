package com.movesmart.movesmart_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String adminNote;
    private String publicUpdate;
    private String assignedUnit;
    private String priority;

    public UpdateStatusRequest() {}

    public UpdateStatusRequest(String status, String adminNote, String publicUpdate, String assignedUnit, String priority) {
        this.status = status;
        this.adminNote = adminNote;
        this.publicUpdate = publicUpdate;
        this.assignedUnit = assignedUnit;
        this.priority = priority;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public String getPublicUpdate() { return publicUpdate; }
    public void setPublicUpdate(String publicUpdate) { this.publicUpdate = publicUpdate; }

    public String getAssignedUnit() { return assignedUnit; }
    public void setAssignedUnit(String assignedUnit) { this.assignedUnit = assignedUnit; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
