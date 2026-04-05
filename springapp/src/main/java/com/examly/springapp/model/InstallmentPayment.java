
package com.examly.springapp.model;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
public class InstallmentPayment {

    @Id
    @GeneratedValue
    private Long id;


    @ManyToOne
    @JoinColumn(name = "plan_application_id")
    private PlanApplication planApplication;

    private Integer installmentNumber;   
    private Double amount;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String status;               
    private LocalDateTime paymentDate;

    public InstallmentPayment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PlanApplication getPlanApplication() { return planApplication; }
    public void setPlanApplication(PlanApplication planApplication) { this.planApplication = planApplication; }

    public Integer getInstallmentNumber() { return installmentNumber; }
    public void setInstallmentNumber(Integer installmentNumber) { this.installmentNumber = installmentNumber; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
}