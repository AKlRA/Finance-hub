package com.examly.springapp.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.InstallmentPayment;
import com.examly.springapp.model.PlanApplication;
import com.examly.springapp.repository.InstallmentPaymentRepo;
import com.examly.springapp.repository.PlanApplicationRepo;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private PlanApplicationRepo planApplicationRepo;

    @Autowired
    private InstallmentPaymentRepo installmentPaymentRepo;

    @PostMapping("/create-order/{applicationId}")
    public ResponseEntity<?> createOrder(@PathVariable Long applicationId) {
        try {
            PlanApplication app = planApplicationRepo.findById(applicationId).orElse(null);
            if (app == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found");

            if (!"APPROVED".equalsIgnoreCase(app.getStatus()))
                return ResponseEntity.badRequest().body("Application is not approved yet");

            if (app.getTotalInstallments() == 0)
                return ResponseEntity.badRequest().body("Installment details not set. Please re-apply.");

            int nextInstallment = app.getInstallmentsPaid() + 1;

            if (nextInstallment > app.getTotalInstallments())
                return ResponseEntity.badRequest().body("All installments already paid!");

            // Amount in PAISE (₹1 = 100 paise)
            long amountInPaise = (long) (app.getInstallmentAmount() * 100);

            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderReq = new JSONObject();
            orderReq.put("amount", amountInPaise);
            orderReq.put("currency", "INR");
            orderReq.put("receipt", "INST-" + applicationId + "-" + nextInstallment);

            Order order = client.orders.create(orderReq);

            InstallmentPayment payment = new InstallmentPayment();
            payment.setPlanApplication(app);
            payment.setInstallmentNumber(nextInstallment);
            payment.setAmount(app.getInstallmentAmount());
            payment.setRazorpayOrderId(order.get("id"));
            payment.setStatus("CREATED");
            installmentPaymentRepo.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("razorpayKeyId", razorpayKeyId);
            response.put("installmentNumber", nextInstallment);
            response.put("totalInstallments", app.getTotalInstallments());
            response.put("applicationId", applicationId);
            response.put("planName", app.getSavingsPlan().getName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating order: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> req) {
        try {
            String orderId   = req.get("razorpayOrderId");
            String paymentId = req.get("razorpayPaymentId");
            String signature = req.get("razorpaySignature");

            String payload   = orderId + "|" + paymentId;
            String generated = hmacSha256(payload, razorpayKeySecret);

            if (!generated.equals(signature)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("status", "FAILED", "message", "Invalid signature"));
            }

            // Update InstallmentPayment
            InstallmentPayment payment = installmentPaymentRepo.findByRazorpayOrderId(orderId);
            if (payment == null)
                return ResponseEntity.badRequest()
                    .body(Map.of("status", "FAILED", "message", "Order not found"));

            payment.setRazorpayPaymentId(paymentId);
            payment.setRazorpaySignature(signature);
            payment.setStatus("PAID");
            payment.setPaymentDate(LocalDateTime.now());
            installmentPaymentRepo.save(payment);

            PlanApplication app = payment.getPlanApplication();
            app.setInstallmentsPaid(app.getInstallmentsPaid() + 1);

            if (app.getInstallmentsPaid() >= app.getTotalInstallments()) {
                app.setPaymentStatus("COMPLETED");
            } else {
                app.setPaymentStatus("IN_PROGRESS");
            }
            planApplicationRepo.save(app);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "installmentNumber", payment.getInstallmentNumber(),
                "installmentsPaid",  app.getInstallmentsPaid(),
                "totalInstallments", app.getTotalInstallments(),
                "paymentStatus",     app.getPaymentStatus()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    @GetMapping("/history/{applicationId}")
    public ResponseEntity<?> getPaymentHistory(@PathVariable Long applicationId) {
        List<InstallmentPayment> list = installmentPaymentRepo
            .findByPlanApplicationPlanApplicationIdOrderByInstallmentNumber(applicationId);
        return ResponseEntity.ok(list);
    }

    private String hmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
