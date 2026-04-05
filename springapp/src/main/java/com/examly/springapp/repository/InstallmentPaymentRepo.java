package com.examly.springapp.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.examly.springapp.model.InstallmentPayment;

public interface InstallmentPaymentRepo extends JpaRepository<InstallmentPayment, Long> {
    List<InstallmentPayment> findByPlanApplicationPlanApplicationIdOrderByInstallmentNumber(Long applicationId);
    InstallmentPayment findByRazorpayOrderId(String orderId);
    
}
