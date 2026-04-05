package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examly.springapp.model.PlanApplication;


public interface PlanApplicationRepo extends JpaRepository<PlanApplication,Long>{

    List<PlanApplication> findByUserUserId(Long userId);
    

}