package com.pgmanagement.security;

import com.pgmanagement.excel.ExcelStorageService;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final ExcelStorageService excel;

    public CustomUserDetailsService(ExcelStorageService excel) {
        this.excel = excel;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return excel.readAll("users.xlsx").stream()
                .filter(row -> username.equalsIgnoreCase(row.get("username")))
                .filter(row -> "true".equalsIgnoreCase(row.getOrDefault("enabled", "true")))
                .findFirst()
                .map(this::toUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid username or password"));
    }

    private UserDetails toUserDetails(Map<String, String> row) {
        String role = row.getOrDefault("role", "ADMIN");
        return User.withUsername(row.get("username"))
                .password(row.get("passwordHash"))
                .authorities("ROLE_" + role.toUpperCase())
                .disabled(!"true".equalsIgnoreCase(row.getOrDefault("enabled", "true")))
                .build();
    }
}
