package com.examly.springapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.SavingsPlan;
import com.examly.springapp.repository.SavingsPlanRepo;
@Service
public class SavingsPlanServiceImpl implements SavingsPlanService {

    @Autowired
    private SavingsPlanRepo repo;

   
    public SavingsPlan addSavingPlan(SavingsPlan savingsPlan){
        return repo.save(savingsPlan);
    }

   
    public List<SavingsPlan> getSavings(){
        return repo.findAll();
    }

   public List<SavingsPlan> getSavingsPlanById(Long id ){
   return repo.findBySavingsPlanId(id);
   }

   public SavingsPlan updateSavingsPlan(Long id, SavingsPlan savingsPlan){
    SavingsPlan existingPlan = repo.findById(id).orElse(null);
    if(existingPlan!=null){
        existingPlan.setDescription(savingsPlan.getDescription());
        existingPlan.setName(savingsPlan.getName());
        existingPlan.setGoalAmount(savingsPlan.getGoalAmount());
        existingPlan.setTimeFrame(savingsPlan.getTimeFrame());
        existingPlan.setRiskLevel(savingsPlan.getRiskLevel());
        existingPlan.setStatus(savingsPlan.getStatus());
        return repo.save(existingPlan);
    }
    return null;
   }

   public boolean deleteSavingsPlan(Long id){
    if(repo.existsById(id)){
        repo.deleteById(id);
        return true;
    }
    return false;
    }

    
}
