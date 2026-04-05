package com.examly.springapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.examly.springapp.model.SavingsPlan;
import com.examly.springapp.service.SavingsPlanServiceImpl;

@RestController
@CrossOrigin
@RequestMapping("/api/savingsplans")
public class SavingsPlanController {

    @Autowired
    private SavingsPlanServiceImpl service;

    @PostMapping
    public ResponseEntity<SavingsPlan> addSavingsPlan(@RequestBody SavingsPlan savingsPlan) {
        SavingsPlan savedPlan = service.addSavingPlan(savingsPlan);

        if (savedPlan != null) {
            return new ResponseEntity<>(savedPlan, HttpStatusCode.valueOf(201));
        }
        return new ResponseEntity<>(HttpStatusCode.valueOf(500));
    }

    @GetMapping
    public ResponseEntity<List<SavingsPlan>> getAllSavingsPlan() {

        List<SavingsPlan> plans = service.getSavings();
        if (plans != null) {
            return new ResponseEntity<>(plans, HttpStatusCode.valueOf(200));
        }
        return new ResponseEntity<>(HttpStatusCode.valueOf(500));

    }

    @GetMapping("/{id}")
    public ResponseEntity<List<SavingsPlan>> getSavingsById(@PathVariable("id") Long id) {

        List<SavingsPlan> plans = service.getSavingsPlanById(id);
        if (plans != null) {
            return new ResponseEntity<>(plans, HttpStatusCode.valueOf(200));
        }
        return new ResponseEntity<>(HttpStatusCode.valueOf(500));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsPlan> updateSavingsPlan(@PathVariable("id") Long id,
            @RequestBody SavingsPlan savingsPlan) {
        SavingsPlan updatedPlan = service.updateSavingsPlan(id, savingsPlan);

        if (updatedPlan != null) {
            return new ResponseEntity<>(updatedPlan, HttpStatusCode.valueOf(200));
        }
        return new ResponseEntity<>(HttpStatusCode.valueOf(500));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSavingsPlan(@PathVariable("id") Long id) {
        boolean b = service.deleteSavingsPlan(id);
        if (b) {
            return new ResponseEntity<>("SavingsPlan deleted successfully", HttpStatusCode.valueOf(200));
        }
        return new ResponseEntity<>(HttpStatusCode.valueOf(500));
    }

}