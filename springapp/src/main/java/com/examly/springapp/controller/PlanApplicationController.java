package com.examly.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.PlanApplication;
import com.examly.springapp.service.PlanApplicationService;

@RestController
@CrossOrigin
@RequestMapping("/api/planapplications")
public class PlanApplicationController {

    @Autowired
    private PlanApplicationService planApplicationService;

    @PostMapping
    public ResponseEntity<PlanApplication> addPlanApplication(@RequestBody PlanApplication data) {
        PlanApplication result = planApplicationService.addPlanApplication(data);
        if (result != null) {
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{Id}")
    public ResponseEntity<PlanApplication> editPlanApplication(@PathVariable("Id") Long Id,
            @RequestBody PlanApplication data) {

        PlanApplication result = planApplicationService.editPlanApplication(Id, data);

        if (result != null) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{Id}")
    public ResponseEntity<PlanApplication> deletePlanApplication(@PathVariable("Id") Long Id) {
        PlanApplication result = planApplicationService.deletePlanApplication(Id);

        if (result != null) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<List<PlanApplication>> getAllPlanApplications() {
        List<PlanApplication> list = planApplicationService.getAllPlanApplications();
        if (list != null && !list.isEmpty()) {
            return new ResponseEntity<>(list, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlanApplication>> getByUserId(@PathVariable("userId") Long userId) {
        List<PlanApplication> list = planApplicationService.getAppliedPlansByUserId(userId);

        if (list != null || !list.isEmpty()) {
            return new ResponseEntity<>(list, HttpStatus.OK);

        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        }

    }

    // User requests withdrawal
@PutMapping("/{id}/withdraw")
public ResponseEntity<?> requestWithdrawal(@PathVariable Long id) {
    PlanApplication app = planApplicationService.requestWithdrawal(id);
    if (app == null) return ResponseEntity.badRequest()
        .body("Cannot request withdrawal. Plan not completed.");
    return ResponseEntity.ok(app);
}

// Admin approves or rejects withdrawal
@PutMapping("/{id}/withdrawal-status")
public ResponseEntity<?> updateWithdrawalStatus(
        @PathVariable Long id,
        @RequestParam String status) {
    if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
        return ResponseEntity.badRequest().body("Status must be APPROVED or REJECTED");
    }
    PlanApplication app = planApplicationService.updateWithdrawalStatus(id, status);
    if (app == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(app);
}




@GetMapping("/{Id}")
public ResponseEntity<PlanApplication> getById(@PathVariable("Id") Long Id) {
    PlanApplication app = planApplicationService.getPlanApplicationById(Id);
    if (app != null) {
        return new ResponseEntity<>(app, HttpStatus.OK);

    } else {
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

}
}
