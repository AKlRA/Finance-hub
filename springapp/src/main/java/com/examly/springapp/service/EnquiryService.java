package com.examly.springapp.service;
 
import java.util.List;
import com.examly.springapp.model.Enquiry;
 
public interface EnquiryService {
    Enquiry addEnquiry(Enquiry enquiry);
    List<Enquiry> getUserEnquiries(Long userId);
    Enquiry getEnquiryById(Long enquiryId);
    List<Enquiry> getAllEnquiries();
    Enquiry updateEnquiry(Long enquiryId, Enquiry enquiry);
    void deleteEnquiry(Long enquiryId);
}
