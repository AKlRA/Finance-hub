package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.model.SavingsPlan;

public interface SavingsPlanService {
    
    SavingsPlan addSavingPlan(SavingsPlan savingsPlan);
    List<SavingsPlan> getSavings();
    
    
}
