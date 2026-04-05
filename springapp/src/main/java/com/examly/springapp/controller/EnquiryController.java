package com.examly.springapp.controller;
 
import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;
 
import org.springframework.web.bind.annotation.*;
 
import com.examly.springapp.model.Enquiry;
 
import com.examly.springapp.service.EnquiryService;
 
@RestController
 
@RequestMapping("/api/enquiry")
 
@CrossOrigin(origins = "*")
 
public class EnquiryController {

    @Autowired
 
    private EnquiryService enquiryService;
 
     
      @PostMapping
      public Enquiry addEnquiry(@RequestBody Enquiry enquiry) {
          return enquiryService.addEnquiry(enquiry);
      }
 
    @GetMapping("/{id}")
 
    public Enquiry getEnquiryById(@PathVariable Long id) {
 
        return enquiryService.getEnquiryById(id);
 
    }
 
    @GetMapping
    public List<Enquiry> getAllEnquiries() {
 
        return enquiryService.getAllEnquiries();
 
    }
 
    @PutMapping("/{id}")
 
    public Enquiry updateEnquiry(@PathVariable Long id, @RequestBody Enquiry updated) {
 
    Enquiry enquiry = enquiryService.getEnquiryById(id);
 
    if (enquiry != null) {
 
    enquiry.setMessage(updated.getMessage());
 
    enquiry.setUser(updated.getUser());
    enquiry.setStatus(updated.getStatus());
 
    return enquiryService.addEnquiry(enquiry);
 
    }

    return null;
 
    }
 
    @DeleteMapping("/{id}")
 
    public void deleteEnquiry(@PathVariable Long id) {
 
        enquiryService.deleteEnquiry(id);
 
    }
 
}
 