package com.examly.springapp.service;

import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.examly.springapp.model.PlanApplication;
import com.examly.springapp.model.SavingsPlan;
import com.examly.springapp.repository.PlanApplicationRepo;

@Service
public class PlanApplicationServiceImpl implements PlanApplicationService {

    @Autowired
    PlanApplicationRepo planApplicationRepo;

    @Autowired
    private com.examly.springapp.repository.UserRepo userRepo;

    @Autowired
    private com.examly.springapp.repository.SavingsPlanRepo savingsPlanRepo;

    @Override
    public PlanApplication addPlanApplication(PlanApplication data) {
        if (data.getUser() != null && data.getUser().getUserId() > 0) {
            data.setUser(userRepo.findById(data.getUser().getUserId()).orElse(null));
        }
        if (data.getSavingsPlan() != null && data.getSavingsPlan().getSavingsPlanId() > 0) {
            SavingsPlan plan = savingsPlanRepo
                .findById(data.getSavingsPlan().getSavingsPlanId()).orElse(null);
            data.setSavingsPlan(plan);

            if (plan != null) {
                int months = plan.getTimeFrame();
                double installment = plan.getInstallmentAmount() > 0
                    ? plan.getInstallmentAmount()
                    : Math.ceil(plan.getGoalAmount() / months * 100.0) / 100.0;


                data.setInstallmentAmount(installment);
                data.setTotalInstallments(months);
                data.setInstallmentsPaid(0);
                data.setPaymentStatus("PENDING"); // until admin approves
            }
        }
        return planApplicationRepo.save(data);
    }

    @Override
    public PlanApplication editPlanApplication(Long id, PlanApplication data) {
        if (planApplicationRepo.existsById(id)) {
            data.setPlanApplicationId(id);
            return planApplicationRepo.save(data);
        }
        return null;
    }

    @Override
    public PlanApplication deletePlanApplication(Long id) {
        PlanApplication app = planApplicationRepo.findById(id).orElse(null);
        if (app != null) planApplicationRepo.deleteById(id);
        return app;
    }

    @Override
    public List<PlanApplication> getAppliedPlansByUserId(Long userId) {
        return planApplicationRepo.findByUserUserId(userId);
    }

    @Override
    public List<PlanApplication> getAllPlanApplications() {
        return planApplicationRepo.findAll();
    }

    @Override
    public PlanApplication getPlanApplicationById(Long id) {
        return planApplicationRepo.findById(id).orElse(null);
    }

    @Override
public PlanApplication requestWithdrawal(Long id) {
    PlanApplication app = planApplicationRepo.findById(id).orElse(null);
    if (app == null) return null;
    if (!"COMPLETED".equals(app.getPaymentStatus())) return null; 
    app.setWithdrawalStatus("REQUESTED");
    return planApplicationRepo.save(app);
}

@Override
public PlanApplication updateWithdrawalStatus(Long id, String status) {
    PlanApplication app = planApplicationRepo.findById(id).orElse(null);
    if (app == null) return null;
    app.setWithdrawalStatus(status); 
  
    return planApplicationRepo.save(app);
}
}