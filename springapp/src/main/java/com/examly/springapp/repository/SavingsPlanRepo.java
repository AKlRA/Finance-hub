package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.SavingsPlan;
@Repository
public interface SavingsPlanRepo extends JpaRepository<SavingsPlan,Long>{
      List<SavingsPlan> findBySavingsPlanId(Long savingsPlanId);
}