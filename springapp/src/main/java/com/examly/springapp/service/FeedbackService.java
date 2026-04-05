package com.examly.springapp.service;

import java.util.List;

import com.examly.springapp.model.Feedback;

public interface FeedbackService {
    Feedback addfeedback(Feedback feedback);
    Feedback getfeedBackById(long feedbackId);
    List<Feedback> getFeedback();
    List<Feedback> getFeedbackByUser(int userId);
    boolean deleteById(long feedbackId);

}
