package com.examly.springapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
 
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepo;

@Component
public class UserDetailsServiceImpl implements UserDetailsService{
    
    @Autowired
    private UserRepo userRepo;
 
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) {
            throw new UsernameNotFoundException("Invalid Email");
        }
        return new CustomUserDetails(user);
    }
}
