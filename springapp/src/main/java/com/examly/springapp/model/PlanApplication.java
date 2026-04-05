package com.examly.springapp.model;

import java.time.LocalDate;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import jakarta.persistence.*;

@Entity
public class PlanApplication {

    @Id
    @GeneratedValue
    private Long planApplicationId;

    private double appliedAmount;
    private String status;
    private LocalDate applicationDate;
    private String remarks;

    // ── Installment fields ──────────────────────────────────────
    private double installmentAmount;   // goalAmount / timeFrame
    private int totalInstallments;      // = timeFrame (months)
    private int installmentsPaid;       // starts at 0
    private String paymentStatus;       // PENDING | IN_PROGRESS | COMPLETED

    @Column(name = "proof_document", columnDefinition = "LONGTEXT")
    private String proofDocument;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "savings_plan_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SavingsPlan savingsPlan;
    private String withdrawalStatus;  
   
    public PlanApplication() {}
    
    
    public String getWithdrawalStatus() { return withdrawalStatus; }
    public void setWithdrawalStatus(String withdrawalStatus) { this.withdrawalStatus = withdrawalStatus; }
    
   

    public Long getPlanApplicationId() { return planApplicationId; }
    public void setPlanApplicationId(Long planApplicationId) { this.planApplicationId = planApplicationId; }

    public double getAppliedAmount() { return appliedAmount; }
    public void setAppliedAmount(double appliedAmount) { this.appliedAmount = appliedAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getProofDocument() { return proofDocument; }
    public void setProofDocument(String proofDocument) { this.proofDocument = proofDocument; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public SavingsPlan getSavingsPlan() { return savingsPlan; }
    public void setSavingsPlan(SavingsPlan savingsPlan) { this.savingsPlan = savingsPlan; }

    public double getInstallmentAmount() { return installmentAmount; }
    public void setInstallmentAmount(double installmentAmount) { this.installmentAmount = installmentAmount; }

    public int getTotalInstallments() { return totalInstallments; }
    public void setTotalInstallments(int totalInstallments) { this.totalInstallments = totalInstallments; }

    public int getInstallmentsPaid() { return installmentsPaid; }
    public void setInstallmentsPaid(int installmentsPaid) { this.installmentsPaid = installmentsPaid; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}