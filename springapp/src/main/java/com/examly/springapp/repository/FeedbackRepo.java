package com.examly.springapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examly.springapp.model.Feedback;

public interface FeedbackRepo extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser_UserId(Integer userId);
}

