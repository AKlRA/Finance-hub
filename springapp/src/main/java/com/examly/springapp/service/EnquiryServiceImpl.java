package com.examly.springapp.service;
 
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.examly.springapp.model.Enquiry;
import com.examly.springapp.repository.EnquiryRepo;
 
@Service
public class EnquiryServiceImpl implements EnquiryService {
 
    @Autowired
    private EnquiryRepo enquiryRepository;
 
    @Override
    public Enquiry addEnquiry(Enquiry enquiry) {
        return enquiryRepository.save(enquiry);
    }
 
    @Override
    public List<Enquiry> getUserEnquiries(Long userId) {
        return enquiryRepository.findByUserId(userId.intValue()); // Convert Long to int
    }
 
    @Override
    public Enquiry getEnquiryById(Long enquiryId) {
        return enquiryRepository.findById(enquiryId).orElse(null);
    }
 
    @Override
    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }
 
    @Override
    public Enquiry updateEnquiry(Long enquiryId, Enquiry enquiry) {
        if (enquiryRepository.existsById(enquiryId)) {
            enquiry.setEnquiryId(enquiryId);
            return enquiryRepository.save(enquiry);
        }
        return null;
    }
 
    @Override
    public void deleteEnquiry(Long enquiryId) {
        enquiryRepository.deleteById(enquiryId);
    }
}
