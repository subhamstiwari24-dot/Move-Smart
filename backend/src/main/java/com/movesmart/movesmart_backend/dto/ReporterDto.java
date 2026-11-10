package com.movesmart.movesmart_backend.dto;

public class ReporterDto {
    private String name;
    private String phone;
    private String email;
    private Boolean isAnonymous;

    public ReporterDto() {}

    public ReporterDto(String name, String phone, String email, Boolean isAnonymous) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.isAnonymous = isAnonymous;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }
}
