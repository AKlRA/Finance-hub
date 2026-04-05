package com.examly.springapp.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Feedback {

    @Id
    @GeneratedValue
    long feedbackId;

    String feedbackText;
    LocalDate date;
    int rating;

    @ManyToOne
    @JoinColumn(name = "userId")
    User user;

    // ✅ NEW — link feedback to a savings plan
    @ManyToOne
    @JoinColumn(name = "savingsPlanId")
    SavingsPlan savingsPlan;

    public Feedback() {}

    public Feedback(String feedbackText, LocalDate date, User user) {
        this.feedbackText = feedbackText;
        this.date = date;
        this.user = user;
    }

    public long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(long feedbackId) { this.feedbackId = feedbackId; }

    public String getFeedbackText() { return feedbackText; }
    public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // ✅ NEW getters/setters
    public SavingsPlan getSavingsPlan() { return savingsPlan; }
    public void setSavingsPlan(SavingsPlan savingsPlan) { this.savingsPlan = savingsPlan; }
}