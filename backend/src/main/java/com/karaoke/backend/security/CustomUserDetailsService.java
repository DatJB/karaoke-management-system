package com.karaoke.backend.security;

import com.karaoke.backend.entity.Account;
import com.karaoke.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Account acc = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        return User.builder()
                .username(acc.getUsername())
                .password(acc.getPassword())
                .roles(acc.getRole().name())
                .build();
    }
}