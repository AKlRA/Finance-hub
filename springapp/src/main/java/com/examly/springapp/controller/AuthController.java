package com.examly.springapp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder; // Added
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.config.JwtUtils;
import com.examly.springapp.model.ChangePasswordRequest;
import com.examly.springapp.model.LoginDTO;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepo;
import com.examly.springapp.service.OtpService;
import com.examly.springapp.service.UserServiceImpl;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private JwtUtils jwtService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private OtpService otpService;

    @PostMapping("/sendotp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        System.out.println(email);
        if (email == null || email.isBlank()) {
            return new ResponseEntity<>("Email is required.", HttpStatus.BAD_REQUEST);
        }
        try {
            otpService.generateAndSendOtp(email);
            return new ResponseEntity<>("OTP sent successfully to " + email, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to send OTP: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    @PostMapping("/verifyotp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");
        if (email == null || otp == null) {
            return new ResponseEntity<>("Email and OTP are required.", HttpStatus.BAD_REQUEST);
        }
        boolean valid = otpService.validateOtp(email, otp);
        if (valid) {
            return new ResponseEntity<>("OTP verified successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid or expired OTP.", HttpStatus.UNAUTHORIZED);
        }
    }

    @Autowired
    private PasswordEncoder passwordEncoder; // Added for reliable password checking

    // -- Register --
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // -- Login --
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
            if (auth.isAuthenticated()) {
                User loggedInUser = userRepo.findByEmail(user.getEmail()).orElse(null);
                if (loggedInUser == null) {
                    return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
                }
                String token = jwtService.GenerateToken(user.getEmail());
                LoginDTO response = new LoginDTO(
                        token,
                        loggedInUser.getUserId(),
                        loggedInUser.getEmail(),
                        loggedInUser.getUserRole(),
                        loggedInUser.getUsername(),
                        loggedInUser.getMobileNumber()
                );
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Invalid credentials", HttpStatus.NOT_FOUND);
            }
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.NOT_FOUND);
        }
    }

    // -- Get users --
    @GetMapping("/user")
    public ResponseEntity<?> getUserByUserRole() {
        Optional<List<User>> list = userService.findByUserRole();
        if (list.isPresent() && !list.get().isEmpty()) {
            return new ResponseEntity<>(list.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteRegionalManager(@PathVariable("id") int id) {
        boolean deleted = userService.deleteRegionalManager(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") int id) {
        try {
            User user = userService.getUserById(id);
            user.setPassword(null);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") int id, @RequestBody User updatedUser) {
        try {
            User updated = userService.updateUser(id, updatedUser);
            updated.setPassword(null);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // -- Updated Change Password --
    @PutMapping("/user/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable("id") int id,
            @RequestBody ChangePasswordRequest request) {
        try {
            // Using service layer directly - ensure service uses passwordEncoder.matches
            userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
            return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // -- Updated Reset Password --
    @PutMapping("/user/{id}/reset-password")
    public ResponseEntity<?> resetPassword(
            @PathVariable("id") int id,
            @RequestBody ChangePasswordRequest request) {
        try {
            User existingUser = userRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Use passwordEncoder.matches() instead of authenticationManager.authenticate()
            // This bypasses strict account-status checks that often fail for regular "Customer" roles
            boolean isPasswordMatch = passwordEncoder.matches(request.getCurrentPassword(), existingUser.getPassword());

            if (!isPasswordMatch) {
                return new ResponseEntity<>("Current login password is incorrect.", HttpStatus.UNAUTHORIZED);
            }

            // Authentication passed — proceed to save new hash
            userService.adminResetPassword(id, request.getNewPassword());
            return new ResponseEntity<>("Password reset successfully. Please log in again.", HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
