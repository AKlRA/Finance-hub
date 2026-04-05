package com.examly.springapp.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class SavingsPlan {
    @Id
    @GeneratedValue
    long savingsPlanId;
    String name;
    double goalAmount;
    int timeFrame;
    String riskLevel;
    String description;
    String status;
    double interestRate;
    double installmentAmount;

    @JsonIgnore
@OneToMany(mappedBy = "savingsPlan", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PlanApplication> applications;
    public SavingsPlan() {
    }

    public SavingsPlan(String name, double goalAmount, int timeFrame, String riskLevel, String description,
            String status, double interestRate, double installmentAmount) {
        this.name = name;
        this.goalAmount = goalAmount;
        this.timeFrame = timeFrame;
        this.riskLevel = riskLevel;
        this.description = description;
        this.status = status;
        this.interestRate = interestRate;
        this.installmentAmount = installmentAmount;
    }

    public long getSavingsPlanId() {
        return savingsPlanId;
    }

    public void setSavingsPlanId(long savingsPlanId) {
        this.savingsPlanId = savingsPlanId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(double goalAmount) {
        this.goalAmount = goalAmount;
    }

    public int getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(int timeFrame) {
        this.timeFrame = timeFrame;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
        this.interestRate = interestRate;
    }

    public double getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(double installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public List<PlanApplication> getApplications() {
        return applications;
    }

    public void setApplications(List<PlanApplication> applications) {
        this.applications = applications;
    }
}