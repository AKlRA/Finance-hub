package com.examly.springapp.model;

public class LoginDTO {

    private String token;
    private int userId;
    private String email;
    private String userRole;
    private String username;
    private String mobileNumber; // ✅ ADDED

    public LoginDTO() {
    }

    // ✅ Updated constructor with mobileNumber
    public LoginDTO(String token, int userId, String email, String userRole, String username, String mobileNumber) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.userRole = userRole;
        this.username = username;
        this.mobileNumber = mobileNumber;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
}