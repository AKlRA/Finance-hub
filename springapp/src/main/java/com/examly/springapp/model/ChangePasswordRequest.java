package com.examly.springapp.model;

// Create this as a separate file: src/main/java/com/examly/springapp/model/ChangePasswordRequest.java

public class ChangePasswordRequest {

    private String currentPassword;
    private String newPassword;

    public ChangePasswordRequest() {}

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}