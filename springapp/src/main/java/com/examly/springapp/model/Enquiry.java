package com.examly.springapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

// Properties:
// . enquiryId: Long - Unique identifier for the enquiry.
// . message: String - The message or question submitted by the user.
// . user: User- The user who submitted the enquiry. This relationship is also mapped with a
// Many-to-One association using @JoinColumn(name="userId").

@Entity
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    long enquiryId;

    String status;

    

    String message;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Enquiry() {
    }

    public Enquiry(String message, User user) {
        this.message = message;
        this.user = user;
    }

   

    public long getEnquiryId() {
        return enquiryId;
    }

    public void setEnquiryId(long enquiryId) {
        this.enquiryId = enquiryId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

public String getStatus() { 
    return status;
}

public void setStatus(String status) { 
    this.status = status; 
}
    

    
}
