package com.examly.springapp.service;

import com.examly.springapp.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    User registerUser(User user);
    Optional<List<User>> findByUserRole();
    boolean deleteRegionalManager(int id);
    User getUserById(int userId);
    User updateUser(int userId, User updatedUser);
    boolean changePassword(int userId, String currentPassword, String newPassword);
    void adminResetPassword(int userId, String newPassword); // ✅ NEW
}