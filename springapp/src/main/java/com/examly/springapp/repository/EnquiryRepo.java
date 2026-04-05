package com.examly.springapp.repository;
 
import java.util.List;
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
 
import com.examly.springapp.model.Enquiry;
 
public interface EnquiryRepo extends JpaRepository<Enquiry, Long> {
   
    @Query("SELECT e FROM Enquiry e WHERE e.user.userId = :userId")
    List<Enquiry> findByUserId(@Param("userId") int userId);
   
}
