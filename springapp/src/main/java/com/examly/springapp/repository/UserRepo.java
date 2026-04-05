package com.examly.springapp.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.model.User;

@Repository
public interface UserRepo extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailAndUserRole(String email, String userRole);
    Optional<List<User>> findByUserRole(String userRole);
    Optional<User> findByEmailAndUserRoleIn(String email, Collection<String> roles);
}