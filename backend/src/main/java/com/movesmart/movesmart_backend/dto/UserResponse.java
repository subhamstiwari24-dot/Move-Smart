package com.movesmart.movesmart_backend.dto;

import com.movesmart.movesmart_backend.model.User;

/**
 * Safe, sanitized DTO representing user account details for administrative inspection.
 * Strict Security Guarantee: This DTO contains NO password hashes, reset tokens,
 * credentials, or internal secrets.
 */
public class UserResponse {

    private String id;
    private String email;
    private String fullName;
    private String role;
    private String phone;
    private boolean active;
    private String createdBy;
    private String createdAt;

    public UserResponse() {}

    public UserResponse(String id, String email, String fullName, String role, String phone, boolean active, String createdBy, String createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.phone = phone;
        this.active = active;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getPhone(),
                user.isActive(),
                user.getCreatedBy(),
                user.getCreatedAt()
        );
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
