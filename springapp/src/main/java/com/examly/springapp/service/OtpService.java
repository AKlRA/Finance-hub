package com.examly.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    private final Map<String, String> otpStore = new HashMap<>();
    // private final Random random = new Random(); // ✅ reuse a single instance

    public void generateAndSendOtp(String email) {
        SecureRandom random = new SecureRandom();
        String otp = String.valueOf(random.nextInt(900000) + 100000);
        otpStore.put(email, otp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("FinanceHub — Your OTP Verification Code");
        message.setText(
            "Hello,\n\n" +
            "Your OTP for FinanceHub registration is:\n\n" +
            "  " + otp + "\n\n" +
            "This OTP is valid for 10 minutes. Do not share it with anyone.\n\n" +
            "Regards,\nFinanceHub Team"
        );

        // mailSender.send(message); // Bypass Render's SMTP block
        System.out.println("\n=======================================================");
        System.out.println("🚨 MOCK EMAIL OTP (RENDER FAST OPTION) 🚨");
        System.out.println("Email: " + email);
        System.out.println("Generated OTP: " + otp);
        System.out.println("=======================================================\n");
    }

    public boolean validateOtp(String email, String otp) {
        String stored = otpStore.get(email);
        if (stored != null && stored.equals(otp)) {
            otpStore.remove(email);
            return true;
        }
        return false;
    }
}