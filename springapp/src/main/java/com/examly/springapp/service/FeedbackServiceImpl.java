package com.examly.springapp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.repository.FeedbackRepo;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    // service for feedback

    @Autowired
    FeedbackRepo feedbackRepo;

    @Override
    public Feedback addfeedback(Feedback feedback) {
        return feedbackRepo.save(feedback);
    }

    @Override
    public Feedback getfeedBackById(long feedbackId) {
        return feedbackRepo.findById(feedbackId).orElse(null);

    }

    @Override
    public List<Feedback> getFeedback() {
        return feedbackRepo.findAll();

    }

    @Override
    public List<Feedback> getFeedbackByUser(int userId) {
        List<Feedback> feed = feedbackRepo.findByUser_UserId(userId);
        if (feed.isEmpty()) {
            return null; 
        }
        return feed;
    }

    @Override
    public boolean deleteById(long feedbackId) {
        boolean feed = feedbackRepo.existsById(feedbackId);
        if (feed) {
            feedbackRepo.deleteById(feedbackId);
            return true;
        }
        return false;
    }

}


