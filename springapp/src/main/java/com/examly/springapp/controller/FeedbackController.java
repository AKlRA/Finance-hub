package com.examly.springapp.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.service.FeedbackService;

@RestController
@CrossOrigin
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService service;

    @PostMapping
    public ResponseEntity<Feedback> addFeedEntity(@RequestBody Feedback feedback) {
        Feedback feed = service.addfeedback(feedback);
        return new ResponseEntity<>(feed, HttpStatus.CREATED); // 201 Created
    }

    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getByIdEntity(@PathVariable("id") long id) {
        Feedback feed = service.getfeedBackById(id);
        if (feed != null) {
            return new ResponseEntity<>(feed, HttpStatus.OK); // 200 OK
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 is better than 500
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getEntity() {
        List<Feedback> feed = service.getFeedback();
        return new ResponseEntity<>(feed, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getByUserId(@PathVariable("userId") int userId) {
        List<Feedback> feed = service.getFeedbackByUser(userId);
        return new ResponseEntity<>(feed, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> delEntity(@PathVariable("id") long id) {
        boolean deleted = service.deleteById(id);
        if (deleted) {
            return new ResponseEntity<>(true, HttpStatus.OK);
        }
        return new ResponseEntity<>(false, HttpStatus.NOT_FOUND);
    }
}
