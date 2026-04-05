package com.examly.springapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examly.springapp.model.PlanApplication;

@Service
public interface PlanApplicationService {

    PlanApplication addPlanApplication(PlanApplication data);

    PlanApplication editPlanApplication(Long id, PlanApplication data);

    PlanApplication deletePlanApplication(Long id);

    List<PlanApplication> getAppliedPlansByUserId(Long userId);

    List<PlanApplication> getAllPlanApplications();

    PlanApplication getPlanApplicationById(Long id);

    PlanApplication requestWithdrawal(Long id);

    PlanApplication updateWithdrawalStatus(Long id, String status);

}

